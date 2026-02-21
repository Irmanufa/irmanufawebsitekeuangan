// ============================================
// IRMANUFA v5.0 - ULTIMATE EDITION
// Mobile Optimized Script
// ============================================

// Konfigurasi
const CONFIG = {
  VERSION: "5.0",
  DEFAULT_FEE: 2000,
  STORAGE_KEY: "irmanufa_ultimate_data",
  SETTINGS_KEY: "irmanufa_ultimate_settings",
  TOAST_DURATION: 3000,
};

// State Aplikasi
const AppState = {
  members: [],
  payments: [],
  expenses: [],
  archives: [],
  settings: {
    weeklyFee: 2000,
    orgName: "IRMANUFA",
    waNumber: "6283840111380",
    bendahara: "Luna & Siva",
    ketua: "Agung Ubaidillah",
  },
  currentPage: "dashboard",
  selectedMember: null,
  charts: {},
  isLoading: false,
};

// ========== INISIALISASI ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 IRMANUFA v5.0 Ultimate Starting...");
  initApp();
});

async function initApp() {
  showLoading(true);

  try {
    loadData();
    setupEventListeners();
    setupDefaultDates();
    updateAllViews();
    updateCurrentDate();

    // Set interval untuk update waktu
    setInterval(updateCurrentDate, 60000);

    showToast("IRMANUFA siap digunakan!", "success");
  } catch (error) {
    console.error("Init error:", error);
    showToast("Gagal memuat aplikasi", "error");
  } finally {
    showLoading(false);
  }
}

// ========== DATA MANAGEMENT ==========
function loadData() {
  // Load settings
  const savedSettings = localStorage.getItem(CONFIG.SETTINGS_KEY);
  if (savedSettings) {
    try {
      Object.assign(AppState.settings, JSON.parse(savedSettings));
    } catch (e) {
      console.warn("Settings corrupted");
    }
  } else {
    saveSettings();
  }

  // Load data
  const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      AppState.members = data.members || [];
      AppState.payments = data.payments || [];
      AppState.expenses = data.expenses || [];
      AppState.archives = data.archives || [];
    } catch (e) {
      console.warn("Data corrupted, creating sample");
      createSampleData();
    }
  } else {
    createSampleData();
  }
}

function saveData(showToastMsg = true) {
  try {
    const data = {
      members: AppState.members,
      payments: AppState.payments,
      expenses: AppState.expenses,
      archives: AppState.archives,
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));

    if (showToastMsg) {
      showToast("Data tersimpan", "success");
    }

    return true;
  } catch (error) {
    console.error("Save error:", error);
    showToast("Gagal menyimpan", "error");
    return false;
  }
}

function saveSettings() {
  try {
    localStorage.setItem(
      CONFIG.SETTINGS_KEY,
      JSON.stringify(AppState.settings),
    );
    return true;
  } catch (error) {
    console.error("Settings save error:", error);
    return false;
  }
}

function createSampleData() {
  const sampleNames = [
    "Ahmad Fauzi",
    "Budi Santoso",
    "Citra Dewi",
    "Dian Permata",
    "Eko Prasetyo",
    "Fitri Handayani",
    "Gilang Ramadhan",
  ];

  const divisions = ["BPH", "PSDM", "PDD", "HUMAS"];

  sampleNames.forEach((name, index) => {
    const member = {
      id: generateId("MEM"),
      name,
      division: divisions[index % divisions.length],
      status: "aktif",
      joinDate: new Date().toISOString().split("T")[0],
      lastPayment: null,
      totalPaid: 0,
    };
    AppState.members.push(member);
  });

  saveData(false);
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Menu toggle
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const sidebarClose = document.getElementById("sidebarClose");

  if (menuBtn) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar(true);
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", () => toggleSidebar(false));
  }

  if (overlay) {
    overlay.addEventListener("click", () => toggleSidebar(false));
  }

  // Navigation - Sidebar
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        navigateTo(page);
        toggleSidebar(false);
      }
    });
  });

  // Navigation - Bottom Nav
  document.querySelectorAll(".bottom-nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        navigateTo(page);
      }
    });
  });

  // Hash change
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1) || "dashboard";
    navigateTo(hash);
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleSidebar(false);
      closeAllModals();
    }
  });

  // Touch events for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeThreshold = 100;
    if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right - open sidebar
      if (!sidebar.classList.contains("active")) {
        toggleSidebar(true);
      }
    } else if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left - close sidebar
      if (sidebar.classList.contains("active")) {
        toggleSidebar(false);
      }
    }
  }
}

// ========== NAVIGASI ==========
function navigateTo(page) {
  if (AppState.currentPage === page) return;

  // Hide current page
  const currentPage = document.getElementById(AppState.currentPage);
  if (currentPage) {
    currentPage.classList.remove("active");
  }

  // Show target page
  const target = document.getElementById(page);
  if (target) {
    target.classList.add("active");
    AppState.currentPage = page;
    window.location.hash = page;

    // Update navigation
    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.page === page);
    });

    // Load page content
    loadPageContent(page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function loadPageContent(page) {
  switch (page) {
    case "dashboard":
      updateDashboard();
      setTimeout(initCharts, 100);
      break;
    case "bayar":
      updateMembersGrid();
      updateFilterCounts();
      break;
    case "pengeluaran":
      updateExpenseList();
      break;
    case "anggota":
      updateAnggotaGrid();
      break;
    case "transaksi":
      updateTransactionsList();
      break;
    case "laporan":
      setDefaultReportDates();
      break;
    case "arsip":
      updateArchiveList();
      break;
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (show) {
    sidebar?.classList.add("active");
    overlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ========== DASHBOARD ==========
function updateDashboard() {
  const totalIncome = AppState.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = AppState.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;
  const activeMembers = AppState.members.filter(
    (m) => m.status === "aktif",
  ).length;
  const complianceRate = calculateComplianceRate();

  // Animate numbers
  animateNumber("mainSaldo", balance);
  animateNumber("totalIncome", totalIncome);
  animateNumber("totalExpense", totalExpense);
  animateNumber("totalMembers", activeMembers);
  animateNumber("complianceRate", complianceRate, (v) => v + "%");

  updateActivityList();
  updateNavBadges();
}

function animateNumber(
  elementId,
  targetValue,
  formatter = (v) => formatCurrency(v),
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const currentText = element.textContent;
  const currentValue = parseInt(currentText.replace(/[^0-9-]/g, "")) || 0;

  if (currentValue === targetValue) {
    element.textContent = formatter(targetValue);
    return;
  }

  // Simple animation - just update directly for mobile performance
  element.textContent = formatter(targetValue);
}

function calculateComplianceRate() {
  const active = AppState.members.filter((m) => m.status === "aktif");
  if (!active.length) return 0;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const paid = active.filter(
    (m) => m.lastPayment && new Date(m.lastPayment) >= weekAgo,
  ).length;

  return Math.round((paid / active.length) * 100);
}

function updateActivityList() {
  const tbody = document.getElementById("activityList");
  if (!tbody) return;

  const activities = [
    ...AppState.payments.map((p) => ({
      date: p.date,
      type: "Pemasukan",
      typeClass: "income",
      desc: p.memberName,
      amount: p.amount,
      sign: "+",
    })),
    ...AppState.expenses.map((e) => ({
      date: e.date,
      type: "Pengeluaran",
      typeClass: "expense",
      desc: e.description,
      amount: e.amount,
      sign: "-",
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (!activities.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada aktivitas</p>
                </td>
            </tr>
        `;
    return;
  }

  // Mobile optimized: show minimal info
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    tbody.innerHTML = activities
      .map(
        (a) => `
            <tr>
                <td>${formatDateShort(a.date)}</td>
                <td class="${a.typeClass}">${a.sign} ${formatCurrencyShort(a.amount)}</td>
            </tr>
        `,
      )
      .join("");
  } else {
    tbody.innerHTML = activities
      .map(
        (a) => `
            <tr>
                <td>${formatDate(a.date)}</td>
                <td><span class="badge ${a.typeClass}">${a.type}</span></td>
                <td>${escapeHtml(a.desc)}</td>
                <td class="${a.typeClass}">${a.sign} ${formatCurrency(a.amount)}</td>
            </tr>
        `,
      )
      .join("");
  }
}

function updateNavBadges() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const unpaid = AppState.members.filter((m) => {
    if (m.status !== "aktif") return false;
    return !m.lastPayment || new Date(m.lastPayment) < weekAgo;
  }).length;

  const badge = document.getElementById("pendingPaymentBadge");
  if (badge) {
    badge.textContent = unpaid > 9 ? "9+" : unpaid;
    badge.style.display = unpaid > 0 ? "block" : "none";
  }

  const memberBadge = document.getElementById("memberCountBadge");
  if (memberBadge) {
    memberBadge.textContent = AppState.members.length;
  }
}

// ========== CHARTS ==========
function initCharts() {
  // Only init if on desktop or if chart container exists
  if (window.innerWidth < 768) {
    // On mobile, maybe show simplified chart or hide
    const chartCard = document.querySelector(".chart-card");
    if (chartCard) {
      // Option 1: Hide chart on mobile (already hidden via CSS for second chart)
      // Option 2: Keep simple chart
    }
  }

  initIncomeExpenseChart();
}

function initIncomeExpenseChart() {
  const ctx = document.getElementById("incomeExpenseChart");
  if (!ctx) return;

  // Destroy existing chart
  if (AppState.charts.incomeExpense) {
    AppState.charts.incomeExpense.destroy();
  }

  const days = 7; // Always show 7 days on mobile
  const labels = [];
  const income = [];
  const expense = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));

    const dayIncome = AppState.payments
      .filter((p) => p.date === dateStr)
      .reduce((sum, p) => sum + p.amount, 0);
    const dayExpense = AppState.expenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    income.push(dayIncome);
    expense.push(dayExpense);
  }

  AppState.charts.incomeExpense = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pemasukan",
          data: income,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: window.innerWidth < 768 ? 2 : 4,
        },
        {
          label: "Pengeluaran",
          data: expense,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: window.innerWidth < 768 ? 2 : 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: window.innerWidth >= 768,
          position: "top",
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const value = formatCurrency(context.raw);
              return `${context.dataset.label}: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (window.innerWidth < 768) {
                return value >= 1000 ? value / 1000 + "k" : value;
              }
              return formatCurrency(value).replace("Rp", "");
            },
          },
        },
      },
    },
  });
}

function updateChart() {
  initIncomeExpenseChart();
}

// ========== BAYAR KAS ==========
function updateMembersGrid() {
  const grid = document.getElementById("membersGrid");
  if (!grid) return;

  const active = AppState.members.filter((m) => m.status === "aktif");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (!active.length) {
    grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-users"></i>
                <p>Belum ada anggota aktif</p>
            </div>
        `;
    return;
  }

  grid.innerHTML = active
    .map((m) => {
      const last = m.lastPayment ? new Date(m.lastPayment) : null;
      const status = last && last >= weekAgo ? "paid" : "unpaid";
      const statusText = status === "paid" ? "Sudah" : "Belum";

      return `
            <div class="member-card ${AppState.selectedMember?.id === m.id ? "selected" : ""}" 
                 onclick="selectMember('${m.id}')">
                <div class="member-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="member-name">${escapeHtml(m.name)}</div>
                <div class="member-division">${escapeHtml(m.division)}</div>
                <div class="member-status ${status}">${statusText}</div>
            </div>
        `;
    })
    .join("");
}

function updateFilterCounts() {
  const active = AppState.members.filter((m) => m.status === "aktif");
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const paid = active.filter(
    (m) => m.lastPayment && new Date(m.lastPayment) >= weekAgo,
  ).length;

  // Update filter button counts if on desktop
  if (window.innerWidth >= 768) {
    // Can add counts to buttons if desired
  }
}

function searchMembers() {
  const term =
    document.getElementById("searchMember")?.value.toLowerCase().trim() || "";

  document.querySelectorAll(".member-card").forEach((card) => {
    const name =
      card.querySelector(".member-name")?.textContent.toLowerCase() || "";
    const div =
      card.querySelector(".member-division")?.textContent.toLowerCase() || "";
    const matches = term === "" || name.includes(term) || div.includes(term);

    card.style.display = matches ? "block" : "none";
  });
}

function filterMembers(status) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document.querySelectorAll(".member-card").forEach((card) => {
    const cardStatus = card
      .querySelector(".member-status")
      ?.classList.contains("paid");
    let show = false;

    if (status === "all") show = true;
    else if (status === "paid") show = cardStatus;
    else if (status === "unpaid") show = !cardStatus;

    card.style.display = show ? "block" : "none";
  });
}

function selectMember(id) {
  const member = AppState.members.find((m) => m.id === id);
  if (!member) return;

  AppState.selectedMember = member;

  // Update UI
  document
    .querySelectorAll(".member-card")
    .forEach((c) => c.classList.remove("selected"));
  const card = document.querySelector(`.member-card[onclick*="'${id}'"]`);
  if (card) card.classList.add("selected");

  // Show form
  const form = document.getElementById("paymentForm");
  const info = document.getElementById("selectedMemberInfo");

  if (form && info) {
    info.innerHTML = `
            <strong>${escapeHtml(member.name)}</strong>
            <small>${escapeHtml(member.division)}</small>
        `;
    form.style.display = "block";
    document.getElementById("paymentDate").value = new Date()
      .toISOString()
      .split("T")[0];

    // Scroll ke form
    setTimeout(() => {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

function processPayment(e) {
  e.preventDefault();

  if (!AppState.selectedMember) {
    showToast("Pilih anggota dulu", "warning");
    return;
  }

  const amount = parseInt(document.getElementById("paymentAmount")?.value);
  const date = document.getElementById("paymentDate")?.value;
  const notes = document.getElementById("paymentNotes")?.value;

  if (!amount || amount < AppState.settings.weeklyFee) {
    showToast("Minimal Rp " + AppState.settings.weeklyFee, "warning");
    return;
  }

  const payment = {
    id: generateId("PAY"),
    memberId: AppState.selectedMember.id,
    memberName: AppState.selectedMember.name,
    division: AppState.selectedMember.division,
    amount,
    date,
    notes: notes || "Pembayaran kas",
    type: "income",
  };

  AppState.payments.push(payment);

  // Update member
  const member = AppState.members.find(
    (m) => m.id === AppState.selectedMember.id,
  );
  if (member) {
    member.lastPayment = date;
    member.totalPaid = (member.totalPaid || 0) + amount;
  }

  if (saveData()) {
    showToast("Pembayaran berhasil", "success");
    closePaymentForm();
    updateAllViews();

    // Navigate ke transaksi
    setTimeout(() => navigateTo("transaksi"), 500);
  }
}

function closePaymentForm() {
  AppState.selectedMember = null;
  const form = document.getElementById("paymentForm");
  if (form) {
    form.style.display = "none";
  }
  document
    .querySelectorAll(".member-card")
    .forEach((c) => c.classList.remove("selected"));
}

// ========== PENGELUARAN ==========
function showExpenseForm() {
  const panel = document.getElementById("expensePanel");
  if (panel) {
    panel.style.display = "block";
    document.getElementById("expenseDate").value = new Date()
      .toISOString()
      .split("T")[0];

    setTimeout(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }
}

function hideExpenseForm() {
  const panel = document.getElementById("expensePanel");
  if (panel) {
    panel.style.display = "none";
  }
}

function addExpense(e) {
  e.preventDefault();

  const category = document.getElementById("expenseCategory")?.value;
  const amount = parseInt(document.getElementById("expenseAmount")?.value);
  const date = document.getElementById("expenseDate")?.value;
  const receipt = document.getElementById("receiptNumber")?.value;
  const description = document.getElementById("expenseDescription")?.value;

  if (!category || !amount || !description) {
    showToast("Isi semua field yang wajib", "warning");
    return;
  }

  const expense = {
    id: generateId("EXP"),
    category,
    amount,
    date: date || new Date().toISOString().split("T")[0],
    noKwitansi:
      receipt || `KW-${String(AppState.expenses.length + 1).padStart(3, "0")}`,
    description,
    type: "expense",
  };

  AppState.expenses.push(expense);

  if (saveData()) {
    showToast("Pengeluaran dicatat", "success");
    hideExpenseForm();
    e.target.reset();
    updateAllViews();

    setTimeout(() => navigateTo("transaksi"), 500);
  }
}

function updateExpenseList() {
  const container = document.getElementById("expenseList");
  if (!container) return;

  const filter = document.getElementById("expenseFilter")?.value || "all";

  let expenses = [...AppState.expenses];
  if (filter !== "all") {
    expenses = expenses.filter((e) => e.category === filter);
  }

  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!expenses.length) {
    container.innerHTML =
      '<div class="empty-state">Belum ada pengeluaran</div>';
    return;
  }

  container.innerHTML = expenses
    .map(
      (e) => `
        <div class="expense-item">
            <div class="expense-info">
                <h4>${escapeHtml(e.category)}</h4>
                <p>${escapeHtml(e.description)}</p>
                <small>${formatDate(e.date)}</small>
            </div>
            <div class="expense-amount">${formatCurrency(e.amount)}</div>
        </div>
    `,
    )
    .join("");
}

function filterExpenses() {
  updateExpenseList();
}

// ========== ANGGOTA ==========
function updateAnggotaGrid() {
  const grid = document.getElementById("anggotaGrid");
  if (!grid) return;

  if (!AppState.members.length) {
    grid.innerHTML = '<div class="empty-state">Belum ada anggota</div>';
    return;
  }

  grid.innerHTML = AppState.members
    .map(
      (m) => `
        <div class="anggota-card">
            <div class="anggota-info">
                <h4>${escapeHtml(m.name)}</h4>
                <p>${escapeHtml(m.division)}</p>
            </div>
            <div class="anggota-actions">
                <button class="btn-edit" onclick="editMember('${m.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete-icon" onclick="confirmDelete('member', '${m.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function searchAnggota() {
  const term =
    document.getElementById("searchAnggota")?.value.toLowerCase().trim() || "";

  document.querySelectorAll(".anggota-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = term === "" || text.includes(term) ? "flex" : "none";
  });
}

function showAddMemberModal() {
  document.getElementById("modalTitle").textContent = "Tambah Anggota";
  document.getElementById("memberId").value = "";
  document.getElementById("memberName").value = "";
  document.getElementById("memberDivision").value = "";
  document.getElementById("memberModal").classList.add("active");
}

function editMember(id) {
  const member = AppState.members.find((m) => m.id === id);
  if (!member) return;

  document.getElementById("modalTitle").textContent = "Edit Anggota";
  document.getElementById("memberId").value = member.id;
  document.getElementById("memberName").value = member.name;
  document.getElementById("memberDivision").value = member.division;
  document.getElementById("memberModal").classList.add("active");
}

function saveMember(e) {
  e.preventDefault();

  const id = document.getElementById("memberId")?.value;
  const name = document.getElementById("memberName")?.value.trim();
  const division = document.getElementById("memberDivision")?.value.trim();

  if (!name || !division) {
    showToast("Nama dan divisi harus diisi", "warning");
    return;
  }

  if (id) {
    // Update
    const member = AppState.members.find((m) => m.id === id);
    if (member) {
      member.name = name;
      member.division = division;
      showToast("Anggota diperbarui", "success");
    }
  } else {
    // Create
    AppState.members.push({
      id: generateId("MEM"),
      name,
      division,
      status: "aktif",
      joinDate: new Date().toISOString().split("T")[0],
      lastPayment: null,
      totalPaid: 0,
    });
    showToast("Anggota ditambahkan", "success");
  }

  if (saveData()) {
    closeMemberModal();
    updateAllViews();
  }
}

function closeMemberModal() {
  document.getElementById("memberModal").classList.remove("active");
}

// ========== TRANSAKSI ==========
function updateTransactionsList() {
  const container = document.getElementById("transactionsList");
  if (!container) return;

  const type = document.getElementById("transactionType")?.value || "all";

  let transactions = [
    ...AppState.payments.map((p) => ({
      ...p,
      type: "income",
      typeClass: "income",
      displayType: "Pemasukan",
    })),
    ...AppState.expenses.map((e) => ({
      ...e,
      type: "expense",
      typeClass: "expense",
      displayType: "Pengeluaran",
    })),
  ];

  if (type !== "all") {
    transactions = transactions.filter((t) => t.type === type);
  }

  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!transactions.length) {
    container.innerHTML = '<div class="empty-state">Belum ada transaksi</div>';
    return;
  }

  container.innerHTML = transactions
    .map(
      (t) => `
        <div class="transaction-item">
            <div class="transaction-info">
                <strong>${escapeHtml(t.memberName || t.category)}</strong>
                <small>${formatDate(t.date)} • ${escapeHtml(t.notes || t.description || "")}</small>
            </div>
            <div class="transaction-amount ${t.typeClass}">
                ${t.type === "income" ? "+" : "-"} ${formatCurrencyShort(t.amount)}
            </div>
            <button class="btn-delete-icon" onclick="confirmDelete('transaction', '${t.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `,
    )
    .join("");
}

function filterTransactions() {
  updateTransactionsList();
}

// ========== LAPORAN ==========
function setDefaultReportDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const startInput = document.getElementById("reportStart");
  const endInput = document.getElementById("reportEnd");

  if (startInput) startInput.value = firstDay.toISOString().split("T")[0];
  if (endInput) endInput.value = today.toISOString().split("T")[0];
}

function generateReport() {
  const start = document.getElementById("reportStart")?.value;
  const end = document.getElementById("reportEnd")?.value;

  if (!start || !end) {
    showToast("Pilih periode laporan", "warning");
    return;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59);

  const payments = AppState.payments.filter((p) => {
    const d = new Date(p.date);
    return d >= startDate && d <= endDate;
  });

  const expenses = AppState.expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= startDate && d <= endDate;
  });

  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const container = document.getElementById("reportResults");
  if (!container) return;

  container.innerHTML = `
        <h3>Laporan Keuangan</h3>
        <p style="color: var(--gray-600); margin-bottom: 16px;">
            ${formatDate(start)} - ${formatDate(end)}
        </p>
        <div style="display: grid; gap: 12px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between;">
                <span>Total Pemasukan:</span>
                <span style="color: var(--success-500); font-weight: 600;">${formatCurrency(totalIncome)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Total Pengeluaran:</span>
                <span style="color: var(--danger-500); font-weight: 600;">${formatCurrency(totalExpense)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--gray-200); padding-top: 12px;">
                <span>Saldo:</span>
                <span style="font-weight: 700; ${balance >= 0 ? "color: var(--success-500);" : "color: var(--danger-500);"}">
                    ${formatCurrency(balance)}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Jumlah Transaksi:</span>
                <span style="font-weight: 600;">${payments.length + expenses.length}</span>
            </div>
        </div>
    `;

  container.style.display = "block";
}

// ========== ARSIP ==========
function updateArchiveList() {
  const container = document.getElementById("archiveItems");
  if (!container) return;

  if (!AppState.archives.length) {
    container.innerHTML = '<div class="empty-state">Belum ada arsip</div>';
    return;
  }

  container.innerHTML = AppState.archives
    .map(
      (a) => `
        <div class="archive-item" onclick="viewArchive('${a.id}')">
            <div class="archive-icon">
                <i class="fas fa-archive"></i>
            </div>
            <div class="archive-info">
                <h4>${getMonthName(a.month)} ${a.year}</h4>
                <small>${a.summary?.totalTransactions || 0} transaksi</small>
            </div>
        </div>
    `,
    )
    .join("");
}

function archiveCurrentMonth() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Check if already archived
  if (AppState.archives.some((a) => a.month === month && a.year === year)) {
    showToast("Bulan ini sudah diarsipkan", "warning");
    return;
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const payments = AppState.payments.filter((p) => {
    const d = new Date(p.date);
    return d >= start && d <= end;
  });

  const expenses = AppState.expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });

  const archive = {
    id: generateId("ARC"),
    month,
    year,
    summary: {
      totalIncome: payments.reduce((s, p) => s + p.amount, 0),
      totalExpense: expenses.reduce((s, e) => s + e.amount, 0),
      totalTransactions: payments.length + expenses.length,
      payments: payments.map((p) => p.id),
      expenses: expenses.map((e) => e.id),
    },
    archivedAt: new Date().toISOString(),
  };

  AppState.archives.push(archive);

  // Remove archived data
  AppState.payments = AppState.payments.filter((p) => {
    const d = new Date(p.date);
    return d < start || d > end;
  });

  AppState.expenses = AppState.expenses.filter((e) => {
    const d = new Date(e.date);
    return d < start || d > end;
  });

  if (saveData()) {
    showToast("Data diarsipkan", "success");
    updateArchiveList();
  }
}

function viewArchive(id) {
  const archive = AppState.archives.find((a) => a.id === id);
  if (!archive) return;

  showToast(
    `Melihat arsip ${getMonthName(archive.month)} ${archive.year}`,
    "info",
  );
}

// ========== PENGATURAN ==========
function showBackupOptions() {
  document.getElementById("backupModal").classList.add("active");
}

function closeBackupModal() {
  document.getElementById("backupModal").classList.remove("active");
}

function showGeneralSettings() {
  const modal = document.getElementById("settingsDetailModal");
  const title = document.getElementById("settingsModalTitle");
  const content = document.getElementById("settingsModalContent");

  title.textContent = "Informasi Organisasi";
  content.innerHTML = `
        <div class="form-group">
            <label>Nama Organisasi</label>
            <input type="text" id="orgName" value="${escapeHtml(AppState.settings.orgName)}">
        </div>
        <div class="form-group">
            <label>Bendahara</label>
            <input type="text" id="bendahara" value="${escapeHtml(AppState.settings.bendahara)}">
        </div>
        <div class="form-group">
            <label>Ketua</label>
            <input type="text" id="ketua" value="${escapeHtml(AppState.settings.ketua)}">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveGeneralSettings()">Simpan</button>
        </div>
    `;

  modal?.classList.add("active");
}

function showFinanceSettings() {
  const modal = document.getElementById("settingsDetailModal");
  const title = document.getElementById("settingsModalTitle");
  const content = document.getElementById("settingsModalContent");

  title.textContent = "Pengaturan Keuangan";
  content.innerHTML = `
        <div class="form-group">
            <label>Kas Wajib per Minggu (Rp)</label>
            <input type="number" id="weeklyFee" value="${AppState.settings.weeklyFee}" min="1000" step="500">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveFinanceSettings()">Simpan</button>
        </div>
    `;

  modal?.classList.add("active");
}

function saveGeneralSettings() {
  AppState.settings.orgName =
    document.getElementById("orgName")?.value || "IRMANUFA";
  AppState.settings.bendahara =
    document.getElementById("bendahara")?.value || "Luna & Siva";
  AppState.settings.ketua =
    document.getElementById("ketua")?.value || "Agung Ubaidillah";

  if (saveSettings()) {
    showToast("Pengaturan disimpan", "success");
    closeSettingsModal();

    // Update header
    document.querySelector(".brand-text h1").textContent =
      AppState.settings.orgName;
  }
}

function saveFinanceSettings() {
  const weeklyFee = parseInt(document.getElementById("weeklyFee")?.value);
  if (weeklyFee && weeklyFee >= 1000) {
    AppState.settings.weeklyFee = weeklyFee;

    if (saveSettings()) {
      showToast("Pengaturan disimpan", "success");
      closeSettingsModal();
    }
  } else {
    showToast("Minimal Rp 1.000", "warning");
  }
}

function closeSettingsModal() {
  document.getElementById("settingsDetailModal").classList.remove("active");
}

function hideSettingsDetail() {
  document.getElementById("settingsDetailPanel").style.display = "none";
}

// ========== BACKUP & RESET ==========
function exportData() {
  try {
    const data = {
      version: CONFIG.VERSION,
      exported: new Date().toISOString(),
      members: AppState.members,
      payments: AppState.payments,
      expenses: AppState.expenses,
      archives: AppState.archives,
      settings: AppState.settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_irmanufa_${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast("Backup berhasil", "success");
    closeBackupModal();
  } catch (error) {
    console.error(error);
    showToast("Gagal backup", "error");
  }
}

function importData() {
  document.getElementById("importFile").click();
  closeBackupModal();
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.members) AppState.members = data.members;
      if (data.payments) AppState.payments = data.payments;
      if (data.expenses) AppState.expenses = data.expenses;
      if (data.archives) AppState.archives = data.archives;
      if (data.settings) Object.assign(AppState.settings, data.settings);

      if (saveData(false)) {
        showToast("Data berhasil diimpor", "success");
        updateAllViews();
      }
    } catch (error) {
      showToast("File tidak valid", "error");
    }
  };
  reader.readAsText(file);
}

// ========== DELETE & CONFIRM ==========
function confirmDelete(type, id) {
  const modal = document.getElementById("confirmModal");
  const message = document.getElementById("confirmMessage");
  const confirmBtn = document.getElementById("confirmActionBtn");

  let msg = "";
  if (type === "member")
    msg = "Hapus anggota ini? Semua transaksinya juga akan dihapus.";
  else if (type === "transaction") msg = "Hapus transaksi ini?";
  else msg = "Yakin ingin melanjutkan?";

  message.textContent = msg;
  modal?.classList.add("active");

  confirmBtn.onclick = function () {
    if (type === "member" && id) deleteMember(id);
    else if (type === "transaction" && id) deleteTransaction(id);
    closeConfirmModal();
  };
}

function closeConfirmModal() {
  document.getElementById("confirmModal").classList.remove("active");
}

function deleteMember(id) {
  AppState.members = AppState.members.filter((m) => m.id !== id);
  AppState.payments = AppState.payments.filter((p) => p.memberId !== id);

  if (saveData()) {
    showToast("Anggota dihapus", "success");
    updateAllViews();
  }
}

function deleteTransaction(id) {
  AppState.payments = AppState.payments.filter((p) => p.id !== id);
  AppState.expenses = AppState.expenses.filter((e) => e.id !== id);

  if (saveData()) {
    showToast("Transaksi dihapus", "success");
    updateAllViews();
  }
}

function resetData() {
  confirmDelete("reset");
  document.getElementById("confirmActionBtn").onclick = function () {
    AppState.members = [];
    AppState.payments = [];
    AppState.expenses = [];
    AppState.archives = [];

    if (saveData()) {
      showToast("Semua data direset", "info");
      setTimeout(() => location.reload(), 1000);
    }
    closeConfirmModal();
  };
}

// ========== UTILITIES ==========
function updateAllViews() {
  updateDashboard();
  updateMembersGrid();
  updateExpenseList();
  updateAnggotaGrid();
  updateTransactionsList();
  updateArchiveList();
}

function updateCurrentDate() {
  const el = document.getElementById("currentDate");
  if (el) {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    el.textContent = now.toLocaleDateString("id-ID", options);
  }
}

function setupDefaultDates() {
  const today = new Date().toISOString().split("T")[0];
  const dateInputs = ["paymentDate", "expenseDate"];

  dateInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = today;
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return "Rp" + (amount / 1000000).toFixed(1) + "jt";
  } else if (amount >= 1000) {
    return "Rp" + (amount / 1000).toFixed(0) + "rb";
  }
  return "Rp" + amount;
}

function formatDate(date) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatDateShort(date) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return date;
  }
}

function getMonthName(month) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return months[month - 1] || "";
}

function generateId(prefix = "") {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6)
  );
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showLoading(show) {
  AppState.isLoading = show;
  if (show) {
    document.body.classList.add("loading");
  } else {
    document.body.classList.remove("loading");
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };

  toast.innerHTML = `
        <i class="fas fa-${icons[type] || "info-circle"}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, CONFIG.TOAST_DURATION);
}

function closeAllModals() {
  document
    .querySelectorAll(".modal.active")
    .forEach((m) => m.classList.remove("active"));
}

function refreshData() {
  showToast("Memperbarui data...", "info");
  setTimeout(() => {
    updateAllViews();
    showToast("Data diperbarui", "success");
  }, 500);
}

// ========== EXPORT GLOBAL ==========
window.navigateTo = navigateTo;
window.refreshData = refreshData;
window.searchMembers = searchMembers;
window.filterMembers = filterMembers;
window.selectMember = selectMember;
window.processPayment = processPayment;
window.closePaymentForm = closePaymentForm;
window.showExpenseForm = showExpenseForm;
window.hideExpenseForm = hideExpenseForm;
window.addExpense = addExpense;
window.filterExpenses = filterExpenses;
window.searchAnggota = searchAnggota;
window.showAddMemberModal = showAddMemberModal;
window.editMember = editMember;
window.saveMember = saveMember;
window.closeMemberModal = closeMemberModal;
window.filterTransactions = filterTransactions;
window.generateReport = generateReport;
window.archiveCurrentMonth = archiveCurrentMonth;
window.viewArchive = viewArchive;
window.showBackupOptions = showBackupOptions;
window.closeBackupModal = closeBackupModal;
window.exportData = exportData;
window.importData = importData;
window.handleFileImport = handleFileImport;
window.resetData = resetData;
window.confirmDelete = confirmDelete;
window.closeConfirmModal = closeConfirmModal;
window.showGeneralSettings = showGeneralSettings;
window.showFinanceSettings = showFinanceSettings;
window.saveGeneralSettings = saveGeneralSettings;
window.saveFinanceSettings = saveFinanceSettings;
window.closeSettingsModal = closeSettingsModal;
window.hideSettingsDetail = hideSettingsDetail;
window.updateChart = updateChart;

console.log("✅ IRMANUFA v5.0 Ultimate Ready!");
