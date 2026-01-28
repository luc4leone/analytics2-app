# Analytics 2 dashboard frontend


# Direzione generale
(Tailwind + “light components” + BEM)
Non è incongruente
Tailwind e BEM possono convivere bene se decidi chi fa cosa.

## Tailwind
ottimo per
layout (grid/flex), spacing, typography, responsive
prototipazione veloce e consistenza visiva

## BEM
ottimo per
definire “componenti” riusabili e riconoscibili (hook semantici)
varianti (--warning, --active) e sotto-elementi (__title, __value)

## JS hooks
evita di legarti alle classi CSS. 
data-* attributes (data-role="kpi-value", data-chart="oee")
così puoi cambiare stile senza rompere lo scripting

## Tailwind CLI (build leggero, niente framework)
Pro:
puoi creare classi BEM in style.css usando @apply (molto potente)
output pulito e riusabile dagli sviluppatori
Contro: aggiungi un passaggio di build (comunque minimo)

## Charts: Chart.js 
Chart.js: ottima scelta per dashboard “classica”, facile, molto diffusa.
Alternative solo se mi serve di più:
- Apache ECharts
- uPlot