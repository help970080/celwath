/**
 * ============================================================
 * 🤖 CELEXPRESS AI CONVERSATION ENGINE v3.0
 * Sistema de IA Conversacional Ultra-Humanizado
 * ============================================================
 * 
 * CAMBIOS v3.0:
 * - Flujo de envíos paso a paso: 1) Origen, 2) Destino, 3) Datos adicionales
 * - Soporte para códigos postales internacionales (no solo México)
 * - Precios de envío cotizados por asistente humano
 * - Captura completa de datos para logística
 * 
 * CAMBIOS v2.2:
 * - Códigos postales en lugar de ciudades
 * - Detección más robusta de datos
 */

// ============================================================
// 📞 CONFIGURACIÓN DE CONTACTO
// ============================================================
const CONTACTO = {
    telefono: '56 6019 4420',
    telefonoLimpio: '5660194420',
    horario: 'Lunes a Sábado 9:00am - 7:00pm'
};

// ============================================================
// 💳 SISTEMA DE CRÉDITO CELEXPRESS
// ============================================================
const planesCredito = {
    ENGANCHE_PORCENTAJE: 10,
    SEMANAS: 17,
    
    descripcion: `
En CelExpress te damos facilidades reales para que estrenes tu celular HOY:

✅ *Sin buró de crédito* - No importa tu historial
✅ *Aprobación en minutos* - Solo necesitas tu INE
✅ *Enganche solo 10%* - El más bajo del mercado
✅ *17 pagos semanales* - Cómodo y rápido
✅ *Sin aval* - Tu palabra es suficiente
    `.trim(),
    
    calcularEquipoPorCapacidad: function(pagoSemanalDisponible) {
        const saldoMaximo = pagoSemanalDisponible * this.SEMANAS;
        const precioMaximoEquipo = Math.round(saldoMaximo / 0.90);
        const enganche = Math.round(precioMaximoEquipo * 0.10);
        
        return {
            pagoSemanal: pagoSemanalDisponible,
            precioMaximoEquipo,
            enganche,
            semanas: this.SEMANAS
        };
    }
};

// ============================================================
// 🧠 MOTOR DE INTENCIONES
// ============================================================
const detectarIntencion = (texto) => {
    const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const intenciones = {
        saludo: {
            patrones: [/^hola/i, /buenas?\s*(dias?|tardes?|noches?)/i, /que\s*tal/i, /^hey$/i, /^hi$/i, /^ola$/i, /buen\s*dia/i],
            peso: 1
        },
        
        cotizar_envio: {
            patrones: [
                /\benv[ií]o/i,
                /\benviar\b/i,
                /\bpaquete/i,
                /\bmandar\b/i,
                /\bgu[ií]a\b/i,
                /\bcotiza/i,
                /\bmensajer[ií]a/i,
                /\bpaqueter[ií]a/i,
                /\bfedex/i,
                /\bdhl/i,
                /\bestafeta/i,
                /\benvios\b/i,
                /\blogistica/i,
                /\bhws/i
            ],
            peso: 10
        },
        
        ver_celulares: {
            patrones: [/celular/i, /telefono/i, /equipo/i, /smartphone/i, /tienen\s*cel/i, /venden\s*cel/i, /movil/i],
            peso: 2
        },
        
        preguntar_credito: {
            patrones: [/credito/i, /financ/i, /plazos?/i, /apartado/i, /abonos?/i, /mensualidad/i, /enganche/i, /semana/i],
            peso: 3
        },

        capacidad_pago: {
            patrones: [
                /puedo\s*pagar\s*\$?(\d+)/i, 
                /(\d+)\s*(pesos?)?\s*(semanal|a la semana|por semana)/i, 
                /mi\s*pago.*\$?(\d+)/i, 
                /tengo\s*para\s*\$?(\d+)/i,
                /dispongo\s*de\s*\$?(\d+)/i,
                /\$?\s*(\d{2,4})\s*(semanal|por\s*semana|a\s*la\s*semana)/i
            ],
            peso: 5
        },
        
        confirmar_si: {
            patrones: [/^si$/i, /^s[ií]$/i, /^ok$/i, /^dale$/i, /^va$/i, /^claro$/i, /^simon$/i, /^sale$/i, /^perfecto$/i, /adelante/i, /de\s*acuerdo/i, /^yes$/i, /^listo$/i],
            peso: 4
        },
        confirmar_no: {
            patrones: [/^no$/i, /^nel$/i, /^nop$/i, /^nope$/i, /dejalo/i, /cancelar/i, /otro\s*dia/i],
            peso: 4
        },
        
        despedida: {
            patrones: [/gracias/i, /bye/i, /adios/i, /hasta\s*luego/i, /nos\s*vemos/i, /chao/i],
            peso: 2
        },
        
        quiere_humano: {
            patrones: [/asesor/i, /humano/i, /persona\s*real/i, /hablar\s*con\s*alguien/i, /llamar/i, /telefono\s*para\s*llamar/i, /ayuda\s*personal/i, /contacto/i, /numero/i],
            peso: 4
        },
        
        queja: {
            patrones: [/problema/i, /queja/i, /no\s*funciona/i, /mal\s*servicio/i, /devolucion/i, /garantia/i],
            peso: 4
        },
        
        preguntar_ubicacion: {
            patrones: [/donde\s*(estan|queda|ubic)/i, /direccion/i, /sucursal/i, /tienda\s*fisica/i, /ir\s*a\s*verlos/i, /ubicacion/i],
            peso: 3
        }
    };

    const intencionesDetectadas = [];
    
    for (const [nombre, config] of Object.entries(intenciones)) {
        for (const patron of config.patrones) {
            const match = t.match(patron);
            if (match) {
                intencionesDetectadas.push({
                    nombre,
                    peso: config.peso,
                    match: match[0],
                    grupos: match.slice(1)
                });
                break;
            }
        }
    }

    intencionesDetectadas.sort((a, b) => b.peso - a.peso);
    
    return {
        principal: intencionesDetectadas[0] || { nombre: 'desconocido', peso: 0 },
        todas: intencionesDetectadas,
        textoOriginal: texto
    };
};

// ============================================================
// 🎭 RESPUESTAS HUMANIZADAS
// ============================================================
const respuestasHumanizadas = {
    saludos: [
        "¡Hola! 👋 Qué gusto saludarte. Soy tu asistente de CelExpress.",
        "¡Hey! 😊 Bienvenido a CelExpress. ¿En qué te ayudo?",
        "¡Hola! Me da mucho gusto atenderte. Soy de CelExpress.",
        "¡Qué tal! 👋 Aquí estoy para ayudarte con lo que necesites."
    ],
    
    menuPrincipal: `
¿En qué te puedo ayudar hoy?

📱 *Celulares a crédito* - Sin buró, enganche 10%
📦 *Envíos* - Cotiza tu paquete (FedEx, DHL, Estafeta)
📞 *Contacto* - Hablar con un asesor

Solo dime qué te interesa 👆
    `.trim(),

    noEntiendo: [
        "Mmm, no estoy seguro de entenderte 🤔 ¿Me puedes decir de otra forma?",
        "Disculpa, ¿podrías ser más específico? Quiero ayudarte bien 😊",
        "No capté eso, ¿me lo explicas diferente? Estoy aquí para ayudarte."
    ],

    despedidas: [
        "¡Gracias por contactarnos! 🙏 Estamos aquí cuando nos necesites.",
        "¡Fue un gusto atenderte! No dudes en escribir si tienes más dudas 👋",
        "¡Hasta pronto! Recuerda que en CelExpress siempre hay buen trato 😊"
    ],

    random: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// ============================================================
// 🔄 CONTEXTO DE CONVERSACIÓN
// ============================================================
class ConversationContext {
    constructor() {
        this.conversations = new Map();
    }

    get(numero) {
        if (!this.conversations.has(numero)) {
            this.conversations.set(numero, {
                etapa: 'inicio',
                ultimaIntencion: null,
                // Datos de envío estructurados
                datosEnvio: {
                    origen: {
                        nombre: null,
                        rfc: null,
                        calle: null,
                        colonia: null,
                        ciudad: null,
                        estado: null,
                        codigoPostal: null,
                        telefono: null
                    },
                    destino: {
                        nombre: null,
                        rfc: null,
                        calle: null,
                        colonia: null,
                        ciudad: null,
                        estado: null,
                        codigoPostal: null,
                        telefono: null
                    },
                    paquete: {
                        contenido: null,
                        uso: null,
                        material: null,
                        precioPorPieza: null,
                        paqueteria: null,
                        alto: null,
                        ancho: null,
                        largo: null,
                        peso: null
                    }
                },
                datosCliente: {},
                historial: [],
                inicioConversacion: Date.now(),
                ultimaInteraccion: Date.now()
            });
        }
        return this.conversations.get(numero);
    }

    update(numero, data) {
        const ctx = this.get(numero);
        Object.assign(ctx, data, { ultimaInteraccion: Date.now() });
        return ctx;
    }

    addHistorial(numero, mensaje, esUsuario = true) {
        const ctx = this.get(numero);
        ctx.historial.push({
            timestamp: Date.now(),
            mensaje,
            esUsuario
        });
        if (ctx.historial.length > 20) {
            ctx.historial = ctx.historial.slice(-20);
        }
    }

    clear(numero) {
        this.conversations.delete(numero);
    }
}

// ============================================================
// 🤖 MOTOR PRINCIPAL
// ============================================================
class CelexpressAI {
    constructor() {
        this.context = new ConversationContext();
        this.credito = planesCredito;
    }

    async procesarMensaje(numero, texto, nombreUsuario = null) {
        const ctx = this.context.get(numero);
        this.context.addHistorial(numero, texto, true);

        const intencion = detectarIntencion(texto);
        ctx.ultimaIntencion = intencion;

        let respuesta = await this.generarRespuesta(numero, intencion, ctx, nombreUsuario);
        
        this.context.addHistorial(numero, respuesta, false);
        return respuesta;
    }

    async generarRespuesta(numero, intencion, ctx, nombreUsuario) {
        const intent = intencion.principal.nombre;

        // ============================================================
        // 📦 FLUJO DE ENVÍOS PASO A PASO
        // ============================================================
        
        // PASO 1: Capturando datos de ORIGEN
        if (ctx.etapa === 'envio_capturando_origen') {
            return this.procesarDatosOrigen(numero, intencion.textoOriginal, ctx);
        }

        // PASO 2: Capturando datos de DESTINO
        if (ctx.etapa === 'envio_capturando_destino') {
            return this.procesarDatosDestino(numero, intencion.textoOriginal, ctx);
        }

        // PASO 3: Capturando datos ADICIONALES del paquete
        if (ctx.etapa === 'envio_capturando_paquete') {
            return this.procesarDatosPaquete(numero, intencion.textoOriginal, ctx);
        }

        // ============================================================
        // 📱 FLUJO DE CELULARES
        // ============================================================
        
        if (ctx.etapa === 'preguntando_capacidad_pago') {
            const montoMatch = intencion.textoOriginal.match(/\$?\s*(\d+)/);
            if (montoMatch) {
                return this.mostrarCapacidadPago(numero, parseInt(montoMatch[1]));
            }
        }

        if (ctx.etapa === 'capturando_datos_celular') {
            return this.procesarDatosClienteCelular(numero, intencion.textoOriginal, ctx);
        }

        // ============================================================
        // MANEJO POR INTENCIÓN
        // ============================================================
        switch (intent) {
            case 'saludo':
                this.context.update(numero, { etapa: 'menu_principal' });
                const saludo = nombreUsuario 
                    ? `¡Hola ${nombreUsuario}! 👋 Qué gusto saludarte.`
                    : respuestasHumanizadas.random(respuestasHumanizadas.saludos);
                return `${saludo}\n\n${respuestasHumanizadas.menuPrincipal}`;

            case 'ver_celulares':
                return this.mostrarInfoCelulares(numero);

            case 'preguntar_credito':
                return this.explicarCredito(numero);

            case 'capacidad_pago':
                const montoCapacidad = intencion.textoOriginal.match(/\$?\s*(\d+)/);
                if (montoCapacidad) {
                    return this.mostrarCapacidadPago(numero, parseInt(montoCapacidad[1]));
                }
                this.context.update(numero, { etapa: 'preguntando_capacidad_pago' });
                return "¿Cuánto puedes pagar a la semana? Dime una cantidad, por ejemplo: *$300*";

            case 'cotizar_envio':
                return this.iniciarCotizacionEnvio(numero);

            case 'quiere_humano':
                return this.mostrarContacto(numero);

            case 'queja':
                return this.manejarQueja(numero);

            case 'preguntar_ubicacion':
                return this.mostrarUbicacion(numero);

            case 'despedida':
                this.context.clear(numero);
                return respuestasHumanizadas.random(respuestasHumanizadas.despedidas);

            default:
                if (ctx.etapa === 'mostrado_capacidad') {
                    return this.continuarFlujoCelular(numero, ctx, intencion);
                }
                if (ctx.etapa !== 'inicio' && ctx.etapa !== 'menu_principal') {
                    return this.continuarConversacion(numero, ctx, intencion);
                }
                return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n${respuestasHumanizadas.menuPrincipal}`;
        }
    }

    // ============================================================
    // 📦 NUEVO FLUJO DE ENVÍOS - PASO A PASO
    // ============================================================

    iniciarCotizacionEnvio(numero) {
        this.context.update(numero, { etapa: 'envio_capturando_origen' });

        return `
📦 *¡Claro! Te ayudo con tu cotización de envío*

Vamos paso a paso para darte la mejor opción.

━━━━━━━━━━━━━━━━━━━━━
*1️⃣ DATOS DE ORIGEN*
━━━━━━━━━━━━━━━━━━━━━

Envíame en *un solo mensaje* los datos de quien envía:

• Nombre y apellido
• RFC o Tax ID (si aplica, si no pon "N/A")
• Calle y número
• Colonia
• Ciudad
• Estado
• Código postal
• Teléfono

*Ejemplo:*
Juan Pérez García
N/A
Av. Insurgentes 123
Roma Norte
Ciudad de México
CDMX
06700
5512345678
        `.trim();
    }

    procesarDatosOrigen(numero, texto, ctx) {
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lineas.length < 5) {
            return `
📝 Parece que faltan algunos datos de origen.

Por favor envía todos los datos en un mensaje:
• Nombre y apellido
• RFC o Tax ID (o "N/A")
• Calle y número
• Colonia
• Ciudad
• Estado
• Código postal
• Teléfono

Así puedo procesar tu cotización correctamente 😊
            `.trim();
        }

        // Extraer teléfono (buscar número de 10+ dígitos)
        const telefonoMatch = texto.match(/\b\d{10,15}\b/);
        
        // Extraer código postal (puede ser internacional: 4-10 dígitos)
        const cpMatch = texto.match(/\b\d{4,10}\b/g);
        
        // Guardar datos de origen
        ctx.datosEnvio.origen = {
            nombre: lineas[0] || null,
            rfc: lineas[1] || 'N/A',
            calle: lineas[2] || null,
            colonia: lineas[3] || null,
            ciudad: lineas[4] || null,
            estado: lineas[5] || null,
            codigoPostal: lineas[6] || (cpMatch ? cpMatch[0] : null),
            telefono: lineas[7] || (telefonoMatch ? telefonoMatch[0] : null)
        };

        // También guardar para el registro de lead
        ctx.datosCliente.cpOrigen = ctx.datosEnvio.origen.codigoPostal;
        ctx.datosCliente.nombre = ctx.datosEnvio.origen.nombre;
        ctx.datosCliente.telefono = ctx.datosEnvio.origen.telefono;

        this.context.update(numero, { 
            etapa: 'envio_capturando_destino',
            datosEnvio: ctx.datosEnvio,
            datosCliente: ctx.datosCliente
        });

        return `
✅ *Datos de origen registrados*

━━━━━━━━━━━━━━━━━━━━━
*2️⃣ DATOS DE DESTINO*
━━━━━━━━━━━━━━━━━━━━━

Ahora envíame los datos de quien *recibe* el paquete:

• Nombre y apellido
• RFC o Tax ID (si aplica, si no pon "N/A")
• Calle y número
• Colonia
• Ciudad
• Estado
• Código postal
• Teléfono

*Ejemplo:*
María López Hernández
N/A
Calle Reforma 456
Centro
Guadalajara
Jalisco
44100
3312345678
        `.trim();
    }

    procesarDatosDestino(numero, texto, ctx) {
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lineas.length < 5) {
            return `
📝 Parece que faltan algunos datos de destino.

Por favor envía todos los datos en un mensaje:
• Nombre y apellido
• RFC o Tax ID (o "N/A")
• Calle y número
• Colonia
• Ciudad
• Estado
• Código postal
• Teléfono

Para continuar con tu cotización 📦
            `.trim();
        }

        // Extraer teléfono
        const telefonoMatch = texto.match(/\b\d{10,15}\b/);
        
        // Extraer código postal
        const cpMatch = texto.match(/\b\d{4,10}\b/g);
        
        // Guardar datos de destino
        ctx.datosEnvio.destino = {
            nombre: lineas[0] || null,
            rfc: lineas[1] || 'N/A',
            calle: lineas[2] || null,
            colonia: lineas[3] || null,
            ciudad: lineas[4] || null,
            estado: lineas[5] || null,
            codigoPostal: lineas[6] || (cpMatch ? cpMatch[0] : null),
            telefono: lineas[7] || (telefonoMatch ? telefonoMatch[0] : null)
        };

        // También guardar para el registro de lead
        ctx.datosCliente.cpDestino = ctx.datosEnvio.destino.codigoPostal;

        this.context.update(numero, { 
            etapa: 'envio_capturando_paquete',
            datosEnvio: ctx.datosEnvio,
            datosCliente: ctx.datosCliente
        });

        return `
✅ *Datos de destino registrados*

━━━━━━━━━━━━━━━━━━━━━
*3️⃣ DATOS DEL PAQUETE*
━━━━━━━━━━━━━━━━━━━━━

Por último, necesito los detalles del paquete:

• Contenido del paquete (qué es, uso, material)
• Precio por pieza (valor declarado)
• Paquetería preferida (FedEx, DHL, Estafeta o "Sin preferencia")
• Medidas en cm: Alto x Ancho x Largo
• Peso en kg

*Ejemplo:*
Laptop para trabajo, plástico y metal
$15,000
Sin preferencia
30 x 40 x 10
2.5
        `.trim();
    }

    procesarDatosPaquete(numero, texto, ctx) {
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lineas.length < 3) {
            return `
📝 Necesito un poco más de información del paquete:

• Contenido (qué es, uso, material)
• Precio por pieza
• Paquetería preferida
• Medidas en cm (Alto x Ancho x Largo)
• Peso en kg

Esto me ayuda a darte la mejor cotización 📦
            `.trim();
        }

        // Extraer peso (número seguido de kg o solo número con decimales)
        const pesoMatch = texto.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos?)?/i);
        
        // Extraer medidas
        const medidasMatch = texto.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i);
        
        // Extraer precio
        const precioMatch = texto.match(/\$?\s*([\d,]+(?:\.\d{2})?)/);

        // Guardar datos del paquete
        ctx.datosEnvio.paquete = {
            contenido: lineas[0] || null,
            precioPorPieza: lineas[1] || (precioMatch ? precioMatch[0] : null),
            paqueteria: lineas[2] || 'Sin preferencia',
            medidas: lineas[3] || (medidasMatch ? `${medidasMatch[1]} x ${medidasMatch[2]} x ${medidasMatch[3]}` : null),
            peso: lineas[4] || (pesoMatch ? pesoMatch[1] : null)
        };

        if (medidasMatch) {
            ctx.datosEnvio.paquete.alto = medidasMatch[1];
            ctx.datosEnvio.paquete.ancho = medidasMatch[2];
            ctx.datosEnvio.paquete.largo = medidasMatch[3];
        }

        this.context.update(numero, { 
            etapa: 'envio_datos_completos',
            datosEnvio: ctx.datosEnvio,
            cotizacionEnvio: ctx.datosEnvio // Para el registro de lead
        });

        // Generar resumen completo
        const origen = ctx.datosEnvio.origen;
        const destino = ctx.datosEnvio.destino;
        const paquete = ctx.datosEnvio.paquete;

        return `
✅ *¡SOLICITUD DE COTIZACIÓN REGISTRADA!*

━━━━━━━━━━━━━━━━━━━━━
📍 *ORIGEN*
━━━━━━━━━━━━━━━━━━━━━
👤 ${origen.nombre}
🏠 ${origen.calle}, ${origen.colonia}
🌆 ${origen.ciudad}, ${origen.estado}
📮 CP: ${origen.codigoPostal}
📞 ${origen.telefono}

━━━━━━━━━━━━━━━━━━━━━
📍 *DESTINO*
━━━━━━━━━━━━━━━━━━━━━
👤 ${destino.nombre}
🏠 ${destino.calle}, ${destino.colonia}
🌆 ${destino.ciudad}, ${destino.estado}
📮 CP: ${destino.codigoPostal}
📞 ${destino.telefono}

━━━━━━━━━━━━━━━━━━━━━
📦 *PAQUETE*
━━━━━━━━━━━━━━━━━━━━━
📋 ${paquete.contenido}
💰 Valor: ${paquete.precioPorPieza}
📐 Medidas: ${paquete.medidas} cm
⚖️ Peso: ${paquete.peso} kg
🚚 Paquetería: ${paquete.paqueteria}

━━━━━━━━━━━━━━━━━━━━━

🎯 *Un asesor de CelExpress se comunicará contigo en breve* para proporcionarte las opciones de precio y confirmar los detalles de tu envío.

📞 O si prefieres, contáctanos directamente:
*${CONTACTO.telefono}*
⏰ ${CONTACTO.horario}

¡Gracias por tu preferencia! 🙏
        `.trim();
    }

    // ============================================================
    // 📱 CELULARES
    // ============================================================
    mostrarInfoCelulares(numero) {
        this.context.update(numero, { etapa: 'preguntando_capacidad_pago' });

        return `
📱 *CELULARES A CRÉDITO EN CELEXPRESS*

Tenemos variedad de equipos Samsung, Xiaomi y Motorola.

💳 *Nuestro crédito:*
• Enganche: solo *10%*
• Plazo: *17 semanas*
• Sin buró de crédito ✅
• Aprobación inmediata ✅

💰 *¿Cuánto puedes pagar a la semana?*

Dime una cantidad (ejemplo: *$300*) y te digo qué equipos te alcanzan.

O si prefieres, *contáctanos directamente*:
📞 ${CONTACTO.telefono}
        `.trim();
    }

    explicarCredito(numero) {
        this.context.update(numero, { etapa: 'preguntando_capacidad_pago' });

        return `
💳 *CRÉDITO CELEXPRESS - SÚPER FÁCIL*

${this.credito.descripcion}

📋 *¿QUÉ NECESITO?*
• INE vigente
• Comprobante de domicilio
• Un número de referencia personal

⏱️ *¿CUÁNTO TARDA?*
La aprobación es en el momento. 
Sales con tu celular el mismo día.

💰 *¿Cuánto puedes pagar a la semana?*
Dime y te calculo qué equipos te alcanzan 👆

📞 O llámanos: ${CONTACTO.telefono}
        `.trim();
    }

    mostrarCapacidadPago(numero, pagoSemanal) {
        this.context.update(numero, { 
            etapa: 'mostrado_capacidad',
            capacidadPago: pagoSemanal 
        });

        if (pagoSemanal < 150) {
            return `
Con *$${pagoSemanal}/semana* el monto es muy bajo para nuestros equipos 😔

El pago mínimo semanal es aproximadamente *$150-$200* para los equipos más accesibles.

¿Podrías aumentar un poco tu pago semanal? 

📞 O contáctanos para buscar opciones: ${CONTACTO.telefono}
            `.trim();
        }

        const capacidad = this.credito.calcularEquipoPorCapacidad(pagoSemanal);

        return `
💰 *Con $${pagoSemanal}/semana te alcanza para:*

📱 Equipos de hasta *$${capacidad.precioMaximoEquipo.toLocaleString()} MXN*
💵 Enganche aproximado: *$${capacidad.enganche.toLocaleString()}*
📅 17 pagos semanales de *$${pagoSemanal}*

✅ Sin revisar buró de crédito
✅ Aprobación en el momento
✅ Solo necesitas tu INE

🎯 *¿Te interesa?*

Contáctanos para ver los equipos disponibles en tu rango:
📞 *${CONTACTO.telefono}*

O si prefieres, déjame tus datos y un asesor te contacta 👇
        `.trim();
    }

    continuarFlujoCelular(numero, ctx, intencion) {
        const texto = intencion.textoOriginal.toLowerCase();
        
        if (/si|sí|me interesa|quiero|va|dale|ok|listo/i.test(texto)) {
            this.context.update(numero, { etapa: 'capturando_datos_celular', tipoDatos: 'celular' });
            return `
¡Excelente! 🎉

Para que un asesor te contacte, envíame en UN SOLO MENSAJE:

1. Nombre completo
2. Teléfono (10 dígitos)
3. Correo electrónico

*Ejemplo:*
Juan Pérez García
5512345678
juan@email.com
            `.trim();
        }

        return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n¿Te ayudo con celulares 📱 o envíos 📦?\n\n📞 Contacto directo: ${CONTACTO.telefono}`;
    }

    procesarDatosClienteCelular(numero, texto, ctx) {
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Extraer email
        const emailMatch = texto.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
            ctx.datosCliente.email = emailMatch[0];
        }
        
        // Extraer teléfono (10 dígitos)
        const telefonoMatch = texto.match(/\b\d{10}\b/);
        if (telefonoMatch) {
            ctx.datosCliente.telefono = telefonoMatch[0];
        }
        
        // Extraer nombre (línea con 2+ palabras, sin números largos, sin @)
        const posibleNombre = lineas.find(l => 
            l.split(' ').length >= 2 && 
            !l.match(/\b\d{10}\b/) && 
            !l.includes('@') &&
            l.length > 5
        );
        
        if (posibleNombre) {
            ctx.datosCliente.nombre = posibleNombre;
        }

        this.context.update(numero, { datosCliente: ctx.datosCliente });

        // Verificar qué falta
        const faltantes = [];
        if (!ctx.datosCliente.nombre) faltantes.push('nombre completo');
        if (!ctx.datosCliente.telefono) faltantes.push('teléfono (10 dígitos)');
        if (!ctx.datosCliente.email) faltantes.push('correo electrónico');

        if (faltantes.length > 0) {
            return `📝 ¡Gracias! Ya tengo algunos datos.\n\nAún me falta:\n${faltantes.map(f => `• ${f}`).join('\n')}\n\n¿Me los compartes?`;
        }

        // Datos completos
        this.context.update(numero, { etapa: 'datos_completos' });

        return `
✅ *¡Datos registrados correctamente!*

📋 *Resumen:*
• Nombre: ${ctx.datosCliente.nombre}
• Teléfono: ${ctx.datosCliente.telefono}
• Email: ${ctx.datosCliente.email}

Un asesor de *CelExpress* te contactará en breve para mostrarte los equipos disponibles.

📞 También puedes llamarnos: *${CONTACTO.telefono}*

¡Gracias por tu preferencia! 🙏
        `.trim();
    }

    // ============================================================
    // 📞 SOPORTE
    // ============================================================
    mostrarContacto(numero) {
        this.context.update(numero, { etapa: 'contacto' });

        return `
📞 *CONTACTO CELEXPRESS*

Estamos para atenderte:

📱 *WhatsApp/Tel:* ${CONTACTO.telefono}
⏰ *Horario:* ${CONTACTO.horario}

¿Prefieres que te llamemos? 
Déjame tu nombre y número aquí y un asesor te contacta 👇
        `.trim();
    }

    manejarQueja(numero) {
        this.context.update(numero, { etapa: 'queja' });

        return `
Lamento mucho que tengas un inconveniente 😔

Tu satisfacción es muy importante para nosotros.

Para atenderte mejor, comunícate directamente con nosotros:

📞 *${CONTACTO.telefono}*
⏰ ${CONTACTO.horario}

Un supervisor revisará tu caso personalmente.
        `.trim();
    }

    mostrarUbicacion(numero) {
        return `
📍 *CELEXPRESS*

🏪 Visítanos en nuestra sucursal más cercana

⏰ *Horario:*
${CONTACTO.horario}
Domingo: Cerrado

📱 *Contacto:*
WhatsApp/Tel: ${CONTACTO.telefono}

📦 *Para envíos:*
Lleva tu paquete a CelExpress más cercano

¡Te esperamos! 🎉
        `.trim();
    }

    continuarConversacion(numero, ctx, intencion) {
        const texto = intencion.textoOriginal.toLowerCase();
        
        return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n¿Te ayudo con celulares 📱 o envíos 📦?\n\n📞 Contacto directo: ${CONTACTO.telefono}`;
    }
}

// ============================================================
// 📤 EXPORTAR
// ============================================================
module.exports = {
    CelexpressAI,
    planesCredito,
    detectarIntencion,
    respuestasHumanizadas,
    ConversationContext,
    CONTACTO
};