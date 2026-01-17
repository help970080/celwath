/**
 * ============================================================
 * 🚀 CELEXPRESS WHATSAPP BOT - SERVIDOR PRINCIPAL v3.0
 * ============================================================
 * Bot ultra-humanizado para celulares y envíos
 * 
 * CAMBIOS v3.0:
 * - Flujo de envíos paso a paso (Origen → Destino → Paquete)
 * - Dashboard muestra datos completos de envío
 * - Soporte códigos postales internacionales
 * - Precios cotizados por asistente humano
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { CelexpressAI } = require('./ai-conversation-engine');

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Teléfono del dueño para notificaciones
const OWNER_PHONE = process.env.OWNER_PHONE || '5660194420';

// Motor de IA
const celexpressAI = new CelexpressAI();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 📊 ALMACENAMIENTO DE LEADS Y ANALYTICS
// ============================================================
const leads = [];
const analytics = {
    mensajesRecibidos: 0,
    cotizacionesEnvio: 0,
    consultasCelulares: 0,
    leadsCapturados: 0,
    conversaciones: new Set()
};

// ============================================================
// 📱 WEBHOOK DE WHATSAPP (TWILIO)
// ============================================================
app.post('/whatsapp', async (req, res) => {
    try {
        const mensaje = req.body.Body?.trim();
        const numero = req.body.From?.replace('whatsapp:', '');
        const nombre = req.body.ProfileName || null;

        if (!mensaje || !numero) {
            return res.status(400).send('Mensaje o número inválido');
        }

        console.log(`📩 [${numero}] ${nombre || 'Usuario'}: ${mensaje}`);
        analytics.mensajesRecibidos++;
        analytics.conversaciones.add(numero);

        // Procesar con el motor de IA
        const respuesta = await celexpressAI.procesarMensaje(numero, mensaje, nombre);

        console.log(`🤖 [Bot]: ${respuesta.substring(0, 100)}...`);

        // Enviar respuesta vía Twilio
        if (client) {
            await client.messages.create({
                from: twilioNumber,
                to: `whatsapp:${numero}`,
                body: respuesta
            });
        }

        // Detectar y registrar leads
        const ctx = celexpressAI.context.get(numero);
        
        // Registrar lead de envío cuando se completan los datos
        if (ctx.etapa === 'envio_datos_completos' && ctx.datosEnvio) {
            registrarLeadEnvio(numero, nombre, ctx);
        }
        // Registrar lead de celular
        else if (ctx.datosCliente.email || ctx.datosCliente.telefono) {
            registrarLead(numero, nombre, ctx);
        }

        // Responder a Twilio (TwiML vacío porque ya enviamos el mensaje)
        const twiml = new twilio.twiml.MessagingResponse();
        res.type('text/xml').send(twiml.toString());

    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.status(500).send('Error procesando mensaje');
    }
});

// ============================================================
// 🔔 NOTIFICAR AL DUEÑO (NUEVOS LEADS)
// ============================================================
async function notificarNuevoLead(lead) {
    if (!client || !OWNER_PHONE) return;

    try {
        let mensaje = `
🎯 *NUEVO LEAD CELEXPRESS*

👤 Nombre: ${lead.nombre || 'No proporcionado'}
📱 Teléfono: ${lead.telefono || 'No proporcionado'}
📧 Email: ${lead.email || 'No proporcionado'}
💬 Interés: ${lead.interes || 'General'}`;

        // Agregar datos de envío si aplica
        if (lead.interes === 'Envío' && lead.datosEnvio) {
            const origen = lead.datosEnvio.origen;
            const destino = lead.datosEnvio.destino;
            const paquete = lead.datosEnvio.paquete;

            mensaje += `

━━━ DATOS DE ENVÍO ━━━

📍 *ORIGEN:*
${origen.nombre}
${origen.calle}, ${origen.colonia}
${origen.ciudad}, ${origen.estado}
CP: ${origen.codigoPostal}
Tel: ${origen.telefono}

📍 *DESTINO:*
${destino.nombre}
${destino.calle}, ${destino.colonia}
${destino.ciudad}, ${destino.estado}
CP: ${destino.codigoPostal}
Tel: ${destino.telefono}

📦 *PAQUETE:*
${paquete.contenido}
Valor: ${paquete.precioPorPieza}
Medidas: ${paquete.medidas} cm
Peso: ${paquete.peso} kg
Paquetería: ${paquete.paqueteria}`;
        } else if (lead.cpOrigen || lead.cpDestino) {
            mensaje += `
📮 CP Origen: ${lead.cpOrigen || '-'}
📮 CP Destino: ${lead.cpDestino || '-'}`;
        }

        mensaje += `

⏰ ${new Date().toLocaleString('es-MX')}`;

        await client.messages.create({
            from: twilioNumber,
            to: `whatsapp:${OWNER_PHONE}`,
            body: mensaje.trim()
        });

        console.log(`📲 Notificación enviada al dueño`);
    } catch (error) {
        console.error('Error notificando al dueño:', error);
    }
}

function registrarLeadEnvio(numero, nombre, ctx) {
    const leadExistente = leads.find(l => l.numero === numero && l.interes === 'Envío');
    
    const nuevoLead = {
        numero,
        nombre: ctx.datosEnvio.origen.nombre || nombre,
        telefono: ctx.datosEnvio.origen.telefono,
        email: ctx.datosCliente.email || null,
        cpOrigen: ctx.datosEnvio.origen.codigoPostal,
        cpDestino: ctx.datosEnvio.destino.codigoPostal,
        interes: 'Envío',
        datosEnvio: ctx.datosEnvio,
        fecha: new Date(),
        estado: 'nuevo'
    };

    if (!leadExistente) {
        leads.push(nuevoLead);
        analytics.leadsCapturados++;
        analytics.cotizacionesEnvio++;
        notificarNuevoLead(nuevoLead);
        console.log(`🎯 Nuevo lead de envío registrado: ${nuevoLead.nombre || numero}`);
    } else {
        Object.assign(leadExistente, nuevoLead, { estado: 'actualizado' });
    }
}

function registrarLead(numero, nombre, ctx) {
    const leadExistente = leads.find(l => l.numero === numero);
    
    const nuevoLead = {
        numero,
        nombre: ctx.datosCliente.nombre || nombre,
        telefono: ctx.datosCliente.telefono,
        email: ctx.datosCliente.email,
        cpOrigen: ctx.datosCliente.cpOrigen || null,
        cpDestino: ctx.datosCliente.cpDestino || null,
        interes: ctx.cotizacionEnvio ? 'Envío' : 'Celular',
        datosEnvio: ctx.datosEnvio || null,
        fecha: new Date(),
        estado: 'nuevo'
    };

    if (!leadExistente) {
        leads.push(nuevoLead);
        analytics.leadsCapturados++;
        if (nuevoLead.interes === 'Celular') analytics.consultasCelulares++;
        notificarNuevoLead(nuevoLead);
        console.log(`🎯 Nuevo lead registrado: ${nombre || numero}`);
    } else {
        Object.assign(leadExistente, nuevoLead, { estado: 'actualizado' });
    }
}

// ============================================================
// 🌐 API ENDPOINTS
// ============================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', version: '3.0', timestamp: new Date().toISOString() });
});

// Dashboard principal
app.get('/', (req, res) => {
    const hoy = new Date().toDateString();
    const leadsHoy = leads.filter(l => new Date(l.fecha).toDateString() === hoy).length;
    
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CelExpress Bot - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { color: white; text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .version { color: rgba(255,255,255,0.7); font-size: 0.5em; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card {
            background: white; border-radius: 15px; padding: 25px;
            text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .stat-number { font-size: 3em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 10px; font-size: 1.1em; }
        .leads-section { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow-x: auto; margin-bottom: 30px; }
        .leads-section h2 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 1100px; }
        th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85em; }
        th { background: #f8f9fa; color: #333; font-weight: 600; position: sticky; top: 0; }
        .badge {
            display: inline-block; padding: 4px 12px; border-radius: 20px;
            font-size: 0.85em; font-weight: 500;
        }
        .badge-celular { background: #e3f2fd; color: #1976d2; }
        .badge-envio { background: #fff3e0; color: #f57c00; }
        .badge-general { background: #f3e5f5; color: #7b1fa2; }
        .cp-badge { 
            background: #e8f5e9; color: #388e3c; 
            padding: 2px 8px; border-radius: 4px; 
            font-family: monospace; font-size: 0.85em;
        }
        .empty-state { text-align: center; padding: 40px; color: #666; }
        .refresh-btn {
            display: inline-block; margin-top: 20px; padding: 12px 24px;
            background: #667eea; color: white; border: none; border-radius: 8px;
            cursor: pointer; font-size: 1em; text-decoration: none;
        }
        .refresh-btn:hover { background: #5a6fd6; }
        .contact-info { 
            background: rgba(255,255,255,0.1); 
            padding: 10px 20px; 
            border-radius: 10px; 
            color: white; 
            text-align: center; 
            margin-bottom: 20px;
        }
        .details-btn {
            background: #667eea; color: white; border: none;
            padding: 4px 10px; border-radius: 5px; cursor: pointer;
            font-size: 0.8em;
        }
        .details-btn:hover { background: #5a6fd6; }
        .modal {
            display: none; position: fixed; top: 0; left: 0;
            width: 100%; height: 100%; background: rgba(0,0,0,0.5);
            z-index: 1000; justify-content: center; align-items: center;
        }
        .modal.active { display: flex; }
        .modal-content {
            background: white; padding: 30px; border-radius: 15px;
            max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
        }
        .modal-close {
            float: right; background: none; border: none;
            font-size: 1.5em; cursor: pointer; color: #666;
        }
        .detail-section { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px; }
        .detail-section h4 { color: #667eea; margin-bottom: 10px; }
        .detail-row { display: flex; margin: 5px 0; }
        .detail-label { font-weight: 600; width: 120px; color: #666; }
        .detail-value { flex: 1; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 CelExpress Bot <span class="version">v3.0</span></h1>
        
        <div class="contact-info">
            📞 Contacto: <strong>56 6019 4420</strong> | ⏰ Lunes a Sábado 9am - 7pm
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${analytics.mensajesRecibidos}</div>
                <div class="stat-label">💬 Mensajes Recibidos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${analytics.conversaciones.size}</div>
                <div class="stat-label">👥 Conversaciones</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${leads.length}</div>
                <div class="stat-label">🎯 Leads Totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${leadsHoy}</div>
                <div class="stat-label">📅 Leads Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${analytics.cotizacionesEnvio}</div>
                <div class="stat-label">📦 Cotizaciones Envío</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${analytics.consultasCelulares}</div>
                <div class="stat-label">📱 Consultas Celulares</div>
            </div>
        </div>

        <div class="leads-section">
            <h2>📋 Últimos Leads</h2>
            ${leads.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Interés</th>
                        <th>CP Origen</th>
                        <th>CP Destino</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.slice(-20).reverse().map((l, idx) => `
                    <tr>
                        <td>${l.nombre || '-'}</td>
                        <td>${l.telefono || '-'}</td>
                        <td>${l.email || '-'}</td>
                        <td><span class="badge badge-${l.interes?.toLowerCase().replace('í','i') || 'general'}">${l.interes || 'General'}</span></td>
                        <td>${l.cpOrigen ? `<span class="cp-badge">${l.cpOrigen}</span>` : '-'}</td>
                        <td>${l.cpDestino ? `<span class="cp-badge">${l.cpDestino}</span>` : '-'}</td>
                        <td>${new Date(l.fecha).toLocaleString('es-MX')}</td>
                        <td>
                            ${l.datosEnvio ? `<button class="details-btn" onclick="showDetails(${leads.length - 1 - idx})">Ver detalles</button>` : '-'}
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="empty-state">
                <p>No hay leads todavía</p>
                <p>Los leads aparecerán aquí cuando los clientes proporcionen sus datos</p>
            </div>
            `}
            <center>
                <a href="/" class="refresh-btn">🔄 Actualizar</a>
            </center>
        </div>
    </div>

    <!-- Modal para detalles de envío -->
    <div id="detailsModal" class="modal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <h2>📦 Detalles del Envío</h2>
            <div id="modalBody"></div>
        </div>
    </div>

    <script>
        const leadsData = ${JSON.stringify(leads.slice(-20).reverse())};

        function showDetails(idx) {
            const lead = leadsData[idx];
            if (!lead || !lead.datosEnvio) return;

            const e = lead.datosEnvio;
            let html = '';

            if (e.origen) {
                html += \`
                <div class="detail-section">
                    <h4>📍 ORIGEN</h4>
                    <div class="detail-row"><span class="detail-label">Nombre:</span><span class="detail-value">\${e.origen.nombre || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">RFC:</span><span class="detail-value">\${e.origen.rfc || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Dirección:</span><span class="detail-value">\${e.origen.calle || '-'}, \${e.origen.colonia || ''}</span></div>
                    <div class="detail-row"><span class="detail-label">Ciudad:</span><span class="detail-value">\${e.origen.ciudad || '-'}, \${e.origen.estado || ''}</span></div>
                    <div class="detail-row"><span class="detail-label">CP:</span><span class="detail-value">\${e.origen.codigoPostal || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Teléfono:</span><span class="detail-value">\${e.origen.telefono || '-'}</span></div>
                </div>\`;
            }

            if (e.destino) {
                html += \`
                <div class="detail-section">
                    <h4>📍 DESTINO</h4>
                    <div class="detail-row"><span class="detail-label">Nombre:</span><span class="detail-value">\${e.destino.nombre || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">RFC:</span><span class="detail-value">\${e.destino.rfc || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Dirección:</span><span class="detail-value">\${e.destino.calle || '-'}, \${e.destino.colonia || ''}</span></div>
                    <div class="detail-row"><span class="detail-label">Ciudad:</span><span class="detail-value">\${e.destino.ciudad || '-'}, \${e.destino.estado || ''}</span></div>
                    <div class="detail-row"><span class="detail-label">CP:</span><span class="detail-value">\${e.destino.codigoPostal || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Teléfono:</span><span class="detail-value">\${e.destino.telefono || '-'}</span></div>
                </div>\`;
            }

            if (e.paquete) {
                html += \`
                <div class="detail-section">
                    <h4>📦 PAQUETE</h4>
                    <div class="detail-row"><span class="detail-label">Contenido:</span><span class="detail-value">\${e.paquete.contenido || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Valor:</span><span class="detail-value">\${e.paquete.precioPorPieza || '-'}</span></div>
                    <div class="detail-row"><span class="detail-label">Medidas:</span><span class="detail-value">\${e.paquete.medidas || '-'} cm</span></div>
                    <div class="detail-row"><span class="detail-label">Peso:</span><span class="detail-value">\${e.paquete.peso || '-'} kg</span></div>
                    <div class="detail-row"><span class="detail-label">Paquetería:</span><span class="detail-value">\${e.paquete.paqueteria || '-'}</span></div>
                </div>\`;
            }

            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('detailsModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('detailsModal').classList.remove('active');
        }

        // Cerrar modal al hacer clic fuera
        document.getElementById('detailsModal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    </script>
</body>
</html>
    `);
});

// API: Obtener leads
app.get('/api/leads', (req, res) => {
    res.json({
        total: leads.length,
        leads: leads.slice(-50).reverse()
    });
});

// API: Obtener analytics
app.get('/api/analytics', (req, res) => {
    res.json({
        ...analytics,
        conversaciones: analytics.conversaciones.size,
        leadsHoy: leads.filter(l => new Date(l.fecha).toDateString() === new Date().toDateString()).length
    });
});

// API: Obtener lead específico con detalles
app.get('/api/leads/:id', (req, res) => {
    const lead = leads[req.params.id];
    if (!lead) {
        return res.status(404).json({ error: 'Lead no encontrado' });
    }
    res.json(lead);
});

// API: Simular mensaje (para pruebas)
app.post('/api/test', async (req, res) => {
    try {
        const { mensaje, numero = '5555555555' } = req.body;
        
        if (!mensaje) {
            return res.status(400).json({ error: 'Se requiere mensaje' });
        }

        const respuesta = await celexpressAI.procesarMensaje(numero, mensaje, 'Usuario Test');
        
        res.json({
            input: mensaje,
            output: respuesta,
            contexto: celexpressAI.context.get(numero)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Reiniciar conversación (para pruebas)
app.post('/api/reset/:numero', (req, res) => {
    celexpressAI.context.clear(req.params.numero);
    res.json({ success: true, message: `Conversación ${req.params.numero} reiniciada` });
});

// ============================================================
// 🚀 INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🤖 CELEXPRESS BOT ACTIVO v3.0               ║
║                                               ║
║   Puerto: ${PORT}                               ║
║   Dashboard: http://localhost:${PORT}           ║
║   Webhook: http://localhost:${PORT}/whatsapp    ║
║                                               ║
║   Twilio: ${client ? '✅ Conectado' : '❌ No configurado'}             ║
║                                               ║
║   NUEVO: Flujo de envíos paso a paso          ║
║   1) Origen → 2) Destino → 3) Paquete         ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;