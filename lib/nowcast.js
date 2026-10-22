"use strict";

/**
 * Short-range forecast ("nowcast") from the 15-minute slots of <location>.minutely: whether and
 * when precipitation starts or ends within the window, and a short text in the system language.
 * Used for the minutely.text data point and by all widget variants.
 */

const { I18N_NOWCAST } = require("./i18n");

/** lightning potential (J/kg) from which a wet spell counts as thunderstorm */
const THUNDER_LP = 1;

/**
 * "HH:MM" plus minutes
 *
 * @param {string} hm - time "HH:MM"
 * @param {number} m - minutes to add
 * @returns {string} time "HH:MM"
 */
function addMin(hm, m) {
	const t = (parseInt(hm.slice(0, 2), 10) * 60 + parseInt(hm.slice(3, 5), 10) + m) % 1440;
	return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * Texts of a language (falls back to English)
 *
 * @param {string} lang - system language
 * @returns {any} texts
 */
function texts(lang) {
	const l = String(lang || "en").toLowerCase();
	const all = Object(I18N_NOWCAST);
	return all[l] || all[l.split("-")[0]] || all.en;
}

/**
 * Snow if the snowfall (cm) clearly dominates the precipitation (mm, ~1 cm snow per 0.7 mm water)
 *
 * @param {any} x - slot
 * @returns {boolean} snow
 */
const isSnow = x => x.snow > 0 && x.snow * 7 >= x.prec;

/**
 * Builds the nowcast.
 *
 * @param {Array<{time: string, date?: string, prec: number, snow: number, lp: number}>} slots - 15-minute slots from now
 * @param {number} threshold - precipitation per 15 min (in the configured unit) from which a slot counts as wet
 * @param {string} lang - system language
 * @param {number|null} [startsIn] - minutes until the start (from rain_starts_in, corrected by its age); default: slot index × 15
 * @returns {{kind: "dry"|"soon"|"now", text: string, slots: Array<any>} | null} nowcast, null without slots
 */
function buildNowcast(slots, threshold, lang, startsIn = null) {
	if (!Array.isArray(slots) || slots.length === 0) {
		return null;
	}
	const T = texts(lang);
	const s = slots.map(x => ({ ...x, wet: x.prec >= threshold }));
	const first = s.findIndex(x => x.wet);
	if (first < 0) {
		return { kind: "dry", text: T.dry(addMin(s[s.length - 1].time, 15)), slots: s };
	}
	let last = first;
	while (last + 1 < s.length && s[last + 1].wet) {
		last++;
	}
	const span = s.slice(first, last + 1);
	const snow = span.reduce((a, x) => a + x.snow, 0) * 7 >= span.reduce((a, x) => a + x.prec, 0) && span.some(isSnow);
	const what = span.some(x => x.lp >= THUNDER_LP) ? T.thunder : snow ? T.snow : T.rain;
	if (first === 0) {
		const text = last + 1 < s.length ? T.until(what, addMin(s[last].time, 15)) : T.lasts(what);
		return { kind: "now", text, slots: s };
	}
	const minutes = typeof startsIn === "number" && startsIn > 0 ? startsIn : first * 15;
	return { kind: "soon", text: T.soon(what, s[first].time, minutes), slots: s };
}

module.exports = { buildNowcast, isSnow, THUNDER_LP, texts };
