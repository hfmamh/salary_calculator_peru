# Calculadora de Sueldo Neto - Perú

[![Deploy workflow](https://github.com/hfmamh/salary_calculator_peru/actions/workflows/deploy.yml/badge.svg)](https://github.com/hfmamh/salary_calculator_peru/actions/workflows/deploy.yml) [🔗 Sitio (GitHub Pages)](https://hfmamh.github.io/salary_calculator_peru/)

Calculadora web para calcular el sueldo neto según el sistema tributario peruano, incluyendo descuentos de AFP, prima de seguro, impuestos de 5ta categoría, gratificaciones y CTS.

## Estructura del Proyecto

```
vibe_coding/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos de la aplicación
├── js/
│   ├── config.js       # Variables configurables (UIT, tasas, tramos de impuestos)
│   └── app.js          # Lógica principal de la aplicación
└── README.md           # Este archivo
```

## Características

- ✅ Cálculo de sueldo neto mensual
- ✅ Descuentos de AFP (10%)
- ✅ Descuentos de Prima de Seguro (1.37%)
- ✅ Cálculo de impuesto de 5ta categoría con tramos progresivos
- ✅ Cálculo automático de gratificaciones (Julio y Diciembre)
- ✅ Cálculo automático de CTS (Mayo y Noviembre)
- ✅ Cálculo automático de meses y días trabajados basado en fecha de inicio
- ✅ Soporte para ingresos adicionales (solo afectan impuestos)
- ✅ Soporte para gastos deducibles
- 🔁 UI: el campo "Tipo de Seguro de Salud" ahora usa un **radio-toggle** (EsSalud / EPS) — mejora la accesibilidad y evita selecciones inválidas
## Configuración

Las variables que pueden cambiar en el tiempo (UIT, tasas, tramos de impuestos) están en `js/config.js`. Actualiza estos valores cuando cambien las leyes o regulaciones peruanas.

### Variables configurables en `js/config.js`:

- `UIT_2024`: Valor de la UIT para el año actual
- `AFP_RATE`: Tasa de descuento de AFP
- `INSURANCE_PRIME_RATE`: Tasa de prima de seguro
- `GRATIFICACION_ESSALUD_RATE`: Tasa de gratificación para EsSalud
- `GRATIFICACION_EPS_RATE`: Tasa de gratificación para EPS
- `TAX_BRACKETS`: Tramos de impuesto de 5ta categoría
- `UIT_DEDUCTION`: Cantidad de UIT a descontar
- `MAX_DEDUCTIBLE_EXPENSES_UIT`: Máximo de UIT para gastos deducibles

## Uso

1. Abre `index.html` en tu navegador
2. Ingresa tu sueldo bruto mensual
3. Selecciona tu tipo de seguro de salud (EsSalud o EPS)
4. Ingresa tu fecha de inicio de trabajo (los meses y días se calcularán automáticamente)
5. Opcionalmente, ingresa ingresos adicionales y gastos deducibles
6. El cálculo se realiza automáticamente

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)

## Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.
