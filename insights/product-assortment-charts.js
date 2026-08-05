// ─────────────────────────────────────────────────────────────
// Overview + SKU tables
// ─────────────────────────────────────────────────────────────
function renderOverviewTable() {
  const rows = ASSORTMENT_CATEGORIES.map(c => {
    const priceIndex = Math.round((c.own.median / c.competitor.median) * 100);
    const shareGap = c.ownShare - c.compShare;
    const trendUp = shareGap >= 0;
    return `<tr>
      <td class="strong">${c.name}</td>
      <td>${c.skus}</td>
      <td>$${c.sales30d.toLocaleString()}</td>
      <td>${c.sellThrough.toFixed(1)}%</td>
      <td>${priceIndex}</td>
      <td>${c.ownShare.toFixed(1)}%</td>
      <td><span class="trend ${trendUp ? "up" : "down"}">${trendUp ? "▲" : "▼"} ${Math.abs(shareGap).toFixed(1)}pp</span></td>
    </tr>`;
  }).join("");
  document.getElementById("overview-rows").innerHTML = rows;
}

function renderSkuTable() {
  const trendArrow = { up: "▲", down: "▼", flat: "→" };
  const rows = SKU_PERFORMANCE.map(s => `
    <tr>
      <td class="strong">${s.sku}</td>
      <td>${s.category}</td>
      <td>${s.units.toLocaleString()}</td>
      <td>$${s.revenue.toLocaleString()}</td>
      <td>${s.margin.toFixed(1)}%</td>
      <td>${s.sellThrough.toFixed(1)}%</td>
      <td><span class="trend ${s.trend}">${trendArrow[s.trend]}</span></td>
    </tr>
  `).join("");
  document.getElementById("sku-rows").innerHTML = rows;
}

// ─────────────────────────────────────────────────────────────
// Price Comparison: box plots (min/Q1/median/Q3/max) + dual-axis
// wallet-share lines, hand-drawn in SVG (no charting library).
// ─────────────────────────────────────────────────────────────
const CHART_COLORS = {
  ownFill: "#f5a623", ownStroke: "#95600c",
  compFill: "#2a78d6", compStroke: "#154a85",
  ownLine: "#248700", compLine: "#d32f2f", catLine: "#4b286d",
};

function renderPriceChart() {
  const cats = ASSORTMENT_CATEGORIES;
  const svg = document.getElementById("price-chart");

  const W = 1400, H = 460;
  const marginLeft = 60, marginRight = 60, marginTop = 20, marginBottom = 100;
  const plotW = W - marginLeft - marginRight;
  const plotH = H - marginTop - marginBottom;
  const plotBottom = marginTop + plotH;

  const priceMax = 25;
  const shareMax = 30;
  const priceToY = v => marginTop + plotH - (v / priceMax) * plotH;
  const shareToY = v => marginTop + plotH - (v / shareMax) * plotH;

  const slotW = plotW / cats.length;
  const slotCenterX = i => marginLeft + i * slotW + slotW / 2;
  const boxW = 30, boxGap = 8;

  function boxPlot(x, stats, fill, stroke) {
    const cx = x + boxW / 2;
    return `<g>
      <line x1="${cx}" y1="${priceToY(stats.max)}" x2="${cx}" y2="${priceToY(stats.min)}" stroke="${stroke}" stroke-width="1.5"/>
      <line x1="${x + boxW * 0.22}" y1="${priceToY(stats.max)}" x2="${x + boxW * 0.78}" y2="${priceToY(stats.max)}" stroke="${stroke}" stroke-width="1.5"/>
      <line x1="${x + boxW * 0.22}" y1="${priceToY(stats.min)}" x2="${x + boxW * 0.78}" y2="${priceToY(stats.min)}" stroke="${stroke}" stroke-width="1.5"/>
      <rect x="${x}" y="${priceToY(stats.q3)}" width="${boxW}" height="${Math.max(1, priceToY(stats.q1) - priceToY(stats.q3))}" fill="${fill}" fill-opacity="0.85" stroke="${stroke}" stroke-width="1.3"/>
      <line x1="${x}" y1="${priceToY(stats.median)}" x2="${x + boxW}" y2="${priceToY(stats.median)}" stroke="${stroke}" stroke-width="2.4"/>
      <title>min $${stats.min.toFixed(2)} · Q1 $${stats.q1.toFixed(2)} · median $${stats.median.toFixed(2)} · Q3 $${stats.q3.toFixed(2)} · max $${stats.max.toFixed(2)}</title>
    </g>`;
  }

  let parts = [];

  // Gridlines + dual axes
  for (let f = 0; f <= 1.0001; f += 0.2) {
    const y = marginTop + plotH * (1 - f);
    const priceLabel = Math.round(priceMax * f);
    const shareLabel = Math.round(shareMax * f);
    parts.push(`<line class="grid-line" x1="${marginLeft}" x2="${W - marginRight}" y1="${y}" y2="${y}"/>`);
    parts.push(`<text class="axis-tick" x="${marginLeft - 8}" y="${y + 4}" text-anchor="end">${priceLabel}</text>`);
    parts.push(`<text class="axis-tick" x="${W - marginRight + 8}" y="${y + 4}" text-anchor="start">${shareLabel}%</text>`);
  }
  parts.push(`<line class="axis-line" x1="${marginLeft}" x2="${marginLeft}" y1="${marginTop}" y2="${plotBottom}"/>`);
  parts.push(`<line class="axis-line" x1="${W - marginRight}" x2="${W - marginRight}" y1="${marginTop}" y2="${plotBottom}"/>`);
  parts.push(`<line class="axis-line" x1="${marginLeft}" x2="${W - marginRight}" y1="${plotBottom}" y2="${plotBottom}"/>`);
  parts.push(`<text class="axis-tick" x="${marginLeft - 44}" y="${marginTop + plotH / 2}" text-anchor="middle" transform="rotate(-90 ${marginLeft - 44} ${marginTop + plotH / 2})" style="font-weight:700">Unit Price ($)</text>`);
  parts.push(`<text class="axis-tick" x="${W - marginRight + 46}" y="${marginTop + plotH / 2}" text-anchor="middle" transform="rotate(-90 ${W - marginRight + 46} ${marginTop + plotH / 2})" style="font-weight:700">Wallet Share</text>`);

  // Box plots + category labels
  cats.forEach((c, i) => {
    const pairLeft = slotCenterX(i) - (boxW + boxGap / 2);
    const ownX = pairLeft;
    const compX = pairLeft + boxW + boxGap;
    parts.push(boxPlot(ownX, c.own, CHART_COLORS.ownFill, CHART_COLORS.ownStroke));
    parts.push(boxPlot(compX, c.competitor, CHART_COLORS.compFill, CHART_COLORS.compStroke));
    const lx = slotCenterX(i);
    parts.push(`<text class="cat-label" x="${lx}" y="${plotBottom + 18}" text-anchor="end" transform="rotate(-30 ${lx} ${plotBottom + 18})">${c.name}</text>`);
  });

  // Wallet-share line series
  function lineSeries(key, color) {
    const pts = cats.map((c, i) => `${slotCenterX(i)},${shareToY(c[key])}`).join(" ");
    let seg = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
    cats.forEach((c, i) => {
      seg += `<circle cx="${slotCenterX(i)}" cy="${shareToY(c[key])}" r="3.6" fill="${color}"><title>${c.name}: ${c[key].toFixed(1)}%</title></circle>`;
    });
    return seg;
  }
  parts.push(lineSeries("ownShare", CHART_COLORS.ownLine));
  parts.push(lineSeries("compShare", CHART_COLORS.compLine));
  parts.push(lineSeries("categoryShare", CHART_COLORS.catLine));

  svg.innerHTML = parts.join("");
}

// ─────────────────────────────────────────────────────────────
// Export the chart SVG as a PNG download.
// ─────────────────────────────────────────────────────────────
function exportChartPng() {
  const svg = document.getElementById("price-chart");
  let svgStr = new XMLSerializer().serializeToString(svg);
  if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgStr = svgStr.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = svg.viewBox.baseVal.width * scale;
    canvas.height = svg.viewBox.baseVal.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob => {
      const link = document.createElement("a");
      link.download = "competitor-price-comparison.png";
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  };
  img.src = url;
}
