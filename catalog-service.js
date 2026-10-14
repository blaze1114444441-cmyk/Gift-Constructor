/**
 * Centralized Gift Catalog Service (GiftConstructor — Practice #4)
 * Handles data persistence (localStorage), CRUD operations, data validation,
 * and shared catalog access between the Public Constructor and Admin Panel.
 */

(function (window) {
	'use strict';

	const STORAGE_KEY = 'gift_constructor_catalog_v2';

	// Default Image Pool (matches homework #3)
	const defaultImages = {
		spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80",
		sweets: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80",
		coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
		flowers: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&q=80",
		tech: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80",
		watches: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80",
		leather: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
		wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80",
		cozy: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80",
		perfume: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
		books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
		headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
		craft: "assets/images/celebration.jpg"
	};

	// Standard Recipients List
	const AVAILABLE_RECIPIENTS = [
		"Мама", "Тато", "Сестра", "Брат", "Дружина / Дівчина",
		"Чоловік / Хлопець", "Друг / Подруга", "Дитина",
		"Бабуся / Дідусь", "Колега", "Вчитель"
	];

	// Standard Occasions List
	const AVAILABLE_OCCASIONS = [
		"ДН", "НР", "14 Лютого", "8 Березня",
		"День Матері / Батька", "Весілля / Річниця",
		"Випускний", "Новосілля", "Без приводу"
	];

	// Standard Categories List
	const AVAILABLE_CATEGORIES = [
		"SPA & Догляд", "Гаджети & Tech", "Затишок & Дім",
		"Солодощі & Кава", "Стиль & Аксесуари",
		"Книги & Творчість", "Враження"
	];

	// Default seed catalog of 18 items
	const defaultCatalog = [
		{
			id: 1,
			title: "СПА-набір релаксу та догляду",
			category: "SPA & Догляд",
			badge: "Затишок & Релакс",
			desc: "Ароматична соєва свічка ручної роботи, сольовий бомбовий набір для ванни, натуральне масло ши та трав'яний карпатський чай у подарунковому боксі.",
			price: 650,
			recipients: ["Мама", "Сестра", "Дружина / Дівчина", "Бабуся / Дідусь", "Друг / Подруга", "Вчитель"],
			occasions: ["ДН", "НР", "8Б", "14 Лютого", "День Матері / Батька", "Без приводу"],
			img: defaultImages.spa
		},
		{
			id: 2,
			title: "Люксовий б'юті-бокс для обличчя та тіла",
			category: "SPA & Догляд",
			badge: "Преміум догляд",
			desc: "Корейська зволожувальна сироватка з гіалуроновою кислотою, нефритовий ролеровий масажер для обличчя, живильний крем та шовкова повязка.",
			price: 1450,
			recipients: ["Мама", "Сестра", "Дружина / Дівчина", "Друг / Подруга"],
			occasions: ["ДН", "НР", "8Б", "14 Лютого", "Весілля / Річниця"],
			img: defaultImages.perfume
		},
		{
			id: 3,
			title: "Парфумований сет елітної косметики",
			category: "SPA & Догляд",
			badge: "Елегантний вибір",
			desc: "Авторський парфум із нотами бергамоту та ванілі, лосьйон для тіла та подарунковий шовковий хусточковий аксесуар у брендовому футлярі.",
			price: 3200,
			recipients: ["Мама", "Дружина / Дівчина", "Сестра", "Колега"],
			occasions: ["ДН", "8Б", "14 Лютого", "Весілля / Річниця"],
			img: defaultImages.perfume
		},
		{
			id: 4,
			title: "Портативна Bluetooth-колонка",
			category: "Гаджети & Tech",
			badge: "Музика всюди",
			desc: "Компактна вологозахищена колонка з чистим об'ємним звучанням, автономністю до 12 годин та вбудованим караоке-режимом.",
			price: 950,
			recipients: ["Брат", "Друг / Подруга", "Дитина", "Чоловік / Хлопець", "Сестра"],
			occasions: ["ДН", "НР", "Випускний", "Без приводу"],
			img: defaultImages.tech
		},
		{
			id: 5,
			title: "Бездротові навушники з шумозаглушенням",
			category: "Гаджети & Tech",
			badge: "Top Tech",
			desc: "Стильні повнорозмірні навушники з активним шумозаглушенням (ANC), глибоким басом, зручними амбушурами та підтримкою швидкої зарядки Type-C.",
			price: 2800,
			recipients: ["Брат", "Чоловік / Хлопець", "Сестра", "Друг / Подруга", "Колега", "Дитина"],
			occasions: ["ДН", "НР", "Випускний", "14 Лютого"],
			img: defaultImages.headphones
		},
		{
			id: 6,
			title: "Смарт-годинник із моніторингом здоров'я",
			category: "Гаджети & Tech",
			badge: "Хіт продажів",
			desc: "Сучасний фітнес-годинник із яскравим AMOLED-дисплеєм, пульсометром, підрахунком кроків, сповіщеннями з телефону та захистом від води IP68.",
			price: 4500,
			recipients: ["Тато", "Мама", "Чоловік / Хлопець", "Дружина / Дівчина", "Брат"],
			occasions: ["ДН", "НР", "День Матері / Батька", "Весілля / Річниця"],
			img: defaultImages.watches
		},
		{
			id: 7,
			title: "Флагманський планшет для навчання та творчості",
			category: "Гаджети & Tech",
			badge: "Ексклюзив",
			desc: "Потужний планшет із 11-дюймовим екраном 120 Гц, підтримкою стилуса, 256 ГБ пам'яті та чудовою акустикою для малювання, роботи та розваг.",
			price: 18500,
			recipients: ["Дитина", "Брат", "Сестра", "Дружина / Дівчина", "Чоловік / Хлопець"],
			occasions: ["ДН", "НР", "Випускний"],
			img: defaultImages.tech
		},
		{
			id: 8,
			title: "Затишний вовняний плед & Різдвяний чай",
			category: "Затишок & Дім",
			badge: "Тепло та затишок",
			desc: "М'який плед із натуральної вовни мериноса, керамічна чашка ручної ліпки, ароматний листовий чай та баночка меду з горішками.",
			price: 1100,
			recipients: ["Мама", "Тато", "Бабуся / Дідусь", "Сестра", "Вчитель"],
			occasions: ["НР", "ДН", "День Матері / Батька", "Новосілля", "Без приводу"],
			img: defaultImages.cozy
		},
		{
			id: 9,
			title: "Аромадифузор із паличками & Свічка",
			category: "Затишок & Дім",
			badge: "Атмосфера дому",
			desc: "Преміальний аромадифузор із ніжним ароматом білого чаю та орхідеї, соєва свічка та стильний сірниковий бокс у скляній колбі.",
			price: 850,
			recipients: ["Мама", "Сестра", "Дружина / Дівчина", "Колега", "Вчитель"],
			occasions: ["ДН", "8Б", "Новосілля", "НР", "Без приводу"],
			img: defaultImages.spa
		},
		{
			id: 10,
			title: "Елегантний кришталевий сет келихів",
			category: "Затишок & Дім",
			badge: "Свято в домі",
			desc: "Набір із 6 кришталевих келихів для вина, вишукана декантер-ваза та вітальна листівка в оксамитовому кейсі.",
			price: 2400,
			recipients: ["Мама", "Тато", "Дружина / Дівчина", "Чоловік / Хлопець", "Колега"],
			occasions: ["Весілля / Річниця", "Новосілля", "НР", "ДН"],
			img: defaultImages.wine
		},
		{
			id: 11,
			title: "Подарунковий кавовий сет з гейзеркою",
			category: "Солодощі & Кава",
			badge: "Кавоман",
			desc: "Класична італійська гейзерна кавоварка, два сорти свіжообсмаженої Арабіки, стильна термокружка та чорний крафтовий шоколад.",
			price: 1250,
			recipients: ["Тато", "Брат", "Колега", "Чоловік / Хлопець", "Вчитель", "Друг / Подруга"],
			occasions: ["ДН", "НР", "День Матері / Батька", "Без приводу"],
			img: defaultImages.coffee
		},
		{
			id: 12,
			title: "Крафтовий бокс солодощів та горіхів",
			category: "Солодощі & Кава",
			badge: "Солодке свято",
			desc: "Набір асорті з натурального крем-меду, карамелізованих горішків, бельгійського шоколаду та цукатів у еко-упаковці.",
			price: 550,
			recipients: ["Дитина", "Сестра", "Бабуся / Дідусь", "Вчитель", "Друг / Подруга", "Колега"],
			occasions: ["НР", "8Б", "14 Лютого", "ДН", "Без приводу"],
			img: defaultImages.sweets
		},
		{
			id: 13,
			title: "Шкіряний портмоне & Кардхолдер ручної роботи",
			category: "Стиль & Аксесуари",
			badge: "Класичний стиль",
			desc: "Виріб із натуральної шкіри Crazy Horse в дерев'яній подарунковій коробці з можливістю персонального гравіювання ініціалів.",
			price: 1600,
			recipients: ["Тато", "Брат", "Чоловік / Хлопець", "Колега"],
			occasions: ["ДН", "НР", "День Матері / Батька", "Випускний"],
			img: defaultImages.leather
		},
		{
			id: 14,
			title: "Класичний чоловічий наручний годинник",
			category: "Стиль & Аксесуари",
			badge: "Солідний подарунок",
			desc: "Елегантний годинник зі сталевим корпусом, сапфіровим склом, шкіряним ремінцем та надійним японським кварцовим механізмом.",
			price: 5800,
			recipients: ["Тато", "Чоловік / Хлопець", "Брат", "Колега"],
			occasions: ["ДН", "Весілля / Річниця", "НР", "Випускний"],
			img: defaultImages.watches
		},
		{
			id: 15,
			title: "Подарунковий бестселер & Набір для читання",
			category: "Книги & Творчість",
			badge: "Для душі",
			desc: "Колекційне ілюстроване видання світового бестселера, металева закладка, затишні носки та ароматичний чашечний набір.",
			price: 780,
			recipients: ["Сестра", "Друг / Подруга", "Мама", "Вчитель", "Дитина"],
			occasions: ["ДН", "НР", "Випускний", "Без приводу"],
			img: defaultImages.books
		},
		{
			id: 16,
			title: "Великий набір для живопису за номерами",
			category: "Книги & Творчість",
			badge: "Творчий релакс",
			desc: "Полотнище на мольберті 40х50 см, акрилові фарби, мольберт-підставка, пензлі та фінішний лак для створення власного шедевра.",
			price: 480,
			recipients: ["Мама", "Сестра", "Дитина", "Друг / Подруга", "Бабуся / Дідусь"],
			occasions: ["ДН", "8Б", "НР", "Без приводу"],
			img: defaultImages.craft
		},
		{
			id: 17,
			title: "Сертифікат на СПА-день або масаж",
			category: "Враження",
			badge: "Незабутні емоції",
			desc: "Повний день релаксу в кращому СПА-комплексі міста: тайський масаж, ароматерапія, сауна та відпочинок біля басейну.",
			price: 2500,
			recipients: ["Мама", "Дружина / Дівчина", "Сестра", "Друг / Подруга"],
			occasions: ["ДН", "8Б", "14 Лютого", "Весілля / Річниця"],
			img: defaultImages.spa
		},
		{
			id: 18,
			title: "Політ на повітряній кулі для двох",
			category: "Враження",
			badge: "Супер Враження",
			desc: "Неймовірна пригода на сході сонця: 1 година польоту, посвята в повітроплавці з келихом шампанського та пам'ятні фото.",
			price: 9500,
			recipients: ["Дружина / Дівчина", "Чоловік / Хлопець", "Друг / Подруга"],
			occasions: ["Весілля / Річниця", "14 Лютого", "ДН"],
			img: defaultImages.craft
		}
	];

	// In-memory cache
	let memoryCatalog = null;

	/**
	 * Safe HTML escaping to prevent XSS
	 */
	function escapeHtml(str) {
		if (str === null || str === undefined) return '';
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	/**
	 * Reads catalog from localStorage or initial seed
	 */
	function getCatalog() {
		if (memoryCatalog && Array.isArray(memoryCatalog)) {
			return JSON.parse(JSON.stringify(memoryCatalog));
		}

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length > 0) {
					memoryCatalog = parsed;
					return JSON.parse(JSON.stringify(parsed));
				}
			}
		} catch (err) {
			console.warn('[GiftCatalogService] Error reading localStorage, using defaults:', err);
		}

		// Initialize with default catalog
		memoryCatalog = JSON.parse(JSON.stringify(defaultCatalog));
		saveCatalog(memoryCatalog);
		return JSON.parse(JSON.stringify(memoryCatalog));
	}

	/**
	 * Saves catalog to localStorage and cache
	 */
	function saveCatalog(catalog) {
		if (!Array.isArray(catalog)) {
			throw new Error('[GiftCatalogService] Catalog must be an array');
		}
		memoryCatalog = JSON.parse(JSON.stringify(catalog));
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
			// Dispatch custom event for cross-component sync
			window.dispatchEvent(new CustomEvent('catalog-updated', { detail: { catalog: memoryCatalog } }));
			return true;
		} catch (err) {
			console.error('[GiftCatalogService] Failed to save catalog to localStorage:', err);
			return false;
		}
	}

	/**
	 * Find gift by ID
	 */
	function getGiftById(id) {
		const catalog = getCatalog();
		const numId = Number(id);
		return catalog.find(g => g.id === numId || String(g.id) === String(id)) || null;
	}

	/**
	 * Validate gift data
	 * Returns { isValid: boolean, errors: Object }
	 */
	function validateGiftData(data) {
		const errors = {};

		// Title: required, non-whitespace, min 2 chars
		if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
			errors.title = 'Назва подарунка є обов\'язковою та не може складатися лише з пробілів.';
		} else if (data.title.trim().length < 2) {
			errors.title = 'Назва повинна містити щонайменше 2 символи.';
		} else if (data.title.trim().length > 120) {
			errors.title = 'Назва занадто довга (максимум 120 символів).';
		}

		// Price: required, positive numeric, max 1 000 000
		const priceNum = parseFloat(data.price);
		if (data.price === '' || data.price === null || data.price === undefined) {
			errors.price = 'Вкажіть ціну подарунка.';
		} else if (isNaN(priceNum)) {
			errors.price = 'Ціна повинна бути коректним числом.';
		} else if (priceNum <= 0) {
			errors.price = 'Ціна повинна бути більшою за 0 грн.';
		} else if (priceNum > 1000000) {
			errors.price = 'Ціна не може перевищувати 1 000 000 грн.';
		}

		// Category: required
		if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
			errors.category = 'Оберіть категорію подарунка.';
		}

		// Recipients: array with at least one recipient
		if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
			errors.recipients = 'Оберіть хоча б одного отримувача.';
		}

		// Occasions: array with at least one occasion
		if (!Array.isArray(data.occasions) || data.occasions.length === 0) {
			errors.occasions = 'Оберіть хоча б одну подію.';
		}

		// Description: required, min 10 chars
		if (!data.desc || typeof data.desc !== 'string' || !data.desc.trim()) {
			errors.desc = 'Опис подарунка є обов\'язковим.';
		} else if (data.desc.trim().length < 10) {
			errors.desc = 'Опис повинен містити щонайменше 10 символів.';
		} else if (data.desc.trim().length > 500) {
			errors.desc = 'Опис занадто довгий (максимум 500 символів).';
		}

		// Image URL: optional, but if provided, must be a non-empty string
		if (data.img && typeof data.img === 'string') {
			const trimmedImg = data.img.trim();
			if (trimmedImg.length > 0 && !trimmedImg.startsWith('http') && !trimmedImg.startsWith('assets/')) {
				// Soft warning or fallback
			}
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	}

	/**
	 * Generate next unique ID
	 */
	function generateUniqueId(catalog) {
		if (catalog.length === 0) return 1;
		const maxId = catalog.reduce((max, item) => {
			const n = Number(item.id);
			return !isNaN(n) && n > max ? n : max;
		}, 0);
		return maxId + 1;
	}

	/**
	 * Add a new gift to catalog
	 */
	function addGift(rawData) {
		const validation = validateGiftData(rawData);
		if (!validation.isValid) {
			return { success: false, errors: validation.errors };
		}

		const catalog = getCatalog();
		const newId = generateUniqueId(catalog);

		// Fallback image based on category
		let finalImg = (rawData.img && rawData.img.trim()) ? rawData.img.trim() : null;
		if (!finalImg) {
			if (rawData.category.includes('Tech')) finalImg = defaultImages.tech;
			else if (rawData.category.includes('SPA')) finalImg = defaultImages.spa;
			else if (rawData.category.includes('Кава') || rawData.category.includes('Солод')) finalImg = defaultImages.sweets;
			else if (rawData.category.includes('Книг')) finalImg = defaultImages.books;
			else if (rawData.category.includes('Стиль')) finalImg = defaultImages.leather;
			else if (rawData.category.includes('Враж')) finalImg = defaultImages.craft;
			else finalImg = defaultImages.cozy;
		}

		const newGift = {
			id: newId,
			title: rawData.title.trim(),
			category: rawData.category.trim(),
			badge: (rawData.badge && rawData.badge.trim()) ? rawData.badge.trim() : 'Новинка',
			desc: rawData.desc.trim(),
			price: Math.round(parseFloat(rawData.price)),
			recipients: [...rawData.recipients],
			occasions: [...rawData.occasions],
			img: finalImg
		};

		catalog.push(newGift);
		const saved = saveCatalog(catalog);
		if (!saved) {
			return { success: false, errors: { storage: 'Помилка збереження даних у сховищі браузера.' } };
		}

		return { success: true, gift: newGift };
	}

	/**
	 * Update an existing gift in catalog
	 */
	function updateGift(id, rawData) {
		const validation = validateGiftData(rawData);
		if (!validation.isValid) {
			return { success: false, errors: validation.errors };
		}

		const catalog = getCatalog();
		const numId = Number(id);
		const index = catalog.findIndex(g => g.id === numId || String(g.id) === String(id));

		if (index === -1) {
			return { success: false, errors: { general: 'Подарунок не знайдено в каталозі.' } };
		}

		const existing = catalog[index];
		let finalImg = (rawData.img && rawData.img.trim()) ? rawData.img.trim() : existing.img;

		const updatedGift = {
			...existing,
			id: existing.id, // Preserve immutable ID
			title: rawData.title.trim(),
			category: rawData.category.trim(),
			badge: (rawData.badge && rawData.badge.trim()) ? rawData.badge.trim() : existing.badge,
			desc: rawData.desc.trim(),
			price: Math.round(parseFloat(rawData.price)),
			recipients: [...rawData.recipients],
			occasions: [...rawData.occasions],
			img: finalImg
		};

		catalog[index] = updatedGift;
		const saved = saveCatalog(catalog);
		if (!saved) {
			return { success: false, errors: { storage: 'Помилка збереження даних у сховищі браузера.' } };
		}

		return { success: true, gift: updatedGift };
	}

	/**
	 * Delete a gift from catalog
	 */
	function deleteGift(id) {
		const catalog = getCatalog();
		const numId = Number(id);
		const initialLength = catalog.length;
		const filtered = catalog.filter(g => g.id !== numId && String(g.id) !== String(id));

		if (filtered.length === initialLength) {
			return { success: false, message: 'Подарунок для видалення не знайдено.' };
		}

		const saved = saveCatalog(filtered);
		if (!saved) {
			return { success: false, message: 'Помилка оновлення сховища під час видалення.' };
		}

		return { success: true, deletedId: id };
	}

	/**
	 * Reset catalog to initial default 18 gifts
	 */
	function resetToDefaultCatalog() {
		const resetData = JSON.parse(JSON.stringify(defaultCatalog));
		const saved = saveCatalog(resetData);
		return saved;
	}

	// Export service to global window
	window.GiftCatalogService = {
		STORAGE_KEY,
		AVAILABLE_RECIPIENTS,
		AVAILABLE_OCCASIONS,
		AVAILABLE_CATEGORIES,
		defaultImages,
		escapeHtml,
		getCatalog,
		saveCatalog,
		getGiftById,
		validateGiftData,
		addGift,
		updateGift,
		deleteGift,
		resetToDefaultCatalog
	};

})(window);
