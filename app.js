// Irish Stabbings Tracker - Main Application Controller
import { mockIncidents, countiesList } from './data.js';
import { countyPaths } from './countyPaths.js';

// Constants
const FIXED_NOW_DATE = new Date(); // Use real current date
const ITEMS_PER_PAGE = 5;

// State Management
let incidents = [];
let selectedCounty = null; // null represents Whole Ireland
let currentPage = 1;

// Load Data: Merge custom admin entries from localStorage with scraped data.js entries
function loadInitialData() {
  const savedCustom = localStorage.getItem('eire_safe_custom_incidents');
  let customIncidents = [];
  if (savedCustom) {
    try {
      customIncidents = JSON.parse(savedCustom);
    } catch (e) {
      console.error("Failed to parse custom incidents.", e);
    }
  }
  
  // Combine custom incidents and scraped mockIncidents, filtering out duplicate IDs
  const combined = [...customIncidents, ...mockIncidents];
  const seenIds = new Set();
  incidents = combined.filter(inc => {
    if (seenIds.has(inc.id)) return false;
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
  const now = new Date(FIXED_NOW_DATE);
  
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

  // Week
  const weekRange = getDateRange('this-week');
  const prevWeekRange = getDateRange('prev-week');
  const thisWeekVal = getCountBetween(weekRange.start, weekRange.end);
  const prevWeekVal = getCountBetween(prevWeekRange.start, prevWeekRange.end);

  // Month
  const monthRange = getDateRange('this-month');
  const prevMonthRange = getDateRange('prev-month');
  const thisMonthVal = getCountBetween(monthRange.start, monthRange.end);
  const prevMonthVal = getCountBetween(prevMonthRange.start, prevMonthRange.end);

  // Year
  const yearRange = getDateRange('this-year');
  const thisYearVal = getCountBetween(yearRange.start, yearRange.end);

  return {
    week: { current: thisWeekVal, previous: prevWeekVal },
    month: { current: thisMonthVal, previous: prevMonthVal },
    year: { current: thisYearVal }
  };
}

// Format trend text
function updateStatCard(cardId, current, previous, isYear = false) {
  const valueEl = document.getElementById(`stat-${cardId}-value`);
  const trendEl = document.getElementById(`stat-${cardId}-trend`);
  
  valueEl.textContent = current;
  
  if (isYear) {
    trendEl.textContent = "Total";
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
  updateStatCard('week', stats.week.current, stats.week.previous);
  updateStatCard('month', stats.month.current, stats.month.previous);
  updateStatCard('year', stats.year.current, 0, true);
  
  const scopeLabel = document.getElementById('active-scope-label');
  const chartScopeLabel = document.getElementById('chart-scope-indicator');
  const displayLabel = selectedCounty ? `${selectedCounty} County` : "Whole Ireland";
  
  scopeLabel.textContent = displayLabel;
  chartScopeLabel.textContent = displayLabel;
  
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
  const yearStart = getDateRange('this-year').start;
  const countyCounts = {};
  activeCounties.forEach(c => { countyCounts[c] = 0; });
  
  incidents.forEach(inc => {
    const incDate = new Date(inc.date);
    if (incDate >= yearStart && activeCounties.includes(inc.county)) {
      countyCounts[inc.county] = (countyCounts[inc.county] || 0) + 1;
    }
  });

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
      tooltip.innerHTML = `<strong>${pathData.id}</strong><br>${count} stabbing${count === 1 ? '' : 's'} in 2026`;
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
  
  // Calculate historical monthly data for the selected scope in 2026
  // Months: Jan, Feb, Mar, Apr, May (current month is May)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const monthIndices = [0, 1, 2, 3, 4]; // 0-indexed months
  const year = 2026;
  
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
    title.textContent = `${months[i]} 2026: ${point.count} incident${point.count === 1 ? '' : 's'}`;
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
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
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
          <a class="source-link" href="${inc.source.url}" target="_blank" rel="noopener">
            Source: ${inc.source.title}
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
  });

  setupAdminPortal();
}

// Populate County Dropdowns (both navbar and editor dropdowns)
function populateDropdowns() {
  const scopeDropdown = document.getElementById('scope-county-dropdown');
  const feedFilterCounty = document.getElementById('filter-county');
  const incCountyForm = document.getElementById('inc-county');
  
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
function init() {
  loadInitialData();
  populateDropdowns();
  setupEvents();
  renderDashboard();
  renderMap();
  renderChart();
  renderFeed();
}

window.addEventListener('DOMContentLoaded', init);
