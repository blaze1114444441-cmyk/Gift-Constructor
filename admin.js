/**
 * GiftConstructor — Admin Panel Controller (Practice #4)
 * 
 * Includes:
 * 1. Admin Authentication Gate (Password Protection & Session Management)
 * 2. Full Catalog CRUD (Create, Read, Update, Delete)
 * 3. Real-time Search, Multi-Filter & Sorting
 * 4. Redesigned Add/Edit Modal with Pinned Header/Footer and Independent Scrolling
 * 5. Body Scroll-Lock & Accessible Dialog Controls
 * 6. Responsive Data Table & Mobile Cards View
 * 7. Toast Notification System
 */

document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	/**
	 * =========================================================================
	 * ADMIN AUTHENTICATION CONFIGURATION
	 * =========================================================================
	 * Change DEFAULT_PASSWORD below to update the administrator password.
	 * NOTE: In this client-side prototype, authentication is verified locally.
	 * In a production server environment, authentication would be verified via
	 * secure server-side sessions/JWT tokens over HTTPS.
	 */
	const ADMIN_AUTH_CONFIG = {
		DEFAULT_PASSWORD: 'admin2026', // Default admin password
		SESSION_KEY: 'gift_admin_auth_session_active'
	};

	// 1. Dependency Check
	if (!window.GiftCatalogService) {
		console.error('[Admin] GiftCatalogService is missing. Make sure catalog-service.js is loaded.');
		return;
	}

	const service = window.GiftCatalogService;

	// 2. DOM Elements
	// Auth Elements
	const adminLoginView = document.getElementById('adminLoginView');
	const adminDashboardView = document.getElementById('adminDashboardView');
	const adminLoginForm = document.getElementById('adminLoginForm');
	const adminPasswordInput = document.getElementById('adminPasswordInput');
	const togglePasswordVisibilityBtn = document.getElementById('togglePasswordVisibilityBtn');
	const passwordToggleIcon = document.getElementById('passwordToggleIcon');
	const loginErrorBanner = document.getElementById('loginErrorBanner');
	const loginErrorMessage = document.getElementById('loginErrorMessage');
	const headerLogoutBtn = document.getElementById('headerLogoutBtn');
	const authProtectedElements = document.querySelectorAll('.auth-protected');

	// Dashboard Metrics
	const metricTotalGifts = document.getElementById('metricTotalGifts');
	const metricCategoriesCount = document.getElementById('metricCategoriesCount');
	const metricAvgPrice = document.getElementById('metricAvgPrice');
	const metricPriceRange = document.getElementById('metricPriceRange');

	// Toolbar & Filters
	const searchInput = document.getElementById('searchInput');
	const clearSearchBtn = document.getElementById('clearSearchBtn');
	const categoryFilter = document.getElementById('categoryFilter');
	const recipientFilter = document.getElementById('recipientFilter');
	const sortSelect = document.getElementById('sortSelect');
	const resetFiltersBtn = document.getElementById('resetFiltersBtn');
	const toolbarAddGiftBtn = document.getElementById('toolbarAddGiftBtn');
	const headerAddGiftBtn = document.getElementById('headerAddGiftBtn');
	const resetDemoCatalogBtn = document.getElementById('resetDemoCatalogBtn');
	const catalogCountStatus = document.getElementById('catalogCountStatus');

	// Views
	const catalogTableContainer = document.getElementById('catalogTableContainer');
	const catalogTableBody = document.getElementById('catalogTableBody');
	const catalogCardsContainer = document.getElementById('catalogCardsContainer');
	const emptyStateContainer = document.getElementById('emptyStateContainer');
	const emptyStateIcon = document.getElementById('emptyStateIcon');
	const emptyStateTitle = document.getElementById('emptyStateTitle');
	const emptyStateDesc = document.getElementById('emptyStateDesc');
	const emptyStateActions = document.getElementById('emptyStateActions');

	// Add/Edit Modal & Form
	const giftModalOverlay = document.getElementById('giftModalOverlay');
	const modalCloseBtn = document.getElementById('modalCloseBtn');
	const modalCancelBtn = document.getElementById('modalCancelBtn');
	const modalScrollBody = document.getElementById('modalScrollBody');
	const giftAdminForm = document.getElementById('giftAdminForm');
	const modalTitleIcon = document.getElementById('modalTitleIcon');
	const modalTitleText = document.getElementById('modalTitleText');
	const modalSubmitBtn = document.getElementById('modalSubmitBtn');
	const modalSubmitText = document.getElementById('modalSubmitText');

	// Form Inputs
	const formGiftId = document.getElementById('formGiftId');
	const formTitle = document.getElementById('formTitle');
	const formCategory = document.getElementById('formCategory');
	const formPrice = document.getElementById('formPrice');
	const formBadge = document.getElementById('formBadge');
	const formImg = document.getElementById('formImg');
	const formImgPreview = document.getElementById('formImgPreview');
	const previewStatusBadge = document.getElementById('previewStatusBadge');
	const formDesc = document.getElementById('formDesc');
	const descCharCounter = document.getElementById('descCharCounter');
	const formGeneralError = document.getElementById('formGeneralError');

	// Tag Groups
	const recipientsTagGroup = document.getElementById('recipientsTagGroup');
	const occasionsTagGroup = document.getElementById('occasionsTagGroup');
	const selectAllRecipientsBtn = document.getElementById('selectAllRecipientsBtn');
	const clearRecipientsBtn = document.getElementById('clearRecipientsBtn');
	const selectAllOccasionsBtn = document.getElementById('selectAllOccasionsBtn');
	const clearOccasionsBtn = document.getElementById('clearOccasionsBtn');

	// Quick Badge Chips
	const quickBadgeChips = document.querySelectorAll('.quick-badge-chip');

	// Form Field Errors
	const errorTitle = document.getElementById('errorTitle');
	const errorCategory = document.getElementById('errorCategory');
	const errorPrice = document.getElementById('errorPrice');
	const errorRecipients = document.getElementById('errorRecipients');
	const errorOccasions = document.getElementById('errorOccasions');
	const errorDesc = document.getElementById('errorDesc');

	// Delete Confirmation Modal
	const deleteModalOverlay = document.getElementById('deleteModalOverlay');
	const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
	const deleteModalCancelBtn = document.getElementById('deleteModalCancelBtn');
	const deleteModalConfirmBtn = document.getElementById('deleteModalConfirmBtn');
	const deletePreviewThumb = document.getElementById('deletePreviewThumb');
	const deletePreviewTitle = document.getElementById('deletePreviewTitle');
	const deletePreviewPrice = document.getElementById('deletePreviewPrice');

	// Toast Container
	const toastContainer = document.getElementById('toastContainer');

	// State
	let currentFilterCategory = '';
	let currentFilterRecipient = '';
	let currentSearchQuery = '';
	let currentSort = 'id-desc';
	let pendingDeleteId = null;

	// --------------------------------------------------------------------------
	// 3. Authentication & Access Control
	// --------------------------------------------------------------------------
	function isAuthenticated() {
		try {
			return sessionStorage.getItem(ADMIN_AUTH_CONFIG.SESSION_KEY) === 'true';
		} catch (e) {
			return false;
		}
	}

	function setAuthenticated(status) {
		try {
			if (status) {
				sessionStorage.setItem(ADMIN_AUTH_CONFIG.SESSION_KEY, 'true');
			} else {
				sessionStorage.removeItem(ADMIN_AUTH_CONFIG.SESSION_KEY);
			}
		} catch (e) {
			console.warn('[Admin] sessionStorage not accessible:', e);
		}
	}

	function updateAuthView() {
		const isAuth = isAuthenticated();

		if (isAuth) {
			// Show dashboard
			adminLoginView.style.display = 'none';
			adminDashboardView.style.display = 'block';
			authProtectedElements.forEach(el => el.style.display = '');

			// Initialize dashboard data
			initSelectors();
			renderCatalog();
		} else {
			// Show login screen
			adminDashboardView.style.display = 'none';
			adminLoginView.style.display = 'flex';
			authProtectedElements.forEach(el => el.style.display = 'none');

			// Reset login form
			if (adminPasswordInput) {
				adminPasswordInput.value = '';
				adminPasswordInput.type = 'password';
				passwordToggleIcon.textContent = '👁️';
				setTimeout(() => adminPasswordInput.focus(), 100);
			}
			if (loginErrorBanner) {
				loginErrorBanner.style.display = 'none';
			}
		}
	}

	// Login Form Handler
	if (adminLoginForm) {
		adminLoginForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const enteredPassword = adminPasswordInput.value;

			if (!enteredPassword) {
				loginErrorMessage.textContent = 'Будь ласка, введіть пароль для входу.';
				loginErrorBanner.style.display = 'flex';
				adminPasswordInput.focus();
				return;
			}

			// Validate against configured password
			if (enteredPassword === ADMIN_AUTH_CONFIG.DEFAULT_PASSWORD) {
				setAuthenticated(true);
				loginErrorBanner.style.display = 'none';
				updateAuthView();
				showToast('success', 'Успішний вхід', 'Ласкаво просимо до панелі адміністратора!');
			} else {
				loginErrorMessage.textContent = 'Невірний пароль адміністратора. Перевірте введення та спробуйте ще раз.';
				loginErrorBanner.style.display = 'flex';
				// Trigger shake animation re-flow
				loginErrorBanner.classList.remove('login-error-banner');
				void loginErrorBanner.offsetWidth;
				loginErrorBanner.classList.add('login-error-banner');

				adminPasswordInput.select();
				adminPasswordInput.focus();
			}
		});
	}

	// Show/Hide Password Toggle
	if (togglePasswordVisibilityBtn && adminPasswordInput) {
		togglePasswordVisibilityBtn.addEventListener('click', () => {
			const isPassword = adminPasswordInput.type === 'password';
			adminPasswordInput.type = isPassword ? 'text' : 'password';
			passwordToggleIcon.textContent = isPassword ? '🙈' : '👁️';
			adminPasswordInput.focus();
		});
	}

	// Logout Handler
	if (headerLogoutBtn) {
		headerLogoutBtn.addEventListener('click', () => {
			setAuthenticated(false);
			updateAuthView();
			showToast('info', 'Сесію завершено', 'Ви успішно вийшли з панелі адміністратора.');
		});
	}

	// --------------------------------------------------------------------------
	// 4. Toast Notifications System
	// --------------------------------------------------------------------------
	function showToast(type, title, message) {
		const toast = document.createElement('div');
		toast.className = `toast-item toast-${type}`;
		toast.setAttribute('role', 'alert');

		let icon = 'ℹ️';
		if (type === 'success') icon = '✅';
		else if (type === 'error') icon = '⚠️';

		toast.innerHTML = `
			<span class="toast-icon">${icon}</span>
			<div class="toast-content">
				<div class="toast-title">${service.escapeHtml(title)}</div>
				<div class="toast-message">${service.escapeHtml(message)}</div>
			</div>
			<button type="button" class="toast-close" aria-label="Закрити сповіщення">✕</button>
		`;

		const closeBtn = toast.querySelector('.toast-close');
		const removeToast = () => {
			toast.classList.add('toast-hiding');
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 300);
		};

		closeBtn.addEventListener('click', removeToast);
		setTimeout(removeToast, 4000);

		toastContainer.appendChild(toast);
	}

	// --------------------------------------------------------------------------
	// 5. Selectors & Tag Groups Population
	// --------------------------------------------------------------------------
	function initSelectors() {
		// Populate Recipients Checkboxes
		recipientsTagGroup.innerHTML = service.AVAILABLE_RECIPIENTS.map(rec => `
			<label class="tag-checkbox-label" data-value="${service.escapeHtml(rec)}">
				<input type="checkbox" name="recipients" value="${service.escapeHtml(rec)}">
				<span>${service.escapeHtml(rec)}</span>
			</label>
		`).join('');

		// Populate Occasions Checkboxes
		occasionsTagGroup.innerHTML = service.AVAILABLE_OCCASIONS.map(occ => `
			<label class="tag-checkbox-label" data-value="${service.escapeHtml(occ)}">
				<input type="checkbox" name="occasions" value="${service.escapeHtml(occ)}">
				<span>${service.escapeHtml(occ)}</span>
			</label>
		`).join('');

		// Add change event listener for active style toggle
		const allTagLabels = document.querySelectorAll('.tag-checkbox-label');
		allTagLabels.forEach(label => {
			const checkbox = label.querySelector('input[type="checkbox"]');
			checkbox.addEventListener('change', () => {
				label.classList.toggle('checked', checkbox.checked);
			});
		});

		// Populate Filter Dropdowns
		updateFilterDropdowns();
	}

	function updateFilterDropdowns() {
		const catalog = service.getCatalog();

		// Unique categories
		const categoriesSet = new Set(service.AVAILABLE_CATEGORIES);
		catalog.forEach(g => {
			if (g.category) categoriesSet.add(g.category);
		});

		const prevCat = categoryFilter.value;
		categoryFilter.innerHTML = '<option value="">Усі категорії</option>' + 
			Array.from(categoriesSet).map(c => `
				<option value="${service.escapeHtml(c)}">${service.escapeHtml(c)}</option>
			`).join('');
		categoryFilter.value = prevCat;

		// Recipients in filter
		const prevRec = recipientFilter.value;
		recipientFilter.innerHTML = '<option value="">Усі отримувачі</option>' +
			service.AVAILABLE_RECIPIENTS.map(r => `
				<option value="${service.escapeHtml(r)}">${service.escapeHtml(r)}</option>
			`).join('');
		recipientFilter.value = prevRec;
	}

	// Quick Select / Clear buttons for tags
	selectAllRecipientsBtn.addEventListener('click', () => {
		recipientsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			cb.checked = true;
			cb.closest('.tag-checkbox-label').classList.add('checked');
		});
		clearFieldError(errorRecipients);
	});

	clearRecipientsBtn.addEventListener('click', () => {
		recipientsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			cb.checked = false;
			cb.closest('.tag-checkbox-label').classList.remove('checked');
		});
	});

	selectAllOccasionsBtn.addEventListener('click', () => {
		occasionsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			cb.checked = true;
			cb.closest('.tag-checkbox-label').classList.add('checked');
		});
		clearFieldError(errorOccasions);
	});

	clearOccasionsBtn.addEventListener('click', () => {
		occasionsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			cb.checked = false;
			cb.closest('.tag-checkbox-label').classList.remove('checked');
		});
	});

	// Quick Badge Chips Click
	quickBadgeChips.forEach(chip => {
		chip.addEventListener('click', () => {
			const badgeText = chip.getAttribute('data-badge');
			formBadge.value = badgeText;
			formBadge.focus();
		});
	});

	// Character counter for description
	formDesc.addEventListener('input', () => {
		const len = formDesc.value.length;
		descCharCounter.textContent = `${len} / 500`;
		if (len >= 500) {
			descCharCounter.style.color = 'var(--color-error)';
		} else {
			descCharCounter.style.color = 'var(--color-text-muted)';
		}
	});

	// --------------------------------------------------------------------------
	// 6. Image Preview Handling
	// --------------------------------------------------------------------------
	function updateImagePreview() {
		const val = formImg.value.trim();
		if (val) {
			formImgPreview.src = val;
			previewStatusBadge.textContent = '🟢 Власне фото за посиланням';
			previewStatusBadge.style.color = 'var(--color-success)';
		} else {
			formImgPreview.src = 'assets/images/celebration.jpg';
			previewStatusBadge.textContent = '💡 Буде використано тематичне фото';
			previewStatusBadge.style.color = 'var(--color-text-muted)';
		}
	}

	formImg.addEventListener('input', updateImagePreview);

	formImgPreview.addEventListener('error', () => {
		formImgPreview.src = 'assets/images/celebration.jpg';
		previewStatusBadge.textContent = '⚠️ Помилка завантаження фото (використано запасне)';
		previewStatusBadge.style.color = 'var(--color-error)';
	});

	// --------------------------------------------------------------------------
	// 7. Metrics Calculation
	// --------------------------------------------------------------------------
	function updateMetrics(catalog) {
		const total = catalog.length;
		metricTotalGifts.textContent = total;

		if (total === 0) {
			metricCategoriesCount.textContent = '0';
			metricAvgPrice.textContent = '0 грн';
			metricPriceRange.textContent = '0 грн';
			return;
		}

		const categories = new Set(catalog.map(g => g.category));
		metricCategoriesCount.textContent = categories.size;

		const prices = catalog.map(g => Number(g.price) || 0);
		const sum = prices.reduce((acc, p) => acc + p, 0);
		const avg = Math.round(sum / total);
		const min = Math.min(...prices);
		const max = Math.max(...prices);

		metricAvgPrice.textContent = `${avg.toLocaleString('uk-UA')} грн`;
		metricPriceRange.textContent = `${min.toLocaleString('uk-UA')} – ${max.toLocaleString('uk-UA')} грн`;
	}

	// --------------------------------------------------------------------------
	// 8. Filtering & Sorting Logic
	// --------------------------------------------------------------------------
	function getFilteredCatalog() {
		const rawCatalog = service.getCatalog();

		return rawCatalog.filter(gift => {
			// Search Query Filter
			if (currentSearchQuery) {
				const query = currentSearchQuery.toLowerCase();
				const matchTitle = (gift.title || '').toLowerCase().includes(query);
				const matchDesc = (gift.desc || '').toLowerCase().includes(query);
				const matchCategory = (gift.category || '').toLowerCase().includes(query);
				const matchBadge = (gift.badge || '').toLowerCase().includes(query);
				if (!matchTitle && !matchDesc && !matchCategory && !matchBadge) {
					return false;
				}
			}

			// Category Filter
			if (currentFilterCategory && gift.category !== currentFilterCategory) {
				return false;
			}

			// Recipient Filter
			if (currentFilterRecipient) {
				const rList = Array.isArray(gift.recipients) ? gift.recipients : [];
				if (!rList.includes(currentFilterRecipient) && !rList.includes('all')) {
					return false;
				}
			}

			return true;
		}).sort((a, b) => {
			switch (currentSort) {
				case 'id-asc':
					return Number(a.id) - Number(b.id);
				case 'price-asc':
					return (Number(a.price) || 0) - (Number(b.price) || 0);
				case 'price-desc':
					return (Number(b.price) || 0) - (Number(a.price) || 0);
				case 'title-asc':
					return (a.title || '').localeCompare(b.title || '', 'uk');
				case 'title-desc':
					return (b.title || '').localeCompare(a.title || '', 'uk');
				case 'id-desc':
				default:
					return Number(b.id) - Number(a.id);
			}
		});
	}

	// --------------------------------------------------------------------------
	// 9. Render Catalog (Table & Mobile Cards)
	// --------------------------------------------------------------------------
	function renderCatalog() {
		const fullCatalog = service.getCatalog();
		updateMetrics(fullCatalog);

		const filtered = getFilteredCatalog();
		const totalCount = fullCatalog.length;
		const filteredCount = filtered.length;

		// Update Count Status
		if (totalCount === 0) {
			catalogCountStatus.textContent = 'У каталозі немає жодного подарунка';
		} else if (filteredCount === totalCount) {
			catalogCountStatus.textContent = `Показано всі ${totalCount} подарунків`;
		} else {
			catalogCountStatus.textContent = `Показано ${filteredCount} з ${totalCount} подарунків`;
		}

		// Handle Empty State
		if (totalCount === 0) {
			catalogTableContainer.style.display = 'none';
			catalogCardsContainer.style.display = 'none';
			emptyStateContainer.style.display = 'flex';
			emptyStateIcon.textContent = '🎁';
			emptyStateTitle.textContent = 'Каталог подарунків порожній';
			emptyStateDesc.textContent = 'У вашому каталозі зараз немає товарів. Ви можете додати новий подарунок або відновити початкову демонстраційну базу.';
			emptyStateActions.innerHTML = `
				<button type="button" class="btn btn-primary btn-sm" id="emptyAddBtn">➕ Додати перший подарунок</button>
				<button type="button" class="btn btn-outline btn-sm" id="emptyRestoreBtn">⚙️ Відновити демо-каталог</button>
			`;
			document.getElementById('emptyAddBtn').addEventListener('click', openAddModal);
			document.getElementById('emptyRestoreBtn').addEventListener('click', handleResetDemo);
			return;
		}

		if (filteredCount === 0) {
			catalogTableContainer.style.display = 'none';
			catalogCardsContainer.style.display = 'none';
			emptyStateContainer.style.display = 'flex';
			emptyStateIcon.textContent = '🔍';
			emptyStateTitle.textContent = 'Нічого не знайдено за запитом';
			emptyStateDesc.textContent = currentSearchQuery 
				? `За запитом «${currentSearchQuery}» відповідностей не виявлено. Перевірте написання або скиньте фільтри.`
				: 'За вибраними критеріями фільтрації подарунків не знайдено.';
			emptyStateActions.innerHTML = `
				<button type="button" class="btn btn-secondary btn-sm" id="emptyResetSearchBtn">🔄 Скинути фільтри та пошук</button>
			`;
			document.getElementById('emptyResetSearchBtn').addEventListener('click', resetAllFilters);
			return;
		}

		// Show tables/cards
		emptyStateContainer.style.display = 'none';
		catalogTableContainer.style.display = '';
		catalogCardsContainer.style.display = '';

		// 1. Render Table Rows
		catalogTableBody.innerHTML = filtered.map(gift => {
			const recipients = Array.isArray(gift.recipients) ? gift.recipients : [];
			const occasions = Array.isArray(gift.occasions) ? gift.occasions : [];
			const thumbImg = gift.img || 'assets/images/celebration.jpg';

			return `
				<tr data-gift-id="${gift.id}">
					<td class="col-img">
						<img src="${service.escapeHtml(thumbImg)}" alt="${service.escapeHtml(gift.title)}" class="thumb-preview" loading="lazy" onerror="this.onerror=null;this.src='assets/images/celebration.jpg';">
					</td>
					<td class="col-details">
						${gift.badge ? `<span class="item-badge-pill">${service.escapeHtml(gift.badge)}</span>` : ''}
						<div class="item-title">${service.escapeHtml(gift.title)}</div>
						<div class="item-desc-snippet">${service.escapeHtml(gift.desc || '')}</div>
					</td>
					<td>
						<span class="category-tag">${service.escapeHtml(gift.category)}</span>
					</td>
					<td>
						<div class="pills-group">
							${recipients.map(r => `<span class="pill-sm">${service.escapeHtml(r)}</span>`).join('')}
						</div>
					</td>
					<td>
						<div class="pills-group">
							${occasions.map(o => `<span class="pill-sm pill-occasion">${service.escapeHtml(o)}</span>`).join('')}
						</div>
					</td>
					<td>
						<div class="price-text">${Number(gift.price).toLocaleString('uk-UA')} грн</div>
					</td>
					<td class="actions-cell">
						<div class="action-buttons">
							<button type="button" class="btn-icon-action btn-action-edit" data-id="${gift.id}" title="Редагувати подарунок">
								<span>✏️</span>
								<span>Змінити</span>
							</button>
							<button type="button" class="btn-icon-action btn-icon-delete btn-action-delete" data-id="${gift.id}" title="Видалити подарунок">
								<span>🗑️</span>
								<span>Видалити</span>
							</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');

		// 2. Render Mobile Cards
		catalogCardsContainer.innerHTML = filtered.map(gift => {
			const recipients = Array.isArray(gift.recipients) ? gift.recipients : [];
			const occasions = Array.isArray(gift.occasions) ? gift.occasions : [];
			const thumbImg = gift.img || 'assets/images/celebration.jpg';

			return `
				<article class="admin-card-item" data-gift-id="${gift.id}">
					<div class="admin-card-top">
						<img src="${service.escapeHtml(thumbImg)}" alt="${service.escapeHtml(gift.title)}" class="admin-card-thumb" loading="lazy" onerror="this.onerror=null;this.src='assets/images/celebration.jpg';">
						<div class="admin-card-meta">
							${gift.badge ? `<span class="item-badge-pill">${service.escapeHtml(gift.badge)}</span>` : ''}
							<h3 class="item-title">${service.escapeHtml(gift.title)}</h3>
							<span class="category-tag">${service.escapeHtml(gift.category)}</span>
						</div>
					</div>
					<p class="item-desc-snippet">${service.escapeHtml(gift.desc || '')}</p>
					<div>
						<div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.25rem;">Отримувачі:</div>
						<div class="pills-group" style="max-width: 100%;">
							${recipients.map(r => `<span class="pill-sm">${service.escapeHtml(r)}</span>`).join('')}
						</div>
					</div>
					<div>
						<div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.25rem;">Події:</div>
						<div class="pills-group" style="max-width: 100%;">
							${occasions.map(o => `<span class="pill-sm pill-occasion">${service.escapeHtml(o)}</span>`).join('')}
						</div>
					</div>
					<div class="admin-card-footer">
						<div class="price-text">${Number(gift.price).toLocaleString('uk-UA')} грн</div>
						<div class="action-buttons">
							<button type="button" class="btn-icon-action btn-action-edit" data-id="${gift.id}">
								<span>✏️</span>
								<span>Змінити</span>
							</button>
							<button type="button" class="btn-icon-action btn-icon-delete btn-action-delete" data-id="${gift.id}">
								<span>🗑️</span>
								<span>Видалити</span>
							</button>
						</div>
					</div>
				</article>
			`;
		}).join('');

		// Attach Edit and Delete listeners
		attachItemActionListeners();
	}

	function attachItemActionListeners() {
		document.querySelectorAll('.btn-action-edit').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const id = e.currentTarget.getAttribute('data-id');
				openEditModal(id);
			});
		});

		document.querySelectorAll('.btn-action-delete').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const id = e.currentTarget.getAttribute('data-id');
				openDeleteModal(id);
			});
		});
	}

	// --------------------------------------------------------------------------
	// 10. Search & Filter Handlers
	// --------------------------------------------------------------------------
	searchInput.addEventListener('input', () => {
		currentSearchQuery = searchInput.value.trim();
		clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
		renderCatalog();
	});

	clearSearchBtn.addEventListener('click', () => {
		searchInput.value = '';
		currentSearchQuery = '';
		clearSearchBtn.style.display = 'none';
		searchInput.focus();
		renderCatalog();
	});

	categoryFilter.addEventListener('change', () => {
		currentFilterCategory = categoryFilter.value;
		renderCatalog();
	});

	recipientFilter.addEventListener('change', () => {
		currentFilterRecipient = recipientFilter.value;
		renderCatalog();
	});

	sortSelect.addEventListener('change', () => {
		currentSort = sortSelect.value;
		renderCatalog();
	});

	function resetAllFilters() {
		searchInput.value = '';
		currentSearchQuery = '';
		clearSearchBtn.style.display = 'none';
		categoryFilter.value = '';
		currentFilterCategory = '';
		recipientFilter.value = '';
		currentFilterRecipient = '';
		sortSelect.value = 'id-desc';
		currentSort = 'id-desc';
		renderCatalog();
		showToast('info', 'Фільтри скинуто', 'Відображається повний каталог подарунків.');
	}

	resetFiltersBtn.addEventListener('click', resetAllFilters);

	// --------------------------------------------------------------------------
	// 11. Modal Controls & Body Scroll Lock
	// --------------------------------------------------------------------------
	function clearFormErrors() {
		formGeneralError.style.display = 'none';
		formGeneralError.textContent = '';

		[errorTitle, errorCategory, errorPrice, errorRecipients, errorOccasions, errorDesc].forEach(el => {
			if (el) {
				el.classList.remove('visible');
				el.textContent = '';
			}
		});

		[formTitle, formCategory, formPrice, formDesc].forEach(el => {
			if (el) el.classList.remove('input-has-error');
		});
	}

	function showFieldError(el, errorElement, msg) {
		if (el) el.classList.add('input-has-error');
		if (errorElement) {
			errorElement.textContent = msg;
			errorElement.classList.add('visible');
		}
	}

	function clearFieldError(errorElement, inputEl) {
		if (inputEl) inputEl.classList.remove('input-has-error');
		if (errorElement) {
			errorElement.classList.remove('visible');
			errorElement.textContent = '';
		}
	}

	// Realtime field error clearing
	formTitle.addEventListener('input', () => clearFieldError(errorTitle, formTitle));
	formCategory.addEventListener('change', () => clearFieldError(errorCategory, formCategory));
	formPrice.addEventListener('input', () => clearFieldError(errorPrice, formPrice));
	formDesc.addEventListener('input', () => clearFieldError(errorDesc, formDesc));

	function openAddModal() {
		clearFormErrors();
		giftAdminForm.reset();
		formGiftId.value = '';
		descCharCounter.textContent = '0 / 500';

		modalTitleIcon.textContent = '➕';
		modalTitleText.textContent = 'Додати новий подарунок';
		modalSubmitText.textContent = 'Зберегти подарунок';
		updateImagePreview();

		// Uncheck all tags
		document.querySelectorAll('.tag-checkbox-label').forEach(label => {
			label.classList.remove('checked');
			const cb = label.querySelector('input[type="checkbox"]');
			if (cb) cb.checked = false;
		});

		// Lock body scroll and open modal
		document.body.classList.add('modal-open');
		giftModalOverlay.classList.add('active');
		if (modalScrollBody) modalScrollBody.scrollTop = 0;
		formTitle.focus();
	}

	function openEditModal(id) {
		clearFormErrors();
		const gift = service.getGiftById(id);
		if (!gift) {
			showToast('error', 'Помилка', 'Не вдалося знайти обраний подарунок.');
			return;
		}

		formGiftId.value = gift.id;
		formTitle.value = gift.title || '';
		formCategory.value = gift.category || '';
		formPrice.value = gift.price || '';
		formBadge.value = gift.badge || '';
		formImg.value = gift.img || '';
		formDesc.value = gift.desc || '';
		descCharCounter.textContent = `${(gift.desc || '').length} / 500`;

		updateImagePreview();

		// Check recipients
		const recipients = Array.isArray(gift.recipients) ? gift.recipients : [];
		recipientsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			const isChecked = recipients.includes(cb.value) || recipients.includes('all');
			cb.checked = isChecked;
			cb.closest('.tag-checkbox-label').classList.toggle('checked', isChecked);
		});

		// Check occasions
		const occasions = Array.isArray(gift.occasions) ? gift.occasions : [];
		occasionsTagGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			const isChecked = occasions.includes(cb.value) || occasions.includes('all');
			cb.checked = isChecked;
			cb.closest('.tag-checkbox-label').classList.toggle('checked', isChecked);
		});

		modalTitleIcon.textContent = '✏️';
		modalTitleText.textContent = `Редагування: ${gift.title}`;
		modalSubmitText.textContent = 'Оновити подарунок';

		// Lock body scroll and open modal
		document.body.classList.add('modal-open');
		giftModalOverlay.classList.add('active');
		if (modalScrollBody) modalScrollBody.scrollTop = 0;
		formTitle.focus();
	}

	function closeGiftModal() {
		giftModalOverlay.classList.remove('active');
		document.body.classList.remove('modal-open');
		clearFormErrors();
	}

	modalCloseBtn.addEventListener('click', closeGiftModal);
	modalCancelBtn.addEventListener('click', closeGiftModal);

	toolbarAddGiftBtn.addEventListener('click', openAddModal);
	headerAddGiftBtn.addEventListener('click', openAddModal);

	// --------------------------------------------------------------------------
	// 12. Form Submission & Validation (CRUD: Add / Update)
	// --------------------------------------------------------------------------
	giftAdminForm.addEventListener('submit', (e) => {
		e.preventDefault();
		clearFormErrors();

		// Prevent duplicate submission
		modalSubmitBtn.disabled = true;

		// Extract form data
		const isEdit = Boolean(formGiftId.value);
		const editId = formGiftId.value;

		const selectedRecipients = Array.from(
			recipientsTagGroup.querySelectorAll('input[name="recipients"]:checked')
		).map(cb => cb.value);

		const selectedOccasions = Array.from(
			occasionsTagGroup.querySelectorAll('input[name="occasions"]:checked')
		).map(cb => cb.value);

		const formData = {
			title: formTitle.value.trim(),
			category: formCategory.value,
			price: formPrice.value.trim(),
			badge: formBadge.value.trim(),
			img: formImg.value.trim(),
			recipients: selectedRecipients,
			occasions: selectedOccasions,
			desc: formDesc.value.trim()
		};

		// Validate using service
		const validation = service.validateGiftData(formData);

		if (!validation.isValid) {
			modalSubmitBtn.disabled = false;

			if (validation.errors.title) showFieldError(formTitle, errorTitle, validation.errors.title);
			if (validation.errors.category) showFieldError(formCategory, errorCategory, validation.errors.category);
			if (validation.errors.price) showFieldError(formPrice, errorPrice, validation.errors.price);
			if (validation.errors.recipients) showFieldError(null, errorRecipients, validation.errors.recipients);
			if (validation.errors.occasions) showFieldError(null, errorOccasions, validation.errors.occasions);
			if (validation.errors.desc) showFieldError(formDesc, errorDesc, validation.errors.desc);

			showToast('error', 'Помилка валідації', 'Будь ласка, виправте виділені поля форми.');
			return;
		}

		// Save via service
		let result;
		if (isEdit) {
			result = service.updateGift(editId, formData);
		} else {
			result = service.addGift(formData);
		}

		modalSubmitBtn.disabled = false;

		if (result && result.success) {
			closeGiftModal();
			updateFilterDropdowns();
			renderCatalog();

			if (isEdit) {
				showToast('success', 'Зміни збережено', `Подарунок «${result.gift.title}» успішно оновлено!`);
			} else {
				showToast('success', 'Подарунок додано', `Новий подарунок «${result.gift.title}» додано до каталогу!`);
			}
		} else {
			const errorMsg = result && result.errors 
				? Object.values(result.errors).join(' ') 
				: 'Не вдалося зберегти подарунок у сховищі.';
			formGeneralError.textContent = errorMsg;
			formGeneralError.style.display = 'block';
			showToast('error', 'Помилка збереження', errorMsg);
		}
	});

	// --------------------------------------------------------------------------
	// 13. Delete Modal & Confirmation (CRUD: Delete)
	// --------------------------------------------------------------------------
	function openDeleteModal(id) {
		const gift = service.getGiftById(id);
		if (!gift) {
			showToast('error', 'Помилка', 'Подарунок не знайдено.');
			return;
		}

		pendingDeleteId = id;
		deletePreviewTitle.textContent = gift.title;
		deletePreviewPrice.textContent = `${Number(gift.price).toLocaleString('uk-UA')} грн`;
		deletePreviewThumb.src = gift.img || 'assets/images/celebration.jpg';

		document.body.classList.add('modal-open');
		deleteModalOverlay.classList.add('active');
		deleteModalConfirmBtn.focus();
	}

	function closeDeleteModal() {
		deleteModalOverlay.classList.remove('active');
		document.body.classList.remove('modal-open');
		pendingDeleteId = null;
	}

	deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
	deleteModalCancelBtn.addEventListener('click', closeDeleteModal);

	deleteModalConfirmBtn.addEventListener('click', () => {
		if (!pendingDeleteId) return;

		const targetGift = service.getGiftById(pendingDeleteId);
		const targetTitle = targetGift ? targetGift.title : 'Подарунок';

		const res = service.deleteGift(pendingDeleteId);
		closeDeleteModal();

		if (res.success) {
			updateFilterDropdowns();
			renderCatalog();
			showToast('success', 'Подарунок видалено', `Подарунок «${targetTitle}» видалено з каталогу.`);
		} else {
			showToast('error', 'Помилка видалення', res.message || 'Не вдалося видалити подарунок.');
		}
	});

	// --------------------------------------------------------------------------
	// 14. Reset to Demo Catalog
	// --------------------------------------------------------------------------
	function handleResetDemo() {
		if (confirm('Ви впевнені, що хочете скинути каталог до початкових 18 демонстраційних подарунків? Усі ваші додані чи змінені товари будуть перезаписані.')) {
			service.resetToDefaultCatalog();
			updateFilterDropdowns();
			resetAllFilters();
			showToast('info', 'Демо-каталог відновлено', 'Базу подарунків повернуто до 18 початкових ідей.');
		}
	}

	resetDemoCatalogBtn.addEventListener('click', handleResetDemo);

	// --------------------------------------------------------------------------
	// 15. Keyboard Accessibility & Global Event Handlers
	// --------------------------------------------------------------------------
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (giftModalOverlay.classList.contains('active')) {
				closeGiftModal();
			} else if (deleteModalOverlay.classList.contains('active')) {
				closeDeleteModal();
			}
		}
	});

	// Close on backdrop click
	giftModalOverlay.addEventListener('click', (e) => {
		if (e.target === giftModalOverlay) closeGiftModal();
	});

	deleteModalOverlay.addEventListener('click', (e) => {
		if (e.target === deleteModalOverlay) closeDeleteModal();
	});

	// Cross-tab synchronization
	window.addEventListener('storage', (e) => {
		if (e.key === service.STORAGE_KEY) {
			updateFilterDropdowns();
			renderCatalog();
		}
	});

	// --------------------------------------------------------------------------
	// 16. Initialize Application
	// --------------------------------------------------------------------------
	updateAuthView();
});
