/**
 * ============================================================
 * 🤖 CELEXPRESS AI CONVERSATION ENGINE
 * Sistema de IA Conversacional Ultra-Humanizado
 * ============================================================
 * 
 * Este motor de conversación hace que el bot se sienta como
 * hablar con un asesor real experto en celulares y envíos.
 * 
 * Características:
 * - Detección inteligente de intención
 * - Manejo de contexto multi-turno
 * - Respuestas naturales y empáticas
 * - Escalamiento inteligente a humano
 * - Personalización basada en historial
 */

// ============================================================
// 📦 CATÁLOGO DE PRODUCTOS CELEXPRESS
// ============================================================
const catalogoCelulares = {
    // SAMSUNG
    'samsung-a15': {
        marca: 'Samsung',
        modelo: 'Galaxy A15',
        nombre: 'Samsung Galaxy A15 128GB',
        precio: 5166,
        especificaciones: {
            pantalla: '6.5" AMOLED FHD+ 90Hz',
            ram: '4GB',
            almacenamiento: '128GB',
            camara: '50MP triple + 13MP frontal',
            bateria: '5000mAh',
            extras: ['NFC', 'Reconocimiento facial', 'Huella dactilar', 'eSIM']
        },
        colores: ['Blue Black', 'Light Blue'],
        puntosFuertes: ['Pantalla AMOLED brillante', 'Batería de larga duración', 'Cámara profesional'],
        paraQuien: 'Ideal para redes sociales, fotos y uso diario intensivo',
        videoUrl: 'https://youtu.be/u8QMhOvhS_4'
    },
    'samsung-m15': {
        marca: 'Samsung',
        modelo: 'Galaxy M15 5G',
        nombre: 'Samsung Galaxy M15 5G 128GB',
        precio: 4517,
        especificaciones: {
            pantalla: '6.6" Super AMOLED',
            ram: '4GB',
            almacenamiento: '128GB',
            camara: '50MP + 13MP frontal',
            bateria: '6000mAh',
            extras: ['5G', 'NFC', 'Huella dactilar']
        },
        colores: ['Gris'],
        puntosFuertes: ['Conectividad 5G', 'Batería monstruo de 6000mAh', 'Precio accesible'],
        paraQuien: 'Perfecto para quien busca 5G sin gastar de más',
        videoUrl: 'https://youtu.be/QeEPqqqu7l4'
    },
    // MOTOROLA
    'moto-g24': {
        marca: 'Motorola',
        modelo: 'Moto G24',
        nombre: 'Motorola Moto G24 128GB',
        precio: 3329,
        especificaciones: {
            pantalla: '6.6" IPS LCD 90Hz',
            ram: '4GB',
            almacenamiento: '128GB',
            camara: '50MP + 8MP frontal',
            bateria: '5000mAh',
            extras: ['Android puro', 'Sin bloatware', 'Actualizaciones garantizadas']
        },
        colores: ['Negro', 'Azul'],
        puntosFuertes: ['Android limpio', 'Muy fluido', 'Excelente relación calidad-precio'],
        paraQuien: 'Para quien quiere un teléfono confiable sin complicaciones',
        videoUrl: 'https://youtu.be/mYRc-sBKNS8'
    },
    // XIAOMI
    'redmi-note-12': {
        marca: 'Xiaomi',
        modelo: 'Redmi Note 12',
        nombre: 'Xiaomi Redmi Note 12 128GB',
        precio: 4200,
        especificaciones: {
            pantalla: '6.67" AMOLED 120Hz',
            ram: '4GB',
            almacenamiento: '128GB',
            camara: '50MP + 13MP frontal',
            bateria: '5000mAh',
            extras: ['Carga rápida 33W', 'MIUI optimizado']
        },
        colores: ['Negro', 'Azul', 'Verde'],
        puntosFuertes: ['Pantalla súper fluida 120Hz', 'Carga rápida', 'Diseño elegante'],
        paraQuien: 'Ideal para gaming y multimedia',
        videoUrl: null
    },
    // IPHONE (ejemplo para referencia)
    'iphone-13': {
        marca: 'Apple',
        modelo: 'iPhone 13',
        nombre: 'iPhone 13 128GB',
        precio: 12500,
        especificaciones: {
            pantalla: '6.1" Super Retina XDR',
            ram: '4GB',
            almacenamiento: '128GB',
            camara: '12MP dual + 12MP TrueDepth',
            bateria: 'Hasta 19hrs video',
            extras: ['iOS 17', 'Face ID', '5G', 'MagSafe']
        },
        colores: ['Midnight', 'Starlight', 'Blue', 'Pink', 'Green', 'Red'],
        puntosFuertes: ['Ecosistema Apple', 'Actualizaciones por años', 'Reventa alta'],
        paraQuien: 'Para quienes buscan la experiencia premium de Apple',
        videoUrl: null
    }
};

// ============================================================
// 💳 SISTEMA DE CRÉDITO CELEXPRESS
// ============================================================
// Enganche: 10% fijo
// Plazo: 17 semanas fijo
// Flujo: Cliente dice cuánto puede pagar → Se calcula qué equipo le alcanza
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
    
    // Calcular plan para un equipo específico
    calcularPlan: function(precioEquipo) {
        const enganche = Math.round(precioEquipo * (this.ENGANCHE_PORCENTAJE / 100));
        const saldoFinanciar = precioEquipo - enganche;
        const pagoSemanal = Math.round(saldoFinanciar / this.SEMANAS);
        
        return {
            precioEquipo,
            enganche,
            saldoFinanciar,
            pagoSemanal,
            semanas: this.SEMANAS,
            totalPagar: enganche + (pagoSemanal * this.SEMANAS)
        };
    },

    // Calcular qué precio de equipo le alcanza según su capacidad de pago semanal
    calcularEquipoPorCapacidad: function(pagoSemanalDisponible) {
        // Si puede pagar X semanal, el saldo a financiar es X * 17
        // El saldo es el 90% del equipo (porque 10% es enganche)
        // Entonces: saldo = precio * 0.90
        // precio = saldo / 0.90 = (pagoSemanal * 17) / 0.90
        const saldoMaximo = pagoSemanalDisponible * this.SEMANAS;
        const precioMaximoEquipo = Math.round(saldoMaximo / 0.90);
        const enganche = Math.round(precioMaximoEquipo * 0.10);
        
        return {
            pagoSemanal: pagoSemanalDisponible,
            precioMaximoEquipo,
            enganche,
            semanas: this.SEMANAS
        };
    },

    formatearPlan: function(celular) {
        const plan = this.calcularPlan(celular.precio);
        
        return `
📱 *${celular.nombre}*
💵 Precio: *$${plan.precioEquipo.toLocaleString()} MXN*

💳 *A CRÉDITO CELEXPRESS:*
• Enganche (10%): *$${plan.enganche.toLocaleString()}*
• ${plan.semanas} pagos de: *$${plan.pagoSemanal}/semana*

✅ Sin revisar buró
✅ Aprobación inmediata
✅ Solo necesitas tu INE
        `.trim();
    },

    formatearRecomendacion: function(pagoSemanal, celularesDisponibles) {
        const capacidad = this.calcularEquipoPorCapacidad(pagoSemanal);
        
        // Filtrar celulares que le alcanzan
        const opciones = celularesDisponibles
            .filter(cel => cel.precio <= capacidad.precioMaximoEquipo)
            .sort((a, b) => b.precio - a.precio); // Mejor equipo primero
        
        return {
            capacidad,
            opciones
        };
    }
};

// ============================================================
// 🚚 TARIFARIO DE ENVÍOS HWS LOGÍSTICA
// ============================================================
const tarifarioEnvios = {
    // Precios base por kg (1-15 kg)
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

    // Márgenes de ganancia por peso
    obtenerMargen: function(peso) {
        if (peso <= 5) return 0.60;
        if (peso <= 15) return 0.50;
        if (peso <= 30) return 0.40;
        return 0.30;
    },

    cotizar: function(peso) {
        const pesoRedondeado = Math.ceil(peso);
        
        if (pesoRedondeado < 1 || pesoRedondeado > 15) {
            return { error: true, mensaje: 'Manejamos envíos de 1 a 15 kg. Para paquetes más grandes, te conecto con un asesor 😊' };
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
        const mejorPrecio = opciones[0];
        const masRapido = opciones.filter(o => o.servicio === 'Express').sort((a, b) => a.precio - b.precio)[0];

        return {
            error: false,
            peso: pesoRedondeado,
            opciones,
            mejorPrecio,
            masRapido
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

        respuesta += `\n💡 _Lleva tu paquete a la sucursal Celexpress más cercana a tu domicilio_`;

        return respuesta;
    }
};

// ============================================================
// 🧠 MOTOR DE INTENCIONES (NLU simplificado)
// ============================================================
const detectarIntencion = (texto) => {
    const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Patrones de intención con pesos
    const intenciones = {
        // SALUDOS
        saludo: {
            patrones: [/^hola/i, /buenas?\s*(dias?|tardes?|noches?)/i, /que\s*tal/i, /^hey$/i, /^hi$/i, /^ola$/i, /buen\s*dia/i],
            peso: 1
        },
        
        // CELULARES - Intención general
        ver_celulares: {
            patrones: [/celular/i, /telefono/i, /movil/i, /equipo/i, /smartphone/i, /tienen\s*cel/i, /venden\s*cel/i],
            peso: 2
        },
        
        // MARCAS ESPECÍFICAS
        buscar_samsung: {
            patrones: [/samsung/i, /galaxy/i],
            peso: 3
        },
        
        // MODELOS ESPECÍFICOS (peso más alto que marcas)
        modelo_a15: {
            patrones: [/a\s*15/i, /a15/i],
            peso: 4
        },
        modelo_m15: {
            patrones: [/m\s*15/i, /m15/i],
            peso: 4
        },
        modelo_g24: {
            patrones: [/g\s*24/i, /g24/i, /moto\s*g/i],
            peso: 4
        },
        modelo_redmi: {
            patrones: [/redmi/i, /note\s*12/i],
            peso: 4
        },
        modelo_iphone: {
            patrones: [/iphone/i, /iphone\s*13/i],
            peso: 4
        },
        buscar_iphone: {
            patrones: [/iphone/i, /apple/i],
            peso: 3
        },
        buscar_motorola: {
            patrones: [/motorola/i, /moto\s*g/i],
            peso: 3
        },
        buscar_xiaomi: {
            patrones: [/xiaomi/i, /redmi/i, /poco/i],
            peso: 3
        },
        
        // CARACTERÍSTICAS BUSCADAS
        buscar_barato: {
            patrones: [/barato/i, /economico/i, /mas\s*barato/i, /presupuesto/i, /poco\s*dinero/i, /no\s*tan\s*caro/i],
            peso: 3
        },
        buscar_camara: {
            patrones: [/buena\s*camara/i, /fotos/i, /fotografia/i, /selfies?/i, /camara/i],
            peso: 3
        },
        buscar_bateria: {
            patrones: [/bateria/i, /duracion/i, /dure\s*mucho/i, /autonomia/i],
            peso: 3
        },
        buscar_gaming: {
            patrones: [/juegos?/i, /gaming/i, /gamer/i, /free\s*fire/i, /pubg/i, /fortnite/i],
            peso: 3
        },
        
        // CRÉDITO
        preguntar_credito: {
            patrones: [/credito/i, /financ/i, /plazos?/i, /apartado/i, /abonos?/i, /mensualidad/i, /enganche/i],
            peso: 3
        },

        // CAPACIDAD DE PAGO SEMANAL
        capacidad_pago: {
            patrones: [/puedo\s*pagar\s*\$?(\d+)/i, /(\d+)\s*(pesos?)?\s*(semanal|a la semana|por semana)/i, /mi\s*pago.*\$?(\d+)/i, /tengo\s*para\s*\$?(\d+)\s*semanal/i, /dispongo\s*de\s*\$?(\d+)/i],
            peso: 4
        },
        
        // PRECIO ESPECÍFICO
        preguntar_precio: {
            patrones: [/cuanto\s*(cuesta|vale|es|sale)/i, /precio/i, /costo/i, /\$\s*\d+/i],
            peso: 3
        },
        
        // ENVÍOS - Prioridad alta
        cotizar_envio: {
            patrones: [/envio/i, /enviar/i, /paquete/i, /mandar/i, /guia/i, /cotizar/i, /mensajeria/i, /paqueteria/i],
            peso: 4
        },
        
        // INFORMACIÓN PESO
        dar_peso: {
            patrones: [/(\d+(?:\.\d+)?)\s*(kg|kilo|kilogramo)?/i],
            peso: 2
        },
        
        // CONFIRMACIONES
        confirmar_si: {
            patrones: [/^si$/i, /^sí$/i, /^ok$/i, /^dale$/i, /^va$/i, /^claro$/i, /^simon$/i, /^sale$/i, /^perfecto$/i, /adelante/i, /de\s*acuerdo/i],
            peso: 4
        },
        confirmar_no: {
            patrones: [/^no$/i, /^nel$/i, /^nop$/i, /^nope$/i, /dejalo/i, /cancelar/i, /otro\s*dia/i],
            peso: 4
        },
        
        // DESPEDIDAS
        despedida: {
            patrones: [/gracias/i, /bye/i, /adios/i, /hasta\s*luego/i, /nos\s*vemos/i, /chao/i],
            peso: 2
        },
        
        // HABLAR CON HUMANO
        quiere_humano: {
            patrones: [/asesor/i, /humano/i, /persona\s*real/i, /hablar\s*con\s*alguien/i, /llamar/i, /telefono\s*para\s*llamar/i, /ayuda\s*personal/i],
            peso: 4
        },
        
        // QUEJAS/PROBLEMAS
        queja: {
            patrones: [/problema/i, /queja/i, /no\s*funciona/i, /mal\s*servicio/i, /devolucion/i, /garantia/i],
            peso: 4
        },
        
        // UBICACIÓN
        preguntar_ubicacion: {
            patrones: [/donde\s*(estan|queda|ubic)/i, /direccion/i, /sucursal/i, /tienda\s*fisica/i, /ir\s*a\s*verlos/i],
            peso: 3
        },
        
        // RANGO DE PRECIO
        rango_precio: {
            patrones: [/menos\s*de\s*\$?(\d+)/i, /hasta\s*\$?(\d+)/i, /entre\s*\$?(\d+)/i, /maximo\s*\$?(\d+)/i, /presupuesto.*\$?(\d+)/i],
            peso: 3
        },
        
        // COMPARACIONES
        comparar: {
            patrones: [/cual\s*(es\s*)?(mejor|recomiend)/i, /diferencia\s*entre/i, /que\s*me\s*recomiend/i, /vs/i, /o\s*el\s*otro/i],
            peso: 3
        }
    };

    // Detectar todas las intenciones que coinciden
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

    // Ordenar por peso (mayor primero) y retornar
    intencionesDetectadas.sort((a, b) => b.peso - a.peso);
    
    return {
        principal: intencionesDetectadas[0] || { nombre: 'desconocido', peso: 0 },
        todas: intencionesDetectadas,
        textoOriginal: texto
    };
};

// ============================================================
// 🎭 GENERADOR DE RESPUESTAS HUMANIZADAS
// ============================================================
const respuestasHumanizadas = {
    // Variaciones de saludos
    saludos: [
        "¡Hola! 👋 Qué gusto saludarte. Soy tu asistente de CelExpress.",
        "¡Hey! 😊 Bienvenido a CelExpress. ¿En qué te ayudo?",
        "¡Hola! Me da mucho gusto atenderte. Soy de CelExpress.",
        "¡Qué tal! 👋 Aquí estoy para ayudarte con lo que necesites."
    ],
    
    // Menú principal
    menuPrincipal: `
¿En qué te puedo ayudar hoy?

📱 *Celulares* - Ver equipos y planes de crédito
📦 *Envíos* - Cotizar tu paquete
💳 *Crédito* - Conocer cómo financiarte

Solo dime qué te interesa 👆
    `.trim(),

    // Preguntas de seguimiento para celulares
    preguntasCelular: [
        "¿Tienes alguna marca en mente? Samsung, Xiaomi, Motorola o iPhone 📱",
        "¿Qué es lo más importante para ti? ¿Cámara, batería, precio? 🤔",
        "¿Tienes un presupuesto aproximado? Así te recomiendo mejor 💰"
    ],

    // Transiciones naturales
    transiciones: [
        "Perfecto, déjame mostrarte...",
        "¡Excelente elección! Mira esto...",
        "Te va a encantar, aquí está...",
        "Con gusto, aquí tienes..."
    ],

    // Cuando no entiende
    noEntiendo: [
        "Mmm, no estoy seguro de entenderte 🤔 ¿Me puedes decir de otra forma?",
        "Disculpa, ¿podrías ser más específico? Quiero ayudarte bien 😊",
        "No capté eso, ¿me lo explicas diferente? Estoy aquí para ayudarte."
    ],

    // Despedidas
    despedidas: [
        "¡Gracias por contactarnos! 🙏 Estamos aquí cuando nos necesites.",
        "¡Fue un gusto atenderte! No dudes en escribir si tienes más dudas 👋",
        "¡Hasta pronto! Recuerda que en CelExpress siempre hay buen trato 😊"
    ],

    // Escalar a humano
    escalarHumano: `
Entiendo, te conecto con un asesor 👨‍💼

📞 Puedes llamarnos al: *56 6019 4420*
📱 O un asesor te contactará en breve

¿Me dejas tu nombre y número para que te llamen?
    `.trim(),

    // Random picker
    random: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// ============================================================
// 🔄 MANEJADOR DE CONTEXTO DE CONVERSACIÓN
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
                celularViendo: null,
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
        // Mantener solo últimos 20 mensajes
        if (ctx.historial.length > 20) {
            ctx.historial = ctx.historial.slice(-20);
        }
    }

    clear(numero) {
        this.conversations.delete(numero);
    }
}

// ============================================================
// 🤖 MOTOR PRINCIPAL DE CONVERSACIÓN
// ============================================================
class CelexpressAI {
    constructor() {
        this.context = new ConversationContext();
        this.catalogo = catalogoCelulares;
        this.credito = planesCredito;
        this.envios = tarifarioEnvios;
    }

    // Procesar mensaje entrante
    async procesarMensaje(numero, texto, nombreUsuario = null) {
        const ctx = this.context.get(numero);
        this.context.addHistorial(numero, texto, true);

        // Detectar intención
        const intencion = detectarIntencion(texto);
        ctx.ultimaIntencion = intencion;

        // Decidir respuesta basada en contexto + intención
        let respuesta = await this.generarRespuesta(numero, intencion, ctx, nombreUsuario);
        
        this.context.addHistorial(numero, respuesta, false);
        return respuesta;
    }

    // Generar respuesta inteligente
    async generarRespuesta(numero, intencion, ctx, nombreUsuario) {
        const intent = intencion.principal.nombre;

        // =========================================
        // MANEJO POR ETAPA DE CONVERSACIÓN
        // =========================================

        // Si está esperando confirmación de algo
        if (ctx.etapa === 'esperando_confirmacion_celular') {
            if (intent === 'confirmar_si') {
                return this.iniciarProcesoCredito(numero, ctx);
            } else if (intent === 'confirmar_no') {
                this.context.update(numero, { etapa: 'menu_principal' });
                return "Entendido, sin problema 😊 ¿Te muestro otros equipos o en qué más te ayudo?";
            }
        }

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

        // Si está esperando capacidad de pago y manda un número
        if (ctx.etapa === 'preguntando_capacidad_pago') {
            const montoMatch = intencion.textoOriginal.match(/\$?(\d+)/);
            if (montoMatch) {
                return this.recomendarPorCapacidadPago(numero, parseInt(montoMatch[1]));
            }
        }

        // =========================================
        // MANEJO POR INTENCIÓN
        // =========================================

        switch (intent) {
            // SALUDOS
            case 'saludo':
                this.context.update(numero, { etapa: 'menu_principal' });
                const saludo = nombreUsuario 
                    ? `¡Hola ${nombreUsuario}! 👋 Qué gusto saludarte.`
                    : respuestasHumanizadas.random(respuestasHumanizadas.saludos);
                return `${saludo}\n\n${respuestasHumanizadas.menuPrincipal}`;

            // VER CELULARES (general)
            case 'ver_celulares':
                return this.mostrarCatalogoCelulares(numero);

            // MARCAS ESPECÍFICAS
            case 'buscar_samsung':
                return this.buscarPorMarca(numero, 'Samsung');
            case 'buscar_iphone':
                return this.buscarPorMarca(numero, 'Apple');
            case 'buscar_motorola':
                return this.buscarPorMarca(numero, 'Motorola');
            case 'buscar_xiaomi':
                return this.buscarPorMarca(numero, 'Xiaomi');

            // MODELOS ESPECÍFICOS - Van directo al detalle
            case 'modelo_a15':
                return this.mostrarDetalleCelular(numero, 'samsung-a15');
            case 'modelo_m15':
                return this.mostrarDetalleCelular(numero, 'samsung-m15');
            case 'modelo_g24':
                return this.mostrarDetalleCelular(numero, 'moto-g24');
            case 'modelo_redmi':
                return this.mostrarDetalleCelular(numero, 'redmi-note-12');
            case 'modelo_iphone':
                return this.mostrarDetalleCelular(numero, 'iphone-13');

            // BÚSQUEDAS POR CARACTERÍSTICA
            case 'buscar_barato':
                return this.buscarPorCaracteristica(numero, 'economico');
            case 'buscar_camara':
                return this.buscarPorCaracteristica(numero, 'camara');
            case 'buscar_bateria':
                return this.buscarPorCaracteristica(numero, 'bateria');
            case 'buscar_gaming':
                return this.buscarPorCaracteristica(numero, 'gaming');

            // RANGO DE PRECIO
            case 'rango_precio':
                const montoMatch = intencion.textoOriginal.match(/\$?(\d+)/);
                if (montoMatch) {
                    return this.buscarPorPresupuesto(numero, parseInt(montoMatch[1]));
                }
                return "¿Cuánto tienes pensado invertir? Así te recomiendo el mejor equipo 💰";

            // CRÉDITO
            case 'preguntar_credito':
                return this.explicarCredito(numero);

            // CAPACIDAD DE PAGO - Cliente dice cuánto puede pagar semanal
            case 'capacidad_pago':
                const montoCapacidad = intencion.textoOriginal.match(/\$?(\d+)/);
                if (montoCapacidad) {
                    return this.recomendarPorCapacidadPago(numero, parseInt(montoCapacidad[1]));
                }
                return "¿Cuánto puedes pagar a la semana? Dime una cantidad, por ejemplo: *$300*";

            // PRECIO ESPECÍFICO
            case 'preguntar_precio':
                if (ctx.celularViendo) {
                    return this.mostrarPrecioYCredito(numero, ctx.celularViendo);
                }
                return "¿De qué equipo te gustaría saber el precio? 📱";

            // COMPARAR
            case 'comparar':
                return this.recomendarMejor(numero);

            // ENVÍOS
            case 'cotizar_envio':
                this.context.update(numero, { etapa: 'esperando_peso' });
                return `¡Claro que sí! 📦\n\n¿Cuántos kilogramos pesa tu paquete?\n\nSolo dime el número, por ejemplo: *5* o *3.5*`;

            // PESO DIRECTO
            case 'dar_peso':
                const pesoDirecto = parseFloat(intencion.principal.grupos?.[0] || intencion.textoOriginal.match(/(\d+(?:\.\d+)?)/)?.[1]);
                if (pesoDirecto) {
                    return this.procesarCotizacionEnvio(numero, pesoDirecto);
                }
                break;

            // QUIERE HUMANO
            case 'quiere_humano':
                return this.escalarAHumano(numero);

            // QUEJA
            case 'queja':
                return this.manejarQueja(numero);

            // UBICACIÓN
            case 'preguntar_ubicacion':
                return this.mostrarUbicacion(numero);

            // DESPEDIDA
            case 'despedida':
                this.context.clear(numero);
                return respuestasHumanizadas.random(respuestasHumanizadas.despedidas);

            // NO ENTENDIDO
            default:
                // Si hay contexto previo, intentar continuar
                if (ctx.etapa !== 'inicio' && ctx.etapa !== 'menu_principal') {
                    return this.continuarConversacion(numero, ctx, intencion);
                }
                return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n${respuestasHumanizadas.menuPrincipal}`;
        }
    }

    // =========================================
    // MÉTODOS DE CELULARES
    // =========================================

    mostrarCatalogoCelulares(numero) {
        this.context.update(numero, { etapa: 'preguntando_capacidad_pago' });

        const celulares = Object.values(this.catalogo);
        const masBarato = celulares.reduce((a, b) => a.precio < b.precio ? a : b);
        const masCaro = celulares.reduce((a, b) => a.precio > b.precio ? a : b);
        
        const planBarato = this.credito.calcularPlan(masBarato.precio);
        const planCaro = this.credito.calcularPlan(masCaro.precio);

        return `
📱 *CELULARES CELEXPRESS A CRÉDITO*

Tenemos equipos desde *$${planBarato.pagoSemanal}/semana* hasta *$${planCaro.pagoSemanal}/semana*

💳 *Nuestro crédito:*
• Enganche: solo *10%*
• Plazo: *17 semanas*
• Sin buró de crédito ✅

💰 *¿Cuánto puedes pagar a la semana?*

Dime una cantidad, por ejemplo: *$300 semanal*
Y te digo qué equipos te alcanzan 📱
        `.trim();
    }

    buscarPorMarca(numero, marca) {
        const celulares = Object.entries(this.catalogo)
            .filter(([_, c]) => c.marca === marca)
            .map(([id, c]) => ({ id, ...c }));

        if (celulares.length === 0) {
            return `Por el momento no tenemos ${marca} disponible 😔 ¿Te muestro otras opciones similares?`;
        }

        this.context.update(numero, { etapa: 'viendo_celulares', marcaViendo: marca });

        let respuesta = `📱 *${marca.toUpperCase()} EN CELEXPRESS*\n\n`;

        celulares.forEach((cel, i) => {
            const plan = this.credito.calcularPlan(cel.precio);
            respuesta += `${i + 1}️⃣ *${cel.modelo}*\n`;
            respuesta += `   💵 Precio: $${cel.precio.toLocaleString()}\n`;
            respuesta += `   💳 Enganche: $${plan.enganche} + $${plan.pagoSemanal}/sem x17\n`;
            respuesta += `   ✨ ${cel.puntosFuertes[0]}\n\n`;
        });

        respuesta += `¿Cuál te interesa? Te doy más detalles 👆`;

        // Si solo hay uno, mostrarlo directo
        if (celulares.length === 1) {
            return this.mostrarDetalleCelular(numero, celulares[0].id);
        }

        return respuesta;
    }

    buscarPorCaracteristica(numero, caracteristica) {
        let celulares = Object.entries(this.catalogo).map(([id, c]) => ({ id, ...c }));

        switch (caracteristica) {
            case 'economico':
                celulares.sort((a, b) => a.precio - b.precio);
                celulares = celulares.slice(0, 3);
                break;
            case 'camara':
                celulares = celulares.filter(c => 
                    c.especificaciones.camara.includes('50MP') || 
                    c.puntosFuertes.some(p => p.toLowerCase().includes('cámara'))
                );
                break;
            case 'bateria':
                celulares = celulares.filter(c => 
                    parseInt(c.especificaciones.bateria) >= 5000 ||
                    c.puntosFuertes.some(p => p.toLowerCase().includes('batería'))
                );
                break;
            case 'gaming':
                celulares = celulares.filter(c => 
                    c.especificaciones.pantalla.includes('120Hz') ||
                    c.especificaciones.pantalla.includes('90Hz')
                );
                break;
        }

        if (celulares.length === 0) {
            return "Déjame buscar opciones que se ajusten a lo que necesitas... ¿Qué es lo más importante para ti? 🤔";
        }

        const recomendaciones = {
            economico: "💰 *LOS MÁS ECONÓMICOS*\n_Calidad sin gastar de más_",
            camara: "📸 *LOS MEJORES PARA FOTOS*\n_Captura momentos increíbles_",
            bateria: "🔋 *BATERÍA QUE DURA*\n_No te quedas sin pila_",
            gaming: "🎮 *IDEALES PARA JUEGOS*\n_Pantalla fluida y potencia_"
        };

        let respuesta = `${recomendaciones[caracteristica]}\n\n`;

        celulares.forEach((cel, i) => {
            const plan = this.credito.calcularPlan(cel.precio);
            respuesta += `${i + 1}️⃣ *${cel.nombre}*\n`;
            respuesta += `   💵 $${cel.precio.toLocaleString()} o *$${plan.pagoSemanal}/semana*\n`;
            respuesta += `   ✨ ${cel.puntosFuertes[0]}\n\n`;
        });

        respuesta += "¿Te doy más detalles de alguno? Solo dime cuál 👆";

        this.context.update(numero, { etapa: 'viendo_celulares', caracteristicaBuscada: caracteristica });
        return respuesta;
    }

    buscarPorPresupuesto(numero, presupuesto) {
        const celulares = Object.entries(this.catalogo)
            .map(([id, c]) => ({ id, ...c }))
            .filter(c => c.precio <= presupuesto)
            .sort((a, b) => b.precio - a.precio); // Mejor equipo dentro del presupuesto primero

        if (celulares.length === 0) {
            const masBarato = Object.values(this.catalogo).reduce((a, b) => a.precio < b.precio ? a : b);
            const plan = this.credito.calcularPlan(masBarato.precio);
            
            return `
Con $${presupuesto.toLocaleString()} de contado no tengo opciones 😔

*PERO* con nuestro crédito sí puedes:

📱 *${masBarato.nombre}*
💰 Enganche: $${plan.enganche.toLocaleString()}
📅 Pagos de: $${plan.planes[0].pagoSemanal}/semana

¡Así puedes llevarte un mejor equipo! ¿Te interesa? 💳
            `.trim();
        }

        let respuesta = `💰 *CON $${presupuesto.toLocaleString()} TE RECOMIENDO:*\n\n`;

        celulares.slice(0, 3).forEach((cel, i) => {
            const sobrante = presupuesto - cel.precio;
            respuesta += `${i + 1}️⃣ *${cel.nombre}*\n`;
            respuesta += `   💵 $${cel.precio.toLocaleString()}`;
            if (sobrante > 0) respuesta += ` (te sobran $${sobrante.toLocaleString()})`;
            respuesta += `\n   ✨ ${cel.puntosFuertes[0]}\n\n`;
        });

        respuesta += "¿Cuál te late más? 🎯";
        
        this.context.update(numero, { etapa: 'viendo_celulares', presupuesto });
        return respuesta;
    }

    mostrarDetalleCelular(numero, celularId) {
        const cel = this.catalogo[celularId];
        if (!cel) {
            return "No encontré ese equipo 🤔 ¿Me dices de nuevo cuál te interesa?";
        }

        this.context.update(numero, { 
            etapa: 'viendo_detalle_celular', 
            celularViendo: celularId 
        });

        const plan = this.credito.calcularPlan(cel.precio);

        return `
📱 *${cel.nombre}*

${cel.paraQuien}

📋 *ESPECIFICACIONES:*
• Pantalla: ${cel.especificaciones.pantalla}
• RAM: ${cel.especificaciones.ram}
• Almacenamiento: ${cel.especificaciones.almacenamiento}
• Cámara: ${cel.especificaciones.camara}
• Batería: ${cel.especificaciones.bateria}

✨ *LO MEJOR:*
${cel.puntosFuertes.map(p => `• ${p}`).join('\n')}

💰 *PRECIO:* $${cel.precio.toLocaleString()} MXN

💳 *A CRÉDITO CELEXPRESS:*
• Enganche (10%): *$${plan.enganche.toLocaleString()}*
• 17 pagos de: *$${plan.pagoSemanal}/semana*

${cel.videoUrl ? `🎬 Video: ${cel.videoUrl}` : ''}

¿Te lo apartas? Solo necesitas tu INE 📋
        `.trim();
    }

    mostrarPrecioYCredito(numero, celularId) {
        const cel = this.catalogo[celularId];
        if (!cel) return this.mostrarCatalogoCelulares(numero);

        return this.credito.formatearPlan(cel);
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

💰 *EJEMPLO:*
Equipo de $5,400
• Enganche (10%): *$540*
• 17 pagos de: *$286/semana*

📱 *¿Cuánto puedes pagar a la semana?*
Dime y te muestro qué equipos te alcanzan 👆
        `.trim();
    }

    recomendarMejor(numero) {
        const celulares = Object.entries(this.catalogo).map(([id, c]) => ({ id, ...c }));
        
        // Mejor relación calidad-precio
        const mejorValor = celulares.find(c => c.modelo.includes('A15')) || celulares[0];
        // Más económico
        const masBarato = celulares.reduce((a, b) => a.precio < b.precio ? a : b);
        // Mejor especificaciones
        const mejorSpec = celulares.find(c => c.marca === 'Apple') || celulares.reduce((a, b) => a.precio > b.precio ? a : b);

        return `
🏆 *MIS RECOMENDACIONES*

*Si buscas el mejor equilibrio:*
📱 ${mejorValor.nombre}
✨ ${mejorValor.puntosFuertes[0]}

*Si tu presupuesto es ajustado:*
📱 ${masBarato.nombre}
✨ ${masBarato.puntosFuertes[0]}

*Si quieres lo mejor sin importar precio:*
📱 ${mejorSpec.nombre}
✨ ${mejorSpec.puntosFuertes[0]}

💰 *¿Cuánto puedes pagar a la semana?*
Dime y te digo exactamente qué te alcanza 📱
        `.trim();
    }

    // Recomendar celulares según capacidad de pago semanal
    recomendarPorCapacidadPago(numero, pagoSemanal) {
        const celulares = Object.entries(this.catalogo).map(([id, c]) => ({ id, ...c }));
        const recomendacion = this.credito.formatearRecomendacion(pagoSemanal, celulares);
        
        this.context.update(numero, { 
            etapa: 'viendo_opciones_credito',
            capacidadPago: pagoSemanal 
        });

        if (recomendacion.opciones.length === 0) {
            const masBarato = celulares.reduce((a, b) => a.precio < b.precio ? a : b);
            const planMinimo = this.credito.calcularPlan(masBarato.precio);
            
            return `
Con *$${pagoSemanal}/semana* no alcanza para ningún equipo 😔

El equipo más accesible es:
📱 *${masBarato.nombre}*
• Enganche: $${planMinimo.enganche}
• Pago semanal: *$${planMinimo.pagoSemanal}*

¿Podrías aumentar un poco tu pago semanal? 
O si prefieres, te ayudo a buscar opciones 💪
            `.trim();
        }

        let respuesta = `
💰 *Con $${pagoSemanal}/semana te alcanzan estos equipos:*

`;
        recomendacion.opciones.slice(0, 4).forEach((cel, i) => {
            const plan = this.credito.calcularPlan(cel.precio);
            const destacado = i === 0 ? ' ⭐ _Mejor opción_' : '';
            respuesta += `${i + 1}️⃣ *${cel.nombre}*${destacado}
   💵 Enganche: $${plan.enganche.toLocaleString()}
   📅 17 pagos de: *$${plan.pagoSemanal}/semana*
   ✨ ${cel.puntosFuertes[0]}

`;
        });

        respuesta += `¿Cuál te interesa? Te doy más detalles 👆`;

        return respuesta.trim();
    }

    iniciarProcesoCredito(numero, ctx) {
        this.context.update(numero, { etapa: 'capturando_datos' });
        
        return `
¡Excelente elección! 🎉

Para apartar tu equipo necesito unos datos:

1️⃣ Tu nombre completo
2️⃣ Tu número de teléfono (para contactarte)
3️⃣ Tu correo electrónico

Puedes enviarlos aquí o un asesor te llamará para completar el proceso 📞

¿Cómo te llamas?
        `.trim();
    }

    // =========================================
    // MÉTODOS DE ENVÍOS
    // =========================================

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
        this.context.update(numero, { etapa: 'capturando_datos' });

        return `
¡Perfecto! 📦

Para generar tu guía necesito:

1️⃣ Tu nombre completo
2️⃣ Dirección de *recolección* (de dónde sale el paquete)
3️⃣ Dirección de *entrega* (a dónde va)
4️⃣ Tu correo electrónico

Puedes enviármelos aquí mismo 📝
        `.trim();
    }

    // =========================================
    // MÉTODOS DE CAPTURA DE DATOS
    // =========================================

    procesarDatosCliente(numero, texto, ctx) {
        // Detectar tipo de dato
        const emailMatch = texto.match(/[\w.-]+@[\w.-]+\.\w+/);
        const telefonoMatch = texto.match(/\d{10}/);
        const tieneNombre = texto.split(' ').length >= 2 && !emailMatch && !telefonoMatch;

        if (emailMatch) {
            ctx.datosCliente.email = emailMatch[0];
        }
        if (telefonoMatch) {
            ctx.datosCliente.telefono = telefonoMatch[0];
        }
        if (tieneNombre && !ctx.datosCliente.nombre) {
            ctx.datosCliente.nombre = texto.trim();
        }

        this.context.update(numero, { datosCliente: ctx.datosCliente });

        // Verificar qué falta
        const faltantes = [];
        if (!ctx.datosCliente.nombre) faltantes.push('tu nombre completo');
        if (!ctx.datosCliente.telefono) faltantes.push('tu número de teléfono (10 dígitos)');
        if (!ctx.datosCliente.email) faltantes.push('tu correo electrónico');

        if (faltantes.length > 0) {
            return `¡Gracias! 📝\n\nAún me falta: ${faltantes.join(', ')}\n\n¿Me lo compartes?`;
        }

        // Datos completos
        this.context.update(numero, { etapa: 'datos_completos' });

        return `
✅ *¡Datos registrados correctamente!*

📋 *Resumen:*
• Nombre: ${ctx.datosCliente.nombre}
• Teléfono: ${ctx.datosCliente.telefono}
• Email: ${ctx.datosCliente.email}

Un asesor de *CelExpress* te contactará en breve para continuar con tu trámite.

📞 También puedes llamarnos: *56 6019 4420*

¡Gracias por tu preferencia! 🙏
        `.trim();
    }

    // =========================================
    // MÉTODOS DE SOPORTE
    // =========================================

    escalarAHumano(numero) {
        this.context.update(numero, { etapa: 'escalado' });

        return `
Entiendo, te conecto con un asesor real 👨‍💼

📞 *Llámanos:* 56 6019 4420
📍 *Visítanos:* Sucursal Celexpress más cercana
⏰ *Horario:* Lun-Sáb 9am-7pm

O si prefieres, déjame tu número y te llamamos nosotros 📱

¿Cuál es tu número de teléfono?
        `.trim();
    }

    manejarQueja(numero) {
        this.context.update(numero, { etapa: 'queja' });

        return `
Lamento mucho que tengas un inconveniente 😔

Tu satisfacción es muy importante para nosotros.

Para atenderte mejor, ¿podrías decirme:
1️⃣ ¿Cuál es el problema específico?
2️⃣ ¿Tienes número de pedido o ticket?

Un supervisor revisará tu caso personalmente.

📞 También puedes llamar a soporte: *56 6019 4420*
        `.trim();
    }

    mostrarUbicacion(numero) {
        return `
📍 *UBICACIÓN CELEXPRESS*

🏪 *Tienda Principal:*
[Dirección completa]
[Ciudad, Estado, CP]

⏰ *Horario:*
Lunes a Sábado: 9:00am - 7:00pm
Domingo: Cerrado

📱 *Contacto:*
WhatsApp: 56 6019 4420
Tel: 56 6019 4420

¡Te esperamos! 🎉
        `.trim();
    }

    continuarConversacion(numero, ctx, intencion) {
        const texto = intencion.textoOriginal.toLowerCase();
        
        // Si estaba viendo opciones y dice un número o nombre de modelo
        if (ctx.etapa === 'viendo_celulares' || ctx.etapa === 'viendo_opciones_credito') {
            // Detectar número de opción
            const numMatch = intencion.textoOriginal.match(/^[1-4]$/);
            if (numMatch) {
                const opciones = Object.keys(this.catalogo);
                const idx = parseInt(numMatch[0]) - 1;
                if (opciones[idx]) {
                    return this.mostrarDetalleCelular(numero, opciones[idx]);
                }
            }
            
            // Detectar si menciona algún modelo específico
            for (const [id, cel] of Object.entries(this.catalogo)) {
                const modeloLower = cel.modelo.toLowerCase();
                const nombreLower = cel.nombre.toLowerCase();
                if (texto.includes(modeloLower) || 
                    texto.includes(cel.marca.toLowerCase()) ||
                    texto.includes('a15') && id.includes('a15') ||
                    texto.includes('m15') && id.includes('m15') ||
                    texto.includes('g24') && id.includes('g24') ||
                    texto.includes('redmi') && id.includes('redmi') ||
                    texto.includes('iphone') && id.includes('iphone')) {
                    return this.mostrarDetalleCelular(numero, id);
                }
            }
        }

        // Si está viendo detalle y confirma interés
        if (ctx.etapa === 'viendo_detalle_celular' && ctx.celularViendo) {
            if (/si|sí|me interesa|lo quiero|apartalo|apartamelo|va|dale|ok/i.test(texto)) {
                return this.iniciarProcesoCredito(numero, ctx);
            }
        }

        return `${respuestasHumanizadas.random(respuestasHumanizadas.noEntiendo)}\n\n¿Te ayudo con celulares 📱 o envíos 📦?`;
    }
}

// ============================================================
// 📤 EXPORTAR MÓDULOS
// ============================================================
module.exports = {
    CelexpressAI,
    catalogoCelulares,
    planesCredito,
    tarifarioEnvios,
    detectarIntencion,
    respuestasHumanizadas,
    ConversationContext
};