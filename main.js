"use strict";

/*
 * Created with @iobroker/create-adapter v3.1.2
 */

const utils = require("@iobroker/adapter-core");
const https = require("node:https");
const SunCalc = require("suncalc");

const I18N_WEEKDAYS = {
	de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
	en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
	it: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
	es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
	pt: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
	nl: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
	pl: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
	ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
	uk: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
	"zh-cn": ["日", "一", "二", "三", "四", "五", "六"],
};

const I18N_DESCRIPTIONS = {
	de: {
		0: "Klar", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bedeckt",
		45: "Nebel", 48: "Gefrierender Nebel",
		51: "Leichter Nieselregen", 53: "Nieselregen", 55: "Starker Nieselregen",
		56: "Leichter gefrierender Nieselregen", 57: "Gefrierender Nieselregen",
		61: "Leichter Regen", 63: "Regen", 65: "Starker Regen",
		66: "Leichter Eisregen", 67: "Eisregen",
		71: "Leichter Schnee", 73: "Schnee", 75: "Starker Schnee", 77: "Schneekörner",
		80: "Leichte Schauer", 81: "Schauer", 82: "Starke Schauer",
		85: "Leichte Schneeschauer", 86: "Schneeschauer",
		95: "Gewitter", 96: "Gewitter mit Hagel", 99: "Schweres Gewitter",
	},
	en: {
		0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
		45: "Fog", 48: "Freezing fog",
		51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
		56: "Light freezing drizzle", 57: "Freezing drizzle",
		61: "Light rain", 63: "Rain", 65: "Heavy rain",
		66: "Light freezing rain", 67: "Freezing rain",
		71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
		80: "Light showers", 81: "Showers", 82: "Heavy showers",
		85: "Light snow showers", 86: "Snow showers",
		95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm",
	},
	fr: {
		0: "Ciel dégagé", 1: "Principalement dégagé", 2: "Partiellement nuageux", 3: "Couvert",
		45: "Brouillard", 48: "Brouillard givrant",
		51: "Bruine légère", 53: "Bruine", 55: "Bruine forte",
		56: "Bruine verglaçante légère", 57: "Bruine verglaçante",
		61: "Pluie légère", 63: "Pluie", 65: "Pluie forte",
		66: "Pluie verglaçante légère", 67: "Pluie verglaçante",
		71: "Neige légère", 73: "Neige", 75: "Neige forte", 77: "Grains de neige",
		80: "Averses légères", 81: "Averses", 82: "Averses fortes",
		85: "Averses de neige légères", 86: "Averses de neige",
		95: "Orage", 96: "Orage avec grêle", 99: "Orage violent",
	},
	it: {
		0: "Sereno", 1: "Prevalentemente sereno", 2: "Parzialmente nuvoloso", 3: "Coperto",
		45: "Nebbia", 48: "Nebbia ghiacciata",
		51: "Pioggerella leggera", 53: "Pioggerella", 55: "Pioggerella intensa",
		56: "Pioggerella gelata leggera", 57: "Pioggerella gelata",
		61: "Pioggia leggera", 63: "Pioggia", 65: "Pioggia intensa",
		66: "Pioggia gelata leggera", 67: "Pioggia gelata",
		71: "Neve leggera", 73: "Neve", 75: "Neve intensa", 77: "Granelli di neve",
		80: "Rovesci leggeri", 81: "Rovesci", 82: "Rovesci intensi",
		85: "Rovesci di neve leggeri", 86: "Rovesci di neve",
		95: "Temporale", 96: "Temporale con grandine", 99: "Temporale intenso",
	},
	es: {
		0: "Despejado", 1: "Principalmente despejado", 2: "Parcialmente nublado", 3: "Nublado",
		45: "Niebla", 48: "Niebla helada",
		51: "Llovizna ligera", 53: "Llovizna", 55: "Llovizna intensa",
		56: "Llovizna helada ligera", 57: "Llovizna helada",
		61: "Lluvia ligera", 63: "Lluvia", 65: "Lluvia intensa",
		66: "Lluvia helada ligera", 67: "Lluvia helada",
		71: "Nieve ligera", 73: "Nieve", 75: "Nieve intensa", 77: "Granos de nieve",
		80: "Chubascos ligeros", 81: "Chubascos", 82: "Chubascos intensos",
		85: "Chubascos de nieve ligeros", 86: "Chubascos de nieve",
		95: "Tormenta", 96: "Tormenta con granizo", 99: "Tormenta intensa",
	},
	pt: {
		0: "Céu limpo", 1: "Principalmente limpo", 2: "Parcialmente nublado", 3: "Nublado",
		45: "Nevoeiro", 48: "Nevoeiro gelado",
		51: "Garoa leve", 53: "Garoa", 55: "Garoa intensa",
		56: "Garoa gelada leve", 57: "Garoa gelada",
		61: "Chuva leve", 63: "Chuva", 65: "Chuva intensa",
		66: "Chuva gelada leve", 67: "Chuva gelada",
		71: "Neve leve", 73: "Neve", 75: "Neve intensa", 77: "Grãos de neve",
		80: "Aguaceiros leves", 81: "Aguaceiros", 82: "Aguaceiros intensos",
		85: "Aguaceiros de neve leves", 86: "Aguaceiros de neve",
		95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade intensa",
	},
	nl: {
		0: "Helder", 1: "Overwegend helder", 2: "Gedeeltelijk bewolkt", 3: "Bewolkt",
		45: "Mist", 48: "Bevriezende mist",
		51: "Lichte motregen", 53: "Motregen", 55: "Zware motregen",
		56: "Lichte bevriezende motregen", 57: "Bevriezende motregen",
		61: "Lichte regen", 63: "Regen", 65: "Zware regen",
		66: "Lichte ijsregen", 67: "IJsregen",
		71: "Lichte sneeuw", 73: "Sneeuw", 75: "Zware sneeuw", 77: "Sneeuwkorrels",
		80: "Lichte buien", 81: "Buien", 82: "Zware buien",
		85: "Lichte sneeuwbuien", 86: "Sneeuwbuien",
		95: "Onweer", 96: "Onweer met hagel", 99: "Zwaar onweer",
	},
	pl: {
		0: "Bezchmurnie", 1: "Głównie bezchmurnie", 2: "Częściowe zachmurzenie", 3: "Zachmurzenie całkowite",
		45: "Mgła", 48: "Marznąca mgła",
		51: "Lekka mżawka", 53: "Mżawka", 55: "Silna mżawka",
		56: "Lekka marznąca mżawka", 57: "Marznąca mżawka",
		61: "Lekki deszcz", 63: "Deszcz", 65: "Silny deszcz",
		66: "Lekki marznący deszcz", 67: "Marznący deszcz",
		71: "Lekki śnieg", 73: "Śnieg", 75: "Silny śnieg", 77: "Ziarnisty śnieg",
		80: "Słabe opady", 81: "Opady", 82: "Silne opady",
		85: "Słabe opady śniegu", 86: "Opady śniegu",
		95: "Burza", 96: "Burza z gradem", 99: "Silna burza",
	},
	ru: {
		0: "Ясно", 1: "Преимущественно ясно", 2: "Переменная облачность", 3: "Пасмурно",
		45: "Туман", 48: "Ледяной туман",
		51: "Слабая морось", 53: "Морось", 55: "Сильная морось",
		56: "Слабый ледяной дождь", 57: "Ледяной дождь (морось)",
		61: "Слабый дождь", 63: "Дождь", 65: "Сильный дождь",
		66: "Слабый ледяной дождь", 67: "Ледяной дождь",
		71: "Слабый снег", 73: "Снег", 75: "Сильный снег", 77: "Снежная крупа",
		80: "Слабые ливни", 81: "Ливни", 82: "Сильные ливни",
		85: "Слабые снежные ливни", 86: "Снежные ливни",
		95: "Гроза", 96: "Гроза с градом", 99: "Сильная гроза",
	},
	uk: {
		0: "Ясно", 1: "Переважно ясно", 2: "Мінлива хмарність", 3: "Хмарно",
		45: "Туман", 48: "Крижаний туман",
		51: "Слабка мряка", 53: "Мряка", 55: "Сильна мряка",
		56: "Слабкий крижаний дощ", 57: "Крижаний дощ (мряка)",
		61: "Слабкий дощ", 63: "Дощ", 65: "Сильний дощ",
		66: "Слабкий крижаний дощ", 67: "Крижаний дощ",
		71: "Слабкий сніг", 73: "Сніг", 75: "Сильний сніг", 77: "Снігова крупа",
		80: "Слабкі зливи", 81: "Зливи", 82: "Сильні зливи",
		85: "Слабкі снігові зливи", 86: "Снігові зливи",
		95: "Гроза", 96: "Гроза з градом", 99: "Сильна гроза",
	},
	"zh-cn": {
		0: "晴天", 1: "大部晴朗", 2: "多云", 3: "阴天",
		45: "雾", 48: "冻雾",
		51: "小毛毛雨", 53: "毛毛雨", 55: "大毛毛雨",
		56: "轻度冻毛毛雨", 57: "冻毛毛雨",
		61: "小雨", 63: "中雨", 65: "大雨",
		66: "轻度冻雨", 67: "冻雨",
		71: "小雪", 73: "中雪", 75: "大雪", 77: "雪粒",
		80: "小阵雨", 81: "阵雨", 82: "大阵雨",
		85: "小阵雪", 86: "阵雪",
		95: "雷暴", 96: "冰雹雷暴", 99: "强雷暴",
	},
};

const ICONS = {
	0: "☀️",
	1: "🌤️",
	2: "⛅",
	3: "⛅",
	45: "🌫️",
	48: "🌫️",
	51: "🌦️",
	53: "🌦️",
	55: "🌧️",
	56: "🌨️",
	57: "🌨️",
	61: "🌦️",
	63: "🌧️",
	65: "🌧️",
	66: "🌧️",
	67: "🌧️",
	71: "❄️",
	73: "❄️",
	75: "❄️",
	77: "❄️",
	80: "🌦️",
	81: "🌧️",
	82: "🌧️",
	85: "❄️",
	86: "❄️",
	95: "⛈️",
	96: "⛈️",
	99: "⛈️",
};

// Precipitation type codes
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

/**
 * Normalizes a location name to a valid ioBroker object ID segment
 *
 * @param {string} name - Location name
 * @returns {string} Normalized ID string safe for use as ioBroker object ID
 */
function normalizeId(name) {
	return name
		.toLowerCase()
		.replace(/ä/g, "ae")
		.replace(/ö/g, "oe")
		.replace(/ü/g, "ue")
		.replace(/ß/g, "ss")
		.replace(/[^a-z0-9_]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

/**
 * Derives precipitation type from weathercode
 * 0 = none, 1 = rain, 2 = snow
 *
 * @param {number} code - WMO weathercode
 * @returns {number} 0 = none, 1 = rain, 2 = snow
 */
/**
 * Returns the relative URL to the weather icon for the given weathercode and icon set
 *
 * @param {number} code - WMO weathercode
 * @param {string} iconSet - Icon set: "wmo", "basmilius" or "basmilius_animated"
 * @returns {string} Relative URL path to the icon file
 */
/**
 * WMO codes that have distinct night variants in Basmilius icon set
 */
const WMO_HAS_NIGHT = new Set([0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);

/**
 * Returns the relative URL to the weather icon for the given weathercode and icon set
 *
 * @param {number} code - WMO weathercode
 * @param {string} iconSet - Icon set: "wmo", "basmilius" or "basmilius_animated"
 * @param {boolean} isDay - Whether it is currently daytime
 * @returns {string} Relative URL path to the icon file
 */
// WMO icon set does not have icons for codes 56/57/66/67 → fall back to nearest equivalent
const WMO_CODE_FALLBACK = { 56: 55, 57: 55, 66: 65, 67: 65 };

function weatherIconUrl(code, iconSet, isDay) {
	const padded = String(code).padStart(2, "0");
	if (iconSet === "basmilius" || iconSet === "basmilius_animated") {
		if (!isDay && WMO_HAS_NIGHT.has(code)) {
			const ext = iconSet === "basmilius_animated" ? "svg" : "png";
			const nightSet = iconSet === "basmilius_animated" ? "basmilius_animated_night" : "basmilius_night";
			return `/openmeteo.admin/icons/${nightSet}/wmo_${padded}.${ext}`;
		}
		const ext = iconSet === "basmilius_animated" ? "svg" : "png";
		return `/openmeteo.admin/icons/${iconSet}/wmo_${padded}.${ext}`;
	}
	// WMO set: fall back for codes without icons
	const wmoCode = WMO_CODE_FALLBACK[code] ?? code;
	return `/openmeteo.admin/icons/wmo/wmo_${String(wmoCode).padStart(2, "0")}.png`;
}

const I18N_MOON_PHASES = {
	de: ["Neumond", "Zunehmende Sichel", "Erstes Viertel", "Zunehmender Mond", "Vollmond", "Abnehmender Mond", "Letztes Viertel", "Abnehmende Sichel"],
	en: ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"],
	fr: ["Nouvelle Lune", "Croissant Montant", "Premier Quartier", "Lune Gibbeuse Croissante", "Pleine Lune", "Lune Gibbeuse Décroissante", "Dernier Quartier", "Croissant Décroissant"],
	it: ["Luna Nuova", "Luna Crescente", "Primo Quarto", "Gibbosa Crescente", "Luna Piena", "Gibbosa Calante", "Ultimo Quarto", "Luna Calante"],
	es: ["Luna Nueva", "Creciente Cóncava", "Cuarto Creciente", "Creciente Convexa", "Luna Llena", "Menguante Convexa", "Cuarto Menguante", "Menguante Cóncava"],
	pt: ["Lua Nova", "Crescente Côncava", "Quarto Crescente", "Crescente Convexa", "Lua Cheia", "Minguante Convexa", "Quarto Minguante", "Minguante Côncava"],
	nl: ["Nieuwe Maan", "Wassende Sikkel", "Eerste Kwartier", "Wassende Maan", "Volle Maan", "Afnemende Maan", "Laatste Kwartier", "Afnemende Sikkel"],
	pl: ["Nów", "Przybywający Sierp", "Pierwsza Kwadra", "Przybywający Księżyc", "Pełnia", "Ubywający Księżyc", "Ostatnia Kwadra", "Ubywający Sierp"],
	ru: ["Новолуние", "Молодой Месяц", "Первая Четверть", "Прибывающая Луна", "Полнолуние", "Убывающая Луна", "Последняя Четверть", "Убывающий Месяц"],
	uk: ["Новий Місяць", "Молодий Місяць", "Перша Чверть", "Зростаючий Місяць", "Повний Місяць", "Спадаючий Місяць", "Остання Чверть", "Старіючий Місяць"],
	"zh-cn": ["新月", "峨眉月", "上弦月", "盈凸月", "满月", "亏凸月", "下弦月", "残月"],
};

/**
 * Returns moon phase text from SunCalc phase value (0–1)
 *
 * @param {number} phase - Moon phase value 0–1
 * @param {string} lang - Language code
 * @returns {{ text: string, idx: number }} Phase text and icon index (0–7)
 */
function moonPhaseInfo(phase, lang) {
	const phases = I18N_MOON_PHASES[lang] || I18N_MOON_PHASES.en;
	const idx = Math.round(phase * 8) % 8;
	return { idx, text: phases[idx] };
}

const I18N_POLLEN_LEVELS = {
	de: { levels: ["Keine", "Niedrig", "Mittel", "Hoch"], na: "k.A." },
	en: { levels: ["None", "Low", "Moderate", "High"], na: "N/A" },
	fr: { levels: ["Aucun", "Faible", "Modéré", "Élevé"], na: "N/D" },
	it: { levels: ["Nessuno", "Basso", "Moderato", "Alto"], na: "N/D" },
	es: { levels: ["Ninguno", "Bajo", "Moderado", "Alto"], na: "N/D" },
	pt: { levels: ["Nenhum", "Baixo", "Moderado", "Alto"], na: "N/D" },
	nl: { levels: ["Geen", "Laag", "Matig", "Hoog"], na: "N/B" },
	pl: { levels: ["Brak", "Niski", "Umiarkowany", "Wysoki"], na: "N/D" },
	ru: { levels: ["Нет", "Низкий", "Умеренный", "Высокий"], na: "Н/Д" },
	uk: { levels: ["Немає", "Низький", "Помірний", "Високий"], na: "Н/Д" },
	"zh-cn": { levels: ["无", "低", "中", "高"], na: "N/A" },
};

/**
 * Converts a pollen value (Grains/m³) to a human-readable level text
 *
 * @param {number|null} value - Pollen concentration in Grains/m³
 * @param {string} type - Pollen type key (e.g. "grass_pollen")
 * @param {string} lang - Language code
 * @returns {string} Level text in the requested language
 */
function pollenLevelText(value, type, lang) {
	const { levels, na } = I18N_POLLEN_LEVELS[lang] || I18N_POLLEN_LEVELS.en;
	if (value == null) {
		return na;
	}
	// Thresholds differ by pollen type (source: German pollen forecast service)
	const thresholds = {
		grass_pollen:   [1, 10, 50],
		birch_pollen:   [1, 10, 100],
		alder_pollen:   [1, 10, 100],
		mugwort_pollen: [1, 10, 50],
		ragweed_pollen: [1, 5, 20],
		olive_pollen:   [1, 10, 100],
	};
	const [low, mid, high] = thresholds[type] || [1, 10, 50];
	if (value < low) return levels[0];
	if (value < mid) return levels[1];
	if (value < high) return levels[2];
	return levels[3];
}

const COMPASS_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const COMPASS_EMOJIS = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
const BEAUFORT_KMH = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];

/**
 * Converts wind direction in degrees to compass text (N, NE, E, …)
 *
 * @param {number} deg - Wind direction in degrees (0–360)
 * @returns {string} Compass direction abbreviation
 */
function degreesToCompass(deg) {
	const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
	return COMPASS_DIRS[idx];
}

/**
 * Converts wind direction in degrees to a directional emoji
 *
 * @param {number} deg - Wind direction in degrees (0–360)
 * @returns {string} Directional arrow emoji
 */
function degreesToEmoji(deg) {
	const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
	return COMPASS_EMOJIS[idx];
}

/**
 * Returns the relative URL to the wind direction arrow icon
 *
 * @param {number} deg - Wind direction in degrees (0–360)
 * @returns {string} Relative URL path to the SVG arrow icon
 */
function windDirIconUrl(deg) {
	return `/openmeteo.admin/icons/wind/${degreesToCompass(deg)}.svg`;
}

/**
 * Converts wind speed to Beaufort scale (0–12)
 *
 * @param {number} speed - Wind speed value
 * @param {string} unit - Unit: "kmh" | "ms" | "mph" | "kn"
 * @returns {number} Beaufort number 0–12
 */
function speedToBeaufort(speed, unit) {
	let kmh = speed;
	if (unit === "ms") {
		kmh = speed * 3.6;
	} else if (unit === "mph") {
		kmh = speed * 1.60934;
	} else if (unit === "kn") {
		kmh = speed * 1.852;
	}
	for (let b = 0; b < BEAUFORT_KMH.length; b++) {
		if (kmh < BEAUFORT_KMH[b]) {
			return b;
		}
	}
	return 12;
}

/**
 * Returns the relative URL to the Beaufort wind speed icon
 *
 * @param {number} beaufort - Beaufort number 0–12
 * @returns {string} Relative URL path to the Beaufort SVG icon
 */
function windBeaufortIconUrl(beaufort) {
	return `/openmeteo.admin/icons/wind/beaufort_${beaufort}.svg`;
}

function precipitationType(code) {
	if (RAIN_CODES.has(code)) {
		return 1;
	}
	if (SNOW_CODES.has(code)) {
		return 2;
	}
	return 0;
}

class Openmeteo extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	constructor(options) {
		super({
			...options,
			name: "openmeteo",
		});
		this.updateInterval = null;
		this.updateTimeout = null;
		this.on("ready", this.onReady.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	async onReady() {
		await this.setState("info.connection", false, true);

		// Sofort beim Start abrufen
		await this.runUpdate();

		// Schedule repeating updates
		const intervalMinutes = this.config.updateInterval || 60;
		if (intervalMinutes >= 1440) {
			// Daily at 01:00
			const msUntilNext1am = () => {
				const now = new Date();
				const next = new Date();
				next.setHours(1, 0, 0, 0);
				if (next <= now) next.setDate(next.getDate() + 1);
				return next - now;
			};
			this.updateTimeout = this.setTimeout(async () => {
				this.updateTimeout = null;
				await this.runUpdate();
				this.updateInterval = this.setInterval(async () => {
					await this.runUpdate();
				}, 24 * 60 * 60 * 1000);
			}, msUntilNext1am());
		} else {
			this.updateInterval = this.setInterval(async () => {
				await this.runUpdate();
			}, intervalMinutes * 60 * 1000);
		}
	}

	/**
	 * Runs a full weather update for all configured locations
	 */
	async runUpdate() {
		let locations = this.config.locations;
		const daysCount = this.config.daysCount ?? 7;
		const hourlyDays = this.config.hourlyDays ?? 3;
		const temperatureUnit = this.config.temperatureUnit || "celsius";
		const windspeedUnit = this.config.windspeedUnit || "kmh";
		const precipitationUnit = this.config.precipitationUnit || "mm";
		const iconSet = this.config.iconSet || "basmilius";
		const enablePollen = !!this.config.enablePollen;
		const enableAirQuality = this.config.enableAirQuality !== false;
		const enableAirQualityHourly = enableAirQuality && !!this.config.enableAirQualityHourly;
		const enableAstronomy = this.config.enableAstronomy !== false;
		const enableAstronomyHourly = enableAstronomy && !!this.config.enableAstronomyHourly;
		const enableAgriculture = !!this.config.enableAgriculture;
		const enableAgricultureHourly = enableAgriculture && !!this.config.enableAgricultureHourly;
		const enablePollenHourly = enablePollen && !!this.config.enablePollenHourly;

		// Read system.config once for language, timezone and location fallback
		const sysConfig = await this.getForeignObjectAsync("system.config");
		const rawLang = (sysConfig?.common?.language || "en").toLowerCase();
		const SUPPORTED_LANGS = ["de", "en", "fr", "it", "es", "pt", "nl", "pl", "ru", "uk", "zh-cn"];
		const lang = SUPPORTED_LANGS.includes(rawLang) ? rawLang :
			(SUPPORTED_LANGS.includes(rawLang.split("-")[0]) ? rawLang.split("-")[0] : "en");
		const timezone = sysConfig?.common?.timezone || "auto";

		if (!Array.isArray(locations) || locations.length === 0) {
			// Fallback: use ioBroker system coordinates from system.config
			const lat = sysConfig?.common?.latitude;
			const lon = sysConfig?.common?.longitude;
			const city = sysConfig?.common?.city || "Home";
			if (lat != null && lon != null) {
				this.log.info(
					`Keine Standorte konfiguriert – verwende ioBroker-Systemstandort: ${city} (${lat}, ${lon})`,
				);
				locations = [{ name: city, lat, lon }];
			} else {
				this.log.error("Keine Standorte konfiguriert und kein Systemstandort in ioBroker hinterlegt.");
				await this.setState("info.connection", false, true);
				return;
			}
		}

		if (hourlyDays > daysCount) {
			this.log.error(`hourlyDays (${hourlyDays}) darf nicht größer als daysCount (${daysCount}) sein!`);
			await this.setState("info.connection", false, true);
			return;
		}

		const tempUnit = temperatureUnit === "fahrenheit" ? "°F" : "°C";
		const windUnit =
			windspeedUnit === "ms" ? "m/s" : windspeedUnit === "mph" ? "mph" : windspeedUnit === "kn" ? "kn" : "km/h";
		const precipUnit = precipitationUnit === "inch" ? "inch" : "mm";
		const units = { tempUnit, windUnit, precipUnit, windspeedUnit };

		const validLocationIds = new Set(locations.map(loc => normalizeId(loc.name)).filter(id => id.length > 0));

		let anySuccess = false;

		for (const loc of locations) {
			const locId = normalizeId(loc.name);
			if (!locId) {
				continue;
			}

			try {
				const data = await this.fetchWeather(
					loc.lat,
					loc.lon,
					daysCount,
					temperatureUnit,
					windspeedUnit,
					precipitationUnit,
					timezone,
				);

				await this.setObjectNotExistsAsync(locId, {
					type: "channel",
					common: { name: loc.name },
					native: {},
				});

				await this.processData(data, locId, daysCount, hourlyDays, units, iconSet, loc, enableAstronomy, enableAstronomyHourly, enableAgriculture, enableAgricultureHourly, lang);
				await this.cleanupLocation(locId, daysCount, hourlyDays);

				if (enablePollen || enableAirQuality) {
					try {
						const aq = await this.fetchAirQuality(loc.lat, loc.lon, timezone);
						await this.processPollen(aq, locId, hourlyDays, enablePollen, enableAirQuality, enableAirQualityHourly, enablePollenHourly, lang);
					} catch (err) {
						this.log.warn(`Pollen/Luftqualität-Daten nicht verfügbar für "${loc.name}": ${err.message}`);
					}
				} else {
					// Both pollen and air quality disabled – clean up all related channels
					try { await this.delObjectAsync(`${locId}.current.air_quality`, { recursive: true }); } catch { /* ok */ }
					try { await this.delObjectAsync(`${locId}.current.pollen`, { recursive: true }); } catch { /* ok */ }
					for (let d = 1; d <= daysCount; d++) {
						try { await this.delObjectAsync(`${locId}.day${d}.pollen`, { recursive: true }); } catch { /* ok */ }
						try { await this.delObjectAsync(`${locId}.day${d}.air_quality`, { recursive: true }); } catch { /* ok */ }
					}
					for (let d = 1; d <= hourlyDays; d++) {
						for (let hh = 0; hh < 24; hh++) {
							const _hk = `h${String(hh).padStart(2, "0")}`;
							try { await this.delObjectAsync(`${locId}.day${d}.hourly.${_hk}.pollen`, { recursive: true }); } catch { /* ok */ }
							try { await this.delObjectAsync(`${locId}.day${d}.hourly.${_hk}.air_quality`, { recursive: true }); } catch { /* ok */ }
						}
					}
				}

				anySuccess = true;
				this.log.info(`OpenMeteo aktualisiert: ${loc.name} (${daysCount} Tage, ${hourlyDays} davon stündlich)`);
			} catch (err) {
				this.log.error(`Fehler beim Abrufen der Wetterdaten für "${loc.name}": ${err.message}`);
			}
		}

		await this.setState("info.connection", anySuccess, true);
		if (anySuccess) {
			await this.setObjectNotExistsAsync("info.lastUpdate", {
				type: "state",
				common: { name: "Letztes Update", type: "string", role: "date", read: true, write: false },
				native: {},
			});
			await this.setState("info.lastUpdate", new Date().toISOString(), true);
		}
		await this.cleanupOrphanedLocations(validLocationIds);
	}

	/**
	 * Fetches weather data from Open-Meteo API
	 *
	 * @param {number} lat - Latitude
	 * @param {number} lon - Longitude
	 * @param {number} daysCount - Number of forecast days
	 * @param {string} temperatureUnit - Temperature unit
	 * @param {string} windspeedUnit - Wind speed unit
	 * @param {string} precipitationUnit - Precipitation unit
	 * @param {string} timezone - Timezone string (e.g. "Europe/Berlin" or "auto")
	 * @returns {Promise<object>} Parsed JSON response from Open-Meteo API
	 */
	fetchWeather(lat, lon, daysCount, temperatureUnit, windspeedUnit, precipitationUnit, timezone) {
		return new Promise((resolve, reject) => {
			const url =
				`https://api.open-meteo.com/v1/forecast` +
				`?latitude=${lat}&longitude=${lon}` +
				`&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min` +
				`,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,windgusts_10m_max` +
				`,winddirection_10m_dominant,sunrise,sunset,uv_index_max,sunshine_duration` +
				`,rain_sum,snowfall_sum,daylight_duration,shortwave_radiation_sum,et0_fao_evapotranspiration` +
			`,cloud_cover_max,dew_point_2m_mean,relative_humidity_2m_mean,pressure_msl_mean` +
				`&hourly=temperature_2m,apparent_temperature,precipitation_probability` +
				`,precipitation,weathercode,windspeed_10m,winddirection_10m,cloudcover` +
				`,relative_humidity_2m,dew_point_2m,pressure_msl,visibility,is_day` +
				`,rain,snowfall,snow_depth,shortwave_radiation,cape,soil_temperature_0cm,global_tilted_irradiance` +
				`&current=temperature_2m,apparent_temperature,precipitation,weathercode` +
				`,windspeed_10m,windgusts_10m,winddirection_10m,cloudcover` +
				`,relative_humidity_2m,dew_point_2m,pressure_msl,visibility,is_day` +
				`,rain,snowfall,snow_depth,shortwave_radiation,cape,soil_temperature_0cm,global_tilted_irradiance` +
				`&timezone=${encodeURIComponent(timezone)}&forecast_days=${daysCount}` +
				`&temperature_unit=${temperatureUnit}` +
				`&windspeed_unit=${windspeedUnit}` +
				`&precipitation_unit=${precipitationUnit}`;

			https
				.get(url, res => {
					let raw = "";
					res.on("data", c => (raw += c));
					res.on("end", () => {
						try {
							resolve(JSON.parse(raw));
						} catch (e) {
							reject(e);
						}
					});
				})
				.on("error", reject);
		});
	}

	/**
	 * Fetches pollen and air quality data from Open-Meteo Air Quality API
	 *
	 * @param {number} lat - Latitude
	 * @param {number} lon - Longitude
	 * @param {string} timezone - Timezone string (e.g. "Europe/Berlin" or "auto")
	 * @returns {Promise<object>} Parsed JSON response from Open-Meteo Air Quality API
	 */
	fetchAirQuality(lat, lon, timezone) {
		return new Promise((resolve, reject) => {
			const url =
				`https://air-quality-api.open-meteo.com/v1/air-quality` +
				`?latitude=${lat}&longitude=${lon}` +
				`&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,carbon_monoxide,dust,ozone` +
			`&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen` +
			`,european_aqi,pm10,pm2_5,nitrogen_dioxide,carbon_monoxide,dust,ozone` +
				`&timezone=${encodeURIComponent(timezone)}&forecast_days=4`;

			https
				.get(url, res => {
					let raw = "";
					res.on("data", c => (raw += c));
					res.on("end", () => {
						try {
							resolve(JSON.parse(raw));
						} catch (e) {
							reject(e);
						}
					});
				})
				.on("error", reject);
		});
	}

	/**
	 * Creates or updates a state
	 *
	 * @param {string} id - State ID
	 * @param {any} value - State value
	 * @param {object} common - State common definition
	 */
	async setDP(id, value, common) {
		await this.setObjectNotExistsAsync(id, {
			type: "state",
			common: { ...common, read: true, write: false },
			native: {},
		});
		await this.setStateAsync(id, value, true);
	}

	/**
	 * Processes weather data and writes all states for one location
	 *
	 * @param {object} data - Raw API response
	 * @param {string} locId - Location channel ID
	 * @param {number} daysCount - Number of days
	 * @param {number} hourlyDays - Number of days with hourly data
	 * @param {object} units - Unit labels { tempUnit, windUnit, precipUnit }
	 * @param {string} iconSet - Icon set to use ("wmo" or "basmilius")
	 */
	async processData(data, locId, daysCount, hourlyDays, units, iconSet, loc, enableAstronomy, enableAstronomyHourly, enableAgriculture, enableAgricultureHourly, lang) {
		const { tempUnit, windUnit, precipUnit, windspeedUnit } = units;
		const descriptions = I18N_DESCRIPTIONS[lang] || I18N_DESCRIPTIONS.en;
		const weekdays = I18N_WEEKDAYS[lang] || I18N_WEEKDAYS.en;
		const d = data.daily;
		const h = data.hourly;
		const cur = data.current;

		// --- Current weather channel ---
		if (cur) {
			const curCode = cur.weathercode;
			const curIcon = ICONS[curCode] || "🌡️";
			const curDesc = descriptions[curCode] || descriptions[0] || "?";

			await this.setObjectNotExistsAsync(`${locId}.current`, {
				type: "channel",
				common: { name: "Aktuelles Wetter" },
				native: {},
			});

			await this.setDP(`${locId}.current.temperature`, Math.round(cur.temperature_2m * 10) / 10, {
				name: "Temperatur",
				type: "number",
				unit: tempUnit,
				role: "value.temperature",
			});
			await this.setDP(`${locId}.current.feels_like`, Math.round(cur.apparent_temperature * 10) / 10, {
				name: "Gefühlt",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.feelslike",
			});
			await this.setDP(`${locId}.current.weathercode`, curCode, {
				name: "Wettercode",
				type: "number",
				role: "value",
			});
			await this.setDP(`${locId}.current.icon`, curIcon, {
				name: "Icon",
				type: "string",
				role: "weather.icon.name",
			});
			await this.setDP(`${locId}.current.icon_url`, weatherIconUrl(curCode, iconSet, cur.is_day === 1), {
				name: "Icon URL",
				type: "string",
				role: "weather.icon",
			});
			await this.setDP(`${locId}.current.description`, curDesc, {
				name: "Beschreibung",
				type: "string",
				role: "weather.state",
			});
			await this.setDP(`${locId}.current.windspeed`, cur.windspeed_10m, {
				name: "Wind",
				type: "number",
				unit: windUnit,
				role: "value.speed.wind",
			});
			await this.setDP(`${locId}.current.windgusts`, cur.windgusts_10m, {
				name: "Windböen",
				type: "number",
				unit: windUnit,
				role: "value.speed.wind.gust",
			});
			await this.setDP(`${locId}.current.winddirection`, cur.winddirection_10m, {
				name: "Windrichtung",
				type: "number",
				unit: "°",
				role: "value.direction.wind",
			});
			await this.setDP(`${locId}.current.winddirection_text`, degreesToCompass(cur.winddirection_10m), {
				name: "Windrichtung Text",
				type: "string",
				role: "weather.direction.wind",
			});
			await this.setDP(`${locId}.current.winddirection_icon`, degreesToEmoji(cur.winddirection_10m), {
				name: "Windrichtung Icon",
				type: "string",
				role: "weather.icon.name",
			});
			await this.setDP(`${locId}.current.winddirection_icon_url`, windDirIconUrl(cur.winddirection_10m), {
				name: "Windrichtung Icon URL",
				type: "string",
				role: "weather.icon",
			});
			const curBeaufort = speedToBeaufort(cur.windspeed_10m, windspeedUnit);
			await this.setDP(`${locId}.current.windbeaufort`, curBeaufort, {
				name: "Windstärke Beaufort",
				type: "number",
				role: "value",
			});
			await this.setDP(`${locId}.current.windbeaufort_icon_url`, windBeaufortIconUrl(curBeaufort), {
				name: "Windstärke Icon URL",
				type: "string",
				role: "weather.icon",
			});
			await this.setDP(`${locId}.current.precipitation`, cur.precipitation, {
				name: "Niederschlag",
				type: "number",
				unit: precipUnit,
				role: "value.precipitation.hour",
			});
			await this.setDP(`${locId}.current.cloudcover`, cur.cloudcover, {
				name: "Bewölkung",
				type: "number",
				unit: "%",
				role: "value.clouds",
			});
			await this.setDP(`${locId}.current.humidity`, cur.relative_humidity_2m, {
				name: "Luftfeuchtigkeit",
				type: "number",
				unit: "%",
				role: "value.humidity",
			});
			await this.setDP(`${locId}.current.dew_point`, Math.round(cur.dew_point_2m * 10) / 10, {
				name: "Taupunkt",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.dewpoint",
			});
			await this.setDP(`${locId}.current.pressure`, Math.round(cur.pressure_msl * 10) / 10, {
				name: "Luftdruck",
				type: "number",
				unit: "hPa",
				role: "value.pressure",
			});
			await this.setDP(`${locId}.current.visibility`, cur.visibility, {
				name: "Sichtweite",
				type: "number",
				unit: "m",
				role: "value.distance.visibility",
			});
			await this.setDP(`${locId}.current.is_day`, cur.is_day === 1, {
				name: "Tag",
				type: "boolean",
				role: "indicator.day",
			});
			await this.setDP(`${locId}.current.rain`, cur.rain, {
				name: "Regen",
				type: "number",
				unit: precipUnit,
				role: "value.precipitation.hour",
			});
			await this.setDP(`${locId}.current.snowfall`, cur.snowfall, {
				name: "Schneefall",
				type: "number",
				unit: "cm",
				role: "value.precipitation.snow",
			});
			await this.setDP(`${locId}.current.snow_depth`, Math.round(cur.snow_depth * 100), {
				name: "Schneehöhe",
				type: "number",
				unit: "cm",
				role: "value.precipitation.snow",
			});
			if (enableAgriculture) {
				await this.setObjectNotExistsAsync(`${locId}.current.agriculture`, {
					type: "channel",
					common: { name: "Agrar/Solar aktuell" },
					native: {},
				});
				await this.setDP(`${locId}.current.agriculture.solar_radiation`, cur.shortwave_radiation, {
					name: "Solarstrahlung",
					type: "number",
					unit: "W/m²",
					role: "value.radiation",
				});
				await this.setDP(`${locId}.current.agriculture.cape`, cur.cape, {
					name: "Gewitterpotenzial (CAPE)",
					type: "number",
					unit: "J/kg",
					role: "value",
				});
				await this.setDP(`${locId}.current.agriculture.soil_temp`, cur.soil_temperature_0cm != null ? Math.round(cur.soil_temperature_0cm * 10) / 10 : null, {
					name: "Bodentemperatur 0cm",
					type: "number",
					unit: units.tempUnit,
					role: "value.temperature",
				});
			} else {
				try { await this.delObjectAsync(`${locId}.current.agriculture`, { recursive: true }); } catch { /* ok */ }
			}
		}

		// --- Group hourly values by date ---
		const hoursByDate = {};
		for (let i = 0; i < h.time.length; i++) {
			const dateKey = h.time[i].substring(0, 10);
			const hour = parseInt(h.time[i].substring(11, 13));
			if (!hoursByDate[dateKey]) {
				hoursByDate[dateKey] = [];
			}
			hoursByDate[dateKey][hour] = {
				temperature: Math.round(h.temperature_2m[i] * 10) / 10,
				feels_like: Math.round(h.apparent_temperature[i] * 10) / 10,
				precipitation: h.precipitation[i],
				rain_prob: h.precipitation_probability[i],
				windspeed: h.windspeed_10m[i],
				winddirection: h.winddirection_10m[i],
				cloudcover: h.cloudcover[i],
				weathercode: h.weathercode[i],
				icon: ICONS[h.weathercode[i]] || "🌡️",
				description: descriptions[h.weathercode[i]] || "?",
				humidity: h.relative_humidity_2m[i],
				dew_point: Math.round(h.dew_point_2m[i] * 10) / 10,
				pressure: Math.round(h.pressure_msl[i] * 10) / 10,
				visibility: h.visibility[i],
				is_day: h.is_day[i] === 1,
				rain: h.rain[i],
				snowfall: h.snowfall[i],
				snow_depth: Math.round(h.snow_depth[i] * 100),
				solar_radiation: h.shortwave_radiation[i],
				cape: h.cape[i],
				soil_temp: h.soil_temperature_0cm ? Math.round(h.soil_temperature_0cm[i] * 10) / 10 : null,
				irradiance: h.global_tilted_irradiance ? h.global_tilted_irradiance[i] : null,
			};
		}

		const shortParts = [];

		for (let i = 0; i < d.time.length; i++) {
			const date = new Date(d.time[i]);
			const weekday = weekdays[date.getDay()];
			const icon = ICONS[d.weathercode[i]] || "🌡️";
			const desc = descriptions[d.weathercode[i]] || "?";
			const prefix = `${locId}.day${i + 1}`;
			const tempMax = Math.round(d.temperature_2m_max[i] * 10) / 10;
			const tempMin = Math.round(d.temperature_2m_min[i] * 10) / 10;
			const feelsMax = Math.round(d.apparent_temperature_max[i] * 10) / 10;
			const feelsMin = Math.round(d.apparent_temperature_min[i] * 10) / 10;
			const sunH = Math.round(d.sunshine_duration[i] / 360) / 10;
			const daylightH = Math.round(d.daylight_duration[i] / 360) / 10;
			const precipType = precipitationType(d.weathercode[i]);

			await this.setObjectNotExistsAsync(prefix, {
				type: "channel",
				common: { name: `Tag ${i + 1}: ${weekday} ${d.time[i]}` },
				native: {},
			});

			await this.setDP(`${prefix}.date`, d.time[i], { name: "Datum", type: "string", role: "date" });
			await this.setDP(`${prefix}.weekday`, weekday, { name: "Wochentag", type: "string", role: "dayofweek" });
			await this.setDP(`${prefix}.icon`, icon, { name: "Icon", type: "string", role: "weather.icon.name" });
			await this.setDP(`${prefix}.icon_url`, weatherIconUrl(d.weathercode[i], iconSet, true), {
				name: "Icon URL",
				type: "string",
				role: "weather.icon",
			});
			await this.setDP(`${prefix}.description`, desc, {
				name: "Beschreibung",
				type: "string",
				role: "weather.state",
			});
			await this.setDP(`${prefix}.temp_max`, tempMax, {
				name: "Temp. Max",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.max",
			});
			await this.setDP(`${prefix}.temp_min`, tempMin, {
				name: "Temp. Min",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.min",
			});
			await this.setDP(`${prefix}.feels_like_max`, feelsMax, {
				name: "Gefühlt Max",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.feelslike",
			});
			await this.setDP(`${prefix}.feels_like_min`, feelsMin, {
				name: "Gefühlt Min",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.feelslike",
			});
			await this.setDP(`${prefix}.weathercode`, d.weathercode[i], {
				name: "Wettercode",
				type: "number",
				role: "value",
			});
			await this.setDP(`${prefix}.precipitation_type`, precipType, {
				name: "Niederschlagsart",
				type: "number",
				role: "value.precipitation.type",
			});
			await this.setDP(`${prefix}.precipitation`, d.precipitation_sum[i], {
				name: "Niederschlag",
				type: "number",
				unit: precipUnit,
				role: "value.precipitation",
			});
			await this.setDP(`${prefix}.rain_probability`, d.precipitation_probability_max[i], {
				name: "Regenwahrsch.",
				type: "number",
				unit: "%",
				role: "value.precipitation.chance",
			});
			await this.setDP(`${prefix}.windspeed`, d.windspeed_10m_max[i], {
				name: "Wind Max",
				type: "number",
				unit: windUnit,
				role: "value.speed.max.wind",
			});
			await this.setDP(`${prefix}.windgusts`, d.windgusts_10m_max[i], {
				name: "Windböen Max",
				type: "number",
				unit: windUnit,
				role: "value.speed.wind.gust",
			});
			await this.setDP(`${prefix}.winddirection`, d.winddirection_10m_dominant[i], {
				name: "Windrichtung",
				type: "number",
				unit: "°",
				role: "value.direction.wind",
			});
			await this.setDP(`${prefix}.winddirection_text`, degreesToCompass(d.winddirection_10m_dominant[i]), {
				name: "Windrichtung Text",
				type: "string",
				role: "weather.direction.wind",
			});
			await this.setDP(`${prefix}.winddirection_icon`, degreesToEmoji(d.winddirection_10m_dominant[i]), {
				name: "Windrichtung Icon",
				type: "string",
				role: "weather.icon.name",
			});
			await this.setDP(`${prefix}.winddirection_icon_url`, windDirIconUrl(d.winddirection_10m_dominant[i]), {
				name: "Windrichtung Icon URL",
				type: "string",
				role: "weather.icon",
			});
			const dayBeaufort = speedToBeaufort(d.windspeed_10m_max[i], windspeedUnit);
			await this.setDP(`${prefix}.windbeaufort`, dayBeaufort, {
				name: "Windstärke Beaufort",
				type: "number",
				role: "value",
			});
			await this.setDP(`${prefix}.windbeaufort_icon_url`, windBeaufortIconUrl(dayBeaufort), {
				name: "Windstärke Icon URL",
				type: "string",
				role: "weather.icon",
			});
			if (enableAstronomy) {
				await this.setObjectNotExistsAsync(`${prefix}.astronomy`, {
					type: "channel",
					common: { name: `Astronomie Tag ${i + 1}` },
					native: {},
				});
				await this.setDP(`${prefix}.astronomy.sunrise`, d.sunrise[i], {
					name: "Sonnenaufgang",
					type: "string",
					role: "date.sunrise",
				});
				await this.setDP(`${prefix}.astronomy.sunset`, d.sunset[i], {
					name: "Sonnenuntergang",
					type: "string",
					role: "date.sunset",
				});
			} else {
				try { await this.delObjectAsync(`${prefix}.astronomy`, { recursive: true }); } catch { /* ok */ }
			}
			await this.setDP(`${prefix}.uv_index`, d.uv_index_max[i], {
				name: "UV-Index",
				type: "number",
				role: "value.uv",
			});
			await this.setDP(`${prefix}.sunshine_hours`, sunH, {
				name: "Sonnenstunden",
				type: "number",
				unit: "h",
				role: "value",
			});
			await this.setDP(`${prefix}.daylight_hours`, daylightH, {
				name: "Tageslichtdauer",
				type: "number",
				unit: "h",
				role: "value",
			});
			await this.setDP(`${prefix}.rain`, d.rain_sum[i], {
				name: "Regen",
				type: "number",
				unit: precipUnit,
				role: "value.precipitation",
			});
			await this.setDP(`${prefix}.snowfall`, d.snowfall_sum[i], {
				name: "Schneefall",
				type: "number",
				unit: "cm",
				role: "value.precipitation.snow",
			});
			if (enableAgriculture) {
				await this.setObjectNotExistsAsync(`${prefix}.agriculture`, {
					type: "channel",
					common: { name: `Agrar/Solar Tag ${i + 1}` },
					native: {},
				});
				await this.setDP(`${prefix}.agriculture.solar_radiation_sum`, Math.round(d.shortwave_radiation_sum[i] * 10) / 10, {
					name: "Solarstrahlung gesamt",
					type: "number",
					unit: "MJ/m²",
					role: "value.radiation",
				});
				await this.setDP(`${prefix}.agriculture.evapotranspiration`, Math.round(d.et0_fao_evapotranspiration[i] * 10) / 10, {
					name: "Evapotranspiration",
					type: "number",
					unit: "mm",
					role: "value",
				});
			} else {
				try { await this.delObjectAsync(`${prefix}.agriculture`, { recursive: true }); } catch { /* ok */ }
			}
			await this.setDP(`${prefix}.cloud_cover_max`, d.cloud_cover_max[i], {
				name: "Bewölkung Max",
				type: "number",
				unit: "%",
				role: "value.clouds",
			});
			await this.setDP(`${prefix}.dew_point_mean`, Math.round(d.dew_point_2m_mean[i] * 10) / 10, {
				name: "Taupunkt Mittel",
				type: "number",
				unit: tempUnit,
				role: "value.temperature.dewpoint",
			});
			await this.setDP(`${prefix}.humidity_mean`, d.relative_humidity_2m_mean[i], {
				name: "Luftfeuchtigkeit Mittel",
				type: "number",
				unit: "%",
				role: "value.humidity",
			});
			await this.setDP(`${prefix}.pressure_mean`, Math.round(d.pressure_msl_mean[i] * 10) / 10, {
				name: "Luftdruck Mittel",
				type: "number",
				unit: "hPa",
				role: "value.pressure",
			});

			// Astronomy channel (sun + moon)
			let astroData = null;
			if (enableAstronomy) {
				const moonDate = new Date(`${d.time[i]}T12:00:00`);
				const moonIllum = SunCalc.getMoonIllumination(moonDate);
				const moonTimes = SunCalc.getMoonTimes(moonDate, loc.lat, loc.lon);
				const { text: moonText, idx: moonIdx } = moonPhaseInfo(moonIllum.phase, lang);
				astroData = {
					sunrise: d.sunrise[i],
					sunset: d.sunset[i],
					moon_phase_val: Math.round(moonIllum.phase * 100) / 100,
					moon_phase_text: moonText,
					moon_phase_icon_url: `/openmeteo.admin/icons/moon/${moonIdx}.png`,
					moonrise: moonTimes.rise ? moonTimes.rise.toISOString() : null,
					moonset: moonTimes.set ? moonTimes.set.toISOString() : null,
				};
				await this.setDP(`${prefix}.astronomy.moon_phase_val`, astroData.moon_phase_val, {
					name: "Mondphase (0–1)",
					type: "number",
					role: "value",
				});
				await this.setDP(`${prefix}.astronomy.moon_phase_text`, astroData.moon_phase_text, {
					name: "Mondphase Text",
					type: "string",
					role: "weather.state",
				});
				await this.setDP(`${prefix}.astronomy.moon_phase_icon_url`, astroData.moon_phase_icon_url, {
					name: "Mondphase Icon URL",
					type: "string",
					role: "weather.icon",
				});
				if (astroData.moonrise) {
					await this.setDP(`${prefix}.astronomy.moonrise`, astroData.moonrise, {
						name: "Mondaufgang",
						type: "string",
						role: "date.sunrise",
					});
				}
				if (astroData.moonset) {
					await this.setDP(`${prefix}.astronomy.moonset`, astroData.moonset, {
						name: "Monduntergang",
						type: "string",
						role: "date.sunset",
					});
				}
			}

			// Hourly values (only for days ≤ hourlyDays)
			if (i < hourlyDays) {
				await this.setObjectNotExistsAsync(`${prefix}.hourly`, {
					type: "channel",
					common: { name: `Stundenwerte Tag ${i + 1}` },
					native: {},
				});

				const hours = hoursByDate[d.time[i]] || [];
				for (let hh = 0; hh < 24; hh++) {
					const hData = hours[hh];
					if (!hData) {
						continue;
					}
					const hKey = `h${String(hh).padStart(2, "0")}`;
					const hPath = `${prefix}.hourly.${hKey}`;

					await this.setObjectNotExistsAsync(hPath, {
						type: "channel",
						common: { name: `${String(hh).padStart(2, "0")}:00 Uhr` },
						native: {},
					});

					await this.setDP(`${hPath}.temperature`, hData.temperature, {
						name: "Temperatur",
						type: "number",
						unit: tempUnit,
						role: "value.temperature",
					});
					await this.setDP(`${hPath}.feels_like`, hData.feels_like, {
						name: "Gefühlt",
						type: "number",
						unit: tempUnit,
						role: "value.temperature.feelslike",
					});
					await this.setDP(`${hPath}.precipitation`, hData.precipitation, {
						name: "Niederschlag",
						type: "number",
						unit: precipUnit,
						role: "value.precipitation.hour",
					});
					await this.setDP(`${hPath}.rain_prob`, hData.rain_prob, {
						name: "Regenwahrsch.",
						type: "number",
						unit: "%",
						role: "value.precipitation.chance",
					});
					await this.setDP(`${hPath}.windspeed`, hData.windspeed, {
						name: "Wind",
						type: "number",
						unit: windUnit,
						role: "value.speed.wind",
					});
					await this.setDP(`${hPath}.winddirection`, hData.winddirection, {
						name: "Windrichtung",
						type: "number",
						unit: "°",
						role: "value.direction.wind",
					});
					await this.setDP(`${hPath}.winddirection_text`, degreesToCompass(hData.winddirection), {
						name: "Windrichtung Text",
						type: "string",
						role: "weather.direction.wind",
					});
					await this.setDP(`${hPath}.winddirection_icon`, degreesToEmoji(hData.winddirection), {
						name: "Windrichtung Icon",
						type: "string",
						role: "weather.icon.name",
					});
					await this.setDP(`${hPath}.winddirection_icon_url`, windDirIconUrl(hData.winddirection), {
						name: "Windrichtung Icon URL",
						type: "string",
						role: "weather.icon",
					});
					const hBeaufort = speedToBeaufort(hData.windspeed, windspeedUnit);
					await this.setDP(`${hPath}.windbeaufort`, hBeaufort, {
						name: "Windstärke Beaufort",
						type: "number",
						role: "value",
					});
					await this.setDP(`${hPath}.windbeaufort_icon_url`, windBeaufortIconUrl(hBeaufort), {
						name: "Windstärke Icon URL",
						type: "string",
						role: "weather.icon",
					});
					await this.setDP(`${hPath}.cloudcover`, hData.cloudcover, {
						name: "Bewölkung",
						type: "number",
						unit: "%",
						role: "value.clouds",
					});
					await this.setDP(`${hPath}.humidity`, hData.humidity, {
						name: "Luftfeuchtigkeit",
						type: "number",
						unit: "%",
						role: "value.humidity",
					});
					await this.setDP(`${hPath}.dew_point`, hData.dew_point, {
						name: "Taupunkt",
						type: "number",
						unit: tempUnit,
						role: "value.temperature.dewpoint",
					});
					await this.setDP(`${hPath}.pressure`, hData.pressure, {
						name: "Luftdruck",
						type: "number",
						unit: "hPa",
						role: "value.pressure",
					});
					await this.setDP(`${hPath}.visibility`, hData.visibility, {
						name: "Sichtweite",
						type: "number",
						unit: "m",
						role: "value.distance.visibility",
					});
					await this.setDP(`${hPath}.is_day`, hData.is_day, {
						name: "Tag",
						type: "boolean",
						role: "indicator.day",
					});
					await this.setDP(`${hPath}.rain`, hData.rain, {
						name: "Regen",
						type: "number",
						unit: precipUnit,
						role: "value.precipitation.hour",
					});
					await this.setDP(`${hPath}.snowfall`, hData.snowfall, {
						name: "Schneefall",
						type: "number",
						unit: "cm",
						role: "value.precipitation.snow",
					});
					await this.setDP(`${hPath}.snow_depth`, hData.snow_depth, {
						name: "Schneehöhe",
						type: "number",
						unit: "cm",
						role: "value.precipitation.snow",
					});
					if (enableAgricultureHourly) {
						await this.setObjectNotExistsAsync(`${hPath}.agriculture`, {
							type: "channel",
							common: { name: "Agrar/Solar" },
							native: {},
						});
						await this.setDP(`${hPath}.agriculture.solar_radiation`, hData.solar_radiation, {
							name: "Solarstrahlung",
							type: "number",
							unit: "W/m²",
							role: "value.radiation",
						});
						await this.setDP(`${hPath}.agriculture.cape`, hData.cape, {
							name: "Gewitterpotenzial (CAPE)",
							type: "number",
							unit: "J/kg",
							role: "value",
						});
						await this.setDP(`${hPath}.agriculture.soil_temp`, hData.soil_temp, {
							name: "Bodentemperatur 0cm",
							type: "number",
							unit: tempUnit,
							role: "value.temperature",
						});
						await this.setDP(`${hPath}.agriculture.irradiance`, hData.irradiance, {
							name: "Globalstrahlung (geneigt)",
							type: "number",
							unit: "W/m²",
							role: "value.radiation",
						});
					} else {
						try { await this.delObjectAsync(`${hPath}.agriculture`, { recursive: true }); } catch { /* ok */ }
					}
					await this.setDP(`${hPath}.weathercode`, hData.weathercode, {
						name: "Wettercode",
						type: "number",
						role: "value",
					});
					await this.setDP(`${hPath}.icon`, hData.icon, {
						name: "Icon",
						type: "string",
						role: "weather.icon.name",
					});
					await this.setDP(`${hPath}.icon_url`, weatherIconUrl(hData.weathercode, iconSet, hData.is_day), {
						name: "Icon URL",
						type: "string",
						role: "weather.icon",
					});
					await this.setDP(`${hPath}.description`, hData.description, {
						name: "Beschreibung",
						type: "string",
						role: "weather.state",
					});

					// Astronomy: echo daily values into each hourly slot
					if (enableAstronomyHourly && astroData) {
						await this.setObjectNotExistsAsync(`${hPath}.astronomy`, {
							type: "channel",
							common: { name: "Astronomie" },
							native: {},
						});
						await this.setDP(`${hPath}.astronomy.sunrise`, astroData.sunrise, {
							name: "Sonnenaufgang",
							type: "string",
							role: "date.sunrise",
						});
						await this.setDP(`${hPath}.astronomy.sunset`, astroData.sunset, {
							name: "Sonnenuntergang",
							type: "string",
							role: "date.sunset",
						});
						await this.setDP(`${hPath}.astronomy.moon_phase_val`, astroData.moon_phase_val, {
							name: "Mondphase (0–1)",
							type: "number",
							role: "value",
						});
						await this.setDP(`${hPath}.astronomy.moon_phase_text`, astroData.moon_phase_text, {
							name: "Mondphase Text",
							type: "string",
							role: "weather.state",
						});
						await this.setDP(`${hPath}.astronomy.moon_phase_icon_url`, astroData.moon_phase_icon_url, {
							name: "Mondphase Icon URL",
							type: "string",
							role: "weather.icon",
						});
						if (astroData.moonrise) {
							await this.setDP(`${hPath}.astronomy.moonrise`, astroData.moonrise, {
								name: "Mondaufgang",
								type: "string",
								role: "date.sunrise",
							});
						}
						if (astroData.moonset) {
							await this.setDP(`${hPath}.astronomy.moonset`, astroData.moonset, {
								name: "Monduntergang",
								type: "string",
								role: "date.sunset",
							});
						}
					} else if (!enableAstronomyHourly) {
						try { await this.delObjectAsync(`${hPath}.astronomy`, { recursive: true }); } catch { /* ok */ }
					}
				}
			}

			shortParts.push(`${weekday} ${Math.round(tempMax)}° ${icon}`);
		}

		await this.setDP(`${locId}.weather_short`, shortParts.join(" | "), {
			name: "Wetter Kurzübersicht",
			type: "string",
			role: "weather.title",
		});
	}

	/**
	 * Removes orphaned states when daysCount or hourlyDays was reduced for a location
	 *
	 * @param {string} locId - Location channel ID
	 * @param {number} daysCount - Current days count
	 * @param {number} hourlyDays - Current hourly days count
	 */
	async cleanupLocation(locId, daysCount, hourlyDays) {
		// Delete entire day channels beyond daysCount (up to max 16)
		for (let i = daysCount + 1; i <= 16; i++) {
			try {
				await this.delObjectAsync(`${locId}.day${i}`, { recursive: true });
				this.log.debug(`${locId}: Tag ${i} gelöscht`);
			} catch {
				// Object didn't exist, ignore
			}
		}
		// Delete only hourly sub-channels for days beyond hourlyDays
		for (let i = hourlyDays + 1; i <= daysCount; i++) {
			try {
				await this.delObjectAsync(`${locId}.day${i}.hourly`, { recursive: true });
				this.log.debug(`${locId}: Stundenwerte Tag ${i} gelöscht`);
			} catch {
				// Object didn't exist, ignore
			}
		}
	}

	/**
	 * Processes pollen data and writes datapoints under dayX.pollen and dayX.hourly.hXX.pollen
	 *
	 * @param {object} data - Air quality API response
	 * @param {string} locId - Location ID
	 * @param {number} hourlyDays - Number of days with hourly channels
	 */
	async processPollen(data, locId, hourlyDays, enablePollen, enableAirQuality, enableAirQualityHourly, enablePollenHourly, lang) {
		// --- AQI current data ---
		if (enableAirQuality && data.current) {
			const c = data.current;
			await this.setObjectNotExistsAsync(`${locId}.current.air_quality`, {
				type: "channel",
				common: { name: "Luftqualität aktuell" },
				native: {},
			});
			const aqiFields = [
				{ key: "european_aqi", name: "Europäischer Luftqualitätsindex", unit: "" },
				{ key: "pm10", name: "PM10", unit: "µg/m³" },
				{ key: "pm2_5", name: "PM2.5", unit: "µg/m³" },
				{ key: "nitrogen_dioxide", name: "Stickstoffdioxid (NO₂)", unit: "µg/m³" },
				{ key: "carbon_monoxide", name: "Kohlenmonoxid (CO)", unit: "µg/m³" },
				{ key: "dust", name: "Staub", unit: "µg/m³" },
				{ key: "ozone", name: "Ozon", unit: "µg/m³" },
			];
			for (const f of aqiFields) {
				await this.setDP(`${locId}.current.air_quality.${f.key}`, c[f.key] ?? null, {
					name: f.name,
					type: "number",
					unit: f.unit,
					role: "value",
				});
			}
		} else if (!enableAirQuality) {
			try { await this.delObjectAsync(`${locId}.current.air_quality`, { recursive: true }); } catch { /* ok */ }
		}

		// Clean up pollen channels if pollen is disabled
		if (!enablePollen) {
			try { await this.delObjectAsync(`${locId}.current.pollen`, { recursive: true }); } catch { /* ok */ }
			for (let d = 1; d <= 16; d++) {
				try { await this.delObjectAsync(`${locId}.day${d}.pollen`, { recursive: true }); } catch { /* ok */ }
			}
		}

		// Hourly data needed for daily max calculation and/or hourly display
		if (!enablePollenHourly && !enableAirQualityHourly && !enablePollen && !enableAirQuality) {
			return;
		}

		const h = data.hourly;
		if (!h || !h.time) {
			return;
		}

		const types = [
			{ key: "alder_pollen", name: "Erle" },
			{ key: "birch_pollen", name: "Birke" },
			{ key: "grass_pollen", name: "Gräser" },
			{ key: "mugwort_pollen", name: "Beifuß" },
			{ key: "olive_pollen", name: "Olive" },
			{ key: "ragweed_pollen", name: "Ambrosia" },
		];

		const aqHourlyFields = [
			{ key: "european_aqi", name: "Europäischer Luftqualitätsindex", unit: "" },
			{ key: "pm10", name: "PM10", unit: "µg/m³" },
			{ key: "pm2_5", name: "PM2.5", unit: "µg/m³" },
			{ key: "nitrogen_dioxide", name: "Stickstoffdioxid (NO₂)", unit: "µg/m³" },
			{ key: "carbon_monoxide", name: "Kohlenmonoxid (CO)", unit: "µg/m³" },
			{ key: "dust", name: "Staub", unit: "µg/m³" },
			{ key: "ozone", name: "Ozon", unit: "µg/m³" },
		];

		// Group hourly pollen + AQ values by date
		const byDate = {};
		for (let i = 0; i < h.time.length; i++) {
			const dateKey = h.time[i].substring(0, 10);
			const hour = parseInt(h.time[i].substring(11, 13));
			if (!byDate[dateKey]) {
				byDate[dateKey] = { hours: {}, max: {}, aqMax: {} };
			}
			const vals = {};
			for (const { key } of types) {
				const val = h[key] ? h[key][i] : null;
				vals[key] = val;
				if (val != null) {
					byDate[dateKey].max[key] = Math.max(byDate[dateKey].max[key] ?? 0, val);
				}
			}
			const aqVals = {};
			for (const { key } of aqHourlyFields) {
				const aqVal = h[key] ? h[key][i] : null;
				aqVals[key] = aqVal;
				if (aqVal != null) {
					byDate[dateKey].aqMax[key] = Math.max(byDate[dateKey].aqMax[key] ?? 0, aqVal);
				}
			}
			vals._aq = aqVals;
			byDate[dateKey].hours[hour] = vals;
		}

		// Current hour pollen under current.pollen (only if pollen enabled)
		if (enablePollen) {
			const now = new Date();
			const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
			const currentHour = now.getHours();
			const currentHourVals = byDate[todayKey]?.hours[currentHour];
			if (currentHourVals) {
				await this.setObjectNotExistsAsync(`${locId}.current.pollen`, {
					type: "channel",
					common: { name: "Pollen aktuell" },
					native: {},
				});
				for (const { key, name } of types) {
					const dpKey = key.replace("_pollen", "");
					const val = currentHourVals[key] ?? null;
					await this.setDP(`${locId}.current.pollen.${dpKey}`, val, {
						name,
						type: "number",
						unit: "Grains/m³",
						role: "value",
					});
					await this.setDP(`${locId}.current.pollen.${dpKey}_text`, pollenLevelText(val, key, lang), {
						name: `${name} (Text)`,
						type: "string",
						unit: "",
						role: "text",
					});
				}
			}
		}

		const dates = Object.keys(byDate).sort();
		for (let i = 0; i < dates.length; i++) {
			const dayNum = i + 1;
			const dayData = byDate[dates[i]];

			// Daily max under dayX.pollen (only if pollen enabled)
			if (enablePollen) {
				const pollenPrefix = `${locId}.day${dayNum}.pollen`;
				await this.setObjectNotExistsAsync(pollenPrefix, {
					type: "channel",
					common: { name: `Pollen Tag ${dayNum} (Tagesmax)` },
					native: {},
				});
				for (const { key, name } of types) {
					const dpKey = key.replace("_pollen", "");
					const val = dayData.max[key] ?? null;
					await this.setDP(`${pollenPrefix}.${dpKey}`, val, {
						name,
						type: "number",
						unit: "Grains/m³",
						role: "value",
					});
					await this.setDP(`${pollenPrefix}.${dpKey}_text`, pollenLevelText(val, key, lang), {
						name: `${name} (Text)`,
						type: "string",
						unit: "",
						role: "text",
					});
				}
			}

			// Daily max air quality under dayX.air_quality (only if air quality enabled)
			if (enableAirQuality) {
				const aqDayPrefix = `${locId}.day${dayNum}.air_quality`;
				await this.setObjectNotExistsAsync(aqDayPrefix, {
					type: "channel",
					common: { name: `Luftqualität Tag ${dayNum} (Tagesmax)` },
					native: {},
				});
				for (const f of aqHourlyFields) {
					await this.setDP(`${aqDayPrefix}.${f.key}_max`, dayData.aqMax?.[f.key] ?? null, {
						name: `${f.name} (Tagesmax)`,
						type: "number",
						unit: f.unit,
						role: "value",
					});
				}
			} else {
				try { await this.delObjectAsync(`${locId}.day${dayNum}.air_quality`, { recursive: true }); } catch { /* ok */ }
			}

			// Hourly pollen + AQ under dayX.hourly.hXX.*
			if (i < hourlyDays) {
				for (const [hourStr, vals] of Object.entries(dayData.hours)) {
					const hKey = `h${String(hourStr).padStart(2, "0")}`;
					const hBase = `${locId}.day${dayNum}.hourly.${hKey}`;

					// Pollen hourly
					if (enablePollenHourly) {
						const hPollenPrefix = `${hBase}.pollen`;
						await this.setObjectNotExistsAsync(hPollenPrefix, {
							type: "channel",
							common: { name: "Pollen" },
							native: {},
						});
						for (const { key, name } of types) {
							const dpKey = key.replace("_pollen", "");
							const hVal = vals[key] ?? null;
							await this.setDP(`${hPollenPrefix}.${dpKey}`, hVal, {
								name,
								type: "number",
								unit: "Grains/m³",
								role: "value",
							});
							await this.setDP(`${hPollenPrefix}.${dpKey}_text`, pollenLevelText(hVal, key, lang), {
								name: `${name} (Text)`,
								type: "string",
								unit: "",
								role: "text",
							});
						}
					} else {
						try { await this.delObjectAsync(`${hBase}.pollen`, { recursive: true }); } catch { /* ok */ }
					}

					// Air quality hourly
					if (enableAirQualityHourly) {
						const hAqPrefix = `${hBase}.air_quality`;
						await this.setObjectNotExistsAsync(hAqPrefix, {
							type: "channel",
							common: { name: "Luftqualität" },
							native: {},
						});
						for (const f of aqHourlyFields) {
							await this.setDP(`${hAqPrefix}.${f.key}`, vals._aq[f.key] ?? null, {
								name: f.name,
								type: "number",
								unit: f.unit,
								role: "value",
							});
						}
					} else {
						try { await this.delObjectAsync(`${hBase}.air_quality`, { recursive: true }); } catch { /* ok */ }
					}
				}
			} else {
				// Day beyond hourlyDays – clean up
				if (!enablePollenHourly) {
					for (let hh = 0; hh < 24; hh++) {
						const hKey = `h${String(hh).padStart(2, "0")}`;
						try { await this.delObjectAsync(`${locId}.day${dayNum}.hourly.${hKey}.pollen`, { recursive: true }); } catch { /* ok */ }
					}
				}
				if (!enableAirQualityHourly) {
					for (let hh = 0; hh < 24; hh++) {
						const hKey = `h${String(hh).padStart(2, "0")}`;
						try { await this.delObjectAsync(`${locId}.day${dayNum}.hourly.${hKey}.air_quality`, { recursive: true }); } catch { /* ok */ }
					}
				}
			}
		}

		// Remove old top-level pollen channel if it exists from a previous version
		try {
			await this.delObjectAsync(`${locId}.pollen`, { recursive: true });
		} catch {
			// didn't exist, fine
		}
	}

	/**
	 * Removes top-level location channels that are no longer in config
	 *
	 * @param {Set<string>} validLocationIds - Set of valid location IDs
	 */
	async cleanupOrphanedLocations(validLocationIds) {
		try {
			const allObjects = await this.getAdapterObjectsAsync();
			const namespace = `${this.namespace}.`;

			// Find top-level channels (only one dot beyond the namespace)
			const topLevelIds = new Set();
			for (const fullId of Object.keys(allObjects)) {
				if (!fullId.startsWith(namespace)) {
					continue;
				}
				const relative = fullId.slice(namespace.length);
				// Top-level: no dots in relative path
				if (!relative.includes(".")) {
					topLevelIds.add(relative);
				}
			}

			for (const channelId of topLevelIds) {
				if (channelId === "info") {
					continue;
				}
				if (validLocationIds.has(channelId)) {
					continue;
				}

				try {
					await this.delObjectAsync(channelId, { recursive: true });
					this.log.info(`Veralteter Standortkanal gelöscht: ${channelId}`);
				} catch (err) {
					this.log.warn(`Konnte Standortkanal "${channelId}" nicht löschen: ${err.message}`);
				}
			}
		} catch (err) {
			this.log.warn(`Fehler beim Aufräumen veralteter Standortkanäle: ${err.message}`);
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 *
	 * @param {() => void} callback - Callback function
	 */
	onUnload(callback) {
		try {
			if (this.updateTimeout) {
				this.clearTimeout(this.updateTimeout);
			}
			if (this.updateInterval) {
				this.clearInterval(this.updateInterval);
			}
			callback();
		} catch (error) {
			this.log.error(`Error during unloading: ${error.message}`);
			callback();
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	module.exports = options => new Openmeteo(options);
} else {
	// otherwise start the instance directly
	new Openmeteo();
}
