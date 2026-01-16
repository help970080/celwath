/**
 * ============================================================
 * 🚀 CELEXPRESS WHATSAPP BOT - SERVIDOR PRINCIPAL v2.2
 * ============================================================
 * Bot ultra-humanizado para celulares y envíos
 * 
 * CAMBIOS v2.2:
 * - Dashboard muestra CP Origen y CP Destino
 * - Leads incluyen códigos postales
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
        if (ctx.datosCliente.email || ctx.datosCliente.telefono) {
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

        // Agregar CPs si es envío
        if (lead.cpOrigen || lead.cpDestino) {
            mensaje += `
📍 CP Origen: ${lead.cpOrigen || '-'}
📍 CP Destino: ${lead.cpDestino || '-'}`;
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
        cotizacion: ctx.cotizacionEnvio,
        fecha: new Date(),
        estado: 'nuevo'
    };

    if (!leadExistente) {
        leads.push(nuevoLead);
        analytics.leadsCapturados++;
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
    res.json({ status: 'OK', version: '2.2', timestamp: new Date().toISOString() });
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
        .leads-section { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow-x: auto; }
        .leads-section h2 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 900px; }
        th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.9em; }
        th { background: #f8f9fa; color: #333; font-weight: 600; }
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 CelExpress Bot <span class="version">v2.2</span></h1>
        
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
                    </tr>
                </thead>
                <tbody>
                    ${leads.slice(-15).reverse().map(l => `
                    <tr>
                        <td>${l.nombre || '-'}</td>
                        <td>${l.telefono || '-'}</td>
                        <td>${l.email || '-'}</td>
                        <td><span class="badge badge-${l.interes?.toLowerCase().replace('í','i') || 'general'}">${l.interes || 'General'}</span></td>
                        <td>${l.cpOrigen ? `<span class="cp-badge">${l.cpOrigen}</span>` : '-'}</td>
                        <td>${l.cpDestino ? `<span class="cp-badge">${l.cpDestino}</span>` : '-'}</td>
                        <td>${new Date(l.fecha).toLocaleString('es-MX')}</td>
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

// ============================================================
// 🚀 INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🤖 CELEXPRESS BOT ACTIVO v2.2               ║
║                                               ║
║   Puerto: ${PORT}                               ║
║   Dashboard: http://localhost:${PORT}           ║
║   Webhook: http://localhost:${PORT}/whatsapp    ║
║                                               ║
║   Twilio: ${client ? '✅ Conectado' : '❌ No configurado'}             ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;