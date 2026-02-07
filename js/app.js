/**
 * Aplicación principal de la Calculadora de Sueldo Neto
 * 
 * Este archivo contiene toda la lógica de la aplicación.
 * Las variables configurables están en js/config.js
 */

// Configuración activa (año actual)
const activeConfig = CONFIG;
const TAX_BRACKETS = getTaxBracketsInSoles(activeConfig);

// Referencias a elementos del DOM
const form = document.getElementById('salaryForm');
const resultDiv = document.getElementById('result');
const netSalaryValue = document.getElementById('netSalaryValue');
const grossDisplay = document.getElementById('grossDisplay');
const taxDeduction = document.getElementById('taxDeduction');
const afpDeduction = document.getElementById('afpDeduction');
const insurancePrimeDeduction = document.getElementById('insurancePrimeDeduction');
const netDisplay = document.getElementById('netDisplay');
const annualIncome = document.getElementById('annualIncome');
const uitDeduction = document.getElementById('uitDeduction');
const expensesDeduction = document.getElementById('expensesDeduction');
const taxableBase = document.getElementById('taxableBase');
const annualTax = document.getElementById('annualTax');
const gratificacionJuly = document.getElementById('gratificacionJuly');
const gratificacionDecember = document.getElementById('gratificacionDecember');
const totalGratificaciones = document.getElementById('totalGratificaciones');
const grossAnnualSalary = document.getElementById('grossAnnualSalary');
const gratificacionesInAnnual = document.getElementById('gratificacionesInAnnual');
const ctsMay = document.getElementById('ctsMay');
const ctsNovember = document.getElementById('ctsNovember');
const totalCTS = document.getElementById('totalCTS');
const ctsInAnnual = document.getElementById('ctsInAnnual');
const additionalIncomeDisplay = document.getElementById('additionalIncomeDisplay');

/**
 * Formatea un monto como moneda peruana
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Inicializa el selector de año tributario
 */
function initConfigLabels() {}

/**
 * Calcula el impuesto progresivo según los tramos establecidos
 */
function calculateProgressiveTax(taxableAmount) {
    let totalTax = 0;
    let remainingAmount = taxableAmount;

    for (let i = 0; i < TAX_BRACKETS.length && remainingAmount > 0; i++) {
        const bracket = TAX_BRACKETS[i];
        const bracketMin = bracket.min;
        const bracketMax = bracket.max === Infinity ? remainingAmount : bracket.max;
        
        if (taxableAmount > bracketMin) {
            const taxableInBracket = Math.min(remainingAmount, bracketMax - bracketMin);
            if (taxableInBracket > 0) {
                totalTax += taxableInBracket * bracket.rate;
                remainingAmount -= taxableInBracket;
            }
        }
    }

    return totalTax;
}

/**
 * Calcula la gratificación según el tipo de seguro
 */
function calculateGratificacion(grossMonthly, monthsWorked, healthInsuranceType) {
    if (monthsWorked <= 0) return 0;
    
    // Base calculation: (salary × months) ÷ 6
    const baseGratificacion = (grossMonthly * monthsWorked) / 6;
    
    // Add percentage based on health insurance
    let bonusRate = 0;
    if (healthInsuranceType === 'essalud') {
        bonusRate = activeConfig.GRATIFICACION_ESSALUD_RATE;
    } else if (healthInsuranceType === 'eps') {
        bonusRate = activeConfig.GRATIFICACION_EPS_RATE;
    }
    
    const bonus = baseGratificacion * bonusRate;
    return baseGratificacion + bonus;
}

/**
 * Calcula la CTS (Compensación por Tiempo de Servicios)
 */
function calculateCTS(grossMonthly, monthsWorked, daysWorked) {
    // CTS = [(Remuneración Computable / 12) x Meses Trabajados] + [(Remuneración Computable / 360) x Días Trabajados]
    const monthsPart = (grossMonthly / 12) * monthsWorked;
    const daysPart = (grossMonthly / 360) * daysWorked;
    return monthsPart + daysPart;
}

/**
 * Calcula los meses y días trabajados entre dos fechas
 */
function calculateMonthsAndDays(startDate, endDate) {
    if (!startDate || !endDate) return { months: 0, days: 0 };

    // Helper to normalize inputs to a local calendar Date (avoid ISO string timezone shifts)
    function toLocalDate(d) {
        if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (typeof d === 'string') {
            const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
            // fallback
            const parsed = new Date(d);
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
        const parsed = new Date(d);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const start = toLocalDate(startDate);
    const end = toLocalDate(endDate);

    // If start date is after end date, return 0
    if (start > end) return { months: 0, days: 0 };

    // Inclusive month count (useful for full-month ranges)
    const inclusiveMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    const lastDayOfEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

    // If range covers whole calendar months (start on day 1 and end on last day), treat as full inclusive months
    if (start.getDate() === 1 && end.getDate() === lastDayOfEndMonth) {
        return { months: Math.min(inclusiveMonths, 6), days: 0 };
    }

    // Otherwise compute full months and leftover days in a calendar-aware way
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    let days = 0;

    if (end.getDate() >= start.getDate()) {
        days = end.getDate() - start.getDate();
    } else {
        // borrow one month
        months -= 1;
        const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        days = prevMonthLastDay - start.getDate() + end.getDate();
    }

    // Limit months to 6 for semesters
    months = Math.min(Math.max(months, 0), 6);

    // Normalize days into months if >= 30
    if (days >= 30) {
        const extraMonths = Math.floor(days / 30);
        months = Math.min(months + extraMonths, 6);
        days = days % 30;
    }

    return { months: months, days: days };
}

/**
 * Calcula automáticamente los meses y días trabajados basándose en la fecha de inicio
 */
function getWorkedTimeFromStartDate(startDateInput) {
    if (!startDateInput) {
        return {
            monthsFirstSemester: 6,
            monthsSecondSemester: 6,
            ctsMonthsFirst: 6,
            ctsDaysFirst: 0,
            ctsMonthsSecond: 6,
            ctsDaysSecond: 0
        };
    }

    const startDate = new Date(startDateInput);
    const currentYear = new Date().getFullYear();

    // Gratificación Julio: Enero 1 - Junio 30
    const gratificacionJulioStart = new Date(currentYear, 0, 1); // Enero 1
    const gratificacionJulioEnd = new Date(currentYear, 5, 30); // Junio 30
    const actualStartJulio = startDate > gratificacionJulioStart ? startDate : gratificacionJulioStart;
    const timeJulio = calculateMonthsAndDays(actualStartJulio, gratificacionJulioEnd);

    // Gratificación Diciembre: Julio 1 - Diciembre 31
    const gratificacionDiciembreStart = new Date(currentYear, 6, 1); // Julio 1
    const gratificacionDiciembreEnd = new Date(currentYear, 11, 31); // Diciembre 31
    const actualStartDiciembre = startDate > gratificacionDiciembreStart ? startDate : gratificacionDiciembreStart;
    const timeDiciembre = calculateMonthsAndDays(actualStartDiciembre, gratificacionDiciembreEnd);

    // CTS Mayo: Noviembre 1 (año anterior) - Abril 30
    const ctsMayoStart = new Date(currentYear - 1, 10, 1); // Noviembre 1 año anterior
    const ctsMayoEnd = new Date(currentYear, 3, 30); // Abril 30
    const actualStartMayo = startDate > ctsMayoStart ? startDate : ctsMayoStart;
    const timeMayo = calculateMonthsAndDays(actualStartMayo, ctsMayoEnd);

    // CTS Noviembre: Mayo 1 - Octubre 31
    const ctsNoviembreStart = new Date(currentYear, 4, 1); // Mayo 1
    const ctsNoviembreEnd = new Date(currentYear, 9, 31); // Octubre 31
    const actualStartNoviembre = startDate > ctsNoviembreStart ? startDate : ctsNoviembreStart;
    const timeNoviembre = calculateMonthsAndDays(actualStartNoviembre, ctsNoviembreEnd);

    return {
        monthsFirstSemester: timeJulio.months,
        monthsSecondSemester: timeDiciembre.months,
        ctsMonthsFirst: timeMayo.months,
        ctsDaysFirst: timeMayo.days,
        ctsMonthsSecond: timeNoviembre.months,
        ctsDaysSecond: timeNoviembre.days
    };
}

/**
 * Función principal que calcula el sueldo neto
 */
function calculateNetSalary() {
    const startDateInput = document.getElementById('startDate').value;
    const workedTime = getWorkedTimeFromStartDate(startDateInput);

    const grossMonthly = parseFloat(document.getElementById('grossSalary').value);
    const healthInsuranceInput = document.querySelector('input[name="healthInsurance"]:checked');
    const healthInsurance = healthInsuranceInput ? healthInsuranceInput.value : 'essalud';
    const monthsFirstSemester = workedTime.monthsFirstSemester;
    const monthsSecondSemester = workedTime.monthsSecondSemester;
    const ctsMonthsFirst = workedTime.ctsMonthsFirst;
    const ctsDaysFirst = workedTime.ctsDaysFirst;
    const ctsMonthsSecond = workedTime.ctsMonthsSecond;
    const ctsDaysSecond = workedTime.ctsDaysSecond;
    const additionalIncomeAnnual = parseFloat(document.getElementById('additionalIncome').value) || 0;
    const deductibleExpensesAnnual = 0;

    if (isNaN(grossMonthly) || grossMonthly < 0) {
        alert('Por favor ingresa un sueldo bruto válido');
        return;
    }

    // Calculate gratificaciones
    const gratificacionJulio = calculateGratificacion(grossMonthly, monthsFirstSemester, healthInsurance);
    const gratificacionDiciembre = calculateGratificacion(grossMonthly, monthsSecondSemester, healthInsurance);
    const totalGratificacionesAnual = gratificacionJulio + gratificacionDiciembre;

    // Calculate CTS
    const ctsMayo = calculateCTS(grossMonthly, ctsMonthsFirst, ctsDaysFirst);
    const ctsNoviembre = calculateCTS(grossMonthly, ctsMonthsSecond, ctsDaysSecond);
    const totalCTSAnual = ctsMayo + ctsNoviembre;

    // Calculate annual income (12 months salary + gratificaciones + CTS)
    const grossAnnualSalaryOnly = grossMonthly * 12;
    // For tax calculation, include additional income (bonos, comisiones, etc.)
    const grossAnnualForTax = grossAnnualSalaryOnly + totalGratificacionesAnual + totalCTSAnual + additionalIncomeAnnual;
    // For display purposes (without additional income in base salary)
    const grossAnnual = grossAnnualSalaryOnly + totalGratificacionesAnual + totalCTSAnual;

    // Step 1: Subtract UIT deduction (using grossAnnualForTax which includes additional income)
    const uitDeductionAmount = activeConfig.UIT_DEDUCTION * activeConfig.UIT;
    let taxableBaseAmount = grossAnnualForTax - uitDeductionAmount;

    // Step 2: Subtract deductible expenses (max 3 UIT)
    const maxDeductibleExpenses = activeConfig.MAX_DEDUCTIBLE_EXPENSES_UIT * activeConfig.UIT;
    const actualDeductibleExpenses = Math.min(deductibleExpensesAnnual, maxDeductibleExpenses);
    taxableBaseAmount = Math.max(0, taxableBaseAmount - actualDeductibleExpenses);

    // Step 3: Calculate progressive tax
    const annualTaxAmount = taxableBaseAmount > 0 ? calculateProgressiveTax(taxableBaseAmount) : 0;
    const monthlyTaxAmount = annualTaxAmount / 12;

    // Calculate AFP (using config rate)
    const afpAmount = grossMonthly * activeConfig.AFP_RATE;

    // Calculate Insurance Prime (using config rate)
    const insurancePrimeAmount = grossMonthly * activeConfig.INSURANCE_PRIME_RATE;

    // Calculate net salary
    const netSalary = grossMonthly - afpAmount - insurancePrimeAmount - monthlyTaxAmount;

    // Display results
    grossDisplay.textContent = formatCurrency(grossMonthly);
    afpDeduction.textContent = '-' + formatCurrency(afpAmount);
    insurancePrimeDeduction.textContent = '-' + formatCurrency(insurancePrimeAmount);
    taxDeduction.textContent = '-' + formatCurrency(monthlyTaxAmount);
    netDisplay.textContent = formatCurrency(netSalary);
    netSalaryValue.textContent = formatCurrency(netSalary);

    // Gratificaciones breakdown
    gratificacionJuly.textContent = formatCurrency(gratificacionJulio);
    gratificacionDecember.textContent = formatCurrency(gratificacionDiciembre);
    totalGratificaciones.textContent = formatCurrency(totalGratificacionesAnual);

    // CTS breakdown
    ctsMay.textContent = formatCurrency(ctsMayo);
    ctsNovember.textContent = formatCurrency(ctsNoviembre);
    totalCTS.textContent = formatCurrency(totalCTSAnual);

    // Annual breakdown
    grossAnnualSalary.textContent = formatCurrency(grossAnnualSalaryOnly);
    gratificacionesInAnnual.textContent = formatCurrency(totalGratificacionesAnual);
    ctsInAnnual.textContent = formatCurrency(totalCTSAnual);
    additionalIncomeDisplay.textContent = formatCurrency(additionalIncomeAnnual);
    annualIncome.textContent = formatCurrency(grossAnnualForTax);
    uitDeduction.textContent = '-' + formatCurrency(uitDeductionAmount);
    expensesDeduction.textContent = '-' + formatCurrency(actualDeductibleExpenses);
    taxableBase.textContent = formatCurrency(taxableBaseAmount);
    annualTax.textContent = formatCurrency(annualTaxAmount);

    // Show result
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event listeners
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateNetSalary();
});

// No auto-calculate; only on submit

// Initialize labels
initConfigLabels();
