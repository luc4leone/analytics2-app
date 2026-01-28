# Analytics 2 dashboard frontend

## Direzione generale
- Tailwind + “light components” + BEM
- Tailwind per layout (grid/flex), spacing, typography, responsive
- BEM per definire “componenti” riusabili e riconoscibili (hook semantici)
varianti (--warning, --active) e sotto-elementi (__title, __value)
- JS hooks per evitare di legarti alle classi CSS. data-* attributes (data-role="kpi-value", data-chart="oee") per cambiare stile senza rompere lo scripting

## Tailwind CLI (build leggero, niente framework)
Per poter creare classi BEM in style.css usando @apply

## Charts: Chart.js 
Alternative solo se mi serve di più:
- Apache ECharts
- uPlot
- https://oracleapex.com/ords/r/apex_pm/sample-charts/bar