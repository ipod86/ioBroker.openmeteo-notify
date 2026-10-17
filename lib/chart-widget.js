"use strict";

/**
 * Chart widget – a forecast card in the style of the Home Assistant
 * "weather-forecast-card" (troinine/ha-weather-forecast-card).
 *
 * Interaction is pure CSS (hidden radio inputs + <label for>), no JavaScript:
 *  - tap on the forecast toggles daily ⇄ hourly
 *  - the gear button opens a menu to pick the charted attribute; picking an
 *    entry closes the menu again (every attribute has a "menu closed" and a
 *    "menu open" radio in the same group).
 *
 * Only attributes/details that the adapter actually wrote (state exists and is
 * not null) are rendered – nothing is padded with 0.
 */

const { I18N_CHART } = require("./i18n");

const COL = 100; // SVG width per column (viewBox units)
const CH_H = 190; // SVG chart height (viewBox units)
const VISIBLE_DAILY = 7;
const VISIBLE_HOURLY = 8;

const COLORS = {
	accent: "#056bb8",
	tempHi: "#ff9800",
	tempLo: "#2196f3",
	hum: "#2196f3",
	press: "#00acc1",
	bar: "rgba(33,150,243,0.45)",
	sunrise: "#ff9800",
	sunset: "#926bc7",
	windLow: "#43a047",
	windMid: "#ffa600",
	windHigh: "#db4437",
	uv: ["#289500", "#f7e400", "#f85900", "#d8001d", "#6b49c8"],
};

const MDI = {
	gear: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
	close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
	feels: "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",
	humid: "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M9.75,10A1.25,1.25 0 0,1 11,11.25A1.25,1.25 0 0,1 9.75,12.5A1.25,1.25 0 0,1 8.5,11.25A1.25,1.25 0 0,1 9.75,10M14.25,14.5A1.25,1.25 0 0,1 15.5,15.75A1.25,1.25 0 0,1 14.25,17A1.25,1.25 0 0,1 13,15.75A1.25,1.25 0 0,1 14.25,14.5Z",
	wind: "M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z",
	press: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,14.4 19,16.5 17.3,18C15.9,16.7 14,16 12,16C10,16 8.2,16.7 6.7,18C5,16.5 4,14.4 4,12A8,8 0 0,1 12,4M14,5.89C13.62,5.9 13.26,6.15 13.1,6.54L11.81,9.77L11.71,10C11,10.13 10.41,10.6 10.14,11.26C9.73,12.29 10.23,13.45 11.26,13.86C12.29,14.27 13.45,13.77 13.86,12.74C14.12,12.08 14,11.32 13.57,10.76L13.67,10.5L14.96,7.29L14.97,7.26C15.17,6.75 14.92,6.17 14.41,5.96C14.28,5.91 14.15,5.89 14,5.89M10,6A1,1 0 0,0 9,7A1,1 0 0,0 10,8A1,1 0 0,0 11,7A1,1 0 0,0 10,6M7,9A1,1 0 0,0 6,10A1,1 0 0,0 7,11A1,1 0 0,0 8,10A1,1 0 0,0 7,9M17,9A1,1 0 0,0 16,10A1,1 0 0,0 17,11A1,1 0 0,0 18,10A1,1 0 0,0 17,9Z",
	eye: "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",
	uv: "M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13",
	sunrise:
		"M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.79,21.21 14.4,20.82L12,18.41L9.6,20.82C9.21,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z",
};

/**
 * HTML escape
 *
 * @param {any} s - value to escape
 */
const esc = s =>
	String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

/**
 * true if a state value counts as "fetched"
 *
 * @param {any} v - state value
 */
const has = v => v !== null && v !== undefined && v !== "";

const num = v => (has(v) && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * Number formatting: max one decimal, locale decimal separator
 *
 * @param {any} v - numeric value
 * @param {string} lang - language key
 * @param {number} [digits] - maximum fraction digits
 */
function fmt(v, lang, digits = 1) {
	const n = Number(v);
	return n.toLocaleString(lang === "zh-cn" ? "zh-CN" : lang, {
		maximumFractionDigits: digits,
		minimumFractionDigits: 0,
	});
}

/**
 * "2026-10-17T07:53" → "07:53"
 *
 * @param {string} iso - ISO timestamp
 */
const hhmm = iso => (has(iso) ? String(iso).split("T")[1]?.substring(0, 5) || "" : "");

/**
 * Catmull-Rom → cubic Bézier, smooth line like the original card
 *
 * @param {Array<Array<number>>} pts - points [x, y]
 */
function smoothPath(pts) {
	if (pts.length === 1) {
		return `M${pts[0][0]},${pts[0][1]}`;
	}
	let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] || pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] || p2;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6;
		const c1y = p1[1] + (p2[1] - p0[1]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6;
		const c2y = p2[1] - (p3[1] - p1[1]) / 6;
		d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
	}
	return d;
}

const uvColor = u => COLORS.uv[u < 3 ? 0 : u < 6 ? 1 : u < 8 ? 2 : u < 11 ? 3 : 4];

/**
 * Renders one chart SVG.
 *
 * @param {object} o - options
 * @param {Array<object>} o.items - forecast slots
 * @param {string} o.cls - CSS class for visibility switching
 * @param {Array<object>} [o.lines] - [{ key, color, dashed, above, label }]
 * @param {string} [o.barKey] - precipitation key (bars at the bottom)
 * @param {Function} [o.barLabel] - label formatter for bars
 * @param {string} [o.uvKey] - UV key (coloured columns)
 * @param {number} [o.minSpan] - minimum value span of the y-axis
 * @param {object} o.theme - colors
 * @param {number} o.fs - font scale
 */
function chartSvg(o) {
	const { items, theme, fs } = o;
	const n = items.length;
	const w = n * COL;
	const font = 19 * fs;
	const x = i => i * COL + COL / 2;
	const hasBars = !!o.barKey && items.some(it => (it[o.barKey] ?? 0) > 0);
	const top = font + 10;
	const bottom = hasBars ? CH_H - (font + 52) : CH_H - (font + 8);
	let s = `<svg class="${o.cls}" viewBox="0 0 ${w} ${CH_H}" preserveAspectRatio="none" style="width:100%;height:auto;aspect-ratio:${w}/${CH_H};overflow:visible;" xmlns="http://www.w3.org/2000/svg">`;
	for (let i = 1; i < n; i++) {
		s += `<line x1="${i * COL}" y1="4" x2="${i * COL}" y2="${CH_H - 4}" stroke="${theme.div}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
	}
	const text = (tx, ty, str, color, weight = 400, size = font) =>
		`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${color}" font-size="${size.toFixed(1)}" font-weight="${weight}" text-anchor="middle" font-family="sans-serif">${str}</text>`;

	if (hasBars) {
		const vals = items.map(it => it[o.barKey] ?? 0);
		const max = Math.max(...vals, 4);
		const area = 40;
		items.forEach((it, i) => {
			const v = it[o.barKey] ?? 0;
			if (v <= 0) {
				return;
			}
			const h = Math.max(4, (v / max) * area);
			const by = CH_H - font - 8 - h;
			s += `<rect x="${(x(i) - 16).toFixed(1)}" y="${by.toFixed(1)}" width="32" height="${h.toFixed(1)}" rx="3" fill="${COLORS.bar}"/>`;
			s += text(x(i), CH_H - 4, o.barLabel(v), theme.text, 400, font * 0.85);
		});
	}

	if (o.uvKey) {
		const base = CH_H - 12;
		const max = Math.max(...items.map(it => it[o.uvKey]), 6);
		items.forEach((it, i) => {
			const u = it[o.uvKey];
			const h = (u / max) * (base - top - 6);
			if (h > 0) {
				s += `<rect x="${(x(i) - 20).toFixed(1)}" y="${(base - h).toFixed(1)}" width="40" height="${h.toFixed(1)}" rx="3" fill="${uvColor(u)}"/>`;
			}
			s += text(x(i), base - h - 8, fmt(Math.round(u), "en", 0), theme.text, 600);
		});
		s += `<line x1="0" y1="${base}" x2="${w}" y2="${base}" stroke="${theme.div}" stroke-width="1.5"/>`;
	}

	if (o.lines?.length) {
		const vals = items.flatMap(it => o.lines.map(l => it[l.key]));
		let min = Math.min(...vals);
		let max = Math.max(...vals);
		const span = Math.max(max - min, o.minSpan ?? 4);
		const mid = (min + max) / 2;
		min = mid - span / 2;
		max = mid + span / 2;
		const y = v => bottom - ((v - min) / span) * (bottom - top);
		for (const l of o.lines) {
			const pts = items.map((it, i) => [x(i), y(it[l.key])]);
			s += `<path d="${smoothPath(pts)}" fill="none" stroke="${l.color}" stroke-width="4" stroke-linecap="round"${l.dashed ? ' stroke-dasharray="7 7"' : ""}/>`;
			pts.forEach(([px, py], i) => {
				s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${l.color}"/>`;
				const ty = l.above ? py - 12 : py + font + 8;
				s += text(px, ty, l.label(items[i][l.key]), l.dashed ? theme.sub : theme.text, l.dashed ? 400 : 600);
			});
		}
	}
	return `${s}</svg>`;
}

/**
 * Builds the chart widget HTML.
 *
 * @param {object} o - options
 * @param {object} o.widget - widget config
 * @param {string} o.locId - location channel id
 * @param {(id: string) => Promise<any>} o.getVal - returns state value or null if not existing
 * @param {(url: string) => Promise<string>} o.resolveIcon - icon url → embeddable url
 * @param {object} o.config - adapter config
 * @param {string} o.lang - language key
 * @param {string} o.warningHtml - optional warning overlay
 * @param {Date} [o.now] - reference time (tests)
 */
async function buildChartWidget(o) {
	const { widget, locId: p, getVal, resolveIcon, config, lang } = o;
	const L = I18N_CHART[lang] || I18N_CHART.en;
	const wid = String(widget.id).replace(/[^A-Za-z0-9_-]/g, "");
	const R = `omc-${wid}`; // id prefix, unique per widget
	const c = x => `${(x / 4.5).toFixed(2)}cqw`; // design px at 450 px reference width
	const sh = Math.max(0.1, 1 + (widget.scaleHeader ?? 0) * 0.2);
	const sd = Math.max(0.1, 1 + (widget.scaleDetails ?? 0) * 0.2);
	const sf = Math.max(0.1, 1 + (widget.scaleForecast ?? 0) * 0.2);

	// ── Theme (same semantics as the other widget variants) ──────────────────
	const isLight = widget.theme === "light"; // "light" = light text for dark backgrounds
	const isCustom = widget.theme === "custom";
	const rgba = (hex, a) =>
		`rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
	let theme;
	let bg = "transparent";
	if (isCustom) {
		const base = /^#[0-9a-f]{6}$/i.test(widget.textBase || "") ? widget.textBase : "#000000";
		bg = widget.bgColor && widget.bgColor !== "transparent" ? widget.bgColor : "transparent";
		const lum =
			0.299 * parseInt(base.slice(1, 3), 16) +
			0.587 * parseInt(base.slice(3, 5), 16) +
			0.114 * parseInt(base.slice(5, 7), 16);
		theme = {
			text: rgba(base, 0.9),
			sub: rgba(base, 0.65),
			fade: rgba(base, 0.45),
			div: rgba(base, 0.15),
			icon: rgba(base, 0.8),
			menuBg: bg !== "transparent" ? bg : lum > 128 ? "#23262b" : "#ffffff",
			menuText:
				bg !== "transparent" ? rgba(base, 0.9) : lum > 128 ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.87)",
			hover: rgba(base, 0.06),
		};
	} else {
		const base = isLight ? "#ffffff" : "#000000";
		theme = {
			text: rgba(base, isLight ? 0.95 : 0.87),
			sub: rgba(base, isLight ? 0.7 : 0.6),
			fade: rgba(base, 0.45),
			div: rgba(base, isLight ? 0.18 : 0.12),
			icon: rgba(base, isLight ? 0.85 : 0.6),
			menuBg: isLight ? "#23262b" : "#ffffff",
			menuText: isLight ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.87)",
			hover: rgba(base, 0.06),
		};
	}

	const tUnit = config.temperatureUnit === "fahrenheit" ? "°F" : "°C";
	const wUnit = { ms: "m/s", mph: "mph", kn: "kn" }[config.windspeedUnit] || "km/h";
	const pUnit = config.precipitationUnit === "inch" ? "in" : "mm";

	const iconSet = config.iconSet || "basmilius";
	const isWmoSvg = iconSet === "wmo_svg";
	const imgScale = iconSet.startsWith("amcharts") ? 1.5 : iconSet.startsWith("basmilius") ? 1.05 : 1;
	const imgFilter = isWmoSvg && isLight ? "filter:invert(1);" : "";

	const mdi = (path, size, color = theme.icon) =>
		`<svg viewBox="0 0 24 24" style="width:${size};height:${size};fill:${color};flex-shrink:0;vertical-align:middle;" xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`;

	// ── Current ──────────────────────────────────────────────────────────────
	const cur = {};
	for (const k of [
		"temperature",
		"description",
		"icon_url",
		"feels_like",
		"humidity",
		"windspeed",
		"windgusts",
		"winddirection_text",
		"pressure",
		"visibility",
		"comfort.uv_index",
	]) {
		cur[k] = await getVal(`${p}.current.${k}`);
	}
	const sunrise = hhmm(await getVal(`${p}.day0.astronomy.sunrise`));
	const sunset = hhmm(await getVal(`${p}.day0.astronomy.sunset`));
	const curIcon = has(cur.icon_url) ? await resolveIcon(cur.icon_url) : "";

	// ── Daily ────────────────────────────────────────────────────────────────
	const dayCount = Math.min(widget.days ?? 7, 14);
	const days = [];
	for (let i = 0; i < dayCount; i++) {
		const k = `${p}.day${i}.`;
		const tMax = num(await getVal(`${k}temp_max`));
		const tMin = num(await getVal(`${k}temp_min`));
		if (tMax === null || tMin === null) {
			break; // day not fetched
		}
		const iconUrl = await getVal(`${k}icon_url`);
		days.push({
			label: (await getVal(`${k}weekday`)) ?? "",
			icon: has(iconUrl) ? await resolveIcon(iconUrl) : "",
			desc: (await getVal(`${k}description`)) ?? "",
			hi: tMax,
			lo: tMin,
			prec: num(await getVal(`${k}precipitation`)),
			fhi: num(await getVal(`${k}feels_like_max`)),
			flo: num(await getVal(`${k}feels_like_min`)),
			hum: num(await getVal(`${k}humidity_mean`)),
			press: num(await getVal(`${k}pressure_mean`)),
			uv: num(await getVal(`${k}uv_index`)),
			bft: num(await getVal(`${k}windbeaufort`)),
			wdir: num(await getVal(`${k}winddirection`)),
			wspd: num(await getVal(`${k}windspeed`)),
		});
	}

	// ── Hourly ───────────────────────────────────────────────────────────────
	const hours = [];
	if ((config.hourlyDays ?? 3) > 0) {
		const step = widget.hourlyStep ?? 2;
		const range = widget.hourlyRange ?? 20;
		const now = o.now || new Date();
		const startH = now.getHours() - (now.getHours() % step);
		const sunMarks = {};
		for (let d = 0; d < 3; d++) {
			for (const [key, cls] of [
				["sunrise", "rise"],
				["sunset", "set"],
			]) {
				const t = hhmm(await getVal(`${p}.day${d}.astronomy.${key}`));
				if (t) {
					sunMarks[`${d}-${parseInt(t, 10)}`] = { cls, t };
				}
			}
		}
		for (let s = 0; s < Math.round(range / step); s++) {
			const total = startH + s * step;
			const day = Math.floor(total / 24);
			const hour = total % 24;
			const k = `${p}.day${day}.hourly.h${String(hour).padStart(2, "0")}.`;
			const temp = num(await getVal(`${k}temperature`));
			if (temp === null) {
				break; // outside hourlyDays
			}
			const iconUrl = await getVal(`${k}icon_url`);
			const newDay = s === 0 || hour < step;
			hours.push({
				label: newDay ? ((await getVal(`${p}.day${day}.weekday`)) ?? "") : String(hour).padStart(2, "0"),
				chip: newDay,
				sun: !newDay && step === 1 ? sunMarks[`${day}-${hour}`] : undefined,
				icon: has(iconUrl) ? await resolveIcon(iconUrl) : "",
				desc: (await getVal(`${k}description`)) ?? "",
				temp,
				prec: num(await getVal(`${k}precipitation`)),
				feels: num(await getVal(`${k}feels_like`)),
				hum: num(await getVal(`${k}humidity`)),
				press: num(await getVal(`${k}pressure`)),
				uv: num(await getVal(`${k}uv_index`)),
				bft: num(await getVal(`${k}windbeaufort`)),
				wdir: num(await getVal(`${k}winddirection`)),
				wspd: num(await getVal(`${k}windspeed`)),
			});
		}
	}

	// ── Attributes: only those with complete data in every shown view ────────
	const views = [{ key: "d", items: days, daily: true }];
	if (hours.length > 0) {
		views.push({ key: "h", items: hours, daily: false });
	}
	const all = (items, keys) => items.length > 0 && items.every(it => keys.every(k => it[k] !== null));
	const deg = v => `${fmt(v, lang)}°`;
	const withPrecip = views.every(v => v.items.every(it => it.prec !== null));
	const ATTRS = [
		{ key: "temp", name: withPrecip ? L.tempPrecip : L.temp, need: v => (v.daily ? ["hi", "lo"] : ["temp"]) },
		{ key: "feels", name: L.feels, need: v => (v.daily ? ["fhi", "flo"] : ["feels"]) },
		{ key: "hum", name: L.humidity, need: () => ["hum"] },
		{ key: "press", name: L.pressure, need: () => ["press"] },
		{ key: "uv", name: L.uv, need: () => ["uv"] },
	].filter(a => views.every(v => all(v.items, a.need(v))));

	const chartsFor = v => {
		const opts = { items: v.items, theme, fs: sf };
		return ATTRS.map(a => {
			const cls = `${R}-c-${a.key}`;
			switch (a.key) {
				case "temp":
					return chartSvg({
						...opts,
						cls,
						lines: v.daily
							? [
									{ key: "hi", color: COLORS.tempHi, above: true, label: deg },
									{ key: "lo", color: COLORS.tempLo, dashed: true, label: deg },
								]
							: [{ key: "temp", color: COLORS.tempHi, above: true, label: deg }],
						barKey: withPrecip ? "prec" : null,
						barLabel: x => `${fmt(x, lang)} ${pUnit}`,
					});
				case "feels":
					return chartSvg({
						...opts,
						cls,
						lines: v.daily
							? [
									{ key: "fhi", color: COLORS.tempHi, above: true, label: deg },
									{ key: "flo", color: COLORS.tempLo, dashed: true, label: deg },
								]
							: [{ key: "feels", color: COLORS.tempHi, above: true, label: deg }],
					});
				case "hum":
					return chartSvg({
						...opts,
						cls,
						minSpan: 30,
						lines: [{ key: "hum", color: COLORS.hum, above: true, label: x => `${Math.round(x)} %` }],
					});
				case "press":
					return chartSvg({
						...opts,
						cls,
						minSpan: v.daily ? 12 : 6,
						lines: [{ key: "press", color: COLORS.press, above: true, label: x => `${Math.round(x)}` }],
					});
				case "uv":
					return chartSvg({ ...opts, cls, uvKey: "uv" });
				default:
					return "";
			}
		}).join("");
	};

	const windBadge = it => {
		if (it.bft === null) {
			return "";
		}
		const col = it.bft <= 3 ? COLORS.windLow : it.bft <= 5 ? COLORS.windMid : COLORS.windHigh;
		const rot = it.wdir === null ? null : (it.wdir + 180) % 360;
		const title = it.wspd !== null ? ` title="${fmt(it.wspd, lang)} ${wUnit}"` : "";
		return (
			`<span${title} style="position:relative;display:inline-grid;place-items:center;width:${c(30 * sf)};height:${c(30 * sf)};">` +
			`<svg viewBox="0 0 32 32" style="position:absolute;inset:0;width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg">` +
			`<g${rot === null ? "" : ` transform="rotate(${rot} 16 16)"`}><circle cx="16" cy="17" r="11" fill="none" stroke="${col}" stroke-width="2.5"/>` +
			`${rot === null ? "" : `<path d="M16 1 L21 8 L11 8 Z" fill="${col}"/>`}</g></svg>` +
			`<span style="position:relative;font-size:${c(11 * sf)};font-weight:600;color:${theme.text};padding-top:${c(2)};">${it.bft}</span></span>`
		);
	};

	const viewHtml = v => {
		const n = v.items.length;
		const visible = Math.min(n, v.daily ? VISIBLE_DAILY : VISIBLE_HOURLY);
		const colW = 100 / visible; // cqw per column
		const trackW = `${(colW * n).toFixed(3)}cqw`;
		const col = `flex:0 0 ${colW.toFixed(3)}cqw;display:flex;flex-direction:column;align-items:center;`;
		const iconSz = c(34 * sf);
		const head = v.items
			.map(it => {
				let lbl = `font-size:${c(12 * sf)};color:${theme.sub};line-height:1.5;`;
				let txt = it.label;
				if (it.chip) {
					lbl += `background:${COLORS.accent};color:#fff;border-radius:${c(10)};padding:0 ${c(6)};`;
				} else if (it.sun) {
					lbl += `color:${it.sun.cls === "rise" ? COLORS.sunrise : COLORS.sunset};`;
					txt = it.sun.t;
				}
				const img = it.icon
					? `<img src="${esc(it.icon)}" alt="${esc(it.desc)}" style="width:${iconSz};height:${iconSz};transform:scale(${imgScale});${imgFilter}">`
					: `<span style="height:${iconSz};"></span>`;
				return `<div style="${col}gap:${c(2)};"><span style="${lbl}">${esc(txt)}</span>${img}</div>`;
			})
			.join("");
		const winds = v.items.some(it => it.bft !== null)
			? `<div style="display:flex;margin-top:${c(2)};">${v.items.map(it => `<div style="${col}">${windBadge(it)}</div>`).join("")}</div>`
			: "";
		const target = v.key === "d" ? "h" : "d";
		const clickable = views.length > 1;
		const tag = clickable ? "label" : "div";
		const forAttr = clickable ? ` for="${R}-v-${target}"` : "";
		return (
			`<${tag} class="${R}-view ${R}-view-${v.key}"${forAttr} style="cursor:${clickable ? "pointer" : "default"};">` +
			`<div style="overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;"><div style="width:${trackW};">` +
			`<div style="display:flex;">${head}</div>${chartsFor(v)}${winds}` +
			`</div></div></${tag}>`
		);
	};

	// ── Details (only fetched values) ────────────────────────────────────────
	const details = [];
	const dIcon = path => mdi(path, c(15 * sd));
	if (has(cur.feels_like)) {
		details.push([MDI.feels, L.feels, `${fmt(cur.feels_like, lang)} ${tUnit}`]);
	}
	if (has(cur.humidity)) {
		details.push([MDI.humid, L.humidity, `${fmt(cur.humidity, lang, 0)} %`]);
	}
	if (has(cur.windspeed)) {
		let wtxt = `${fmt(cur.windspeed, lang)} ${wUnit}`;
		if (has(cur.winddirection_text)) {
			wtxt += ` ${cur.winddirection_text}`;
		}
		if (has(cur.windgusts)) {
			wtxt += ` · ${L.gusts} ${fmt(cur.windgusts, lang)}`;
		}
		details.push([MDI.wind, L.wind, wtxt]);
	}
	if (has(cur.pressure)) {
		details.push([MDI.press, L.pressure, `${fmt(cur.pressure, lang, 0)} hPa`]);
	}
	if (has(cur.visibility)) {
		details.push([MDI.eye, L.visibility, `${fmt(Number(cur.visibility) / 1000, lang)} km`]);
	}
	if (has(cur["comfort.uv_index"])) {
		details.push([MDI.uv, L.uv, fmt(cur["comfort.uv_index"], lang)]);
	}
	if (sunrise || sunset) {
		details.push([
			MDI.sunrise,
			L.sun,
			`${sunrise ? `↑ ${sunrise}` : ""}${sunrise && sunset ? "  " : ""}${sunset ? `↓ ${sunset}` : ""}`,
		]);
	}

	// ── CSS (state switching) ────────────────────────────────────────────────
	let css = `#${R} input.${R}-in{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none;}`;
	css += `#${R} .${R}-view,#${R} .${R}-gear,#${R} .${R}-menu,#${R} .${R}-bd,#${R} .${R}-an,#${R} svg[class^="${R}-c-"]{display:none;}`;
	for (const v of views) {
		css += `#${R}-v-${v.key}:checked~.${R}-fc .${R}-view-${v.key}{display:block;}`;
	}
	for (const a of ATTRS) {
		const sel = `#${R}-a-${a.key}:checked,#${R}-m-${a.key}:checked`;
		css += sel
			.split(",")
			.map(s => `${s}~.${R}-fc svg.${R}-c-${a.key}`)
			.join(",");
		css += `{display:block;}`;
		css += sel
			.split(",")
			.map(s => `${s}~.${R}-set .${R}-an-${a.key}`)
			.join(",");
		css += `{display:inline;}`;
		css += `#${R}-a-${a.key}:checked~.${R}-set .${R}-go-${a.key},#${R}-m-${a.key}:checked~.${R}-set .${R}-gc-${a.key}{display:grid;}`;
		css += `#${R}-m-${a.key}:checked~.${R}-menu{display:flex;}`;
		css += `#${R}-m-${a.key}:checked~.${R}-bd-${a.key}{display:block;}`;
		css += `#${R}-m-${a.key}:checked~.${R}-menu .${R}-mi-${a.key}{color:${COLORS.accent};background:rgba(5,107,184,0.14);}`;
	}
	css += `#${R} .${R}-mi:hover{background:${theme.hover};}`;

	// ── HTML ─────────────────────────────────────────────────────────────────
	let html = `<div style="container-type:inline-size;width:100%;">`;
	html += `<style>${css}</style>`;
	html += `<div id="${R}" style="position:relative;background:${bg};color:${theme.text};font-family:Roboto,'Segoe UI',sans-serif;padding:${c(10)} ${c(8)} ${c(6)};box-sizing:border-box;">`;

	// header
	const mainIcon = c(64 * sh);
	html += `<div style="display:flex;align-items:center;gap:${c(10)};">`;
	if (curIcon) {
		html += `<img src="${esc(curIcon)}" alt="" style="width:${mainIcon};height:${mainIcon};flex-shrink:0;transform:scale(${imgScale});${imgFilter}">`;
	}
	html += `<div style="flex:1;min-width:0;"><div style="font-size:${c(22 * sh)};line-height:1.2;">${esc(cur.description ?? "")}</div>`;
	html += `<div style="font-size:${c(13 * sh)};color:${theme.sub};">${esc(widget.locationName)}</div></div>`;
	html += `<div style="text-align:right;">`;
	if (has(cur.temperature)) {
		html += `<div style="font-size:${c(30 * sh)};font-weight:300;line-height:1.1;">${fmt(cur.temperature, lang)}${tUnit}</div>`;
	}
	if (days[0]) {
		html += `<div style="font-size:${c(12 * sh)};color:${theme.sub};">${fmt(days[0].hi, lang)}${tUnit} / ${fmt(days[0].lo, lang)}${tUnit}</div>`;
	}
	html += `</div></div>`;

	// details
	if (details.length) {
		html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${c(3)} ${c(16)};margin-top:${c(8)};font-size:${c(12 * sd)};">`;
		html += details
			.map(
				([icon, label, val]) =>
					`<div style="display:flex;align-items:center;gap:${c(6)};min-width:0;">${dIcon(icon)}<span style="color:${theme.sub};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(label)}</span><span style="white-space:nowrap;">${esc(val)}</span></div>`,
			)
			.join("");
		html += `</div>`;
	}

	// forecast section with radio state
	html += `<div style="position:relative;margin-top:${c(8)};">`;
	views.forEach((v, i) => {
		html += `<input type="radio" class="${R}-in" name="${R}-v" id="${R}-v-${v.key}"${i === 0 ? " checked" : ""}>`;
	});
	ATTRS.forEach((a, i) => {
		html += `<input type="radio" class="${R}-in" name="${R}-a" id="${R}-a-${a.key}"${i === 0 ? " checked" : ""}>`;
		html += `<input type="radio" class="${R}-in" name="${R}-a" id="${R}-m-${a.key}">`;
	});

	const multi = ATTRS.length > 1;
	html += `<div class="${R}-set" style="display:flex;align-items:center;justify-content:flex-end;gap:${c(8)};min-height:${c(26)};">`;
	html += ATTRS.map(
		a =>
			`<span class="${R}-an ${R}-an-${a.key}" style="font-size:${c(11 * sf)};color:${theme.sub};">${esc(a.name)}</span>`,
	).join("");
	if (multi) {
		const btn = `width:${c(26)};height:${c(26)};border-radius:${c(8)};background:${COLORS.accent};place-items:center;cursor:pointer;position:relative;z-index:6;`;
		html += ATTRS.map(
			a =>
				`<label class="${R}-gear ${R}-go-${a.key}" for="${R}-m-${a.key}" title="${esc(L.choose)}" style="${btn}">${mdi(MDI.gear, c(16), "#fff")}</label>` +
				`<label class="${R}-gear ${R}-gc-${a.key}" for="${R}-a-${a.key}" title="${esc(L.close)}" style="${btn}">${mdi(MDI.close, c(16), "#fff")}</label>`,
		).join("");
	}
	html += `</div>`;
	if (multi) {
		html += ATTRS.map(
			a =>
				`<label class="${R}-bd ${R}-bd-${a.key}" for="${R}-a-${a.key}" style="position:fixed;inset:0;z-index:5;cursor:default;"></label>`,
		).join("");
		html += `<div class="${R}-menu" style="position:absolute;top:${c(32)};right:0;z-index:6;flex-direction:column;background:${theme.menuBg};border:1px solid ${theme.div};border-radius:${c(10)};padding:${c(6)} 0;box-shadow:0 6px 20px rgba(0,0,0,0.25);max-width:100%;">`;
		html += ATTRS.map(
			a =>
				`<label class="${R}-mi ${R}-mi-${a.key}" for="${R}-a-${a.key}" style="display:flex;align-items:center;padding:0 ${c(14)};height:${c(36)};font-size:${c(13)};white-space:nowrap;cursor:pointer;color:${theme.menuText};">${esc(a.name)}</label>`,
		).join("");
		html += `</div>`;
	}
	html += `<div class="${R}-fc">${views.map(viewHtml).join("")}</div>`;
	html += `</div>`;

	html += o.warningHtml || "";
	html += `</div></div>`;
	return html;
}

module.exports = { buildChartWidget };
