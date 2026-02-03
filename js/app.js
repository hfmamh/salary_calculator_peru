/**
 * Aplicación principal de la Calculadora de Sueldo Neto
 * 
 * Este archivo contiene toda la lógica de la aplicación.
 * Las variables configurables están en js/config.js
 */

// Obtener los tramos de impuesto con valores en soles
const TAX_BRACKETS = getTaxBracketsInSoles();

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
        bonusRate = CONFIG.GRATIFICACION_ESSALUD_RATE;
    } else if (healthInsuranceType === 'eps') {
        bonusRate = CONFIG.GRATIFICACION_EPS_RATE;
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    // If start date is after end date, return 0
    if (start > end) return { months: 0, days: 0 };

    // Normalize to start of day
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

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
function calculateWorkedTime() {
    const startDateInput = document.getElementById('startDate').value;
    if (!startDateInput) {
        // Reset all fields to 0
        document.getElementById('monthsFirstSemester').value = '';
        document.getElementById('monthsSecondSemester').value = '';
        document.getElementById('ctsMonthsFirst').value = '';
        document.getElementById('ctsDaysFirst').value = '';
        document.getElementById('ctsMonthsSecond').value = '';
        document.getElementById('ctsDaysSecond').value = '';
        return;
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
    
    // Update form fields
    document.getElementById('monthsFirstSemester').value = timeJulio.months;
    document.getElementById('monthsSecondSemester').value = timeDiciembre.months;
    document.getElementById('ctsMonthsFirst').value = timeMayo.months;
    document.getElementById('ctsDaysFirst').value = timeMayo.days;
    document.getElementById('ctsMonthsSecond').value = timeNoviembre.months;
    document.getElementById('ctsDaysSecond').value = timeNoviembre.days;
}

/**
 * Función principal que calcula el sueldo neto
 */
function calculateNetSalary() {
    // First, calculate worked time if start date is provided
    calculateWorkedTime();
    
    const grossMonthly = parseFloat(document.getElementById('grossSalary').value);
    const healthInsuranceInput = document.querySelector('input[name="healthInsurance"]:checked');
    const healthInsurance = healthInsuranceInput ? healthInsuranceInput.value : 'essalud';
    const monthsFirstSemester = parseInt(document.getElementById('monthsFirstSemester').value) || 0;
    const monthsSecondSemester = parseInt(document.getElementById('monthsSecondSemester').value) || 0;
    const ctsMonthsFirst = parseInt(document.getElementById('ctsMonthsFirst').value) || 0;
    const ctsDaysFirst = parseInt(document.getElementById('ctsDaysFirst').value) || 0;
    const ctsMonthsSecond = parseInt(document.getElementById('ctsMonthsSecond').value) || 0;
    const ctsDaysSecond = parseInt(document.getElementById('ctsDaysSecond').value) || 0;
    const additionalIncomeAnnual = parseFloat(document.getElementById('additionalIncome').value) || 0;
    const deductibleExpensesAnnual = parseFloat(document.getElementById('deductibleExpenses').value) || 0;

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
    const uitDeductionAmount = CONFIG.UIT_DEDUCTION * CONFIG.UIT_2024;
    let taxableBaseAmount = grossAnnualForTax - uitDeductionAmount;

    // Step 2: Subtract deductible expenses (max 3 UIT)
    const maxDeductibleExpenses = CONFIG.MAX_DEDUCTIBLE_EXPENSES_UIT * CONFIG.UIT_2024;
    const actualDeductibleExpenses = Math.min(deductibleExpensesAnnual, maxDeductibleExpenses);
    taxableBaseAmount = Math.max(0, taxableBaseAmount - actualDeductibleExpenses);

    // Step 3: Calculate progressive tax
    const annualTaxAmount = taxableBaseAmount > 0 ? calculateProgressiveTax(taxableBaseAmount) : 0;
    const monthlyTaxAmount = annualTaxAmount / 12;

    // Calculate AFP (using config rate)
    const afpAmount = grossMonthly * CONFIG.AFP_RATE;

    // Calculate Insurance Prime (using config rate)
    const insurancePrimeAmount = grossMonthly * CONFIG.INSURANCE_PRIME_RATE;

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

// Auto-calculate on input change
const inputs = document.querySelectorAll('input[type="number"], input[type="radio"], select');
inputs.forEach(input => {
    input.addEventListener('input', function() {
        if (document.getElementById('grossSalary').value) {
            calculateNetSalary();
        }
    });
    input.addEventListener('change', function() {
        if (document.getElementById('grossSalary').value) {
            calculateNetSalary();
        }
    });
});

// Calculate worked time when start date changes
const startDateInput = document.getElementById('startDate');
startDateInput.addEventListener('change', function() {
    calculateWorkedTime();
    if (document.getElementById('grossSalary').value) {
        calculateNetSalary();
    }
});
