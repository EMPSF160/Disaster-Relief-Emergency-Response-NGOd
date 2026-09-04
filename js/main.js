/**
 * IFRC GO Inspired Disaster Relief & Emergency Response NGO Portal
 * Core JavaScript Logic & Interactive Modules
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS Animations
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // Initialize Lucide Icons if available
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Master Header & Capsule Navbar scroll effect
  const masterHeader = document.getElementById('masterHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      masterHeader?.classList.add('header-scrolled');
    } else {
      masterHeader?.classList.remove('header-scrolled');
    }
  });

  // Initialize ScrollSpy for Capsule & Mobile Navigation
  initScrollSpy();

  // Mobile Menu Auto-close when clicking any anchor link
  const offcanvasEl = document.getElementById('mobileNavDrawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  if (offcanvasEl && typeof bootstrap !== 'undefined') {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        bsOffcanvas.hide();
      });
    });
  }

  // Initialize Leaflet Disaster Operations Map
  initDisasterMap();

  // Initialize Operations Charts (Chart.js)
  initOperationsCharts();

  // Initialize Swiper for Stories
  initStoriesSwiper();

  // Initialize Interactive Donation Portal
  initDonationPortal();

  // Initialize Counter Animations
  initCounterAnimations();
});

/* ==========================================================================
   0. Dynamic ScrollSpy & Navigation Active Highlighter
   ========================================================================== */
function initScrollSpy() {
  const capsuleItems = document.querySelectorAll('.capsule-nav-item');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const trackedSections = [
    { id: 'top', el: document.getElementById('top') || document.getElementById('hero'), desktopId: 'top' },
    { id: 'about-us', el: document.getElementById('about-us'), desktopId: 'about-us' },
    { id: 'disaster-map-section', el: document.getElementById('disaster-map-section'), desktopId: 'disaster-map-section' },
    { id: 'emergency-appeals', el: document.getElementById('emergency-appeals'), desktopId: 'emergency-appeals' },
    { id: 'relief-programs', el: document.getElementById('relief-programs'), desktopId: 'relief-programs' },
    { id: 'photojournalism-gallery', el: document.getElementById('photojournalism-gallery'), desktopId: 'photojournalism-gallery' },
    { id: 'operations-analytics', el: document.getElementById('operations-analytics'), desktopId: 'photojournalism-gallery' },
    { id: 'stories-news', el: document.getElementById('stories-news'), desktopId: 'stories-news' },
    { id: 'donate-gateway', el: document.getElementById('donate-gateway'), desktopId: 'stories-news' },
    { id: 'contact-operations', el: document.getElementById('contact-operations'), desktopId: 'contact-operations' }
  ].filter(item => item.el !== null);

  let isClickScrolling = false;
  let clickTimeout = null;

  function updateActiveNav(activeId) {
    const sectionObj = trackedSections.find(s => s.id === activeId) || { id: activeId, desktopId: activeId };
    const desktopTargetId = sectionObj.desktopId || activeId;

    capsuleItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === '#' + desktopTargetId || (desktopTargetId === 'top' && (href === '#top' || href === '#hero'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + activeId || (activeId === 'top' && (href === '#top' || href === '#hero'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function handleScrollSpy() {
    if (isClickScrolling) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // At the bottom of page -> activate contact
    if (windowHeight + scrollY >= docHeight - 80) {
      updateActiveNav('contact-operations');
      return;
    }

    // Near top of page -> activate home
    if (scrollY < 180) {
      updateActiveNav('top');
      return;
    }

    const headerOffset = 140;
    let currentId = 'top';

    for (let i = 0; i < trackedSections.length; i++) {
      const sec = trackedSections[i];
      if (sec.id === 'top') continue;

      const top = sec.el.getBoundingClientRect().top + scrollY - headerOffset;
      if (scrollY >= top) {
        currentId = sec.id;
      }
    }

    updateActiveNav(currentId);
  }

  // Handle click on all anchor links
  const allNavLinks = document.querySelectorAll('.capsule-nav-item, .mobile-nav-link');
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      updateActiveNav(targetId);

      isClickScrolling = true;
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
        handleScrollSpy();
      }, 900);
    });
  });

  // Attach throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollSpy();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Run on initial load
  handleScrollSpy();
}

/* ==========================================================================
   1. Three.js Interactive Humanitarian 3D Globe
   ========================================================================== */
function initThreeGlobe() {
  const container = document.getElementById('humanitarianGlobeCanvas');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 450;
  const height = container.clientHeight || 450;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 210;

  const renderer = new THREE.WebGLRenderer({
    canvas: container,
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Globe Base Sphere
  const globeRadius = 75;
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Wireframe / Grid Latitude/Longitude Lines
  const sphereGeo = new THREE.SphereGeometry(globeRadius, 36, 36);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x152A3F,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(globeMesh);

  // Inner solid glow sphere
  const innerGeo = new THREE.SphereGeometry(globeRadius - 0.5, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0B192C,
    transparent: true,
    opacity: 0.85
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerSphere);

  // Humanitarian Points & Hotspots
  const points = [
    { lat: 37.0, lon: 35.3, type: 'emergency', label: 'Türkiye / Syria' },
    { lat: 9.0, lon: 38.7, type: 'appeal', label: 'Horn of Africa' },
    { lat: -18.9, lon: 47.5, type: 'dref', label: 'Madagascar Cyclone' },
    { lat: 23.8, lon: 90.4, type: 'emergency', label: 'Bangladesh Flood' },
    { lat: 15.3, lon: 32.5, type: 'emergency', label: 'Sudan Crisis' },
    { lat: 31.5, lon: 34.4, type: 'emergency', label: 'Middle East' },
    { lat: 48.3, lon: 31.1, type: 'appeal', label: 'Ukraine Emergency' },
    { lat: -15.7, lon: -47.9, type: 'dref', label: 'South America' },
    { lat: 14.5, lon: 121.0, type: 'appeal', label: 'Philippines Typhoon' },
    { lat: 4.5, lon: -75.6, type: 'dref', label: 'Colombia Landslide' }
  ];

  // Particle cloud for landmass approximation
  const particleCount = 700;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const color1 = new THREE.Color(0x3B82F6);
  const color2 = new THREE.Color(0xE00000);

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const r = globeRadius + (Math.random() * 2);
    positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = (Math.random() > 0.8) ? color2 : color1;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.75
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  globeGroup.add(particleSystem);

  // Add 3D Marker Pins for Real Relief Operations
  points.forEach(pt => {
    const latRad = pt.lat * (Math.PI / 180);
    const lonRad = -pt.lon * (Math.PI / 180);
    const r = globeRadius + 2;

    const x = r * Math.cos(latRad) * Math.cos(lonRad);
    const y = r * Math.sin(latRad);
    const z = r * Math.cos(latRad) * Math.sin(lonRad);

    const markerGeo = new THREE.SphereGeometry(pt.type === 'emergency' ? 2.2 : 1.6, 12, 12);
    const markerMat = new THREE.MeshBasicMaterial({
      color: pt.type === 'emergency' ? 0xFF3333 : (pt.type === 'appeal' ? 0xFFA500 : 0x00D084)
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(x, y, z);
    globeGroup.add(marker);
  });

  // Interactive mouse drag & tilt
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const handlePointerDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    globeGroup.rotation.y += deltaX * 0.005;
    globeGroup.rotation.x += deltaY * 0.005;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging = false;
  };

  container.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const newW = container.clientWidth || 400;
    const newH = container.clientHeight || 400;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
      globeGroup.rotation.y += 0.0025;
    }
    renderer.render(scene, camera);
  }
  animate();
}

/* ==========================================================================
   2. Leaflet.js Interactive Disaster Operations Map
   ========================================================================== */
let disasterMap = null;
let mapMarkersLayer = null;

const DISASTER_DATA = [
  {
    id: 1,
    title: "Türkiye & Syria Post-Earthquake Recovery",
    category: "earthquake",
    country: "Türkiye / Syria",
    coords: [37.5, 36.9],
    severity: "level3",
    status: "Active Appeal",
    targetPeople: "1.2M",
    fundingTarget: "$150,000,000",
    fundingRaised: "$114,000,000",
    progress: 76,
    lead: "Turkish Red Crescent & SARC",
    desc: "Long-term shelter restoration, psychological first aid, and essential health infrastructure rebuilding."
  },
  {
    id: 2,
    title: "Horn of Africa Complex Food Insecurity Crisis",
    category: "food",
    country: "Kenya, Ethiopia & Somalia",
    coords: [4.2, 42.0],
    severity: "level3",
    status: "Active Appeal",
    targetPeople: "3.5M",
    fundingTarget: "$85,000,000",
    fundingRaised: "$58,650,000",
    progress: 69,
    lead: "IFRC Africa Regional Taskforce",
    desc: "Emergency nutrition supply chains, borehole solarization, and mobile trauma/malnutrition clinics."
  },
  {
    id: 3,
    title: "Cyclone Freddy & Southern Africa Storm Surge",
    category: "flood",
    country: "Malawi & Mozambique",
    coords: [-15.7, 35.0],
    severity: "level2",
    status: "Emergency Response",
    targetPeople: "650,000",
    fundingTarget: "$32,000,000",
    fundingRaised: "$26,240,000",
    progress: 82,
    lead: "Malawi Red Cross Society",
    desc: "Rapid deployment of water purification kits, cholera prevention oral vaccines, and emergency tarpaulins."
  },
  {
    id: 4,
    title: "Middle East Emergency Humanitarian Aid",
    category: "conflict",
    country: "Gaza & Regional Hubs",
    coords: [31.4, 34.35],
    severity: "level3",
    status: "Critical Appeal",
    targetPeople: "1.8M",
    fundingTarget: "$120,000,000",
    fundingRaised: "$98,400,000",
    progress: 82,
    lead: "Palestine Red Crescent Society",
    desc: "Ambulance emergency dispatches, essential medical consumables, trauma surgical supplies, and winter shelter."
  },
  {
    id: 5,
    title: "South Sudan Monsoon Flooding & Displacement",
    category: "flood",
    country: "South Sudan (Bentiu / Unity)",
    coords: [9.2, 29.8],
    severity: "level2",
    status: "Active DREF",
    targetPeople: "400,000",
    fundingTarget: "$14,500,000",
    fundingRaised: "$10,150,000",
    progress: 70,
    lead: "South Sudan Red Cross",
    desc: "Construction of protective flood dykes, distribution of mosquito nets, water tablets, and emergency rations."
  },
  {
    id: 6,
    title: "Bangladesh Monsoon Flash Floods & Landslides",
    category: "flood",
    country: "Bangladesh (Sylhet / Feni)",
    coords: [24.8, 91.8],
    severity: "level2",
    status: "Emergency Operation",
    targetPeople: "850,000",
    fundingTarget: "$18,000,000",
    fundingRaised: "$14,040,000",
    progress: 78,
    lead: "Bangladesh Red Crescent Society",
    desc: "Emergency boat rescues, dry food packs, high-capacity water treatment plants, and cash voucher aid."
  },
  {
    id: 7,
    title: "Papua New Guinea Highlands Landslide",
    category: "earthquake",
    country: "Papua New Guinea (Enga)",
    coords: [-5.4, 143.7],
    severity: "level2",
    status: "Active Appeal",
    targetPeople: "120,000",
    fundingTarget: "$7,500,000",
    fundingRaised: "$5,100,000",
    progress: 68,
    lead: "PNG Red Cross",
    desc: "Search & rescue support, dignity kits, temporary emergency shelter pods, and psychosocial counseling."
  }
];

function initDisasterMap() {
  const mapElem = document.getElementById('disasterImpactMap');
  if (!mapElem || typeof L === 'undefined') return;

  // Initialize Map with custom high-contrast humanitarian tiles
  disasterMap = L.map('disasterImpactMap', {
    center: [20, 30],
    zoom: 2.8,
    minZoom: 2,
    maxZoom: 14,
    scrollWheelZoom: false
  });

  // CartoDB Positron / OpenStreetMap Clean Layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(disasterMap);

  mapMarkersLayer = L.layerGroup().addTo(disasterMap);

  // Render Initial Markers
  renderMapMarkers('all');

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.map-filter-chip');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'active-red'));
      btn.classList.add(btn.dataset.filter === 'all' ? 'active-red' : 'active');
      renderMapMarkers(btn.dataset.filter);
    });
  });

  // Responsive map resize invalidate
  window.addEventListener('resize', () => {
    if (disasterMap) {
      disasterMap.invalidateSize();
    }
  });
}

function renderMapMarkers(categoryFilter) {
  if (!mapMarkersLayer) return;
  mapMarkersLayer.clearLayers();

  const filtered = categoryFilter === 'all'
    ? DISASTER_DATA
    : DISASTER_DATA.filter(d => d.category === categoryFilter);

  filtered.forEach(item => {
    let markerColorClass = 'marker-red';
    let iconClass = 'fa-solid fa-triangle-exclamation';

    if (item.category === 'earthquake') {
      markerColorClass = 'marker-red';
      iconClass = 'fa-solid fa-house-crack';
    } else if (item.category === 'flood') {
      markerColorClass = 'marker-blue';
      iconClass = 'fa-solid fa-water';
    } else if (item.category === 'food') {
      markerColorClass = 'marker-yellow';
      iconClass = 'fa-solid fa-wheat-awn';
    } else if (item.category === 'conflict') {
      markerColorClass = 'marker-orange';
      iconClass = 'fa-solid fa-shield-heart';
    }

    const customIcon = L.divIcon({
      className: 'custom-div-marker-wrapper',
      html: `<div class="custom-leaflet-marker ${markerColorClass}" style="width:34px;height:34px;"><i class="${iconClass}"></i></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });

    const popupContent = `
      <div class="map-popup-card">
        <span class="map-popup-badge" style="background:${item.severity === 'level3' ? '#FFF0F0' : '#FFF9E6'}; color:${item.severity === 'level3' ? '#E00000' : '#D97706'};">
          ${item.status} &bull; ${item.severity.toUpperCase()}
        </span>
        <h4 class="map-popup-title">${item.title}</h4>
        <p style="font-size: 0.8125rem; color:#4A5568; margin-bottom:10px;">${item.desc}</p>
        <div class="map-popup-stat-row">
          <span style="color:#718096;">Target Beneficiaries:</span>
          <strong>${item.targetPeople}</strong>
        </div>
        <div class="map-popup-stat-row">
          <span style="color:#718096;">Financial Target:</span>
          <strong style="color:#E00000;">${item.fundingTarget}</strong>
        </div>
        <div class="map-popup-stat-row">
          <span style="color:#718096;">Funding Raised:</span>
          <strong style="color:#00875A;">${item.fundingRaised} (${item.progress}%)</strong>
        </div>
        <div style="height:6px; background:#E2E8F0; border-radius:4px; margin:8px 0 12px 0; overflow:hidden;">
          <div style="width:${item.progress}%; height:100%; background:#E00000;"></div>
        </div>
        <button class="btn btn-sm btn-ifrc-red w-100" onclick="triggerDonateModal('${item.title.replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-heart"></i> Support This Appeal
        </button>
      </div>
    `;

    const marker = L.marker(item.coords, { icon: customIcon })
      .bindPopup(popupContent, { maxWidth: 300 });

    mapMarkersLayer.addLayer(marker);
  });
}

/* ==========================================================================
   3. Operational Telemetry & Chart.js Analytics
   ========================================================================== */
function initOperationsCharts() {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Global Funding Distribution
  const ctxFunding = document.getElementById('fundingDistributionChart');
  if (ctxFunding) {
    new Chart(ctxFunding, {
      type: 'doughnut',
      data: {
        labels: ['Emergency Appeals', 'DREF Rapid Grants', 'Disaster Risk Reduction', 'Ecosystem & Climate Resil.'],
        datasets: [{
          data: [58, 22, 12, 8],
          backgroundColor: ['#E00000', '#FF6B00', '#0065FF', '#00875A'],
          borderWidth: 2,
          borderColor: '#0E2238'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#E2E8F0', font: { family: 'Manrope', size: 11 }, padding: 14 }
          }
        },
        cutout: '68%'
      }
    });
  }

  // Chart 2: Deployment & Response Time Performance
  const ctxSpeed = document.getElementById('deploymentSpeedChart');
  if (ctxSpeed) {
    new Chart(ctxSpeed, {
      type: 'bar',
      data: {
        labels: ['Alert Received', 'DREF Released', 'Rapid Team In-Country', 'Shelter & Medical Airlift', 'Full Scale Ops'],
        datasets: [{
          label: 'Average Hours to Deploy',
          data: [0.5, 4.0, 18.0, 24.0, 48.0],
          backgroundColor: '#FF6B6B',
          borderRadius: 6,
          borderColor: '#E00000',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#94A3B8', font: { family: 'Manrope', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            title: { display: true, text: 'Hours Elapsed', color: '#94A3B8' },
            ticks: { color: '#94A3B8', font: { family: 'Manrope', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.06)' }
          }
        }
      }
    });
  }
}

/* ==========================================================================
   4. Swiper.js Stories & Field Reports Slider
   ========================================================================== */
function initStoriesSwiper() {
  if (typeof Swiper === 'undefined') return;

  new Swiper('.storiesSwiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    navigation: {
      nextEl: '.swiper-button-next-custom',
      prevEl: '.swiper-button-prev-custom'
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      640: { slidesPerView: 1.5 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

/* ==========================================================================
   5. Interactive Multi-Tier Donation Gateway
   ========================================================================== */
function initDonationPortal() {
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customInput = document.getElementById('customDonationInput');
  const impactText = document.getElementById('donationImpactPreview');
  const toggleBtns = document.querySelectorAll('.donation-toggle-btn');

  let currentAmount = 100;
  let frequency = 'one-time';

  const impactRules = {
    25: "Provides emergency hygiene and water purification kits for a family of 5 for one month.",
    50: "Supplies trauma wound bandages, blankets, and essential thermal wear for 8 displaced children.",
    100: "Funds high-capacity emergency water treatment filtration units delivering 10,000L clean drinking water.",
    250: "Deploys rapid all-weather emergency family shelter pods with solar power and stoves.",
    500: "Equips an entire mobile first responder paramedic trauma backpack with critical lifesaving instruments.",
    1000: "Airlifts 2.5 metric tonnes of specialized therapeutic food and infant medical supplies to crisis zones."
  };

  function updateImpact(amt) {
    if (!impactText) return;
    const num = parseInt(amt) || 0;
    if (num <= 35) {
      impactText.innerHTML = `<i class="fa-solid fa-droplet text-primary"></i> <span>Provides essential clean water purification tablets and basic dignity kits.</span>`;
    } else if (num <= 75) {
      impactText.innerHTML = `<i class="fa-solid fa-kit-medical text-danger"></i> <span>Supplies trauma wound dressing and thermal protection packs for displaced families.</span>`;
    } else if (num <= 150) {
      impactText.innerHTML = `<i class="fa-solid fa-faucet-drip text-primary"></i> <span>${impactRules[100]}</span>`;
    } else if (num <= 350) {
      impactText.innerHTML = `<i class="fa-solid fa-tent text-warning"></i> <span>${impactRules[250]}</span>`;
    } else if (num <= 750) {
      impactText.innerHTML = `<i class="fa-solid fa-truck-medical text-danger"></i> <span>${impactRules[500]}</span>`;
    } else {
      impactText.innerHTML = `<i class="fa-solid fa-plane-departure text-success"></i> <span>${impactRules[1000]}</span>`;
    }
  }

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAmount = parseInt(btn.dataset.amount);
      if (customInput) customInput.value = '';
      updateImpact(currentAmount);
    });
  });

  if (customInput) {
    customInput.addEventListener('input', (e) => {
      amountBtns.forEach(b => b.classList.remove('active'));
      const val = parseInt(e.target.value) || 0;
      currentAmount = val;
      updateImpact(val);
    });
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      frequency = btn.dataset.frequency;
    });
  });

  // Handle Main Submit
  const donateSubmitBtn = document.getElementById('btnSubmitDonation');
  if (donateSubmitBtn) {
    donateSubmitBtn.addEventListener('click', () => {
      const appealSelect = document.getElementById('donationAppealSelect');
      const appealName = appealSelect ? appealSelect.options[appealSelect.selectedIndex].text : "Global Emergency Disaster Relief Fund";
      executeDonationSuccess(currentAmount, frequency, appealName);
    });
  }
}

// Global modal trigger from map or appeal cards
window.triggerDonateModal = function(appealName = "Global Emergency Disaster Relief Fund") {
  const modalElem = document.getElementById('emergencyDonationModal');
  const targetAppealInput = document.getElementById('modalTargetAppeal');
  if (targetAppealInput) {
    targetAppealInput.value = appealName;
  }
  if (modalElem && typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getInstance(modalElem) || new bootstrap.Modal(modalElem);
    modal.show();
  }
};

window.executeModalDonation = function() {
  const amountInput = document.getElementById('modalDonationAmount');
  const amount = amountInput ? (amountInput.value || 100) : 100;
  const targetAppeal = document.getElementById('modalTargetAppeal')?.value || "Global Disaster Response";

  const modalElem = document.getElementById('emergencyDonationModal');
  if (modalElem && typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getInstance(modalElem);
    if (modal) modal.hide();
  }

  executeDonationSuccess(amount, 'one-time', targetAppeal);
};

function executeDonationSuccess(amount, freq, appeal) {
  // Confetti burst
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const successModalElem = document.getElementById('donationSuccessModal');
  const summaryElem = document.getElementById('donationSuccessSummary');
  if (summaryElem) {
    summaryElem.innerHTML = `You have successfully pledged <strong>$${amount}</strong> (${freq}) to <strong>${appeal}</strong>. A tax-exempt receipt and emergency deployment telemetry report have been dispatched to your email.`;
  }

  if (successModalElem && typeof bootstrap !== 'undefined') {
    const sModal = bootstrap.Modal.getInstance(successModalElem) || new bootstrap.Modal(successModalElem);
    sModal.show();
  }
}

/* ==========================================================================
   6. Live Counter Animations
   ========================================================================== */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter-val');
  const speed = 120;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';

        let count = 0;
        const inc = target / speed;

        const updateCount = () => {
          count += inc;
          if (count < target) {
            counter.innerText = prefix + (Number.isInteger(target) ? Math.ceil(count) : count.toFixed(1)) + suffix;
            requestAnimationFrame(updateCount);
          } else {
            counter.innerText = prefix + target + suffix;
          }
        };
        updateCount();
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => observer.observe(counter));
}
