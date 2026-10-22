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
const { isSnow, THUNDER_LP, texts: nowcastTexts } = require("./nowcast");

const COL = 100; // SVG width per column at VISIBLE_DAILY columns (viewBox units)
const CH_H = 210; // SVG chart height (viewBox units)
const BAR_AREA = 30; // max. height of precipitation bars (viewBox units)
const VISIBLE_DAILY = 7;
const VISIBLE_HOURLY = 8;
// Fixed chart height in cqw (height of the daily chart with 7 visible columns). Every view uses
// this height and only the viewBox column width varies, so toggling daily/hourly keeps the height.
const PAD_X = 8; // horizontal padding of the widget (design px at 450 px reference width)
const INNER_CQW = 100 - (2 * PAD_X) / 4.5; // usable width inside the padding
const CHART_H_CQW = ((INNER_CQW / VISIBLE_DAILY) * CH_H) / COL;

const COLORS = {
	accent: "#056bb8",
	tempHi: "#ff9800",
	tempLo: "#2196f3",
	hum: "#2196f3",
	press: "#00acc1",
	bar: "rgba(33,150,243,0.45)",
	prob: "rgba(33,150,243,0.6)",
	wind: "#26a69a",
	gust: "#78909c",
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
 * @param {string} o.cls - CSS classes for visibility switching
 * @param {Array<object>} [o.lines] - [{ key, color, dashed, above, label }]
 * @param {string} [o.barKey] - precipitation key (small bars at the bottom)
 * @param {(v: number) => string} [o.barLabel] - label formatter for bars
 * @param {object} [o.columns] - full-height columns { key, max, color(v), label(v) } (UV, probability)
 * @param {number} [o.minSpan] - minimum value span of the y-axis
 * @param {object} o.theme - colors
 * @param {number} o.fs - font scale
 * @param {number} o.col - column width in viewBox units
 */
function chartSvg(o) {
	const { items, theme, fs, col } = o;
	const n = items.length;
	const w = n * col;
	const font = 19 * fs;
	const x = i => i * col + col / 2;
	const hasBars = !!o.barKey && items.some(it => (it[o.barKey] ?? 0) > 0);
	const hasBelow = (o.lines || []).some(l => !l.above);
	const top = font + 10;
	// precipitation bars + labels occupy the bottom; labels below a line must stay above them
	const barsTop = hasBars ? CH_H - font - 8 - BAR_AREA : CH_H - 4;
	const bottom = barsTop - (hasBelow ? font + 12 : 8);
	let s = `<svg class="${o.cls}" viewBox="0 0 ${w} ${CH_H}" preserveAspectRatio="none" style="width:100%;height:${CHART_H_CQW.toFixed(3)}cqw;overflow:visible;" xmlns="http://www.w3.org/2000/svg">`;
	for (let i = 1; i < n; i++) {
		s += `<line x1="${i * col}" y1="4" x2="${i * col}" y2="${CH_H - 4}" stroke="${theme.div}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
	}
	const text = (tx, ty, str, color, weight = 400, size = font) =>
		`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${color}" font-size="${size.toFixed(1)}" font-weight="${weight}" text-anchor="middle" font-family="sans-serif">${str}</text>`;
	const barW = Math.min(32, col * 0.4);

	if (hasBars) {
		const max = Math.max(...items.map(it => it[o.barKey] ?? 0), 4);
		items.forEach((it, i) => {
			const v = it[o.barKey] ?? 0;
			if (v <= 0) {
				return;
			}
			const h = Math.max(4, (v / max) * BAR_AREA);
			s += `<rect x="${(x(i) - barW / 2).toFixed(1)}" y="${(CH_H - font - 8 - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${COLORS.bar}"/>`;
			s += text(x(i), CH_H - 4, o.barLabel(v), theme.text, 400, font * 0.85);
		});
	}

	if (o.columns) {
		const c = o.columns;
		const base = CH_H - 12;
		const max = Math.max(...items.map(it => it[c.key]), c.max);
		const colW = Math.min(40, col * 0.5);
		items.forEach((it, i) => {
			const v = it[c.key];
			const h = (v / max) * (base - top - 6);
			if (h > 0) {
				s += `<rect x="${(x(i) - colW / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${colW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${c.color(v)}"/>`;
			}
			s += text(x(i), base - h - 8, c.label(v), theme.text, 600);
		});
		s += `<line x1="0" y1="${base}" x2="${w}" y2="${base}" stroke="${theme.div}" stroke-width="1.5"/>`;
	}

	if (o.lines?.length) {
		const vals = items.flatMap(it => o.lines.map(l => it[l.key]));
		let min = Math.min(...vals);
		const max = Math.max(...vals);
		const span = Math.max(max - min, o.minSpan ?? 4);
		min = (min + max) / 2 - span / 2;
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
 * @param {any} [o.nowcast] - short-range forecast (lib/nowcast.js) → extra "15 min" view
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
	const showDetails = widget.chartShowDetails !== false;
	const showWind = widget.chartShowWind !== false;
	const showMoon = widget.showMoon !== false;
	const viewMode = ["daily", "hourly", "dailyOnly"].includes(widget.chartView) ? widget.chartView : "daily";
	const wantedAttrs = Array.isArray(widget.chartAttrs) && widget.chartAttrs.length > 0 ? widget.chartAttrs : null; // null = all

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
		const moonUrl = showMoon ? await getVal(`${k}astronomy.moon_phase_icon_url`) : null;
		days.push({
			moon: has(moonUrl) ? await resolveIcon(moonUrl) : "",
			label: (await getVal(`${k}weekday`)) ?? "",
			icon: has(iconUrl) ? await resolveIcon(iconUrl) : "",
			desc: (await getVal(`${k}description`)) ?? "",
			hi: tMax,
			lo: tMin,
			prec: num(await getVal(`${k}precipitation`)),
			prob: num(await getVal(`${k}precipitation_probability`)),
			gust: num(await getVal(`${k}windgusts`)),
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
	if ((config.hourlyDays ?? 3) > 0 && viewMode !== "dailyOnly") {
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
				prob: num(await getVal(`${k}precip_prob`)),
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
	if (days.length === 0) {
		return ""; // nothing fetched yet
	}
	// short-range forecast: third view with 15-minute columns (weather icon at full hours)
	const nc = o.nowcast;
	const NT = nowcastTexts(lang);
	if (nc && nc.slots.length) {
		const today = (o.now || new Date()).toISOString().slice(0, 10);
		const mItems = [];
		for (let i = 0; i < nc.slots.length; i++) {
			const sl = nc.slots[i];
			const full = sl.time.endsWith(":00");
			let icon = "";
			if (full) {
				const dayIdx = sl.date && sl.date > today ? 1 : 0;
				const u = await getVal(`${p}.day${dayIdx}.hourly.h${sl.time.slice(0, 2)}.icon_url`);
				icon = has(u) ? await resolveIcon(u) : "";
			}
			mItems.push({ ...sl, label: i === 0 ? NT.now : full ? sl.time : "", chip: i === 0, icon, desc: "" });
		}
		views.push({ key: "m", items: mItems, daily: false, nowcast: true });
	}
	const startView = viewMode === "hourly" && hours.length > 0 ? "h" : "d";
	const all = (items, keys) => items.length > 0 && items.every(it => keys.every(k => it[k] !== null));
	const deg = v => `${fmt(v, lang)}°`;
	const withPrecip = views.every(v => v.items.every(it => it.prec !== null));
	const ATTRS = [
		{ key: "temp", name: withPrecip ? L.tempPrecip : L.temp, need: v => (v.daily ? ["hi", "lo"] : ["temp"]) },
		{ key: "feels", name: L.feels, need: v => (v.daily ? ["fhi", "flo"] : ["feels"]) },
		{ key: "prob", name: L.precipProb, need: () => ["prob"] },
		{ key: "wind", name: `${L.wind} (${wUnit})`, need: () => ["wspd"] },
		{ key: "hum", name: L.humidity, need: () => ["hum"] },
		{ key: "press", name: L.pressure, need: () => ["press"] },
		{ key: "uv", name: L.uv, need: () => ["uv"] },
	]
		.filter(a => !wantedAttrs || wantedAttrs.includes(a.key))
		.filter(a => views.every(v => all(v.items, a.need(v))));
	const start = ATTRS[0]?.key;
	const multi = ATTRS.length > 1;

	// ── Icons: every distinct icon is embedded once as a CSS class ───────────
	const iconCls = new Map();
	const iconSpan = (url, size, extra = "", alt = "") => {
		if (!url) {
			return `<span style="display:block;width:${size};height:${size};"></span>`;
		}
		if (!iconCls.has(url)) {
			iconCls.set(url, `${R}-i${iconCls.size}`);
		}
		const role = alt ? ` role="img" aria-label="${esc(alt)}" title="${esc(alt)}"` : ` aria-hidden="true"`;
		return `<span class="${iconCls.get(url)}"${role} style="display:block;width:${size};height:${size};background-size:contain;background-position:center;background-repeat:no-repeat;${extra}"></span>`;
	};

	/**
	 * cqw per column: all columns fit up to VISIBLE_*, beyond that the view scrolls
	 *
	 * @param {object} v - view
	 */
	const colWidthCqw = v =>
		INNER_CQW /
		Math.max(1, v.nowcast ? v.items.length : Math.min(v.items.length, v.daily ? VISIBLE_DAILY : VISIBLE_HOURLY));

	// 15-minute view: precipitation columns (blue rain, yellow thunderstorm, light snow), value at the start and the peak
	const nowcastSvg = v => {
		const items = v.items;
		const col = (colWidthCqw(v) / CHART_H_CQW) * CH_H;
		const w = items.length * col;
		const font = 19 * sf;
		const base = CH_H - 14;
		const top = font + 16;
		const max = Math.max(1, ...items.map(it => it.prec));
		let s = `<svg viewBox="0 0 ${w} ${CH_H}" preserveAspectRatio="none" style="display:block;width:100%;height:${CHART_H_CQW.toFixed(3)}cqw;overflow:visible;" xmlns="http://www.w3.org/2000/svg">`;
		for (let i = 4; i < items.length; i += 4) {
			s += `<line x1="${i * col}" y1="4" x2="${i * col}" y2="${CH_H - 4}" stroke="${theme.div}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
		}
		s += `<line x1="0" y1="${base}" x2="${w}" y2="${base}" stroke="${theme.div}" stroke-width="1.5"/>`;
		if (!items.some(it => it.wet)) {
			s += `<text x="${w / 2}" y="${(base + top) / 2}" fill="${theme.sub}" font-size="${(font * 1.1).toFixed(1)}" text-anchor="middle" font-family="sans-serif">${esc(nc.text)}</text>`;
		}
		items.forEach((it, i) => {
			if (it.prec <= 0) {
				return;
			}
			const h = Math.max(5, (it.prec / max) * (base - top - 8));
			const fill = isSnow(it)
				? "rgba(200,220,255,0.9)"
				: it.lp >= THUNDER_LP
					? "rgba(255,193,7,0.85)"
					: "rgba(33,150,243,0.75)";
			const bw = col * 0.72;
			s += `<rect x="${(i * col + (col - bw) / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${fill}"/>`;
			if (it.wet && (i === 0 || !items[i - 1].wet || it.prec === max)) {
				s += `<text x="${(i * col + col / 2).toFixed(1)}" y="${(base - h - 8).toFixed(1)}" fill="${theme.text}" font-size="${(font * 0.85).toFixed(1)}" font-weight="600" text-anchor="middle" font-family="sans-serif">${fmt(it.prec, lang)}</text>`;
			}
		});
		return `${s}</svg>`;
	};

	const chartsFor = v => {
		if (v.nowcast) {
			return nowcastSvg(v);
		}
		// column width in viewBox units so that the chart is CHART_H_CQW high at any column count
		const opts = { items: v.items, theme, fs: sf, col: (colWidthCqw(v) / CHART_H_CQW) * CH_H };
		return ATTRS.map(a => {
			const cls = `${R}-c ${R}-c-${a.key}`;
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
				case "prob":
					return chartSvg({
						...opts,
						cls,
						columns: { key: "prob", max: 100, color: () => COLORS.prob, label: x => `${Math.round(x)}%` },
					});
				case "wind": {
					// gusts (dashed, labels above) only where every column has a value – hourly has none
					const gusts = v.items.every(it => it.gust !== null);
					const spd = x => fmt(Math.round(x), lang, 0);
					return chartSvg({
						...opts,
						cls,
						minSpan: 10,
						lines: gusts
							? [
									{ key: "gust", color: COLORS.gust, dashed: true, above: true, label: spd },
									{ key: "wspd", color: COLORS.wind, above: false, label: spd },
								]
							: [{ key: "wspd", color: COLORS.wind, above: true, label: spd }],
					});
				}
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
					return chartSvg({
						...opts,
						cls,
						columns: { key: "uv", max: 6, color: uvColor, label: x => fmt(Math.round(x), "en", 0) },
					});
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

	// hidden radio (state carrier); lives inside the label that activates it, so no ids are needed
	const radio = (group, cls, checked = false) =>
		`<input type="radio" class="${R}-r ${cls}" name="${R}-${group}"${checked ? " checked" : ""} tabindex="-1" aria-hidden="true">`;

	const viewHtml = v => {
		const n = v.items.length;
		const colW = colWidthCqw(v);
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
				const moon = it.moon
					? `<span style="position:absolute;top:${c(-4 * sf)};right:${c(-8 * sf)};opacity:0.92;">${iconSpan(it.moon, c(16 * sf))}</span>`
					: "";
				const img = `<span style="position:relative;display:inline-block;">${iconSpan(it.icon, iconSz, `transform:scale(${imgScale});${imgFilter}`, it.desc)}${moon}</span>`;
				return `<div style="${col}gap:${c(2)};"><span style="${lbl}">${esc(txt)}</span>${img}</div>`;
			})
			.join("");
		// the 15-minute view has no wind badges but keeps the row height of the other views
		const windsAny = showWind && views.some(x => !x.nowcast && x.items.some(it => it.bft !== null));
		const winds = v.nowcast
			? windsAny
				? `<div style="display:flex;margin-top:${c(2)};height:${c(30 * sf)};"></div>`
				: ""
			: showWind && v.items.some(it => it.bft !== null)
				? `<div style="display:flex;margin-top:${c(2)};">${v.items.map(it => `<div style="${col}">${windBadge(it)}</div>`).join("")}</div>`
				: "";
		const clickable = views.length > 1;
		// tap on the chart: next view (daily → hourly → 15 min → daily)
		const target = views[(views.indexOf(v) + 1) % views.length].key;
		const tag = clickable ? "label" : "div";
		return (
			`<${tag} class="${R}-view ${R}-view-${v.key}" style="cursor:${clickable ? "pointer" : "default"};">${
				clickable ? radio("v", `${R}-sv-${target}`) : ""
			}<div class="${R}-sc" style="overflow-x:auto;overflow-y:hidden;scrollbar-width:none;"><div style="width:${trackW};">` +
			`<div style="display:flex;">${head}</div>${chartsFor(v)}${winds}` +
			`</div></div></${tag}>`
		);
	};

	// ── Details (only fetched values) ────────────────────────────────────────
	const details = [];
	const detail = (...row) => showDetails && details.push(row);
	const dIcon = path => mdi(path, c(15 * sd));
	if (has(cur.feels_like)) {
		detail(MDI.feels, L.feels, `${fmt(cur.feels_like, lang)} ${tUnit}`);
	}
	if (has(cur.humidity)) {
		detail(MDI.humid, L.humidity, `${fmt(cur.humidity, lang, 0)} %`);
	}
	if (has(cur.windspeed)) {
		let wtxt = `${fmt(cur.windspeed, lang)} ${wUnit}`;
		if (has(cur.winddirection_text)) {
			wtxt += ` ${cur.winddirection_text}`;
		}
		if (has(cur.windgusts)) {
			wtxt += ` · ${L.gusts} ${fmt(cur.windgusts, lang)}`;
		}
		detail(MDI.wind, L.wind, wtxt);
	}
	if (has(cur.pressure)) {
		detail(MDI.press, L.pressure, `${fmt(cur.pressure, lang, 0)} hPa`);
	}
	if (has(cur.visibility)) {
		detail(MDI.eye, L.visibility, `${fmt(Number(cur.visibility) / 1000, lang)} km`);
	}
	if (has(cur["comfort.uv_index"])) {
		detail(MDI.uv, L.uv, fmt(cur["comfort.uv_index"], lang));
	}
	if (sunrise || sunset) {
		detail(
			MDI.sunrise,
			L.sun,
			`${sunrise ? `↑ ${sunrise}` : ""}${sunrise && sunset ? "  " : ""}${sunset ? `↓ ${sunset}` : ""}`,
		);
	}

	// ── Body (built before the CSS so that all icon classes are known) ───────
	let body = "";
	// header
	const mainIcon = c(64 * sh);
	body += `<div style="display:flex;align-items:center;gap:${c(10)};">`;
	if (curIcon) {
		const moon = days[0]?.moon
			? `<span style="position:absolute;top:${c(-4 * sh)};right:${c(-6 * sh)};opacity:0.92;">${iconSpan(days[0].moon, c(26 * sh))}</span>`
			: "";
		body += `<span style="position:relative;display:inline-block;flex-shrink:0;">${iconSpan(curIcon, mainIcon, `transform:scale(${imgScale});${imgFilter}`)}${moon}</span>`;
	}
	body += `<div style="flex:1;min-width:0;"><div style="font-size:${c(22 * sh)};line-height:1.2;">${esc(cur.description ?? "")}</div>`;
	body += `<div style="font-size:${c(13 * sh)};color:${theme.sub};">${esc(widget.locationName)}</div></div>`;
	body += `<div style="text-align:right;">`;
	if (has(cur.temperature)) {
		body += `<div style="font-size:${c(30 * sh)};font-weight:300;line-height:1.1;">${fmt(cur.temperature, lang)}${tUnit}</div>`;
	}
	body += `<div style="font-size:${c(12 * sh)};color:${theme.sub};">${fmt(days[0].hi, lang)}${tUnit} / ${fmt(days[0].lo, lang)}${tUnit}</div>`;
	body += `</div></div>`;

	// details
	if (details.length) {
		body += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${c(3)} ${c(16)};margin-top:${c(8)};font-size:${c(12 * sd)};">`;
		body += details
			.map(
				([icon, label, val]) =>
					`<div style="display:flex;align-items:center;gap:${c(6)};min-width:0;">${dIcon(icon)}<span style="color:${theme.sub};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(label)}</span><span style="white-space:nowrap;">${esc(val)}</span></div>`,
			)
			.join("");
		body += `</div>`;
	}

	// forecast: settings row, menu, views
	body += `<div style="position:relative;margin-top:${c(8)};">`;
	if (multi) {
		// inner backdrop: covers the widget (fixed is relative to the size container)
		body += ATTRS.map(
			a =>
				`<label class="${R}-bd ${R}-bd-${a.key}" style="position:fixed;inset:0;z-index:5;cursor:default;">${radio("a", `${R}-st ${R}-sa-${a.key}`)}</label>`,
		).join("");
	}
	body += `<div style="display:flex;align-items:center;justify-content:flex-end;gap:${c(8)};min-height:${c(26)};">`;
	if (nc) {
		// short-range forecast text in the free left part of the settings row (no extra height)
		const wet = nc.kind !== "dry";
		const col = wet ? (isLight ? "#90caf9" : "#1565c0") : theme.sub;
		body += `<span style="margin-right:auto;font-size:${c(12 * sf)};color:${col};${wet ? "font-weight:600;" : ""}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;">${esc(nc.text)}</span>`;
		body += `<span class="${R}-anm" style="display:none;font-size:${c(11 * sf)};color:${theme.sub};">${esc(NT.view)}</span>`;
	}
	body += ATTRS.map(
		a =>
			`<span class="${R}-an ${R}-an-${a.key}" style="font-size:${c(11 * sf)};color:${theme.sub};">${esc(a.name)}</span>`,
	).join("");
	if (multi) {
		const btn = `width:${c(26)};height:${c(26)};border-radius:${c(8)};background:${COLORS.accent};place-items:center;cursor:pointer;position:relative;z-index:6;`;
		body += ATTRS.map(
			a =>
				`<label class="${R}-gear ${R}-go-${a.key}" title="${esc(L.choose)}" style="${btn}">${radio("a", `${R}-st ${R}-sm ${R}-sm-${a.key}`)}${mdi(MDI.gear, c(16), "#fff")}</label>` +
				`<label class="${R}-gear ${R}-gc-${a.key}" title="${esc(L.close)}" style="${btn}">${radio("a", `${R}-st ${R}-sa-${a.key}`)}${mdi(MDI.close, c(16), "#fff")}</label>`,
		).join("");
	}
	body += `</div>`;
	if (multi) {
		body += `<div class="${R}-menu" style="position:absolute;top:${c(32)};right:0;z-index:6;flex-direction:column;background:${theme.menuBg};border:1px solid ${theme.div};border-radius:${c(10)};padding:${c(6)} 0;box-shadow:0 6px 20px rgba(0,0,0,0.25);max-width:100%;">`;
		body += ATTRS.map(
			a =>
				`<label class="${R}-mi ${R}-mi-${a.key}" style="display:flex;align-items:center;padding:0 ${c(14)};height:${c(36)};font-size:${c(13)};white-space:nowrap;cursor:pointer;color:${theme.menuText};">${radio("a", `${R}-st ${R}-sa-${a.key}`, a.key === start)}${esc(a.name)}</label>`,
		).join("");
		body += `</div>`;
	}
	body += views.map(viewHtml).join("");
	body += `</div>`;

	// ── CSS ──────────────────────────────────────────────────────────────────
	// Base rules show the configured start view/value and work in every browser. Switching uses
	// :has() on radios inside the labels (no ids → the same widget may exist twice in the DOM,
	// e.g. on two cached VIS views); browsers without :has() simply keep the start view.
	const W = `.${R}`;
	const on = (...cls) => cls.map(k => `${W}:has(input.${R}-${k}:checked)`);
	const rule = (sels, decl) => `${sels.join(",")}{${decl}}`;
	let css = `${W} input.${R}-r{position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none;}`;
	css += `${W} .${R}-sc::-webkit-scrollbar{display:none;}`; // no scrollbar height → same height daily/hourly
	css += `${W} .${R}-view,${W} .${R}-gear,${W} .${R}-menu,${W} .${R}-bd,${W} .${R}-an,${W} svg.${R}-c{display:none;}`;
	css += `${W} .${R}-view-${startView}{display:block;}`;
	if (start) {
		css += `${W} svg.${R}-c-${start}{display:block;}${W} .${R}-an-${start}{display:inline;}`;
	}
	for (const [url, cls] of iconCls) {
		css += `.${cls}{background-image:url("${url}");}`;
	}
	let hasCss = "";
	// views
	if (views.length > 1) {
		// whichever view radio is checked: hide all views, then show that one
		for (const v of views) {
			hasCss += rule(
				on(`sv-${v.key}`).map(s => `${s} .${R}-view`),
				"display:none;",
			);
			hasCss += rule(
				on(`sv-${v.key}`).map(s => `${s} .${R}-view-${v.key}`),
				"display:block;",
			);
		}
		if (views.some(v => v.nowcast)) {
			// 15-minute view: own label instead of the value name and the value menu
			hasCss += rule(
				on("sv-m").map(s => `${s} .${R}-an,${s} .${R}-gear`),
				"display:none!important;",
			);
			hasCss += rule(
				on("sv-m").map(s => `${s} .${R}-anm`),
				"display:inline!important;",
			);
		}
	}
	if (multi) {
		const notStartSel = `${W}:has(input.${R}-st:checked:not(.${R}-sa-${start}):not(.${R}-sm-${start}))`;
		hasCss += `${W} .${R}-go-${start}{display:grid;}`;
		hasCss += `${W}:has(input.${R}-st:checked:not(.${R}-sa-${start})) .${R}-go-${start}{display:none;}`;
		hasCss += `${notStartSel} svg.${R}-c-${start},${notStartSel} .${R}-an-${start}{display:none;}`;
		for (const a of ATTRS) {
			const k = a.key;
			hasCss += rule(
				[...on(`sa-${k}`, `sm-${k}`)].map(s => `${s} svg.${R}-c-${k}`),
				"display:block;",
			);
			hasCss += rule(
				[...on(`sa-${k}`, `sm-${k}`)].map(s => `${s} .${R}-an-${k}`),
				"display:inline;",
			);
			hasCss += rule(
				on(`sa-${k}`).map(s => `${s} .${R}-go-${k}`),
				"display:grid;",
			);
			hasCss += rule(
				on(`sm-${k}`).map(s => `${s} .${R}-gc-${k}`),
				"display:grid;",
			);
			hasCss += rule(
				on(`sm-${k}`).map(s => `${s} .${R}-bd-${k}`),
				"display:block;",
			);
			hasCss += rule(
				on(`sm-${k}`).map(s => `${s} .${R}-mi-${k}`),
				`color:${COLORS.accent};background:rgba(5,107,184,0.14);`,
			);
		}
		hasCss += rule(
			on("sm").map(s => `${s} .${R}-menu`),
			"display:flex;",
		);
		hasCss += `${W} .${R}-mi:hover{background:${theme.hover};}`;
	}
	if (hasCss) {
		css += `@supports selector(:has(*)){${hasCss}}`;
	}

	// ── HTML ─────────────────────────────────────────────────────────────────
	// The <form> isolates the radio groups of this copy from other copies of the same widget.
	let html = `<form class="${R}" style="margin:0;"><style>${css}</style>`;
	if (multi) {
		// outer backdrop: tap anywhere on the page closes the menu
		html += ATTRS.map(
			a =>
				`<label class="${R}-bd ${R}-bd-${a.key}" style="position:fixed;inset:0;z-index:5;cursor:default;">${radio("a", `${R}-st ${R}-sa-${a.key}`)}</label>`,
		).join("");
	}
	html += `<div style="container-type:inline-size;width:100%;position:relative;z-index:6;">`;
	html += `<div style="position:relative;background:${bg};color:${theme.text};font-family:Roboto,'Segoe UI',sans-serif;padding:${c(10)} ${c(PAD_X)} ${c(6)};box-sizing:border-box;">`;
	html += body;
	html += o.warningHtml || "";
	html += `</div></div></form>`;
	return html;
}

module.exports = { buildChartWidget };
