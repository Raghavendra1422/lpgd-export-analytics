
Chart.defaults.font.family = "'Source Sans 3', sans-serif";
Chart.defaults.color = '#766C88';
Chart.defaults.borderColor = '#E1D9EE';

const PURPLE_SCALE = ['#33205A','#4A2E7A','#6D4AA0','#8A68B8','#A98BCB','#C9BEDD','#DDD2EB'];
const RED = '#B23A3A';

const CROP_COLORS = {
  'Turmeric (Raw)': '#D9A404',
  'Chilli (Dried Red)': '#B3241C',
  'Chilli Powder': '#E2492D',
  'Cotton': '#8FBF6B',
  'Onion (Red)': '#8E4585',
  'Onion (White)': '#C9C2AE',
  'Soya': '#B5A642'
};
const CROP_FALLBACK = ['#6D4AA0','#4A2E7A','#A9812F','#33205A'];

const COUNTRY_COLORS = {
  'UAE': '#1E88E5',
  'USA': '#E53935',
  'UK': '#43A047',
  'Germany': '#FDD835',
  'Australia': '#8E24AA'
};
const COUNTRY_FALLBACK = ['#1E88E5','#E53935','#43A047','#FDD835','#8E24AA'];

const GRADE_COLORS = {
  'Grade A': '#D4AF37',
  'Grade B': '#9AA0A6',
  'Grade C': '#B08D57'
};
const GRADE_FALLBACK = ['#D4AF37','#9AA0A6','#B08D57'];

function inr(n, compact=true){
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if(compact){
    if(n >= 1e7) return sign+'₹' + (n/1e7).toFixed(2) + 'Cr';
    if(n >= 1e5) return sign+'₹' + (n/1e5).toFixed(2) + 'L';
    if(n >= 1e3) return sign+'₹' + (n/1e3).toFixed(1) + 'k';
    return sign+'₹' + n.toFixed(0);
  }
  return sign+'₹' + n.toLocaleString('en-IN', {maximumFractionDigits:0});
}
function monthLabel(m){
  const [y,mm] = m.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[parseInt(mm,10)-1] + " '" + y.slice(2);
}
function pctColor(p){ return p < 0 ? RED : '#6D4AA0'; }
function uniq(arr, key){ return [...new Set(arr.map(r=>r[key]))].sort(); }

function aggregate(records, key){
  const map = {};
  records.forEach(r=>{
    if(!map[r[key]]) map[r[key]] = {label:r[key], rev:0, cost:0, profit:0, count:0};
    const m = map[r[key]];
    m.rev += r.rev; m.cost += r.cost; m.profit += r.profit; m.count += 1;
  });
  return Object.values(map).map(m=>({...m, pct: m.rev ? (m.profit/m.rev*100) : 0}));
}

function aggregateBy2(records, key1, key2){
  const map = {};
  records.forEach(r=>{
    const k = r[key1]+'||'+r[key2];
    if(!map[k]) map[k] = {a:r[key1], b:r[key2], rev:0, cost:0, profit:0, count:0};
    const m = map[k];
    m.rev += r.rev; m.cost += r.cost; m.profit += r.profit; m.count += 1;
  });
  return Object.values(map).map(m=>({...m, pct: m.rev ? (m.profit/m.rev*100) : 0}));
}

function aggregateMonthly(records){
  const map = {};
  records.forEach(r=>{
    if(!map[r.month]) map[r.month] = {month:r.month, rev:0, cost:0, profit:0, count:0};
    const m = map[r.month];
    m.rev += r.rev; m.cost += r.cost; m.profit += r.profit; m.count += 1;
  });
  return Object.keys(map).sort().map(k=>{
    const m = map[k];
    return {...m, pct: m.rev ? (m.profit/m.rev*100) : 0};
  });
}

const ALL_CROPS = uniq(RECORDS, 'crop');
const ALL_COUNTRIES = uniq(RECORDS, 'country');
let state = { crop:'All', country:'All' };
let brokerSort = { key:'pct', dir:'desc' };
let charts = {};

function filtered(){
  return RECORDS.filter(r =>
    (state.crop==='All' || r.crop===state.crop) &&
    (state.country==='All' || r.country===state.country)
  );
}

function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

const cropSel = document.getElementById('cropFilter');
const countrySel = document.getElementById('countryFilter');
cropSel.innerHTML = ['All', ...ALL_CROPS].map(c=>`<option value="${c}">${c}</option>`).join('');
countrySel.innerHTML = ['All', ...ALL_COUNTRIES].map(c=>`<option value="${c}">${c}</option>`).join('');
cropSel.addEventListener('change', ()=>{ state.crop = cropSel.value; render(); });
countrySel.addEventListener('change', ()=>{ state.country = countrySel.value; render(); });
document.getElementById('resetBtn').addEventListener('click', ()=>{
  state = {crop:'All', country:'All'}; cropSel.value='All'; countrySel.value='All'; render();
});

const allDates = RECORDS.map(r=>r.month).sort();
document.getElementById('dateRange').textContent = monthLabel(allDates[0]) + '  →  ' + monthLabel(allDates[allDates.length-1]);
document.getElementById('headerCounts').textContent =
  RECORDS.length.toLocaleString('en-IN') + ' shipments · ' + uniq(RECORDS,'broker').length + ' brokers · ' + ALL_COUNTRIES.length + ' countries';

function render(){
  const recs = filtered();
  const noteBits = [];
  if(state.crop !== 'All') noteBits.push(state.crop);
  if(state.country !== 'All') noteBits.push(state.country);
  document.getElementById('activeNote').textContent = noteBits.length
    ? `Showing ${recs.length.toLocaleString('en-IN')} shipments · ${noteBits.join(' → ')}`
    : `Showing all ${recs.length.toLocaleString('en-IN')} shipments`;

  renderKPIs(recs);
  renderMonthly(recs);
  renderCropChart(recs);
  renderCropPie(recs);
  renderCountryChart(recs);
  renderCountryPie(recs);
  renderQualityChart(recs);
  renderQualityPie(recs);
  renderRegionChart(recs);
  renderCrossTab(recs);
  renderBrokerTable(recs);
  renderInsights(recs);
}

function renderKPIs(recs){
  const rev = recs.reduce((s,r)=>s+r.rev,0);
  const cost = recs.reduce((s,r)=>s+r.cost,0);
  const profit = recs.reduce((s,r)=>s+r.profit,0);
  const pct = rev ? profit/rev*100 : 0;
  const perCost = cost ? profit/cost : 0;
  const lossCount = recs.filter(r=>r.profit<0).length;
  const lossPct = recs.length ? lossCount/recs.length*100 : 0;

  const kpiDefs = [
    {label:'Total revenue', value: inr(rev), cls:''},
    {label:'Total shipment cost', value: inr(cost), cls:''},
    {label:'Total profit', value: inr(profit), cls: profit<0?'red':''},
    {label:'Profit %', value: pct.toFixed(1) + '%', cls: pct<0?'red':'', foot:'profit as a share of revenue'},
    {label:'Profit per ₹1 of cost', value: '₹' + perCost.toFixed(2), cls: perCost<0?'red':'', foot:'₹ earned per ₹1 spent shipping — stricter than profit %'},
    {label:'Loss-making shipments', value: lossCount.toLocaleString('en-IN') + ' (' + lossPct.toFixed(1) + '%)', cls:'red', foot:'cost exceeded revenue — a flag to investigate, not a scorecard'},
  ];
  document.getElementById('kpiRow').innerHTML = kpiDefs.map(k => `
    <div class="kpi">
      <div class="label">${k.label}</div>
      <div class="value ${k.cls}">${k.value}</div>
      ${k.foot ? `<div class="foot">${k.foot}</div>` : ''}
    </div>`).join('');
}

function renderMonthly(recs){
  const monthly = aggregateMonthly(recs);
  const labels = monthly.map(m=>monthLabel(m.month));
  destroyChart('monthly');
  charts.monthly = new Chart(document.getElementById('monthlyChart'), {
    type:'bar',
    data: {
      labels,
      datasets: [
        { label:'Shipment cost', data: monthly.map(m=>m.cost), backgroundColor:'#E07B22', borderRadius:3 },
        { label:'Revenue', data: monthly.map(m=>m.rev), backgroundColor:'#2E5AAC', borderRadius:3 },
        { label:'Profit', data: monthly.map(m=>m.profit), backgroundColor:'#2E8B57', borderRadius:3 }
      ]
    },
    options: {
      responsive:true,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:false },
        tooltip:{
          backgroundColor:'#33205A', borderColor:'#33205A', borderWidth:1, titleColor:'#FFFFFF', bodyColor:'#F4F0FA',
          callbacks:{ label: ctx => ' ' + ctx.dataset.label + ': ' + inr(ctx.parsed.y, false) }
        }
      },
      scales:{
        x:{ grid:{ display:false }, ticks:{ maxRotation:0, autoSkip:true, maxTicksLimit:16 } },
        y:{ grid:{ color:'#EFE9F7' }, ticks:{ callback:v=>inr(v) } }
      }
    }
  });
}

function renderCropChart(recs){
  const data = aggregate(recs, 'crop').sort((a,b)=>a.pct-b.pct);
  destroyChart('crop');
  charts.crop = new Chart(document.getElementById('cropChart'), {
    type:'bar',
    data:{ labels: data.map(c=>c.label), datasets:[{ data: data.map(c=>c.pct), backgroundColor: data.map(c=>pctColor(c.pct)), borderRadius:3 }] },
    options:{
      indexAxis:'y',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.x.toFixed(1)+'% profit margin'}} },
      scales:{ x:{ grid:{ color:'#EFE9F7' }, ticks:{ callback:v=>v+'%' } }, y:{ grid:{ display:false } } }
    }
  });
}

function renderCropPie(recs){
  const data = aggregate(recs, 'crop');
  const positive = data.filter(d=>d.profit > 0).sort((a,b)=>b.profit-a.profit);
  const negative = data.filter(d=>d.profit <= 0);
  destroyChart('cropPie');
  charts.cropPie = new Chart(document.getElementById('cropPie'), {
    type:'pie',
    data:{
      labels: positive.map(d=>d.label),
      datasets:[{ data: positive.map(d=>d.profit), backgroundColor: positive.map((d,i)=>CROP_COLORS[d.label] || CROP_FALLBACK[i % CROP_FALLBACK.length]), borderColor:'#FFFFFF', borderWidth:2 }]
    },
    options:{
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } },
        tooltip:{ callbacks:{ label: ctx => ' ' + ctx.label + ': ' + inr(ctx.parsed, false) } }
      }
    }
  });
  const foot = document.getElementById('cropPieFootnote');
  if(negative.length){
    const totalLoss = negative.reduce((s,d)=>s+d.profit,0);
    foot.innerHTML = `Not shown (loss-making, so a pie slice can't represent them): <b>${negative.map(d=>d.label).join(', ')}</b> — together these subtracted ${inr(Math.abs(totalLoss),false)} from total profit.`;
  } else {
    foot.innerHTML = '';
  }
}

function renderCountryChart(recs){
  const data = aggregate(recs, 'country').sort((a,b)=>b.pct-a.pct);
  destroyChart('country');
  charts.country = new Chart(document.getElementById('countryChart'), {
    type:'bar',
    data:{ labels: data.map(c=>c.label), datasets:[{ data: data.map(c=>c.pct), backgroundColor: data.map(c=>pctColor(c.pct)), borderRadius:3, maxBarThickness:60 }] },
    options:{
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toFixed(1)+'% profit margin'}} },
      scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:'#EFE9F7' }, ticks:{ callback:v=>v+'%' } } }
    }
  });
}

function renderCountryPie(recs){
  const data = aggregate(recs, 'country');
  const positive = data.filter(d=>d.profit > 0).sort((a,b)=>b.profit-a.profit);
  const negative = data.filter(d=>d.profit <= 0);
  destroyChart('countryPie');
  charts.countryPie = new Chart(document.getElementById('countryPie'), {
    type:'pie',
    data:{
      labels: positive.map(d=>d.label),
      datasets:[{ data: positive.map(d=>d.profit), backgroundColor: positive.map((d,i)=>COUNTRY_COLORS[d.label] || COUNTRY_FALLBACK[i % COUNTRY_FALLBACK.length]), borderColor:'#FFFFFF', borderWidth:2 }]
    },
    options:{
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } },
        tooltip:{ callbacks:{ label: ctx => ' ' + ctx.label + ': ' + inr(ctx.parsed, false) } }
      }
    }
  });
  const foot = document.getElementById('countryPieFootnote');
  if(negative.length){
    const totalLoss = negative.reduce((s,d)=>s+d.profit,0);
    foot.innerHTML = `Not shown (loss-making): <b>${negative.map(d=>d.label).join(', ')}</b> — together subtracted ${inr(Math.abs(totalLoss),false)} from total profit.`;
  } else {
    foot.innerHTML = 'All countries in this view are profitable, so every one is represented above.';
  }
}

function renderQualityChart(recs){
  const data = aggregate(recs, 'grade').sort((a,b)=> a.label.localeCompare(b.label));
  destroyChart('quality');
  charts.quality = new Chart(document.getElementById('qualityChart'), {
    type:'bar',
    data:{ labels: data.map(q=>q.label), datasets:[{ data: data.map(q=>q.pct), backgroundColor: data.map(q=>pctColor(q.pct)), borderRadius:3, maxBarThickness:60 }] },
    options:{
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toFixed(1)+'% profit margin'}} },
      scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:'#EFE9F7' }, ticks:{ callback:v=>v+'%' } } }
    }
  });
}

function renderQualityPie(recs){
  const data = aggregate(recs, 'grade');
  const positive = data.filter(d=>d.profit > 0).sort((a,b)=>b.profit-a.profit);
  const negative = data.filter(d=>d.profit <= 0);
  destroyChart('qualityPie');
  charts.qualityPie = new Chart(document.getElementById('qualityPie'), {
    type:'pie',
    data:{
      labels: positive.map(d=>d.label),
      datasets:[{ data: positive.map(d=>d.profit), backgroundColor: positive.map((d,i)=>GRADE_COLORS[d.label] || GRADE_FALLBACK[i % GRADE_FALLBACK.length]), borderColor:'#FFFFFF', borderWidth:2 }]
    },
    options:{
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } },
        tooltip:{ callbacks:{ label: ctx => ' ' + ctx.label + ': ' + inr(ctx.parsed, false) } }
      }
    }
  });
  const foot = document.getElementById('qualityPieFootnote');
  if(negative.length){
    const totalLoss = negative.reduce((s,d)=>s+d.profit,0);
    foot.innerHTML = `Not shown (loss-making): <b>${negative.map(d=>d.label).join(', ')}</b> — together subtracted ${inr(Math.abs(totalLoss),false)} from total profit.`;
  } else {
    foot.innerHTML = 'All grades in this view are profitable, so every one is represented above.';
  }
}

function renderRegionChart(recs){
  const data = aggregate(recs, 'region').sort((a,b)=>b.profit-a.profit)
    .map(r=>({...r, perShipment: r.count ? r.profit/r.count : 0}));
  destroyChart('region');
  charts.region = new Chart(document.getElementById('regionChart'), {
    data:{
      labels: data.map(r=>r.label),
      datasets:[
        { type:'bar', label:'Total profit', data: data.map(r=>r.profit), backgroundColor: data.map(r=>r.profit<0?RED:'#6D4AA0'), borderRadius:3, yAxisID:'y' },
        { type:'line', label:'Profit per shipment', data: data.map(r=>r.perShipment), borderColor:'#A9812F', backgroundColor:'#A9812F', pointRadius:4, pointBackgroundColor:'#A9812F', borderWidth:2.5, tension:0.3, yAxisID:'y1' }
      ]
    },
    options:{
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } },
        tooltip:{ callbacks:{ label: ctx => ctx.dataset.label === 'Profit per shipment' ? ' Profit/shipment: ' + inr(ctx.parsed.y,false) : ' Total profit: ' + inr(ctx.parsed.y,false) } }
      },
      scales:{
        x:{ grid:{ display:false } },
        y:{ position:'left', grid:{ color:'#EFE9F7' }, ticks:{ callback:v=>inr(v) }, title:{display:true,text:'Total profit'} },
        y1:{ position:'right', grid:{ display:false }, ticks:{ callback:v=>inr(v) }, title:{display:true,text:'Profit / shipment'} }
      }
    }
  });
}

function renderCrossTab(recs){
  const crops = state.crop==='All' ? ALL_CROPS : [state.crop];
  const countries = state.country==='All' ? ALL_COUNTRIES : [state.country];

  const cellMap = {};
  crops.forEach(c=>countries.forEach(co=>{ cellMap[c+'|'+co] = {rev:0, profit:0, count:0}; }));
  recs.forEach(r=>{
    const k = r.crop+'|'+r.country;
    if(cellMap[k]){ cellMap[k].rev += r.rev; cellMap[k].profit += r.profit; cellMap[k].count += 1; }
  });

  let maxAbsPct = 1;
  crops.forEach(c=>countries.forEach(co=>{
    const cell = cellMap[c+'|'+co];
    if(cell.count){ const pct = cell.rev ? cell.profit/cell.rev*100 : 0; maxAbsPct = Math.max(maxAbsPct, Math.abs(pct)); }
  }));

  let html = '<table class="xtab"><thead><tr><th>Crop \\ Country</th>' + countries.map(co=>`<th>${co}</th>`).join('') + '</tr></thead><tbody>';
  crops.forEach(c=>{
    html += `<tr><td class="rowhead">${c}</td>`;
    countries.forEach(co=>{
      const cell = cellMap[c+'|'+co];
      if(!cell.count){ html += `<td class="cell empty">—</td>`; return; }
      const pct = cell.rev ? cell.profit/cell.rev*100 : 0;
      const intensity = Math.min(1, Math.abs(pct)/maxAbsPct);
      const bg = pct < 0
        ? `rgba(178,58,58,${0.15 + intensity*0.65})`
        : `rgba(74,46,122,${0.12 + intensity*0.68})`;
      const textColor = intensity > 0.4 ? '#FFFFFF' : '#2A2438';
      html += `<td class="cell" style="background:${bg}; color:${textColor}" title="${cell.count} shipments, ${inr(cell.profit,false)} profit">${pct.toFixed(1)}%</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('xtabWrap').innerHTML = html;
}

function renderBrokerTable(recs){
  let data = aggregateBy2(recs, 'broker', 'country');
  data.sort((a,b)=>{
    const dir = brokerSort.dir === 'asc' ? 1 : -1;
    if(brokerSort.key==='broker') return dir * a.a.localeCompare(b.a);
    if(brokerSort.key==='country') return dir * a.b.localeCompare(b.b);
    return dir * (a[brokerSort.key] - b[brokerSort.key]);
  });
  document.getElementById('brokerBody').innerHTML = data.map(b=>{
    const cls = b.pct < 0 ? 'neg' : 'pos';
    return `<tr>
      <td>${b.a}</td>
      <td>${b.b}</td>
      <td class="num">${b.count}</td>
      <td class="num">${inr(b.cost,false)}</td>
      <td class="num">${inr(b.rev,false)}</td>
      <td class="num">${inr(b.profit,false)}</td>
      <td class="num ${cls}">${b.pct.toFixed(1)}%</td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="color:var(--muted-2); text-align:center; padding:20px;">No shipments match the current filters.</td></tr>';
}

document.querySelectorAll('th.sortable').forEach(th=>{
  th.addEventListener('click', ()=>{
    const key = th.dataset.key;
    if(brokerSort.key === key){ brokerSort.dir = brokerSort.dir === 'asc' ? 'desc' : 'asc'; }
    else { brokerSort = { key, dir: (key==='broker'||key==='country') ? 'asc' : 'desc' }; }
    document.querySelectorAll('th.sortable').forEach(h=>{
      h.classList.remove('active');
      h.querySelector('.arrow').textContent = '↕';
    });
    th.classList.add('active');
    th.querySelector('.arrow').textContent = brokerSort.dir === 'asc' ? '↑' : '↓';
    renderBrokerTable(filtered());
  });
});

function renderInsights(recs){
  const box = document.getElementById('insightsBox');
  if(recs.length < 5){
    box.innerHTML = `<div class="insight"><div class="h">Not enough shipments in this view</div><div class="b">Widen the filters to see a meaningful trend.</div></div>`;
    return;
  }
  const cropAgg = aggregate(recs,'crop').sort((a,b)=>a.pct-b.pct);
  const worstCrop = cropAgg[0], bestCrop = cropAgg[cropAgg.length-1];
  const qualityAgg = aggregate(recs,'grade').sort((a,b)=>b.pct-a.pct);
  const regionAgg = aggregate(recs,'region').sort((a,b)=>b.profit-a.profit);
  const monthly = aggregateMonthly(recs);
  const profits = monthly.map(m=>m.profit);
  const minM = Math.min(...profits), maxM = Math.max(...profits);

  const crops = state.crop==='All' ? ALL_CROPS : [state.crop];
  const countries = state.country==='All' ? ALL_COUNTRIES : [state.country];
  let pairs = [];
  crops.forEach(c=>countries.forEach(co=>{
    const rows = recs.filter(r=>r.crop===c && r.country===co);
    if(rows.length >= 5){
      const rev = rows.reduce((s,r)=>s+r.rev,0);
      const profit = rows.reduce((s,r)=>s+r.profit,0);
      pairs.push({c, co, pct: rev?profit/rev*100:0, count:rows.length});
    }
  }));
  pairs.sort((a,b)=>b.pct-a.pct);
  const bestPair = pairs[0], worstPair = pairs[pairs.length-1];

  const cards = [];
  if(worstCrop.pct < 0){
    cards.push({warn:true, h:`${worstCrop.label} is loss-making in this view`, b:`Running at ${worstCrop.pct.toFixed(1)}% margin, while ${bestCrop.label} sits at ${bestCrop.pct.toFixed(1)}% — a gap worth acting on if the mix is a choice, not a constraint.`});
  } else {
    cards.push({warn:false, h:`${bestCrop.label} is the strongest performer`, b:`At ${bestCrop.pct.toFixed(1)}% margin versus ${worstCrop.label} at ${worstCrop.pct.toFixed(1)}%, crop mix still meaningfully moves overall profitability.`});
  }
  if(bestPair && worstPair && bestPair !== worstPair){
    cards.push({warn: worstPair.pct<0, h:`${bestPair.c} → ${bestPair.co} is the standout pairing`, b:`${bestPair.pct.toFixed(1)}% margin over ${bestPair.count} shipments, versus ${worstPair.c} → ${worstPair.co} at ${worstPair.pct.toFixed(1)}% — the same crop can perform very differently by market.`});
  }
  cards.push({warn:false, h:`Grade mix is a real lever`, b:`${qualityAgg[0].label} converts at ${qualityAgg[0].pct.toFixed(1)}% versus ${qualityAgg[qualityAgg.length-1].label} at ${qualityAgg[qualityAgg.length-1].pct.toFixed(1)}% — quality, not just crop or destination, changes the outcome.`});
  cards.push({warn:false, h:`Monthly profit ranges ${inr(minM,false)}–${inr(maxM,false)}`, b:`${regionAgg[0].label} is the top-contributing sourcing region by total profit (${inr(regionAgg[0].profit,false)}); ${regionAgg[regionAgg.length-1].label} contributes the least.`});

  box.innerHTML = cards.map(c=>`
    <div class="insight ${c.warn?'warn':''}">
      <div class="h">${c.h}</div>
      <div class="b">${c.b}</div>
    </div>`).join('');
}

render();
