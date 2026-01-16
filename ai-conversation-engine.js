/**
 * ============================================================
 * 🤖 CELEXPRESS AI CONVERSATION ENGINE v2.2
 * Sistema de IA Conversacional Ultra-Humanizado
 * ============================================================
 * 
 * CAMBIOS v2.2:
 * - Códigos postales (5 dígitos) en lugar de ciudades
 * - Detección más robusta de datos
 * 
 * CAMBIOS v2.1:
 * - Eliminado catálogo de equipos (sin marcas/modelos)
 * - Enfoque en capacidad de pago semanal
 * - Número de contacto: 56 6019 4420
 * - "Lleva tu paquete a CelExpress más cercano" (sin recolección)
 * - Captura de datos mejorada: todos juntos en una sola respuesta
 * - Eliminada confusión envíos vs iOS
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
// 🚚 TARIFARIO DE ENVÍOS
// ============================================================
const tarifarioEnvios = {
    FEDEX: {
        economico: [184, 189, 197, 209, 218, 230, 252, 274, 295, 310, 322, 326, 326, 326, 326],
        express: [217, 240, 240, 240, 240, 424, 506, 590, 673, 757, 840, 924, 1008, 1091, 1175]
    },
    DHL: {
        economico: [179, 182, 202, 221, 221, 334, 360, 422, 484, 546, 610, 673, 738, 802, 869],
        express: [185, 227, 227, 227, 227, 365, 365, 426, 490, 552, 617, 682, 748, 812, 880]
    },
    ESTAFETA: {
        economico: [173, 173, 173, 173, 173, 181, 187, 194, 200, 207, 214, 222, 229, 231, 231],
        express: [216, 237, 257, 279, 300, 322, 343, 364, 386, 406, 428, 449, 470, 492, 512]
    },

    obtenerMargen: function(peso) {
        if (peso <= 5) return 0.60;
        if (peso <= 15) return 0.50;
        if (peso <= 30) return 0.40;
        return 0.30;
    },

    cotizar: function(peso) {
        const pesoRedondeado = Math.ceil(peso);
        
        if (pesoRedondeado < 1 || pesoRedondeado > 15) {
            return { 
                error: true, 
                mensaje: `Manejamos envíos de 1 a 15 kg. Para paquetes más grandes, contáctanos directamente 😊\n\n📞 ${CONTACTO.telefono}` 
            };
        }

        const margen = this.obtenerMargen(pesoRedondeado);
        const opciones = [];

        for (const [paqueteria, servicios] of Object.entries(this).filter(([k]) => ['FEDEX', 'DHL', 'ESTAFETA'].includes(k))) {
            const costoEco = servicios.economico?.[pesoRedondeado - 1];
            const costoExp = servicios.express?.[pesoRedondeado - 1];

            if (costoEco) {
                opciones.push({
                    paqueteria,
                    servicio: 'Económico',
                    costo: costoEco,
                    precio: Math.round(costoEco * (1 + margen)),
                    tiempo: '3-5 días hábiles'
                });
            }
            if (costoExp) {
                opciones.push({
                    paqueteria,
                    servicio: 'Express',
                    costo: costoExp,
                    precio: Math.round(costoExp * (1 + margen)),
                    tiempo: '1-2 días hábiles'
                });
            }
        }

        opciones.sort((a, b) => a.precio - b.precio);

        return {
            error: false,
            peso: pesoRedondeado,
            opciones,
            mejorPrecio: opciones[0],
            masRapido: opciones.filter(o => o.servicio === 'Express').sort((a, b) => a.precio - b.precio)[0]
        };
    },

    formatearCotizacion: function(cotizacion) {
        if (cotizacion.error) return cotizacion.mensaje;

        const economicos = cotizacion.opciones.filter(o => o.servicio === 'Económico');
        const express = cotizacion.opciones.filter(o => o.servicio === 'Express');

        let respuesta = `📦 *Tu cotización para ${cotizacion.peso} kg*\n\n`;

        if (economicos.length > 0) {
            respuesta += `🚚 *ENVÍO ECONÓMICO* (3-5 días)\n`;
            economicos.forEach((op, i) => {
                const tag = i === 0 ? ' ⭐ _Mejor precio_' : '';
                respuesta += `   • ${op.paqueteria}: *$${op.precio} MXN*${tag}\n`;
            });
            respuesta += '\n';
        }

        if (express.length > 0) {
            respuesta += `⚡ *ENVÍO EXPRESS* (1-2 días)\n`;
            express.forEach((op, i) => {
                const tag = i === 0 ? ' 🚀 _Más rápido_' : '';
                respuesta += `   • ${op.paqueteria}: *$${op.precio} MXN*${tag}\n`;
            });
        }

        respuesta += `\n📍 *Lleva tu paquete a CelExpress más cercano*`;
        respuesta += `\n📞 Dudas: ${CONTACTO.telefono}`;

        return respuesta;
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
                /\benvios\b/i
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
        
        dar_peso: {
            patrones: [/(\d+(?:\.\d+)?)\s*(kg|kilo|kilogramo)?/i],
            peso: 2
        },
        
        confirmar_si: {
            patrones: [/^si$/i, /^s[ií]$/i, /^ok$/i, /^dale$/i, /^va$/i, /^claro$/i, /^simon$/i, /^sale$/i, /^perfecto$/i, /adelante/i, /de\s*acuerdo/i, /^yes$/i],
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
                cotizacionEnvio: null,
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
        this.envios = tarifarioEnvios;
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

        // MANEJO POR ETAPA
        if (ctx.etapa === 'esperando_peso') {
            const pesoMatch = intencion.textoOriginal.match(/(\d+(?:\.\d+)?)/);
            if (pesoMatch) {
                return this.procesarCotizacionEnvio(numero, parseFloat(pesoMatch[1]));
            } else {
                return "Por favor, dime el peso en kilogramos. Por ejemplo: *5* o *3.5 kg* 📦";
            }
        }

        if (ctx.etapa === 'esperando_confirmacion_envio') {
            if (intent === 'confirmar_si') {
                return this.capturarDatosEnvio(numero);
            } else if (intent === 'confirmar_no') {
                this.context.update(numero, { etapa: 'menu_principal' });
                return "Sin problema 👍 ¿Hay algo más en lo que te pueda ayudar?";
            }
        }

        if (ctx.etapa === 'capturando_datos') {
            return this.procesarDatosCliente(numero, intencion.textoOriginal, ctx);
        }

        if (ctx.etapa === 'preguntando_capacidad_pago') {
            const montoMatch = intencion.textoOriginal.match(/\$?\s*(\d+)/);
            if (montoMatch) {
                return this.mostrarCapacidadPago(numero, parseInt(montoMatch[1]));
            }
        }

        // MANEJO POR INTENCIÓN
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
                this.context.update(numero, { etapa: 'esperando_peso' });
                return `¡Claro que sí! 📦\n\n¿Cuántos kilogramos pesa tu paquete?\n\nSolo dime el número, por ejemplo: *5* o *3.5*`;

            case 'dar_peso':
                const pesoDirecto = parseFloat(intencion.principal.grupos?.[0] || intencion.textoOriginal.match(/(\d+(?:\.\d+)?)/)?.[1]);
                if (pesoDirecto && ctx.etapa === 'esperando_peso') {
                    return this.procesarCotizacionEnvio(numero, pesoDirecto);
                }
                break;

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
                if (ctx.etapa !== 'inicio' && ctx.etapa !== 'menu_principal') {
                    return this.continuarConversacion(numero, ctx, intencion);
                }
                return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n${respuestasHumanizadas.menuPrincipal}`;
        }
    }

    // CELULARES
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

    // ENVÍOS
    procesarCotizacionEnvio(numero, peso) {
        const cotizacion = this.envios.cotizar(peso);
        
        if (cotizacion.error) {
            return cotizacion.mensaje;
        }

        this.context.update(numero, { 
            etapa: 'esperando_confirmacion_envio',
            cotizacionEnvio: cotizacion
        });

        return `${this.envios.formatearCotizacion(cotizacion)}\n\n¿Te gustaría proceder con alguna opción? 🚚`;
    }

    capturarDatosEnvio(numero) {
        this.context.update(numero, { etapa: 'capturando_datos', tipoDatos: 'envio' });

        return `
¡Perfecto! 📦

Para generar tu guía necesito tus datos.

📝 *Envíame TODO en UN SOLO MENSAJE:*

1. Nombre completo
2. Teléfono (10 dígitos)
3. Correo electrónico
4. CP origen (5 dígitos)
5. CP destino (5 dígitos)

*Ejemplo:*
Juan Pérez García
5512345678
juan@email.com
06600
44100
        `.trim();
    }

    // CAPTURA DE DATOS CON CÓDIGOS POSTALES
    procesarDatosCliente(numero, texto, ctx) {
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Extraer email
        const emailMatch = texto.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch && !ctx.datosCliente.email) {
            ctx.datosCliente.email = emailMatch[0];
        }
        
        // Extraer teléfono (10 dígitos)
        const telefonoMatch = texto.match(/\b\d{10}\b/);
        if (telefonoMatch && !ctx.datosCliente.telefono) {
            ctx.datosCliente.telefono = telefonoMatch[0];
        }
        
        // Extraer códigos postales (5 dígitos) - buscar todos
        const codigosPostales = texto.match(/\b\d{5}\b/g) || [];
        
        if (ctx.tipoDatos === 'envio' && codigosPostales.length >= 2) {
            if (!ctx.datosCliente.cpOrigen) {
                ctx.datosCliente.cpOrigen = codigosPostales[0];
            }
            if (!ctx.datosCliente.cpDestino) {
                ctx.datosCliente.cpDestino = codigosPostales[1];
            }
        } else if (ctx.tipoDatos === 'envio' && codigosPostales.length === 1) {
            if (!ctx.datosCliente.cpOrigen) {
                ctx.datosCliente.cpOrigen = codigosPostales[0];
            } else if (!ctx.datosCliente.cpDestino) {
                ctx.datosCliente.cpDestino = codigosPostales[0];
            }
        }
        
        // Extraer nombre (línea con 2+ palabras, sin números de 10 o 5 dígitos, sin @)
        const posibleNombre = lineas.find(l => 
            l.split(' ').length >= 2 && 
            !l.match(/\b\d{10}\b/) && 
            !l.match(/\b\d{5}\b/) &&
            !l.includes('@') &&
            l.length > 5
        );
        
        if (posibleNombre && !ctx.datosCliente.nombre) {
            ctx.datosCliente.nombre = posibleNombre;
        }

        this.context.update(numero, { datosCliente: ctx.datosCliente });

        // Verificar qué falta
        const faltantes = [];
        if (!ctx.datosCliente.nombre) faltantes.push('nombre completo');
        if (!ctx.datosCliente.telefono) faltantes.push('teléfono (10 dígitos)');
        if (!ctx.datosCliente.email) faltantes.push('correo electrónico');
        
        if (ctx.tipoDatos === 'envio') {
            if (!ctx.datosCliente.cpOrigen) faltantes.push('CP origen (5 dígitos)');
            if (!ctx.datosCliente.cpDestino) faltantes.push('CP destino (5 dígitos)');
        }

        if (faltantes.length > 0) {
            return `📝 ¡Gracias! Ya tengo algunos datos.\n\nAún me falta:\n${faltantes.map(f => `• ${f}`).join('\n')}\n\n¿Me los compartes?`;
        }

        // Datos completos
        this.context.update(numero, { etapa: 'datos_completos' });

        let resumen = `
✅ *¡Datos registrados correctamente!*

📋 *Resumen:*
• Nombre: ${ctx.datosCliente.nombre}
• Teléfono: ${ctx.datosCliente.telefono}
• Email: ${ctx.datosCliente.email}`;

        if (ctx.tipoDatos === 'envio') {
            resumen += `
• CP Origen: ${ctx.datosCliente.cpOrigen}
• CP Destino: ${ctx.datosCliente.cpDestino}`;
        }

        resumen += `

Un asesor de *CelExpress* te contactará en breve para continuar.

📞 También puedes llamarnos: *${CONTACTO.telefono}*

¡Gracias por tu preferencia! 🙏`;

        return resumen.trim();
    }

    // SOPORTE
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
        
        if (ctx.etapa === 'mostrado_capacidad') {
            if (/si|sí|me interesa|quiero|va|dale|ok/i.test(texto)) {
                this.context.update(numero, { etapa: 'capturando_datos', tipoDatos: 'celular' });
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
        }

        return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n¿Te ayudo con celulares 📱 o envíos 📦?\n\n📞 Contacto directo: ${CONTACTO.telefono}`;
    }
}

// ============================================================
// 📤 EXPORTAR
// ============================================================
module.exports = {
    CelexpressAI,
    planesCredito,
    tarifarioEnvios,
    detectarIntencion,
    respuestasHumanizadas,
    ConversationContext,
    CONTACTO
};