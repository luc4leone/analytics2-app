function formatInt(value) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(value);
}

function average(values) {
  if (!values.length) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

function sum(values) {
  return values.reduce((acc, v) => acc + v, 0);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

const avgLinePlugin = {
  id: "avgLine",
  afterDatasetsDraw(chart, _args, pluginOptions) {
    const avg = pluginOptions?.value;
    if (avg === null || avg === undefined) return;

    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const y = scales?.y;
    if (!y) return;

    const yPos = y.getPixelForValue(avg);
    const { left, right } = chartArea;

    ctx.save();
    ctx.strokeStyle = pluginOptions?.color ?? "#71717a";
    ctx.lineWidth = pluginOptions?.lineWidth ?? 2;
    ctx.setLineDash(pluginOptions?.dash ?? [6, 6]);
    ctx.beginPath();
    ctx.moveTo(left, yPos);
    ctx.lineTo(right, yPos);
    ctx.stroke();
    ctx.restore();
  },
  afterEvent(chart, args, pluginOptions) {
    const tooltipEl = pluginOptions?.tooltipEl;
    const label = pluginOptions?.tooltipLabel;
    const avg = pluginOptions?.value;

    if (!tooltipEl || !label || avg === null || avg === undefined) return;

    const event = args?.event;
    if (!event) return;

    if (event.type === "mouseout") {
      tooltipEl.style.display = "none";
      return;
    }

    const { chartArea, scales } = chart;
    if (!chartArea) return;

    const y = scales?.y;
    if (!y) return;

    const rect = chart.canvas.getBoundingClientRect();
    const ratioX = rect.width / chart.width;
    const ratioY = rect.height / chart.height;

    const native = event.native;
    const xCss =
      native && typeof native.clientX === "number"
        ? native.clientX - rect.left
        : event.x * ratioX;
    const yMouseCss =
      native && typeof native.clientY === "number"
        ? native.clientY - rect.top
        : event.y * ratioY;

    const chartAreaCss = {
      left: chartArea.left * ratioX,
      right: chartArea.right * ratioX,
      top: chartArea.top * ratioY,
      bottom: chartArea.bottom * ratioY,
    };

    const yPos = y.getPixelForValue(avg);
    const yLineCss = yPos * ratioY;
    const threshold = pluginOptions?.hoverThreshold ?? 10;

    const withinChartArea =
      xCss >= chartAreaCss.left &&
      xCss <= chartAreaCss.right &&
      yMouseCss >= chartAreaCss.top &&
      yMouseCss <= chartAreaCss.bottom;

    const nearLine = Math.abs(yMouseCss - yLineCss) <= threshold;

    if (!withinChartArea || !nearLine) {
      tooltipEl.style.display = "none";
      return;
    }

    tooltipEl.textContent = label;
    tooltipEl.style.display = "inline-flex";

    const tooltipWidth = tooltipEl.offsetWidth || 0;
    const tooltipHeight = tooltipEl.offsetHeight || 0;

    const padding = 8;
    const minLeft = 0;
    const maxLeft = rect.width - tooltipWidth;

    const desiredLeft = xCss + padding;
    const left = Math.max(minLeft, Math.min(maxLeft, desiredLeft));

    const desiredTop = yLineCss - tooltipHeight - 6;
    const top = Math.max(0, desiredTop);

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  },
};

function getMockData() {
  const labels = ["Lun", "Mar", "Mer", "Gio", "Ven"];

  const byOperator = {
    "juan-pedro": [8, 10, 6, 7, 9],
    "juan-franco": [4, 3, 5, 4, 4],
  };

  const efficiencyByOperator = {
    "juan-pedro": [72, 71, 70, 73, 74],
    "juan-franco": [68, 67, 66, 69, 70],
  };

  const teliMultipliers = labels.map(() =>
    Math.floor(100 + Math.random() * 21),
  );

  const all = labels.map((_, i) => {
    const jp = byOperator["juan-pedro"][i] ?? 0;
    const jf = byOperator["juan-franco"][i] ?? 0;
    return jp + jf;
  });

  const efficiencyAll = labels.map((_, i) => {
    const jp = efficiencyByOperator["juan-pedro"][i] ?? 0;
    const jf = efficiencyByOperator["juan-franco"][i] ?? 0;
    return (jp + jf) / 2;
  });

  return {
    labels,
    all,
    byOperator,
    efficiencyAll,
    efficiencyByOperator,
    teliMultipliers,
  };
}

function computeSeries(data, operatorId) {
  if (operatorId === "all") return data.all;
  return data.byOperator[operatorId] ?? [];
}

function computeEfficiencySeries(data, operatorId) {
  if (operatorId === "all") return data.efficiencyAll;
  return data.efficiencyByOperator[operatorId] ?? [];
}

function computeTeliSeries(data, operatorId) {
  const base = computeSeries(data, operatorId);
  return base.map((v, i) => v * (data.teliMultipliers?.[i] ?? 100));
}

function buildBarChart(ctx, { labels, series, avg, barColor, yAxis }) {
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "value",
          data: series,
          backgroundColor: barColor,
          borderRadius: 6,
          maxBarThickness: 28,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        avgLine: {
          value: avg,
          color: "#71717a",
          lineWidth: 2,
          dash: [6, 6],
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#71717a",
            font: {
              family: "Inter",
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          ...(yAxis ?? {}),
          grid: {
            color: "#e4e4e7",
          },
          ticks: {
            color: "#71717a",
            font: {
              family: "Inter",
              size: 12,
            },
            precision: 0,
          },
        },
      },
    },
    plugins: [avgLinePlugin],
  });
}

function initMarkersPanel(root) {
  const data = getMockData();

  const tabs = Array.from(root.querySelectorAll("[data-operator]"));
  const canvas = root.querySelector('[data-role="markers-chart"]');
  const canvasTeli = root.querySelector('[data-role="teli-chart"]');
  const canvasEfficiency = root.querySelector('[data-role="efficiency-chart"]');
  const elTotal = root.querySelector('[data-role="kpi-total"]');
  const elAvg = root.querySelector('[data-role="kpi-avg"]');
  const elTeliTotal = root.querySelector('[data-role="kpi-teli-total"]');
  const elTeliAvg = root.querySelector('[data-role="kpi-teli-avg"]');
  const elEfficiency = root.querySelector('[data-role="kpi-efficiency"]');

  const barColorButton = document.querySelector(
    '[data-role="bar-color-button"]',
  );
  const barColorInput = document.querySelector('[data-role="bar-color-input"]');

  const efficiencyBarColorButton = document.querySelector(
    '[data-role="efficiency-bar-color-button"]',
  );
  const efficiencyBarColorInput = document.querySelector(
    '[data-role="efficiency-bar-color-input"]',
  );

  if (
    !canvas ||
    !canvasTeli ||
    !canvasEfficiency ||
    !elTotal ||
    !elAvg ||
    !elTeliTotal ||
    !elTeliAvg ||
    !elEfficiency
  )
    return;

  const ctx = canvas.getContext("2d");
  const ctxTeli = canvasTeli.getContext("2d");
  const ctxEfficiency = canvasEfficiency.getContext("2d");

  const tooltipMarkers = canvas.parentElement?.querySelector(
    '[data-role="avgline-tooltip"]',
  );
  const tooltipTeli = canvasTeli.parentElement?.querySelector(
    '[data-role="avgline-tooltip"]',
  );
  const tooltipEfficiency = canvasEfficiency.parentElement?.querySelector(
    '[data-role="avgline-tooltip"]',
  );

  const initialOperator =
    root.querySelector(".operator-tabs__tab--active")?.dataset.operator ??
    "all";

  const initialSeries = computeSeries(data, initialOperator);
  const initialAvg = average(initialSeries);

  let barsColor =
    (barColorInput && typeof barColorInput.value === "string"
      ? barColorInput.value
      : "") || "#f0abfc";

  let efficiencyBarsColor =
    (efficiencyBarColorInput &&
    typeof efficiencyBarColorInput.value === "string"
      ? efficiencyBarColorInput.value
      : "") || "#fde68a";

  if (barColorButton) {
    barColorButton.style.backgroundColor = barsColor;
  }

  if (efficiencyBarColorButton) {
    efficiencyBarColorButton.style.backgroundColor = efficiencyBarsColor;
  }

  const initialTeliSeries = computeTeliSeries(data, initialOperator);
  const initialTeliAvg = average(initialTeliSeries);

  const initialEfficiencySeries = computeEfficiencySeries(
    data,
    initialOperator,
  );
  const initialEfficiencyAvg = average(initialEfficiencySeries);

  const chart = buildBarChart(ctx, {
    labels: data.labels,
    series: initialSeries,
    avg: initialAvg,
    barColor: barsColor,
  });

  chart.options.plugins.avgLine.tooltipEl = tooltipMarkers;
  chart.options.plugins.avgLine.tooltipLabel =
    "media markers tagliati al giorno";
  chart.options.plugins.avgLine.hoverThreshold = 10;

  const chartTeli = buildBarChart(ctxTeli, {
    labels: data.labels,
    series: initialTeliSeries,
    avg: initialTeliAvg,
    barColor: barsColor,
  });

  chartTeli.options.plugins.avgLine.tooltipEl = tooltipTeli;
  chartTeli.options.plugins.avgLine.tooltipLabel =
    "media teli tagliati al giorno";
  chartTeli.options.plugins.avgLine.hoverThreshold = 10;

  const chartEfficiency = buildBarChart(ctxEfficiency, {
    labels: data.labels,
    series: initialEfficiencySeries,
    avg: initialEfficiencyAvg,
    barColor: efficiencyBarsColor,
    yAxis: {
      min: 0,
      max: 100,
      ticks: {
        callback: (v) => `${v}%`,
      },
    },
  });

  chartEfficiency.options.plugins.avgLine.tooltipEl = tooltipEfficiency;
  chartEfficiency.options.plugins.avgLine.tooltipLabel = "efficienza media";
  chartEfficiency.options.plugins.avgLine.hoverThreshold = 10;

  function setActiveTab(operatorId) {
    tabs.forEach((t) => {
      const isActive = t.dataset.operator === operatorId;
      t.classList.toggle("operator-tabs__tab--active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function update(operatorId) {
    const series = computeSeries(data, operatorId);
    const total = sum(series);
    const avg = average(series);

    const teliSeries = computeTeliSeries(data, operatorId);
    const teliTotal = sum(teliSeries);
    const teliAvg = average(teliSeries);

    const efficiencySeries = computeEfficiencySeries(data, operatorId);
    const efficiencyAvg = average(efficiencySeries);

    elTotal.textContent = formatInt(total);
    elAvg.textContent = formatInt(Math.round(avg));
    elTeliTotal.textContent = formatInt(teliTotal);
    elTeliAvg.textContent = formatInt(Math.round(teliAvg));
    elEfficiency.textContent = formatPercent(efficiencyAvg);

    chart.data.datasets[0].data = series;
    chart.data.datasets[0].backgroundColor = barsColor;
    chart.options.plugins.avgLine.value = avg;
    chart.update();

    chartTeli.data.datasets[0].data = teliSeries;
    chartTeli.data.datasets[0].backgroundColor = barsColor;
    chartTeli.options.plugins.avgLine.value = teliAvg;
    chartTeli.update();

    chartEfficiency.data.datasets[0].data = efficiencySeries;
    chartEfficiency.data.datasets[0].backgroundColor = efficiencyBarsColor;
    chartEfficiency.options.plugins.avgLine.value = efficiencyAvg;
    chartEfficiency.update();
  }

  function setBarsColor(nextColor) {
    if (!nextColor) return;
    barsColor = nextColor;

    if (barColorButton) {
      barColorButton.style.backgroundColor = barsColor;
    }

    chart.data.datasets[0].backgroundColor = barsColor;
    chartTeli.data.datasets[0].backgroundColor = barsColor;

    chart.update();
    chartTeli.update();
  }

  if (barColorButton && barColorInput) {
    barColorButton.addEventListener("click", () => {
      barColorInput.click();
    });

    barColorInput.addEventListener("input", () => {
      setBarsColor(barColorInput.value);
    });
  }

  function setEfficiencyBarsColor(nextColor) {
    if (!nextColor) return;
    efficiencyBarsColor = nextColor;

    if (efficiencyBarColorButton) {
      efficiencyBarColorButton.style.backgroundColor = efficiencyBarsColor;
    }

    chartEfficiency.data.datasets[0].backgroundColor = efficiencyBarsColor;
    chartEfficiency.update();
  }

  if (efficiencyBarColorButton && efficiencyBarColorInput) {
    efficiencyBarColorButton.addEventListener("click", () => {
      efficiencyBarColorInput.click();
    });

    efficiencyBarColorInput.addEventListener("input", () => {
      setEfficiencyBarsColor(efficiencyBarColorInput.value);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const operatorId = tab.dataset.operator;
      if (!operatorId) return;
      setActiveTab(operatorId);
      update(operatorId);
    });
  });

  update(initialOperator);
}

document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll('[data-component="markers-panel"]');
  panels.forEach((p) => initMarkersPanel(p));
});
