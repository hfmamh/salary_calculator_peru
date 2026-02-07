/**
 * Configuración de la Calculadora de Sueldo Neto - Perú
 * 
 * Este archivo contiene todas las variables que pueden cambiar en el tiempo
 * como valores de UIT, tasas de impuestos, descuentos, etc.
 * 
 * Actualizar estos valores cuando cambien las leyes o regulaciones peruanas.
 */

// ============================================
// CONFIGURACIÓN POR AÑO TRIBUTARIO
// ============================================
const CONFIG_BY_YEAR = {
    // 2024
    "2024": {
        // Valor de UIT para el año
        UIT: 5150.00,

        // ============================================
        // TASAS DE DESCUENTOS
        // ============================================

        // Tasa de AFP (Administradora de Fondos de Pensiones)
        AFP_RATE: 0.10, // 10%

        // Tasa de Prima de Seguro
        INSURANCE_PRIME_RATE: 0.0137, // 1.37%

        // ============================================
        // TASAS DE GRATIFICACIÓN POR SEGURO
        // ============================================

        // Tasa de gratificación para EsSalud
        GRATIFICACION_ESSALUD_RATE: 0.09, // 9%

        // Tasa de gratificación para EPS
        GRATIFICACION_EPS_RATE: 0.0675, // 6.75%

        // ============================================
        // IMPUESTO DE 5TA CATEGORÍA - TRAMOS
        // ============================================
        // Los tramos se calculan en base a UIT
        TAX_BRACKETS: [
            { min: 0, max: 5, rate: 0.08 },      // 0-5 UIT: 8%
            { min: 5, max: 20, rate: 0.14 },     // 5-20 UIT: 14%
            { min: 20, max: 35, rate: 0.17 },    // 20-35 UIT: 17%
            { min: 35, max: 45, rate: 0.20 },    // 35-45 UIT: 20%
            { min: 45, max: Infinity, rate: 0.30 } // Más de 45 UIT: 30%
        ],

        // ============================================
        // DEDUCCIONES PARA IMPUESTO
        // ============================================

        // Cantidad de UIT a descontar (7 UIT)
        UIT_DEDUCTION: 7,

        // Máximo de UIT para gastos deducibles (3 UIT)
        MAX_DEDUCTIBLE_EXPENSES_UIT: 3,

        // ============================================
        // PERÍODOS DE PAGO
        // ============================================

        // Meses de pago de gratificación
        GRATIFICACION_MONTHS: {
            JULY: 7,    // Julio
            DECEMBER: 12 // Diciembre
        },

        // Meses de pago de CTS
        CTS_MONTHS: {
            MAY: 5,      // Mayo
            NOVEMBER: 11 // Noviembre
        }
    }
};

function getAvailableYears() {
    return Object.keys(CONFIG_BY_YEAR).sort();
}

function getConfigForYear(year) {
    const years = getAvailableYears();
    if (!years.length) return null;

    if (year && CONFIG_BY_YEAR[String(year)]) {
        return CONFIG_BY_YEAR[String(year)];
    }

    const currentYear = String(new Date().getFullYear());
    if (CONFIG_BY_YEAR[currentYear]) {
        return CONFIG_BY_YEAR[currentYear];
    }

    return CONFIG_BY_YEAR[years[years.length - 1]];
}

// Función helper para obtener los tramos de impuesto con valores en soles
function getTaxBracketsInSoles(config) {
    return config.TAX_BRACKETS.map(bracket => ({
        min: bracket.min * config.UIT,
        max: bracket.max === Infinity ? Infinity : bracket.max * config.UIT,
        rate: bracket.rate
    }));
}
