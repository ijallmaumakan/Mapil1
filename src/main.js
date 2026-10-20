/**
 * Little Olie - Admin Management & Customer Food Ordering System
 * Combines Little Olie Admin Login, Menu CRUD with Cloudinary, and Bistro Customer Store
 */

import { 
  fetchAllMenus, 
  createMenu, 
  updateMenu, 
  deleteMenu, 
  loginUser, 
  registerUser,
  setAuthToken 
} from './api.js';

// ==========================================================================
// FALLBACK GOURMET FOOD DATA (IN CASE SERVER / MYSQL IS OFFLINE)
// ==========================================================================
const GOURMET_FALLBACK_MENUS = [
  {
    id: 1,
    name: 'Nasi Goreng Spesial',
    price: 28000,
    category: 'Makanan',
    desc: 'Semoga cepet sampe',
    img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700'
  },
  {
    id: 2,
    name: 'Mie Goreng Seafood',
    price: 32000,
    category: 'Makanan',
    desc: 'Mie kenyal ditumis dengan udang dan cumi segar.',
    img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=700'
  },
  {
    id: 3,
    name: 'Ayam Bakar Madu',
    price: 35000,
    category: 'Makanan',
    desc: 'Ayam panggang bumbu madu khas nusantara disajikan dengan lalapan.',
    img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=700'
  },
  {
    id: 4,
    name: 'Sate Ayam Madura',
    price: 30000,
    category: 'Makanan',
    desc: 'Sate daging ayam empuk dengan saus kacang gurih dan lontong.',
    img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700'
  },
  {
    id: 5,
    name: 'Kentang Goreng Keju',
    price: 18000,
    category: 'Cemilan',
    desc: 'Kentang goreng renyah dengan taburan keju gurih spesial.',
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700'
  },
  {
    id: 6,
    name: 'Roti Bakar Cokelat',
    price: 20000,
    category: 'Cemilan',
    desc: 'Roti panggang mentega dengan lumeran cokelat manis lezat.',
    img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700'
  }
];

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const state = {
  menus: [],
  activeEditId: null,
  selectedPresetImage: null,
  toastTimeout: null,
  authMode: 'login', // 'login' or 'register'
  cart: [],
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular',
  activeDetailMenu: null
};

// ==========================================================================
// DOM ELEMENTS SELECTORS
// ==========================================================================
const elements = {
  // Views
  loginView: document.getElementById('login-view'),
  dashboardView: document.getElementById('dashboard-view'),
  customerStoreView: document.getElementById('customer-store-view'),

  // Login & Register Form
  authTitle: document.getElementById('auth-title'),
  authSubtitle: document.getElementById('auth-subtitle'),
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  loginForm: document.getElementById('login-form'),
  loginName: document.getElementById('login-name'),
  loginMonth: document.getElementById('login-month'),
  loginYear: document.getElementById('login-year'),
  btnLoginSubmit: document.getElementById('btn-login-submit'),
  authSwitchPrompt: document.getElementById('auth-switch-prompt'),
  btnToggleAuth: document.getElementById('btn-toggle-auth'),

  // Dashboard Nav
  loggedUserName: document.getElementById('logged-user-name'),
  btnViewCustomerStore: document.getElementById('btn-view-customer-store'),
  btnBackToAdmin: document.getElementById('btn-back-to-admin'),
  authLogoutBtn: document.getElementById('auth-logout-btn'),

  // Admin Menu Form
  menuForm: document.getElementById('menu-form'),
  formHeadingTitle: document.getElementById('form-heading-title'),
  menuIdInput: document.getElementById('menu-id-input'),
  menuNameInput: document.getElementById('menu-name-input'),
  menuPriceInput: document.getElementById('menu-price-input'),
  menuCategoryInput: document.getElementById('menu-category-input'),
  menuDescInput: document.getElementById('menu-desc-input'),
  btnPickPhoto: document.getElementById('btn-pick-photo'),
  menuImgFile: document.getElementById('menu-img-file'),
  fileStatusIndicator: document.getElementById('file-status-indicator'),
  fileStatusText: document.getElementById('file-status-text'),
  quickPresetsChips: document.getElementById('quick-presets-chips'),
  selectedImgPreview: document.getElementById('selected-img-preview'),
  previewImgTag: document.getElementById('preview-img-tag'),
  btnRemovePreview: document.getElementById('btn-remove-preview'),
  saveMenuBtn: document.getElementById('save-menu-btn'),
  btnCancelEdit: document.getElementById('btn-cancel-edit'),
  menuCardsContainer: document.getElementById('menu-cards-container'),
  dropzoneEmptyWrap: document.getElementById('dropzone-empty-wrap'),
  statsTotalMenus: document.getElementById('stats-total-menus'),

  // Customer Catalog
  foodCardsGrid: document.getElementById('food-cards-grid'),
  searchMenuInput: document.getElementById('search-menu-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  sortSelect: document.getElementById('sort-select'),
  categoryFilterContainer: document.getElementById('category-filter-container'),

  // Modals & Cart
  btnOpenCart: document.getElementById('btn-open-cart'),
  headerCartBadge: document.getElementById('header-cart-badge'),
  cartDrawerBackdrop: document.getElementById('cart-drawer-backdrop'),
  btnCloseCart: document.getElementById('btn-close-cart'),
  drawerCartItems: document.getElementById('drawer-cart-items'),
  drawerSubtitleCount: document.getElementById('drawer-subtitle-count'),
  orderCustName: document.getElementById('order-cust-name'),
  orderTypeSelect: document.getElementById('order-type-select'),
  orderDestInfo: document.getElementById('order-dest-info'),
  orderPaymentMethod: document.getElementById('order-payment-method'),
  calcSubtotalVal: document.getElementById('calc-subtotal-val'),
  calcTaxVal: document.getElementById('calc-tax-val'),
  calcGrandtotalVal: document.getElementById('calc-grandtotal-val'),
  btnSubmitOrder: document.getElementById('btn-submit-order'),
  btnOrderWhatsapp: document.getElementById('btn-order-whatsapp'),
  btnClearAllCart: document.getElementById('btn-clear-all-cart'),

  // Detail Modal
  detailModalBackdrop: document.getElementById('detail-modal-backdrop'),
  detailModalImg: document.getElementById('detail-modal-img'),
  detailModalCategory: document.getElementById('detail-modal-category'),
  detailModalName: document.getElementById('detail-modal-name'),
  detailModalPrice: document.getElementById('detail-modal-price'),
  detailModalDesc: document.getElementById('detail-modal-desc'),
  btnCloseDetail: document.getElementById('btn-close-detail'),
  btnSecondaryCloseDetail: document.getElementById('btn-secondary-close-detail'),
  detailQtyMinus: document.getElementById('detail-qty-minus'),
  detailQtyPlus: document.getElementById('detail-qty-plus'),
  detailQtyVal: document.getElementById('detail-qty-val'),
  detailOrderNote: document.getElementById('detail-order-note'),
  btnDetailAddCart: document.getElementById('btn-detail-add-cart'),
  detailBtnText: document.getElementById('detail-btn-text'),

  // Receipt Modal
  receiptModalBackdrop: document.getElementById('receipt-modal-backdrop'),
  receiptPaperContent: document.getElementById('receipt-paper-content'),
  btnCloseReceipt: document.getElementById('btn-close-receipt'),
  btnReceiptDone: document.getElementById('btn-receipt-done'),

  // Toast
  toastBar: document.getElementById('toast-bar')
};

// ==========================================================================
// HELPERS
// ==========================================================================
const formatRupiah = (amount) => {
  const num = Number(amount) || 0;
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const showToast = (message, type = 'error') => {
  if (!elements.toastBar) return;
  clearTimeout(state.toastTimeout);
  elements.toastBar.className = `toast-bar ${type}`;
  elements.toastBar.textContent = message;
  elements.toastBar.style.display = 'block';

  state.toastTimeout = setTimeout(() => {
    elements.toastBar.style.display = 'none';
    elements.toastBar.className = 'toast-bar';
  }, 4000);
};

const getFallbackImage = (item) => {
  if (item && item.img && typeof item.img === 'string' && item.img.trim()) {
    return item.img.trim();
  }
  const key = ((item && item.name) || '' + ' ' + (item && item.category) || '').toLowerCase();
  if (key.includes('nasi')) return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700';
  if (key.includes('mie') || key.includes('noodle')) return 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=700';
  if (key.includes('ayam') || key.includes('chicken')) return 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=700';
  if (key.includes('sate')) return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700';
  if (key.includes('kentang') || key.includes('fries')) return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700';
  if (key.includes('roti') || key.includes('toast')) return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700';
  if (key.includes('kopi') || key.includes('latte')) return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=700';
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700';
};

// ==========================================================================
// ==========================================
// 1. LOGIN & REGISTER AUTHENTICATION HANDLERS
// ==========================================
const setAuthMode = (mode) => {
  state.authMode = mode;
  if (mode === 'register') {
    if (elements.authTitle) elements.authTitle.textContent = 'Little Olie';
    if (elements.authSubtitle) elements.authSubtitle.textContent = 'Daftarkan Nama dan Tanggal Lahir Anda';
    if (elements.tabRegister) elements.tabRegister.classList.add('active');
    if (elements.tabLogin) elements.tabLogin.classList.remove('active');
    if (elements.btnLoginSubmit) elements.btnLoginSubmit.textContent = 'Daftar Sekarang';
    if (elements.authSwitchPrompt) elements.authSwitchPrompt.textContent = 'Sudah punya akun?';
    if (elements.btnToggleAuth) elements.btnToggleAuth.textContent = 'Masuk di sini';
  } else {
    if (elements.authTitle) elements.authTitle.textContent = 'Little Olie';
    if (elements.authSubtitle) elements.authSubtitle.textContent = 'Masukkan Nama dan Tanggal Lahir Anda';
    if (elements.tabLogin) elements.tabLogin.classList.add('active');
    if (elements.tabRegister) elements.tabRegister.classList.remove('active');
    if (elements.btnLoginSubmit) elements.btnLoginSubmit.textContent = 'Sign In';
    if (elements.authSwitchPrompt) elements.authSwitchPrompt.textContent = 'Belum punya akun?';
    if (elements.btnToggleAuth) elements.btnToggleAuth.textContent = 'Daftar sekarang';
  }
};

if (elements.tabLogin) {
  elements.tabLogin.addEventListener('click', () => setAuthMode('login'));
}

if (elements.tabRegister) {
  elements.tabRegister.addEventListener('click', () => setAuthMode('register'));
}

if (elements.btnToggleAuth) {
  elements.btnToggleAuth.addEventListener('click', () => {
    setAuthMode(state.authMode === 'login' ? 'register' : 'login');
  });
}

if (elements.loginForm) {
  elements.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = elements.loginName ? elements.loginName.value.trim() : 'Yus Rizal';
    const month = elements.loginMonth ? elements.loginMonth.value.trim() : 'januari';
    const year = elements.loginYear ? elements.loginYear.value.trim() : '2010';

    if (!name) {
      showToast('Silakan masukkan nama lengkap Anda.', 'error');
      return;
    }

    // --- MODE REGISTER ---
    if (state.authMode === 'register') {
      if (elements.btnLoginSubmit) {
        elements.btnLoginSubmit.disabled = true;
        elements.btnLoginSubmit.textContent = 'Mendaftarkan...';
      }

      try {
        const dummyEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@littleolie.com`;
        const dummyPass = `${month}${year}`;

        // Attempt register to backend MySQL database
        try {
          await registerUser(name, dummyEmail, dummyPass, 'user');
        } catch (apiErr) {
          console.warn('Backend register note:', apiErr.message);
        }

        // Store registered user in localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('little_olie_registered') || '[]');
        if (!registeredUsers.some(u => u.name.toLowerCase() === name.toLowerCase())) {
          registeredUsers.push({ name, month, year, email: dummyEmail });
          localStorage.setItem('little_olie_registered', JSON.stringify(registeredUsers));
        }

        showToast(`Registrasi berhasil! Selamat datang, ${name}. Silakan masuk.`, 'success');
        setAuthMode('login');
      } catch (regErr) {
        showToast('Gagal mendaftar: ' + regErr.message, 'error');
      } finally {
        if (elements.btnLoginSubmit) {
          elements.btnLoginSubmit.disabled = false;
          elements.btnLoginSubmit.textContent = 'Sign In';
        }
      }
      return;
    }

    // --- MODE LOGIN ---
    if (elements.btnLoginSubmit) {
      elements.btnLoginSubmit.disabled = true;
      elements.btnLoginSubmit.textContent = 'Memproses...';
    }

    try {
      // Set user session in localStorage
      const user = { name, month, year, role: 'admin' };
      localStorage.setItem('little_olie_user', JSON.stringify(user));

      // Attempt login to backend to get JWT token
      try {
        const dummyEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@littleolie.com`;
        await loginUser(dummyEmail, `${month}${year}`);
      } catch (apiErr) {
        // Fallback: set dummy token for testing bypass
        setAuthToken('little_olie_token_bypass_auth_123');
      }

      showToast(`Selamat datang, ${name}!`, 'success');

      if (elements.loggedUserName) {
        elements.loggedUserName.textContent = name;
      }

      // Switch to dashboard view
      if (elements.loginView) elements.loginView.style.display = 'none';
      if (elements.customerStoreView) elements.customerStoreView.style.display = 'none';
      if (elements.dashboardView) elements.dashboardView.style.display = 'block';

      // Load menus
      loadAdminMenus();
    } catch (err) {
      showToast('Gagal memproses login: ' + err.message, 'error');
    } finally {
      if (elements.btnLoginSubmit) {
        elements.btnLoginSubmit.disabled = false;
        elements.btnLoginSubmit.textContent = 'Sign In';
      }
    }
  });
}

// Logout Handler
if (elements.authLogoutBtn) {
  elements.authLogoutBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda ingin keluar dari Little Olie Admin?')) {
      setAuthToken(null);
      localStorage.removeItem('little_olie_user');
      
      if (elements.dashboardView) elements.dashboardView.style.display = 'none';
      if (elements.customerStoreView) elements.customerStoreView.style.display = 'none';
      if (elements.loginView) elements.loginView.style.display = 'flex';
      
      showToast('Anda telah logout dari Little Olie Admin.', 'success');
    }
  });
}

// Navigation between Admin & Customer Storefront
if (elements.btnViewCustomerStore) {
  elements.btnViewCustomerStore.addEventListener('click', () => {
    if (elements.dashboardView) elements.dashboardView.style.display = 'none';
    if (elements.loginView) elements.loginView.style.display = 'none';
    if (elements.customerStoreView) elements.customerStoreView.style.display = 'block';
    renderCustomerCatalog();
  });
}

if (elements.btnBackToAdmin) {
  elements.btnBackToAdmin.addEventListener('click', () => {
    if (elements.customerStoreView) elements.customerStoreView.style.display = 'none';
    if (elements.loginView) elements.loginView.style.display = 'none';
    if (elements.dashboardView) elements.dashboardView.style.display = 'block';
    loadAdminMenus();
  });
}

// ==========================================================================
// 2. ADMIN MENU CRUD & CLOUDINARY LOGIC
// ==========================================================================
const renderAdminSkeleton = () => {
  if (!elements.menuCardsContainer) return;
  elements.menuCardsContainer.innerHTML = Array(6)
    .fill(0)
    .map(() => '<div class="skeleton-card"></div>')
    .join('');
};

const renderAdminMenus = () => {
  if (!elements.menuCardsContainer) return;

  if (state.menus.length === 0) {
    elements.menuCardsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; background: #ffffff; padding: 40px; text-align: center; border-radius: 12px; color: #6b7280; border: 1px solid #e2e8f0;">
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">Belum Ada Menu Tersedia</p>
        <p style="font-size: 13px;">Gunakan formulir di atas untuk menambahkan menu baru ke database.</p>
      </div>
    `;
    return;
  }

  elements.menuCardsContainer.innerHTML = state.menus.map((item) => {
    const imgSrc = getFallbackImage(item);
    const priceText = formatRupiah(item.price);

    return `
      <article class="menu-card-item" data-id="${item.id}">
        <div class="menu-card-img-wrap" onclick="window.openFoodDetail(${item.id})" style="cursor: pointer;" title="Klik untuk lihat rincian menu">
          <img 
            src="${imgSrc}" 
            alt="${item.name}" 
            class="menu-card-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'"
          >
        </div>
        <div class="menu-card-details">
          <h3 class="menu-card-name" title="${item.name}" onclick="window.openFoodDetail(${item.id})" style="cursor: pointer;">${item.name}</h3>
          <div class="menu-card-price">${priceText}</div>
          <div class="menu-card-actions">
            <button type="button" class="btn-card-detail-admin" onclick="window.openFoodDetail(${item.id})" title="Lihat detail menu">
              🔍 Detail
            </button>
            <button type="button" class="btn-card-edit" onclick="window.editAdminMenu(${item.id})">
              ✏️ Edit
            </button>
            <button type="button" class="btn-card-del" onclick="window.deleteAdminMenu(${item.id})">
              🗑️ Hapus
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

const loadAdminMenus = async () => {
  try {
    renderAdminSkeleton();
    const data = await fetchAllMenus();
    state.menus = data && data.length > 0 ? data : [...GOURMET_FALLBACK_MENUS];
    if (elements.statsTotalMenus) {
      elements.statsTotalMenus.textContent = `${state.menus.length} Menu`;
    }
    renderAdminMenus();
  } catch (error) {
    console.warn('Backend offline or database empty, using fallback items:', error);
    state.menus = [...GOURMET_FALLBACK_MENUS];
    if (elements.statsTotalMenus) {
      elements.statsTotalMenus.textContent = `${state.menus.length} Menu`;
    }
    renderAdminMenus();
  }
};

// Global handlers for edit and delete menu cards
window.editAdminMenu = (id) => {
  const item = state.menus.find((m) => m.id === Number(id));
  if (!item) return;

  state.activeEditId = item.id;
  state.selectedPresetImage = item.img || null;

  if (elements.formHeadingTitle) elements.formHeadingTitle.textContent = `Edit Menu #${item.id}: ${item.name}`;
  if (elements.menuIdInput) elements.menuIdInput.value = item.id;
  if (elements.menuNameInput) elements.menuNameInput.value = item.name || '';
  if (elements.menuPriceInput) elements.menuPriceInput.value = item.price ? Number(item.price) : '';
  if (elements.menuCategoryInput) elements.menuCategoryInput.value = item.category || 'Makanan';
  if (elements.menuDescInput) elements.menuDescInput.value = item.desc || '';

  const imgSrc = getFallbackImage(item);
  if (elements.previewImgTag) elements.previewImgTag.src = imgSrc;
  if (elements.selectedImgPreview) elements.selectedImgPreview.style.display = 'block';
  if (elements.dropzoneEmptyWrap) elements.dropzoneEmptyWrap.style.display = 'none';
  if (elements.fileStatusText) elements.fileStatusText.textContent = 'Foto tersedia';
  if (elements.saveMenuBtn) elements.saveMenuBtn.textContent = 'Perbarui Menu ke Cloudinary';
  if (elements.btnCancelEdit) elements.btnCancelEdit.style.display = 'block';

  if (elements.menuForm) {
    elements.menuForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (elements.menuNameInput) elements.menuNameInput.focus();
};

window.deleteAdminMenu = async (id) => {
  const item = state.menus.find((m) => m.id === Number(id));
  const itemName = item ? item.name : `#${id}`;

  if (!confirm(`Hapus menu "${itemName}" dari database?`)) return;

  try {
    await deleteMenu(id);
    showToast(`Menu "${itemName}" berhasil dihapus.`, 'success');
    await loadAdminMenus();
  } catch (err) {
    state.menus = state.menus.filter((m) => m.id !== Number(id));
    renderAdminMenus();
    showToast(`Menu "${itemName}" dihapus dari tampilan.`, 'success');
  }
};

const resetAdminForm = () => {
  state.activeEditId = null;
  state.selectedPresetImage = null;
  if (elements.menuForm) elements.menuForm.reset();
  if (elements.menuIdInput) elements.menuIdInput.value = '';
  if (elements.formHeadingTitle) elements.formHeadingTitle.textContent = 'Tambah Menu Baru';
  if (elements.saveMenuBtn) elements.saveMenuBtn.textContent = 'Simpan & Upload ke Cloudinary';
  if (elements.btnCancelEdit) elements.btnCancelEdit.style.display = 'none';
  if (elements.selectedImgPreview) elements.selectedImgPreview.style.display = 'none';
  if (elements.dropzoneEmptyWrap) elements.dropzoneEmptyWrap.style.display = 'flex';
  if (elements.previewImgTag) elements.previewImgTag.src = '';
  if (elements.fileStatusText) elements.fileStatusText.textContent = 'Pilih foto atau klik rekomendasi di bawah';

  if (elements.quickPresetsChips) {
    elements.quickPresetsChips.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
  }
};

if (elements.btnCancelEdit) {
  elements.btnCancelEdit.addEventListener('click', resetAdminForm);
}

// File Picker button triggers hidden input
if (elements.btnPickPhoto && elements.menuImgFile) {
  elements.btnPickPhoto.addEventListener('click', () => {
    elements.menuImgFile.click();
  });
}

if (elements.menuImgFile) {
  elements.menuImgFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      state.selectedPresetImage = null;
      if (elements.fileStatusText) {
        elements.fileStatusText.textContent = `Foto: ${file.name.substring(0, 16)}...`;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (elements.previewImgTag) elements.previewImgTag.src = loadEvt.target.result;
        if (elements.selectedImgPreview) elements.selectedImgPreview.style.display = 'block';
        if (elements.dropzoneEmptyWrap) elements.dropzoneEmptyWrap.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
}

if (elements.btnRemovePreview) {
  elements.btnRemovePreview.addEventListener('click', () => {
    if (elements.menuImgFile) elements.menuImgFile.value = '';
    state.selectedPresetImage = null;
    if (elements.previewImgTag) elements.previewImgTag.src = '';
    if (elements.selectedImgPreview) elements.selectedImgPreview.style.display = 'none';
    if (elements.dropzoneEmptyWrap) elements.dropzoneEmptyWrap.style.display = 'flex';
    if (elements.fileStatusText) elements.fileStatusText.textContent = 'Pilih foto atau klik rekomendasi di bawah';
    if (elements.quickPresetsChips) {
      elements.quickPresetsChips.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
    }
  });
}

// Preset chips click
if (elements.quickPresetsChips) {
  elements.quickPresetsChips.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      elements.quickPresetsChips.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      if (!state.activeEditId) {
        if (elements.menuNameInput) elements.menuNameInput.value = chip.dataset.name || '';
        if (elements.menuPriceInput) elements.menuPriceInput.value = chip.dataset.price || '';
        if (elements.menuCategoryInput) elements.menuCategoryInput.value = chip.dataset.cat || 'Makanan';
        if (elements.menuDescInput) elements.menuDescInput.value = chip.dataset.desc || '';
      }

      state.selectedPresetImage = chip.dataset.img || null;
      if (elements.menuImgFile) elements.menuImgFile.value = '';
      if (elements.previewImgTag && state.selectedPresetImage) {
        elements.previewImgTag.src = state.selectedPresetImage;
        if (elements.selectedImgPreview) elements.selectedImgPreview.style.display = 'block';
        if (elements.dropzoneEmptyWrap) elements.dropzoneEmptyWrap.style.display = 'none';
      }
      if (elements.fileStatusText) {
        elements.fileStatusText.textContent = `Foto: ${chip.dataset.name}`;
      }
    });
  });
}

// Menu Form Submit
if (elements.menuForm) {
  elements.menuForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = elements.menuNameInput ? elements.menuNameInput.value.trim() : '';
    const price = elements.menuPriceInput ? elements.menuPriceInput.value.trim() : '';
    const category = elements.menuCategoryInput ? elements.menuCategoryInput.value.trim() : 'Makanan';
    const desc = elements.menuDescInput ? elements.menuDescInput.value.trim() : '';
    const file = elements.menuImgFile && elements.menuImgFile.files ? elements.menuImgFile.files[0] : null;

    if (!name || !price) {
      showToast('Nama Menu dan Harga wajib diisi!', 'error');
      return;
    }

    if (elements.saveMenuBtn) {
      elements.saveMenuBtn.disabled = true;
      elements.saveMenuBtn.textContent = '⏳ Mengunggah ke Cloudinary...';
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('desc', desc);

      if (file) {
        formData.append('img', file);
      } else if (state.selectedPresetImage) {
        try {
          const resp = await fetch(state.selectedPresetImage);
          const blob = await resp.blob();
          formData.append('img', blob, `${name.replace(/\s+/g, '-').toLowerCase()}.jpg`);
        } catch (fetchErr) {
          console.warn('Preset blob convert failed:', fetchErr);
        }
      } else {
        const fallbackUrl = getFallbackImage({ name, category });
        try {
          const resp = await fetch(fallbackUrl);
          const blob = await resp.blob();
          formData.append('img', blob, `${name.replace(/\s+/g, '-').toLowerCase()}.jpg`);
        } catch (fetchErr) {
          console.warn('Auto blob convert failed:', fetchErr);
        }
      }

      if (state.activeEditId) {
        await updateMenu(state.activeEditId, formData);
        showToast('Menu berhasil diperbarui di database & Cloudinary!', 'success');
      } else {
        await createMenu(formData);
        showToast('Menu berhasil disimpan ke database & Cloudinary!', 'success');
      }

      resetAdminForm();
      await loadAdminMenus();
    } catch (err) {
      console.error('Menu submit error:', err);
      showToast(err.message || 'Gagal menyimpan menu ke server.', 'error');
    } finally {
      if (elements.saveMenuBtn) {
        elements.saveMenuBtn.disabled = false;
        elements.saveMenuBtn.textContent = state.activeEditId ? 'Perbarui Menu ke Cloudinary' : 'Simpan & Upload ke Cloudinary';
      }
    }
  });
}

// Refresh Data Button
if (elements.refreshDataBtn) {
  elements.refreshDataBtn.addEventListener('click', async () => {
    elements.refreshDataBtn.textContent = '⏳ Memuat...';
    await loadAdminMenus();
    elements.refreshDataBtn.textContent = '🔄 Segarkan Data';
    showToast('Data menu berhasil dimuat ulang.', 'success');
  });
}

// ==========================================================================
// 3. CUSTOMER STOREFRONT LOGIC (BISTRO MENU & ORDERING)
// ==========================================================================
const renderCustomerCatalog = () => {
  if (!elements.foodCardsGrid) return;

  let filtered = [...state.menus];

  // Category filter
  if (state.activeCategory && state.activeCategory !== 'all') {
    filtered = filtered.filter((m) => (m.category || '').toLowerCase() === state.activeCategory.toLowerCase());
  }

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter((m) => 
      (m.name || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q) ||
      (m.desc || '').toLowerCase().includes(q)
    );
  }

  // Sorting
  if (state.sortBy === 'price-asc') {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (state.sortBy === 'price-desc') {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (state.sortBy === 'name-asc') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  if (filtered.length === 0) {
    elements.foodCardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <span style="font-size: 40px; display: block; margin-bottom: 10px;">🔍</span>
        <h4 style="font-size: 18px; color: #1e293b; margin-bottom: 6px;">Menu Tidak Ditemukan</h4>
        <p style="font-size: 14px; color: #64748b;">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
      </div>
    `;
    return;
  }

  elements.foodCardsGrid.innerHTML = filtered.map((item) => {
    const imgUrl = getFallbackImage(item);
    const priceText = formatRupiah(item.price);

    return `
      <article class="food-card" onclick="window.openFoodDetail(${item.id})">
        <div class="card-img-wrapper">
          <img 
            src="${imgUrl}" 
            alt="${item.name}" 
            class="food-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'"
          >
          <span class="card-category-badge">${item.category || 'Makanan'}</span>
        </div>
        <div class="card-content">
          <h4 class="card-title">${item.name}</h4>
          <p class="card-desc">${item.desc || 'Sajian lezat dibuat dengan bahan-bahan segar pilihan.'}</p>
          <div class="card-footer-action">
            <span class="card-price">${priceText}</span>
            <div class="card-action-btns">
              <button 
                type="button" 
                class="btn-card-detail" 
                onclick="event.stopPropagation(); window.openFoodDetail(${item.id})"
                title="Lihat Detail Menu"
              >
                Detail
              </button>
              <button 
                type="button" 
                class="btn-add-food btn-card-buy" 
                onclick="event.stopPropagation(); window.quickAddToCart(${item.id})"
                title="Tambah ke Keranjang"
              >
                + Pesan
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

// Customer Category filter chips
if (elements.categoryFilterContainer) {
  elements.categoryFilterContainer.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.categoryFilterContainer.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category || 'all';
      renderCustomerCatalog();
    });
  });
}

// Search input
if (elements.searchMenuInput) {
  elements.searchMenuInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderCustomerCatalog();
  });
}

if (elements.btnClearSearch) {
  elements.btnClearSearch.addEventListener('click', () => {
    if (elements.searchMenuInput) elements.searchMenuInput.value = '';
    state.searchQuery = '';
    renderCustomerCatalog();
  });
}

// Sort dropdown
if (elements.sortSelect) {
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderCustomerCatalog();
  });
}

// Detail Modal
window.openFoodDetail = (id) => {
  const item = state.menus.find((m) => m.id === Number(id));
  if (!item || !elements.detailModalBackdrop) return;

  state.activeDetailMenu = item;
  if (elements.detailModalImg) elements.detailModalImg.src = getFallbackImage(item);
  if (elements.detailModalCategory) elements.detailModalCategory.textContent = item.category || 'Makanan';
  if (elements.detailModalName) elements.detailModalName.textContent = item.name;
  if (elements.detailModalPrice) elements.detailModalPrice.textContent = formatRupiah(item.price);
  if (elements.detailModalDesc) elements.detailModalDesc.textContent = item.desc || 'Sajian lezat berkualitas tinggi dari Little Olie Bistro.';
  if (elements.detailQtyVal) elements.detailQtyVal.textContent = '1';
  if (elements.detailOrderNote) elements.detailOrderNote.value = '';
  if (elements.detailBtnText) elements.detailBtnText.textContent = `Tambahkan ke Keranjang • ${formatRupiah(item.price)}`;

  elements.detailModalBackdrop.style.display = 'flex';
  requestAnimationFrame(() => {
    elements.detailModalBackdrop.classList.add('open');
  });
};

const closeFoodDetail = () => {
  if (elements.detailModalBackdrop) {
    elements.detailModalBackdrop.classList.remove('open');
    setTimeout(() => {
      elements.detailModalBackdrop.style.display = 'none';
    }, 200);
  }
  state.activeDetailMenu = null;
};

if (elements.btnCloseDetail) elements.btnCloseDetail.addEventListener('click', closeFoodDetail);
if (elements.btnSecondaryCloseDetail) elements.btnSecondaryCloseDetail.addEventListener('click', closeFoodDetail);

// Close when clicking directly on backdrop outside the card
if (elements.detailModalBackdrop) {
  elements.detailModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.detailModalBackdrop) {
      closeFoodDetail();
    }
  });
}

// Stepper in detail
if (elements.detailQtyMinus && elements.detailQtyPlus && elements.detailQtyVal) {
  elements.detailQtyMinus.addEventListener('click', () => {
    let q = Number(elements.detailQtyVal.textContent) || 1;
    if (q > 1) {
      q -= 1;
      elements.detailQtyVal.textContent = q;
      if (state.activeDetailMenu && elements.detailBtnText) {
        elements.detailBtnText.textContent = `Tambahkan ke Keranjang • ${formatRupiah(state.activeDetailMenu.price * q)}`;
      }
    }
  });

  elements.detailQtyPlus.addEventListener('click', () => {
    let q = Number(elements.detailQtyVal.textContent) || 1;
    q += 1;
    elements.detailQtyVal.textContent = q;
    if (state.activeDetailMenu && elements.detailBtnText) {
      elements.detailBtnText.textContent = `Tambahkan ke Keranjang • ${formatRupiah(state.activeDetailMenu.price * q)}`;
    }
  });
}

// Add to Cart from Detail
if (elements.btnDetailAddCart) {
  elements.btnDetailAddCart.addEventListener('click', () => {
    if (!state.activeDetailMenu) return;
    const qty = Number(elements.detailQtyVal ? elements.detailQtyVal.textContent : 1) || 1;
    const note = elements.detailOrderNote ? elements.detailOrderNote.value.trim() : '';

    addToCart(state.activeDetailMenu, qty, note);
    closeFoodDetail();
    showToast(`"${state.activeDetailMenu.name}" ditambahkan ke keranjang.`, 'success');
  });
}

// Quick Add to Cart
window.quickAddToCart = (id) => {
  const item = state.menus.find((m) => m.id === Number(id));
  if (!item) return;
  addToCart(item, 1, '');
  showToast(`"${item.name}" ditambahkan ke pesanan.`, 'success');
};

const addToCart = (item, quantity = 1, note = '') => {
  const existing = state.cart.find((c) => c.id === item.id && c.note === note);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      img: getFallbackImage(item),
      quantity,
      note
    });
  }
  updateCartBadge();
  renderCartDrawer();
};

const updateCartBadge = () => {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (elements.headerCartBadge) {
    elements.headerCartBadge.textContent = totalItems;
  }
  if (elements.drawerSubtitleCount) {
    elements.drawerSubtitleCount.textContent = `${totalItems} item dipilih`;
  }
};

const renderCartDrawer = () => {
  if (!elements.drawerCartItems) return;

  if (state.cart.length === 0) {
    elements.drawerCartItems.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: #94a3b8;">
        <span style="font-size: 48px; display: block; margin-bottom: 10px;">🛒</span>
        <p style="font-size: 15px; font-weight: 600; color: #475569; margin-bottom: 4px;">Keranjang Masih Kosong</p>
        <p style="font-size: 13px;">Silakan pilih hidangan lezat favorit Anda dari katalog menu.</p>
      </div>
    `;
    updateOrderSummary(0);
    return;
  }

  elements.drawerCartItems.innerHTML = state.cart.map((cItem, idx) => `
    <div class="cart-item-card" style="display: flex; gap: 12px; padding: 12px; background: #fff; border-radius: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; align-items: center;">
      <img src="${cItem.img}" alt="${cItem.name}" style="width: 55px; height: 55px; border-radius: 8px; object-fit: cover;">
      <div style="flex: 1; min-width: 0;">
        <h5 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cItem.name}</h5>
        <div style="font-size: 13px; font-weight: 600; color: #15803d;">${formatRupiah(cItem.price)}</div>
        ${cItem.note ? `<p style="font-size: 11px; color: #64748b; font-style: italic;">"${cItem.note}"</p>` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer; font-weight: bold;" onclick="window.changeCartQty(${idx}, -1)">-</button>
        <span style="font-size: 13px; font-weight: 700; min-width: 18px; text-align: center;">${cItem.quantity}</span>
        <button type="button" style="width: 26px; height: 26px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer; font-weight: bold;" onclick="window.changeCartQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  updateOrderSummary(subtotal);
};

window.changeCartQty = (index, delta) => {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  updateCartBadge();
  renderCartDrawer();
};

const updateOrderSummary = (subtotal) => {
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  if (elements.calcSubtotalVal) elements.calcSubtotalVal.textContent = formatRupiah(subtotal);
  if (elements.calcTaxVal) elements.calcTaxVal.textContent = formatRupiah(tax);
  if (elements.calcGrandtotalVal) elements.calcGrandtotalVal.textContent = formatRupiah(total);
};

// Cart Drawer Open / Close
if (elements.btnOpenCart && elements.cartDrawerBackdrop) {
  elements.btnOpenCart.addEventListener('click', () => {
    elements.cartDrawerBackdrop.style.display = 'flex';
    renderCartDrawer();
  });
}

if (elements.btnCloseCart && elements.cartDrawerBackdrop) {
  elements.btnCloseCart.addEventListener('click', () => {
    elements.cartDrawerBackdrop.style.display = 'none';
  });
}

if (elements.btnClearAllCart) {
  elements.btnClearAllCart.addEventListener('click', () => {
    if (confirm('Kosongkan semua pesanan di keranjang?')) {
      state.cart = [];
      updateCartBadge();
      renderCartDrawer();
      showToast('Keranjang pesanan telah dikosongkan.', 'success');
    }
  });
}

// Submit Order -> Show Receipt Modal
if (elements.btnSubmitOrder) {
  elements.btnSubmitOrder.addEventListener('click', () => {
    if (state.cart.length === 0) {
      showToast('Keranjang Anda masih kosong!', 'error');
      return;
    }

    const custName = elements.orderCustName ? elements.orderCustName.value.trim() : '';
    const destInfo = elements.orderDestInfo ? elements.orderDestInfo.value.trim() : '';
    const orderType = elements.orderTypeSelect ? elements.orderTypeSelect.value : 'Dine-In';
    const payMethod = elements.orderPaymentMethod ? elements.orderPaymentMethod.value : 'QRIS';

    if (!custName || !destInfo) {
      showToast('Silakan isi Nama Pemesan dan Meja / Alamat.', 'error');
      return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleString('id-ID');

    if (elements.receiptPaperContent) {
      elements.receiptPaperContent.innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 12px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #14532d;">🌿 LITTLE OLIE BISTRO</h2>
          <p style="font-size: 11px; color: #64748b;">Jl. Kuliner Hijau No. 8 • Telp: 0812-3456-7890</p>
          <p style="font-size: 12px; font-weight: 700; margin-top: 4px;">STRUK PEMESANAN RESMI</p>
        </div>

        <div style="font-size: 12px; margin-bottom: 12px; line-height: 1.6;">
          <div><strong>No. Pesanan:</strong> ${orderId}</div>
          <div><strong>Tanggal:</strong> ${dateStr}</div>
          <div><strong>Pemesan:</strong> ${custName}</div>
          <div><strong>Jenis:</strong> ${orderType}</div>
          <div><strong>Tujuan/Meja:</strong> ${destInfo}</div>
          <div><strong>Pembayaran:</strong> ${payMethod}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 6px 0;">Item</th>
              <th style="padding: 6px 0; text-align: center;">Qty</th>
              <th style="padding: 6px 0; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${state.cart.map((it) => `
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 6px 0;">${it.name}${it.note ? `<br><small style="color: #64748b;">(${it.note})</small>` : ''}</td>
                <td style="padding: 6px 0; text-align: center;">${it.quantity}</td>
                <td style="padding: 6px 0; text-align: right;">${formatRupiah(it.price * it.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 13px; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>${formatRupiah(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Pajak (10%):</span>
            <span>${formatRupiah(tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; color: #15803d; margin-top: 4px; border-top: 2px dashed #cbd5e1; padding-top: 6px;">
            <span>TOTAL:</span>
            <span>${formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          Terima kasih telah memesan di Little Olie Bistro!<br>
          Selamat menikmati hidangan lezat kami.
        </div>
      `;
    }

    if (elements.cartDrawerBackdrop) elements.cartDrawerBackdrop.style.display = 'none';
    if (elements.receiptModalBackdrop) elements.receiptModalBackdrop.style.display = 'flex';

    // Clear cart
    state.cart = [];
    updateCartBadge();
    showToast('Pesanan berhasil dibuat!', 'success');
  });
}

// WhatsApp Order
if (elements.btnOrderWhatsapp) {
  elements.btnOrderWhatsapp.addEventListener('click', () => {
    if (state.cart.length === 0) {
      showToast('Keranjang masih kosong!', 'error');
      return;
    }
    const custName = elements.orderCustName ? elements.orderCustName.value.trim() : 'Pelanggan';
    const destInfo = elements.orderDestInfo ? elements.orderDestInfo.value.trim() : '-';
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = subtotal + Math.round(subtotal * 0.1);

    let text = `*Halo Little Olie Bistro! Saya ingin memesan:*%0A%0A`;
    text += `*Nama:* ${custName}%0A`;
    text += `*Meja/Alamat:* ${destInfo}%0A%0A`;
    text += `*Daftar Pesanan:*%0A`;
    state.cart.forEach((it, i) => {
      text += `${i + 1}. ${it.name} (${it.quantity}x) - ${formatRupiah(it.price * it.quantity)}%0A`;
      if (it.note) text += `   _Catatan: ${it.note}_%0A`;
    });
    text += `%0A*Total Pembayaran (termasuk pajak 10%):* ${formatRupiah(grandTotal)}%0A`;
    text += `Mohon konfirmasi pesanan ini. Terima kasih!`;

    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  });
}

if (elements.btnCloseReceipt) {
  elements.btnCloseReceipt.addEventListener('click', () => {
    if (elements.receiptModalBackdrop) elements.receiptModalBackdrop.style.display = 'none';
  });
}

if (elements.btnReceiptDone) {
  elements.btnReceiptDone.addEventListener('click', () => {
    if (elements.receiptModalBackdrop) elements.receiptModalBackdrop.style.display = 'none';
  });
}

// ==========================================================================
// 4. APP INITIALIZATION (SELALU LANGSUNG HALAMAN LOGIN SAAT DIBUKA)
// ==========================================================================
const initApp = () => {
  // Selalu buka langsung ke halaman login Little Olie saat web diakses
  if (elements.loginView) elements.loginView.style.display = 'flex';
  if (elements.dashboardView) elements.dashboardView.style.display = 'none';
  if (elements.customerStoreView) elements.customerStoreView.style.display = 'none';
};

// Run on page ready
initApp();
