import { countyPaths } from './countyPaths.js';
import { historicalData } from './historical_data.js';// Constants
const FIXED_NOW_DATE = new Date(); // Use real current date
let itemsPerPage = 5;

// State Management
let incidents = [];
let selectedCounty = null; // null represents Whole Ireland
let selectedYear = FIXED_NOW_DATE.getUTCFullYear();
let currentPage = 1;

let mockIncidents = [];
export const countiesList = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];

// Load Data: Merge custom admin entries from localStorage with scraped data.js entries
async function loadInitialData() {
  const savedCustom = localStorage.getItem('eire_safe_custom_incidents');
  let customIncidents = [];
  if (savedCustom) {
    try {
      customIncidents = JSON.parse(savedCustom);
    } catch (e) {
      console.error("Failed to parse custom incidents.", e);
    }
  }
  
  try {
    const module = await import(`./data_${selectedYear}.js`);
    mockIncidents = module.mockIncidents || [];
  } catch (e) {
    console.warn(`Could not load data for ${selectedYear}:`, e);
    mockIncidents = []; // Clear if not found
  }
  
  // Combine custom incidents and scraped mockIncidents, filtering out duplicate IDs
  const combined = [...customIncidents, ...mockIncidents];
  const seenIds = new Set();
  incidents = combined.filter(inc => {
    if (seenIds.has(inc.id)) return false;
    
    // Enforce selectedYear logic for feed and stats
    const d = new Date(inc.date);
    if (d.getUTCFullYear() !== selectedYear) return false;
    
    seenIds.add(inc.id);
    return true;
  });
}

// 32 Irish Counties matching the SVG paths
const activeCounties = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
  "Antrim", "Londonderry", "Down", "Armagh", "Tyrone", "Fermanagh"
];

// Helper: Calculate Date ranges
function getDateRange(type) {
  let baseDate = new Date(FIXED_NOW_DATE);
  const currentYear = FIXED_NOW_DATE.getUTCFullYear();
  
  if (selectedYear !== currentYear) {
    // Pretend "now" is Dec 31 of the selected year
    baseDate = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59));
  }
  
  const now = baseDate;
  
  if (type === 'this-week') {
    // Current week (Monday to Sunday)
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start, end };
  }
  
  if (type === 'prev-week') {
    // Previous week
    const weekRange = getDateRange('this-week');
    const start = new Date(weekRange.start);
    start.setUTCDate(start.getUTCDate() - 7);
    const end = new Date(weekRange.start);
    return { start, end };
  }
  
  if (type === 'this-month') {
    // Current Month
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { start, end };
  }
  
  if (type === 'prev-month') {
    // Previous Month
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return { start, end };
  }
  
  if (type === 'this-year') {
    // Current Year
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
    return { start, end };
  }
  
  if (type === 'prev-year') {
    // Previous Year
    const start = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    return { start, end };
  }
}

// Compute Statistics
function computeStats(countyFilter = null) {
  // Filter by county scope if set
  const filtered = countyFilter
    ? incidents.filter(inc => inc.county.toLowerCase() === countyFilter.toLowerCase())
    : incidents;

  const getCountBetween = (start, end) => {
    return filtered.filter(inc => {
      const d = new Date(inc.date);
      return d >= start && d < end;
    }).length;
  };

  let thisWeekVal = 0, prevWeekVal = 0, thisMonthVal = 0, prevMonthVal = 0, thisYearVal = 0;

  if (selectedYear <= 2024) {
    // USE HISTORICAL DATA FOR YEARLY TOTAL
    if (countyFilter) {
      thisYearVal = historicalData.seizuresByCounty[countyFilter]?.[selectedYear] || 0;
    } else {
      thisYearVal = historicalData.totals[selectedYear] || 0;
    }
  } else {
    // USE LIVE DATA
    const weekRange = getDateRange('this-week');
    const prevWeekRange = getDateRange('prev-week');
    thisWeekVal = getCountBetween(weekRange.start, weekRange.end);
    prevWeekVal = getCountBetween(prevWeekRange.start, prevWeekRange.end);

    const monthRange = getDateRange('this-month');
    const prevMonthRange = getDateRange('prev-month');
    thisMonthVal = getCountBetween(monthRange.start, monthRange.end);
    prevMonthVal = getCountBetween(prevMonthRange.start, prevMonthRange.end);

    const yearRange = getDateRange('this-year');
    thisYearVal = getCountBetween(yearRange.start, yearRange.end);
  }

  return {
    week: { current: thisWeekVal, previous: prevWeekVal },
    month: { current: thisMonthVal, previous: prevMonthVal },
    year: { current: thisYearVal }
  };
}

// Format trend text
function updateStatCard(cardId, current, previous, isYear = false, isHistorical = false) {
  const valueEl = document.getElementById(`stat-${cardId}-value`);
  const trendEl = document.getElementById(`stat-${cardId}-trend`);
  
  if (isHistorical && !isYear) {
    valueEl.textContent = "N/A";
    trendEl.textContent = "Historical Data";
    trendEl.className = "stat-trend flat";
    return;
  }
  
  valueEl.textContent = current;
  
  if (isYear) {
    trendEl.textContent = "Official Total";
    trendEl.className = "stat-trend flat";
    return;
  }
  
  const diff = current - previous;
  if (diff > 0) {
    trendEl.textContent = `+${diff} increase`;
    trendEl.className = "stat-trend up";
  } else if (diff < 0) {
    trendEl.textContent = `${diff} decrease`;
    trendEl.className = "stat-trend down";
  } else {
    trendEl.textContent = "0 change";
    trendEl.className = "stat-trend flat";
  }
}

function renderDashboard() {
  const stats = computeStats(selectedCounty);
  const currentYear = FIXED_NOW_DATE.getUTCFullYear();
  
  const weekTitle = document.getElementById('stat-week-title');
  const monthTitle = document.getElementById('stat-month-title');
  const weekLabel = document.getElementById('stat-week-trend-label');
  const monthLabel = document.getElementById('stat-month-trend-label');
  const yearTitle = document.getElementById('stat-year-title');
  
  if (selectedYear === currentYear) {
    weekTitle.textContent = "This Week";
    monthTitle.textContent = "This Month";
    weekLabel.textContent = "vs previous 7 days";
    monthLabel.textContent = "vs previous month";
    yearTitle.textContent = "This Year";
  } else {
    weekTitle.textContent = `Last Week of ${selectedYear}`;
    monthTitle.textContent = `Last Month of ${selectedYear}`;
    weekLabel.textContent = "vs previous 7 days";
    monthLabel.textContent = "vs previous month";
    yearTitle.textContent = `Total in ${selectedYear}`;
  }

  const isHistorical = selectedYear <= 2024;
  updateStatCard('week', stats.week.current, stats.week.previous, false, isHistorical);
  updateStatCard('month', stats.month.current, stats.month.previous, false, isHistorical);
  updateStatCard('year', stats.year.current, 0, true, isHistorical);
  
  const scopeLabel = document.getElementById('active-scope-label');
  const chartScopeLabel = document.getElementById('chart-scope-indicator');
  const dataSyncLabel = document.getElementById('data-sync-label');
  
  const displayLabel = selectedCounty ? `${selectedCounty} County` : "Whole Ireland";
  scopeLabel.textContent = displayLabel;
  chartScopeLabel.textContent = displayLabel;
  
  if (selectedYear === currentYear) {
    const dateTime = FIXED_NOW_DATE.toLocaleString('default', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC' 
    });
    dataSyncLabel.textContent = `Verified ${dateTime} UTC`;
  } else {
    dataSyncLabel.textContent = `Verified Data for ${selectedYear}`;
  }
  
  // Set dropdown value to sync
  const dropdown = document.getElementById('scope-county-dropdown');
  dropdown.value = selectedCounty || "";
  
  // Highlight "Whole Ireland" button
  const nationalBtn = document.getElementById('scope-national');
  if (selectedCounty) {
    nationalBtn.classList.remove('active');
  } else {
    nationalBtn.classList.add('active');
  }
}

// Render SVG County Map
function renderMap() {
  const mapSvg = document.getElementById('ireland-map-svg');
  mapSvg.innerHTML = ''; // clear
  
  const tooltip = document.getElementById('map-tooltip');
  
  // Filter paths for only the 32 active counties
  const activePaths = countyPaths.filter(path => activeCounties.includes(path.id));
  
  // Count incidents by county for tooltips (current year)
  const countyCounts = {};
  activeCounties.forEach(c => { countyCounts[c] = 0; });
  
  if (selectedYear <= 2024) {
    // Map Mode 2: 10-Year Seizures Heatmap for the selected historical year
    // The data is directly from historicalData.seizuresByCounty
    activeCounties.forEach(c => {
      countyCounts[c] = historicalData.seizuresByCounty[c]?.[selectedYear] || 0;
    });
  } else {
    // Map Mode 1: Live Incidents
    const yearStart = getDateRange('this-year').start;
    incidents.forEach(inc => {
      const incDate = new Date(inc.date);
      if (incDate >= yearStart && activeCounties.includes(inc.county)) {
        countyCounts[inc.county] = (countyCounts[inc.county] || 0) + 1;
      }
    });
  }

  activePaths.forEach(pathData => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', `map-county-${pathData.id}`);
    path.setAttribute('class', 'county-path');
    path.setAttribute('d', pathData.d);
    
    // Check if it's a Northern Ireland county
    const isNi = ["Antrim", "Londonderry", "Down", "Armagh", "Tyrone", "Fermanagh"].includes(pathData.id);
    if (isNi) {
      path.classList.add('ni-county');
    }
    
    if (selectedCounty === pathData.id) {
      path.classList.add('selected');
    }
    
    // Mouse events
    path.addEventListener('mouseenter', (e) => {
      const count = countyCounts[pathData.id] || 0;
      const metricLabel = selectedYear <= 2024 ? 'knives seized' : `stabbing${count === 1 ? '' : 's'}`;
      tooltip.innerHTML = `<strong>${pathData.id}</strong><br>${count} ${metricLabel} in ${selectedYear}`;
      tooltip.style.opacity = '1';
    });
    
    path.addEventListener('mousemove', (e) => {
      const rect = document.getElementById('map-wrapper').getBoundingClientRect();
      const x = e.clientX - rect.left + 15;
      const y = e.clientY - rect.top + 15;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });
    
    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
    
    path.addEventListener('click', () => {
      selectCountyScope(pathData.id);
    });
    
    mapSvg.appendChild(path);
  });
}

// Select County Scope and trigger updates
function selectCountyScope(county) {
  selectedCounty = county || null;
  
  // Highlight map path
  document.querySelectorAll('.county-path').forEach(p => {
    p.classList.remove('selected');
  });
  
  if (selectedCounty) {
    const selectedPath = document.getElementById(`map-county-${selectedCounty}`);
    if (selectedPath) {
      selectedPath.classList.add('selected');
    }
  }
  
  // Update dashboard, chart and feed
  renderDashboard();
  renderChart();
  
  // Reset feed filter and page, then render feed
  const feedCountyFilter = document.getElementById('filter-county');
  feedCountyFilter.value = selectedCounty || "";
  currentPage = 1;
  renderFeed();
}

// Render Custom SVG Line Chart
function renderChart() {
  const chartSvg = document.getElementById('trend-chart-svg');
  // Clear everything except <defs>
  const defs = chartSvg.querySelector('defs');
  chartSvg.innerHTML = '';
  chartSvg.appendChild(defs);
  
  const containerWidth = chartSvg.clientWidth || 380;
  const chartHeight = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 30 };
  
  // Calculate historical monthly data for the selected scope
  let months, monthIndices;
  const currentYear = FIXED_NOW_DATE.getUTCFullYear();
  const currentMonth = FIXED_NOW_DATE.getUTCMonth(); // 0-indexed
  
  if (selectedYear === currentYear) {
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months = allMonths.slice(0, currentMonth + 1);
    monthIndices = Array.from({length: currentMonth + 1}, (_, i) => i);
  } else {
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }
  const year = selectedYear;
  
  const monthlyCounts = monthIndices.map(mIndex => {
    return incidents.filter(inc => {
      const d = new Date(inc.date);
      const matchesCounty = selectedCounty
        ? inc.county.toLowerCase() === selectedCounty.toLowerCase()
        : true;
      return matchesCounty && d.getUTCFullYear() === year && d.getUTCMonth() === mIndex;
    }).length;
  });
  
  const maxVal = Math.max(...monthlyCounts, 3); // Minimum scale height of 3
  
  // Render Axes
  const xSpan = (containerWidth - padding.left - padding.right) / (months.length - 1);
  const yScale = (val) => chartHeight - padding.bottom - (val / maxVal) * (chartHeight - padding.top - padding.bottom);
  const xScale = (index) => padding.left + index * xSpan;
  
  // Grid Lines and Labels
  const gridLinesCount = 3;
  for (let i = 0; i <= gridLinesCount; i++) {
    const yVal = Math.round((maxVal / gridLinesCount) * i);
    const yPos = yScale(yVal);
    
    // Grid line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('y1', yPos);
    line.setAttribute('x2', containerWidth - padding.right);
    line.setAttribute('y2', yPos);
    line.setAttribute('class', 'chart-grid-line');
    chartSvg.appendChild(line);
    
    // Y-Axis label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', padding.left - 8);
    label.setAttribute('y', yPos + 3);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('class', 'chart-axis-text');
    label.textContent = yVal;
    chartSvg.appendChild(label);
  }
  
  // X-Axis labels & Point coordinates
  const points = [];
  months.forEach((month, index) => {
    const xPos = xScale(index);
    points.push({ x: xPos, y: yScale(monthlyCounts[index]), count: monthlyCounts[index] });
    
    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', xPos);
    label.setAttribute('y', chartHeight - padding.bottom + 16);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'chart-axis-text');
    label.textContent = month;
    chartSvg.appendChild(label);
  });
  
  // Build Line Path and Area Path
  let dLine = `M ${points[0].x} ${points[0].y}`;
  let dArea = `M ${points[0].x} ${chartHeight - padding.bottom} L ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    // Linear paths (or we could use smooth bezier)
    dLine += ` L ${points[i].x} ${points[i].y}`;
    dArea += ` L ${points[i].x} ${points[i].y}`;
  }
  
  dArea += ` L ${points[points.length - 1].x} ${chartHeight - padding.bottom} Z`;
  
  // Append Area under curve
  const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  areaPath.setAttribute('d', dArea);
  areaPath.setAttribute('class', 'chart-line-area');
  chartSvg.appendChild(areaPath);
  
  // Append Line path
  const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  linePath.setAttribute('d', dLine);
  linePath.setAttribute('class', 'chart-line');
  chartSvg.appendChild(linePath);
  
  // Render Points with Tooltips
  points.forEach((point, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('class', 'chart-point');
    
    // Interactivity title tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${months[i]} ${selectedYear}: ${point.count} incident${point.count === 1 ? '' : 's'}`;
    circle.appendChild(title);
    
    chartSvg.appendChild(circle);
  });
}

// Render Confirmed Reports Feed
function renderFeed() {
  const container = document.getElementById('feed-container');
  const emptyState = document.getElementById('feed-empty-state');
  const resultsCountEl = document.getElementById('feed-results-count');
  
  const searchQuery = document.getElementById('feed-search').value.toLowerCase().trim();
  const filterCounty = document.getElementById('filter-county').value;
  const filterStatus = document.getElementById('filter-status').value;
  const filterDate = document.getElementById('filter-date').value;
  const sortOrder = document.getElementById('filter-sort').value;
  
  // 1. Filter data
  let filtered = [...incidents];
  
  if (filterCounty) {
    filtered = filtered.filter(inc => inc.county.toLowerCase() === filterCounty.toLowerCase());
  }
  
  if (filterStatus) {
    filtered = filtered.filter(inc => inc.status.toLowerCase() === filterStatus.toLowerCase());
  }
  
  if (filterDate) {
    const ranges = {
      week: getDateRange('this-week'),
      month: getDateRange('this-month'),
      year: getDateRange('this-year')
    };
    const targetRange = ranges[filterDate];
    if (targetRange) {
      filtered = filtered.filter(inc => {
        const d = new Date(inc.date);
        return d >= targetRange.start && d < targetRange.end;
      });
    }
  }
  
  if (searchQuery) {
    filtered = filtered.filter(inc => {
      return (
        inc.location.toLowerCase().includes(searchQuery) ||
        inc.description.toLowerCase().includes(searchQuery) ||
        inc.county.toLowerCase().includes(searchQuery)
      );
    });
  }
  
  // 2. Sort data
  filtered.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });
  
  resultsCountEl.textContent = filtered.length;
  
  // Handle empty state
  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    updatePagination(0);
    return;
  }
  
  emptyState.style.display = 'none';
  
  // 3. Slice for pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);
  
  // 4. Render cards
  container.innerHTML = pageItems.map(inc => {
    const dateFormatted = new Date(inc.date).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    let statusClass = 'investigation';
    if (inc.status === 'Garda Confirmed') statusClass = 'garda';
    if (inc.status === 'Media Reported') statusClass = 'media';
    
    const sourceUrl = inc.sourceUrl || (inc.source && inc.source.url) || '#';
    const sourceTitle = (typeof inc.source === 'string') ? inc.source : (inc.source && inc.source.title) || 'Unknown Source';
    
    return `
      <article class="incident-card" data-id="${inc.id}">
        <div class="card-meta-line">
          <div class="card-tags">
            <span class="tag-badge county">${inc.county}</span>
            <span class="tag-badge location">${inc.location}</span>
          </div>
          <span class="status-badge ${statusClass}">${inc.status}</span>
        </div>
        <p class="card-desc">${inc.description}</p>
        <div class="card-source-bar">
          <div class="card-date">
            <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            ${dateFormatted} UTC
          </div>
          <a class="source-link" href="${sourceUrl}" target="_blank" rel="noopener">
            Source: ${sourceTitle}
            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          </a>
        </div>
      </article>
    `;
  }).join('');
  
  updatePagination(totalPages);
}

// Update Pagination UI
function updatePagination(totalPages) {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');
  const info = document.getElementById('pagination-info');
  
  if (totalPages <= 1) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    info.textContent = `Page 1 of ${Math.max(1, totalPages)}`;
    return;
  }
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  info.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Render Historical Deep Dive Charts
function renderHistoricalCharts() {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const pad = { top: 30, right: 30, bottom: 45, left: 40 };
  
  // Helper to draw grid and axes
  function drawGridAndAxes(svgId, maxVal, htmlRef, scaleX, scaleY, w, h) {
    for (let i = 0; i <= 4; i++) {
      const yVal = Math.round((maxVal / 4) * i);
      const yPos = scaleY(yVal);
      htmlRef.html += `<line x1="${pad.left}" y1="${yPos}" x2="${w - pad.right}" y2="${yPos}" stroke="var(--border-color)" stroke-dasharray="4"/>`;
      htmlRef.html += `<text x="${pad.left - 8}" y="${yPos + 4}" text-anchor="end" fill="var(--text-secondary)" font-size="12">${yVal}</text>`;
    }
    years.forEach((y, i) => {
      const xPos = scaleX(i);
      htmlRef.html += `<text x="${xPos}" y="${h - pad.bottom + 15}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">${y}</text>`;
    });
  }

  // Helper to draw line
  function drawLine(data, scaleX, scaleY, color, htmlRef) {
    let dPath = `M ${scaleX(0)} ${scaleY(data[0])}`;
    data.forEach((val, i) => {
      const xPos = scaleX(i);
      const yPos = scaleY(val);
      htmlRef.html += `<circle cx="${xPos}" cy="${yPos}" r="4" fill="${color}"/>`;
      htmlRef.html += `<text x="${xPos}" y="${yPos - 8}" text-anchor="middle" fill="var(--text-primary)" font-size="10" font-weight="600">${val}</text>`;
      if (i > 0) dPath += ` L ${xPos} ${yPos}`;
    });
    htmlRef.html += `<path d="${dPath}" fill="none" stroke="${color}" stroke-width="3"/>`;
  }

  // --- TAB 1: TRENDS & POLICING ---
  const typeSelector = document.getElementById('historical-chart-type-selector');
  if (typeSelector) {
    const selectedType = typeSelector.value;
    const trendSvg = document.getElementById('historical-trend-chart');
    if (trendSvg && trendSvg.clientWidth > 0) {
      let trendHtml = { html: '' };
      const tData = years.map(y => historicalData.incidentsByType[selectedType]?.[y] || 0);
      const tMax = Math.max(...tData, 10);
      const w = trendSvg.clientWidth, h = trendSvg.clientHeight;
      const txScale = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
      const tyScale = (val) => h - pad.bottom - (val / tMax) * (h - pad.top - pad.bottom);
      drawGridAndAxes('historical-trend-chart', tMax, trendHtml, txScale, tyScale, w, h);
      drawLine(tData, txScale, tyScale, 'var(--accent-info)', trendHtml);
      trendSvg.innerHTML = trendHtml.html;
    }
  }

  // Searches vs Seizures
  const searchSvg = document.getElementById('historical-searches-chart');
  if (searchSvg && searchSvg.clientWidth > 0) {
    let sHtml = { html: '' };
    const w = searchSvg.clientWidth, h = searchSvg.clientHeight;
    const szData = years.map(y => { let sum=0; Object.values(historicalData.seizuresByCounty).forEach(c => sum += c[y]); return sum; });
    const srcData = years.map(y => historicalData.searchesNational[y]);
    const szMax = Math.max(...szData, 10), srcMax = Math.max(...srcData, 10);
    const scaleX = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const szScaleY = (val) => h - pad.bottom - (val / szMax) * (h - pad.top - pad.bottom);
    const srcScaleY = (val) => h - pad.bottom - (val / srcMax) * (h - pad.top - pad.bottom);
    
    for (let i = 0; i <= 4; i++) {
      const yVal = Math.round((srcMax / 4) * i);
      const yPos = srcScaleY(yVal);
      sHtml.html += `<line x1="${pad.left}" y1="${yPos}" x2="${w - pad.right}" y2="${yPos}" stroke="var(--border-color)" stroke-dasharray="4"/>`;
      sHtml.html += `<text x="${w - pad.right + 4}" y="${yPos + 4}" text-anchor="start" fill="var(--accent-warning)" font-size="10">${Math.round(yVal/1000)}k</text>`;
      sHtml.html += `<text x="${pad.left - 8}" y="${yPos + 4}" text-anchor="end" fill="var(--accent-info)" font-size="10">${Math.round((szMax / 4) * i)}</text>`;
    }
    years.forEach((y, i) => { sHtml.html += `<text x="${scaleX(i)}" y="${h - pad.bottom + 15}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">${y}</text>`; });
    
    drawLine(srcData, scaleX, srcScaleY, 'var(--accent-warning)', sHtml);
    drawLine(szData, scaleX, szScaleY, 'var(--accent-info)', sHtml);
    sHtml.html += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">Blue: Seizures (Left Axis) | Yellow: Searches (Right Axis)</text>`;
    searchSvg.innerHTML = sHtml.html;
  }

  // Proceedings
  const procSvg = document.getElementById('historical-proceedings-chart');
  if (procSvg && procSvg.clientWidth > 0) {
    let pHtml = { html: '' };
    const pData1 = years.map(y => historicalData.proceedings['Possession of Knives'][y]);
    const pData2 = years.map(y => historicalData.proceedings['Flick-Knife'][y]);
    const pMax = Math.max(...pData1, ...pData2, 10);
    const w = procSvg.clientWidth, h = procSvg.clientHeight;
    const scaleX = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const scaleY = (val) => h - pad.bottom - (val / pMax) * (h - pad.top - pad.bottom);
    drawGridAndAxes('historical-proceedings-chart', pMax, pHtml, scaleX, scaleY, w, h);
    drawLine(pData1, scaleX, scaleY, 'var(--accent-info)', pHtml);
    drawLine(pData2, scaleX, scaleY, 'var(--accent-danger)', pHtml);
    pHtml.html += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">Blue: Knives/Articles | Red: Flick-Knives</text>`;
    procSvg.innerHTML = pHtml.html;
  }

  // Possession Overall vs Knife
  const possSvg = document.getElementById('historical-possession-chart');
  if (possSvg && possSvg.clientWidth > 0) {
    let p2Html = { html: '' };
    const poData = years.map(y => historicalData.possessionOverall[y]);
    const pkData = years.map(y => historicalData.incidentsByType['Possession of Offensive Weapon'][y]);
    const p2Max = Math.max(...poData, 10);
    const w = possSvg.clientWidth, h = possSvg.clientHeight;
    const scaleX = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const scaleY = (val) => h - pad.bottom - (val / p2Max) * (h - pad.top - pad.bottom);
    drawGridAndAxes('historical-possession-chart', p2Max, p2Html, scaleX, scaleY, w, h);
    drawLine(poData, scaleX, scaleY, 'var(--accent-info)', p2Html);
    drawLine(pkData, scaleX, scaleY, 'var(--accent-danger)', p2Html);
    p2Html.html += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">Blue: Overall Weapon Possession | Red: Specifically Knives</text>`;
    possSvg.innerHTML = p2Html.html;
  }

  // --- TAB 2: LOCATIONS ---
  const locAssaultSvg = document.getElementById('loc-assault-chart');
  if (locAssaultSvg && locAssaultSvg.clientWidth > 0) {
    let aHtml = { html: '' };
    const res = years.map(y => historicalData.assaultLocations['Residential'][y]);
    const str = years.map(y => historicalData.assaultLocations['Street / Open Space'][y]);
    const oth = years.map(y => historicalData.assaultLocations['Other'][y]);
    const w = locAssaultSvg.clientWidth, h = locAssaultSvg.clientHeight;
    const aMax = Math.max(...res, ...str, ...oth, 10);
    const scaleX = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const scaleY = (val) => h - pad.bottom - (val / aMax) * (h - pad.top - pad.bottom);
    drawGridAndAxes('loc-assault-chart', aMax, aHtml, scaleX, scaleY, w, h);
    drawLine(res, scaleX, scaleY, 'var(--accent-warning)', aHtml);
    drawLine(str, scaleX, scaleY, 'var(--accent-info)', aHtml);
    drawLine(oth, scaleX, scaleY, 'var(--text-secondary)', aHtml);
    aHtml.html += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">Yellow: Residential | Blue: Street | Grey: Other</text>`;
    locAssaultSvg.innerHTML = aHtml.html;
  }

  const locMurderSvg = document.getElementById('loc-murder-chart');
  if (locMurderSvg && locMurderSvg.clientWidth > 0) {
    let mHtml = { html: '' };
    const res = years.map(y => historicalData.murderLocations['Residential'][y]);
    const non = years.map(y => historicalData.murderLocations['Non-Residential'][y]);
    const w = locMurderSvg.clientWidth, h = locMurderSvg.clientHeight;
    const mMax = 100;
    const scaleX = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const scaleY = (val) => h - pad.bottom - (val / mMax) * (h - pad.top - pad.bottom);
    drawGridAndAxes('loc-murder-chart', mMax, mHtml, scaleX, scaleY, w, h);
    drawLine(res, scaleX, scaleY, 'var(--accent-warning)', mHtml);
    drawLine(non, scaleX, scaleY, 'var(--accent-info)', mHtml);
    mHtml.html += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" fill="var(--text-secondary)" font-size="12">Yellow: Residential (%) | Blue: Non-Residential (%)</text>`;
    locMurderSvg.innerHTML = mHtml.html;
  }

  // --- TAB 3: DEMOGRAPHICS ---
  const demoSel = document.getElementById('demographics-type-selector');
  if (demoSel) {
    const dType = demoSel.value;
    const pieSvg = document.getElementById('demographics-pie-chart');
    const legend = document.getElementById('demographics-legend');
    if (pieSvg && legend && pieSvg.clientWidth > 0) {
      const data = historicalData.demographics[dType];
      const colors = ['var(--accent-success)', 'var(--accent-info)', 'var(--accent-warning)', 'var(--accent-danger)'];
      let pieHtml = '';
      let legendHtml = '';
      let acc = 0;
      let i = 0;
      for (const [key, val] of Object.entries(data)) {
        const pct = val / 100;
        const a1 = acc * 2 * Math.PI;
        const a2 = (acc + pct) * 2 * Math.PI;
        // Don't draw if 0
        if (pct > 0) {
            // Check for 100% case
            if (pct === 1) {
                pieHtml += `<circle cx="125" cy="125" r="100" fill="${colors[i]}"><title>${key}: ${val}%</title></circle>`;
            } else {
                const x1 = 125 + 100 * Math.cos(a1), y1 = 125 + 100 * Math.sin(a1);
                const x2 = 125 + 100 * Math.cos(a2), y2 = 125 + 100 * Math.sin(a2);
                const largeArc = pct > 0.5 ? 1 : 0;
                pieHtml += `<path d="M 125 125 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[i]}"><title>${key}: ${val}%</title></path>`;
            }
        }
        legendHtml += `<span style="color:${colors[i]}"><span style="display:inline-block; width:10px; height:10px; background:${colors[i]}; margin-right:4px;"></span>${key} (${val}%)</span>`;
        acc += pct;
        i++;
      }
      pieHtml += `<circle cx="125" cy="125" r="50" fill="var(--bg-secondary)"/>`;
      pieSvg.innerHTML = pieHtml;
      legend.innerHTML = legendHtml;
    }
  }

  const hseSvg = document.getElementById('historical-hse-chart');
  if (hseSvg && hseSvg.clientWidth > 0) {
    let hseHtml = { html: '' };
    const assaultData = years.map(y => historicalData.incidentsByType['Assault Causing Harm']?.[y] || 0);
    const hseData = years.map(y => historicalData.hseAdmissions[y] || 0);
    const hMax = Math.max(...assaultData, ...hseData, 10);
    const w = hseSvg.clientWidth, h = hseSvg.clientHeight;
    const hxScale = (idx) => pad.left + idx * ((w - pad.left - pad.right) / (years.length - 1));
    const hyScale = (val) => h - pad.bottom - (val / hMax) * (h - pad.top - pad.bottom);
    drawGridAndAxes('historical-hse-chart', hMax, hseHtml, hxScale, hyScale, w, h);
    drawLine(assaultData, hxScale, hyScale, 'var(--accent-warning)', hseHtml);
    drawLine(hseData, hxScale, hyScale, 'var(--accent-info)', hseHtml);
    hseSvg.innerHTML = hseHtml.html;
  }

  // --- TAB 4: TABLES ---
  const table1 = document.getElementById('table-app1');
  if (table1 && table1.innerHTML === '') {
    let tHtml = '<thead><tr><th>Offence Group</th>';
    years.forEach(y => tHtml += `<th>${y}</th>`);
    tHtml += '</tr></thead><tbody>';
    for (const [offence, data] of Object.entries(historicalData.incidentsByType)) {
      tHtml += `<tr><td>${offence}</td>`;
      years.forEach(y => tHtml += `<td>${data[y] || 0}</td>`);
      tHtml += `</tr>`;
    }
    tHtml += '</tbody>';
    table1.innerHTML = tHtml;
  }

  const table2 = document.getElementById('table-app2');
  if (table2 && table2.innerHTML === '') {
    let tHtml = '<thead><tr><th>Division</th>';
    years.forEach(y => tHtml += `<th>${y}</th>`);
    tHtml += '</tr></thead><tbody>';
    for (const [division, data] of Object.entries(historicalData.seizuresByCounty)) {
      tHtml += `<tr><td>${division}</td>`;
      years.forEach(y => tHtml += `<td>${data[y] || 0}</td>`);
      tHtml += `</tr>`;
    }
    tHtml += '</tbody>';
    table2.innerHTML = tHtml;
  }

  const table3 = document.getElementById('table-app3');
  if (table3 && table3.innerHTML === '') {
    let tHtml = '<thead><tr><th>Metric</th>';
    years.forEach(y => tHtml += `<th>${y}</th>`);
    tHtml += '</tr></thead><tbody><tr><td>National Total Searches</td>';
    years.forEach(y => tHtml += `<td>${historicalData.searchesNational[y] || 0}</td>`);
    tHtml += '</tr></tbody>';
    table3.innerHTML = tHtml;
  }
}

// Setup Event Listeners
function setupEvents() {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eire_safe_theme', newTheme);
  });
  
  // Load saved theme
  const savedTheme = localStorage.getItem('eire_safe_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // National scope toggle button
  const nationalBtn = document.getElementById('scope-national');
  nationalBtn.addEventListener('click', () => {
    selectCountyScope(null);
  });
  
  // County scope selector dropdown
  const scopeDropdown = document.getElementById('scope-county-dropdown');
  scopeDropdown.addEventListener('change', (e) => {
    selectCountyScope(e.target.value);
  });
  
  // Map reset button
  const mapResetBtn = document.getElementById('map-reset-btn');
  mapResetBtn.addEventListener('click', () => {
    selectCountyScope(null);
  });
  
  // Feed search and filters
  document.getElementById('feed-search').addEventListener('input', () => {
    currentPage = 1;
    renderFeed();
  });
  
  document.getElementById('filter-county').addEventListener('change', (e) => {
    selectedCounty = e.target.value || null;
    currentPage = 1;
    renderDashboard();
    renderChart();
    renderMap();
    renderFeed();
  });
  
  document.getElementById('filter-status').addEventListener('change', () => {
    currentPage = 1;
    renderFeed();
  });
  
  document.getElementById('filter-date').addEventListener('change', () => {
    currentPage = 1;
    renderFeed();
  });
  
  document.getElementById('filter-sort').addEventListener('change', () => {
    currentPage = 1;
    renderFeed();
  });

  document.getElementById('filter-per-page').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value, 10);
    currentPage = 1;
    renderFeed();
  });
  
  // Pagination actions
  document.getElementById('pagination-prev').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderFeed();
      document.getElementById('incidents-section').scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  document.getElementById('pagination-next').addEventListener('click', () => {
    currentPage++;
    renderFeed();
    document.getElementById('incidents-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Handle resizing for Chart responsiveness
  window.addEventListener('resize', () => {
    renderChart();
    renderHistoricalCharts();
  });
  
  // Dashboard Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-target')).classList.add('active');
      // Re-render to fix dimensions
      renderHistoricalCharts();
    });
  });

  const demoSel = document.getElementById('demographics-type-selector');
  if (demoSel) demoSel.addEventListener('change', renderHistoricalCharts);

  const historicalTypeSelector = document.getElementById('historical-chart-type-selector');
  if (historicalTypeSelector) {
    historicalTypeSelector.addEventListener('change', () => {
      renderHistoricalCharts();
    });
  }

  setupAdminPortal();
}

// Populate County Dropdowns (both navbar and editor dropdowns)
function populateDropdowns() {
  const scopeDropdown = document.getElementById('scope-county-dropdown');
  const yearDropdown = document.getElementById('scope-year-dropdown');
  const feedFilterCounty = document.getElementById('filter-county');
  const incCountyForm = document.getElementById('inc-county');
  const filterDateYearOpt = document.querySelector('#filter-date option[value="year"]');
  
  // Sort counties alphabetically
  const sortedCounties = [...countiesList].sort();
  
  // Scope and Feed filters dropdowns
  sortedCounties.forEach(county => {
    // Map dropdown options
    const opt1 = document.createElement('option');
    opt1.value = county;
    opt1.textContent = county;
    scopeDropdown.appendChild(opt1);
    
    const opt2 = document.createElement('option');
    opt2.value = county;
    opt2.textContent = county;
    feedFilterCounty.appendChild(opt2);
    
    const opt3 = document.createElement('option');
    opt3.value = county;
    opt3.textContent = county;
    incCountyForm.appendChild(opt3);
  });
  
  // Populate Year dropdown
  const currentYear = FIXED_NOW_DATE.getUTCFullYear();
  for (let y = currentYear; y >= currentYear - 30; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearDropdown.appendChild(opt);
  }
  yearDropdown.value = selectedYear;
  
  yearDropdown.addEventListener('change', async (e) => {
    selectedYear = parseInt(e.target.value, 10);
    if (filterDateYearOpt) {
      filterDateYearOpt.textContent = `This Year (${selectedYear})`;
    }
    await loadInitialData();
    renderDashboard();
    renderChart();
    renderMap();
    renderFeed();
  });
}

// Admin Portal Functionality
function setupAdminPortal() {
  const modal = document.getElementById('admin-modal');
  const openBtns = [
    document.getElementById('admin-trigger'),
    document.getElementById('admin-portal-link')
  ];
  const closeBtn = document.getElementById('modal-close');
  
  const loginForm = document.getElementById('admin-login-form');
  const adminPanel = document.getElementById('admin-panel');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const passwordInput = document.getElementById('admin-password');
  
  const incidentForm = document.getElementById('admin-incident-form');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const downloadBtn = document.getElementById('admin-download-btn');
  
  let isAuthenticated = sessionStorage.getItem('eire_safe_authenticated') === 'true';

  const openModal = () => {
    modal.classList.add('active');
    if (isAuthenticated) {
      loginForm.style.display = 'none';
      adminPanel.style.display = 'block';
      // Pre-fill form date
      document.getElementById('inc-date').value = FIXED_NOW_DATE.toISOString().slice(0, 16);
    } else {
      loginForm.style.display = 'block';
      adminPanel.style.display = 'none';
      passwordInput.value = '';
      passwordInput.focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove('active');
    loginErrorMsg.style.display = 'none';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  
  // Close modal clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Login handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = passwordInput.value;
    if (pass === 'admin') {
      isAuthenticated = true;
      sessionStorage.setItem('eire_safe_authenticated', 'true');
      loginForm.style.display = 'none';
      adminPanel.style.display = 'block';
      loginErrorMsg.style.display = 'none';
      document.getElementById('inc-date').value = FIXED_NOW_DATE.toISOString().slice(0, 16);
    } else {
      loginErrorMsg.style.display = 'block';
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    sessionStorage.setItem('eire_safe_authenticated', 'false');
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
  });

  // Add Incident handler
  incidentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newInc = {
      id: `inc-${Date.now()}`,
      date: new Date(document.getElementById('inc-date').value).toISOString(),
      county: document.getElementById('inc-county').value,
      location: document.getElementById('inc-location').value.trim(),
      status: document.getElementById('inc-status').value,
      description: document.getElementById('inc-desc').value.trim(),
      source: {
        title: document.getElementById('inc-source-title').value.trim(),
        url: document.getElementById('inc-source-url').value.trim()
      }
    };
    
    const savedCustom = localStorage.getItem('eire_safe_custom_incidents');
    let customIncidents = [];
    if (savedCustom) {
      try {
        customIncidents = JSON.parse(savedCustom);
      } catch (err) {
        console.error(err);
      }
    }
    customIncidents.push(newInc);
    localStorage.setItem('eire_safe_custom_incidents', JSON.stringify(customIncidents));
    
    // Reload database state
    loadInitialData();
    
    // Reset form fields
    document.getElementById('inc-location').value = '';
    document.getElementById('inc-desc').value = '';
    document.getElementById('inc-source-title').value = '';
    document.getElementById('inc-source-url').value = '';
    
    // Refresh stats, map, feed, chart
    renderDashboard();
    renderMap();
    renderChart();
    renderFeed();
    
    alert("Record successfully added to the local database!");
    closeModal();
  });

  // Download DB File handler
  downloadBtn.addEventListener('click', () => {
    const dbCode = `// Generated Database File - Copy and overwrite data.js to update permanently
export const countiesList = ${JSON.stringify(countiesList, null, 2)};

export const mockIncidents = ${JSON.stringify(incidents, null, 2)};
`;
    const blob = new Blob([dbCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

// Initialise App
async function init() {
  await loadInitialData();
  populateDropdowns();
  setupEvents();
  renderDashboard();
  renderMap();
  renderChart();
  renderFeed();
  renderHistoricalCharts();
}

window.addEventListener('DOMContentLoaded', init);
