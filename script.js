/**
 * Конструктор подарунків — Сценарій роботи (Practice #4)
 * 
 * Включає:
 * 1. Підключення централізованого сервісу каталогу (localStorage persistence)
 * 2. Оновлену розширену базу подарунків із РЕАЛЬНИМИ фіксованими цінами (грн)
 * 3. Розумну фільтрацію за бюджетом (бюджет як обмеження, а не множник)
 * 4. Нативну валідацію форми
 * 5. Мобільне меню та плавну навігацію
 * 6. Рендеринг сітки подарункових карток однакової висоти
 * 7. Автоматичну синхронізацію з оновленнями з Адмін-панелі
 */

document.addEventListener('DOMContentLoaded', () => {
	// 1. Елементи DOM
	const form = document.getElementById('giftForm');
	const recipientSelect = document.getElementById('recipientSelect');
	const occasionSelect = document.getElementById('occasionSelect');
	const budgetInput = document.getElementById('budgetInput');
	const categorySelect = document.getElementById('categorySelect');

	const rezultatContainer = document.getElementById('rezultatContainer');
	const emptyStateContent = document.getElementById('emptyStateContent');
	const resultsGrid = document.getElementById('resultsGrid');

	const navToggleBtn = document.getElementById('navToggleBtn');
	const mainNav = document.getElementById('mainNav');

	// 2. Мобільна навігація
	if (navToggleBtn && mainNav) {
		navToggleBtn.addEventListener('click', () => {
			const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
			navToggleBtn.setAttribute('aria-expanded', !isExpanded);
			mainNav.classList.toggle('active');
		});

		// Закривати меню при кліку на посилання
		document.querySelectorAll('.nav-link').forEach(link => {
			link.addEventListener('click', () => {
				mainNav.classList.remove('active');
				navToggleBtn.setAttribute('aria-expanded', 'false');
			});
		});
	}

	// 3. Доступ до каталогу подарунків через централізований сервіс
	function getActiveCatalog() {
		if (window.GiftCatalogService && typeof window.GiftCatalogService.getCatalog === 'function') {
			return window.GiftCatalogService.getCatalog();
		}
		return [];
	}

	// Безпечне екранування тексту
	function escapeHtml(str) {
		if (window.GiftCatalogService && typeof window.GiftCatalogService.escapeHtml === 'function') {
			return window.GiftCatalogService.escapeHtml(str);
		}
		if (str === null || str === undefined) return '';
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	// 4. Алгоритм підбору подарунків (з урахуванням РЕАЛЬНОГО БЮДЖЕТУ)
	function filterGifts(recipient, occasion, maxBudget, selectedCategory) {
		const currentCatalog = getActiveCatalog();

		return currentCatalog.filter(gift => {
			// Перевірка ціни (Бюджет — це ВЕРХНЯ МЕЖА, а не множник!)
			if (gift.price > maxBudget) {
				return false;
			}

			// Перевірка отримувача
			const recipientsList = Array.isArray(gift.recipients) ? gift.recipients : [];
			const matchRecipient = recipientsList.includes(recipient) || recipientsList.includes("all");
			if (!matchRecipient) {
				return false;
			}

			// Перевірка події
			const occasionsList = Array.isArray(gift.occasions) ? gift.occasions : [];
			const matchOccasion = occasionsList.includes(occasion) || occasionsList.includes("all");
			if (!matchOccasion) {
				return false;
			}

			// Перевірка категорії (якщо обрана)
			if (selectedCategory && gift.category !== selectedCategory) {
				return false;
			}

			return true;
		}).sort((a, b) => b.price - a.price); // Сортуємо: найбільш цінні подарунки в рамках бюджету першими
	}

	// 5. Обробка відправки форми (Нативна валідація HTML5)
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();

			// Перевірка нативної валідності браузера
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}

			const recipient = recipientSelect.value;
			const occasion = occasionSelect.value;
			const maxBudget = parseFloat(budgetInput.value);
			const category = categorySelect ? categorySelect.value : '';

			renderResults(recipient, occasion, maxBudget, category);
		});
	}

	// 6. Рендеринг карток подарунків
	function renderResults(recipient, occasion, maxBudget, category) {
		const currentCatalog = getActiveCatalog();
		let matches = filterGifts(recipient, occasion, maxBudget, category);

		// Якщо за точними критеріями не знайдено — шукаємо будь-які подарунки в рамках бюджету для цього отримувача
		if (matches.length === 0) {
			matches = currentCatalog.filter(gift => {
				const rList = Array.isArray(gift.recipients) ? gift.recipients : [];
				return gift.price <= maxBudget && (rList.includes(recipient) || rList.includes("all"));
			}).sort((a, b) => b.price - a.price);
		}

		// Якщо і так нічого немає — шукаємо найдешевші варіанти загалом до бюджету
		if (matches.length === 0) {
			matches = currentCatalog.filter(gift => gift.price <= maxBudget).sort((a, b) => b.price - a.price);
		}

		// Приховуємо Empty state
		if (emptyStateContent) {
			emptyStateContent.style.display = 'none';
		}
		if (rezultatContainer) {
			rezultatContainer.classList.remove('empty-state');
		}
		if (resultsGrid) {
			resultsGrid.style.display = 'grid';
		}

		// Якщо взагалі немає варіантів за бюджетом (наприклад, бюджет = 100 грн, а мін ціна 480 грн)
		if (matches.length === 0) {
			const minPrice = currentCatalog.length > 0 
				? Math.min(...currentCatalog.map(g => Number(g.price) || 0))
				: 0;

			if (resultsGrid) {
				resultsGrid.innerHTML = `
					<div class="no-results-box">
						<div class="no-results-icon">💡</div>
						<h3>За бюджетом ${maxBudget.toLocaleString('uk-UA')} грн подарунків не знайдено</h3>
						<p>Мінімальна вартість підготовлених ідей у базі складає <strong>${minPrice.toLocaleString('uk-UA')} грн</strong>.</p>
						<p class="no-results-sub">Спробуйте збільшити бюджет або обрати інші параметри у формі.</p>
					</div>
				`;
			}
			return;
		}

		// Беремо до 3 найкращих варіантів
		const topGifts = matches.slice(0, 3);

		if (resultsGrid) {
			resultsGrid.innerHTML = topGifts.map(gift => `
				<article class="result-card">
					<div class="card-badge">${escapeHtml(gift.badge || 'Подарунок')}</div>
					<div class="card-image-wrapper">
						<img src="${escapeHtml(gift.img || 'assets/images/celebration.jpg')}" alt="${escapeHtml(gift.title)}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/celebration.jpg';">
					</div>
					<div class="card-body">
						<div class="card-tags">
							<span class="card-tag card-tag-target">👤 ${escapeHtml(recipient)}</span>
							<span class="card-tag card-tag-cat">${escapeHtml(gift.category)}</span>
						</div>
						<h3 class="card-title">${escapeHtml(gift.title)}</h3>
						<p class="card-desc">${escapeHtml(gift.desc)}</p>
						<div class="card-footer">
							<div class="card-price-label">Реальна ціна:</div>
							<div class="card-price-value">${Number(gift.price).toLocaleString('uk-UA')} грн</div>
						</div>
					</div>
				</article>
			`).join('');
		}

		// Плавний скролл до результатів на мобільних
		if (window.innerWidth < 768 && rezultatContainer) {
			rezultatContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// 7. Прослуховування оновлень каталогу з інших вкладок або вікон
	window.addEventListener('storage', (e) => {
		if (e.key === 'gift_constructor_catalog_v2') {
			// Якщо форма була заповнена, оновити результати
			if (form && recipientSelect.value && occasionSelect.value && budgetInput.value) {
				const maxBudget = parseFloat(budgetInput.value);
				if (!isNaN(maxBudget)) {
					renderResults(recipientSelect.value, occasionSelect.value, maxBudget, categorySelect ? categorySelect.value : '');
				}
			}
		}
	});

	window.addEventListener('catalog-updated', () => {
		if (form && recipientSelect.value && occasionSelect.value && budgetInput.value) {
			const maxBudget = parseFloat(budgetInput.value);
			if (!isNaN(maxBudget)) {
				renderResults(recipientSelect.value, occasionSelect.value, maxBudget, categorySelect ? categorySelect.value : '');
			}
		}
	});
});
