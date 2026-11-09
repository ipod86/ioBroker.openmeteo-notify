/* global getComputedStyle, ResizeObserver */
/* Web-Komponente <iob-openmeteo-widget>: zeigt ein Wetter-Widget von openmeteo-notify in Aura, vis-2,
   devices und admin. Gerendert wird immer im Adapter (dieselben Funktionen wie die HTML-Datenpunkte):
   - Modus "adapter": ein in den Adapter-Einstellungen angelegtes Widget (Datenpunkt <ort>.widget.<id>)
   - Modus "custom":  Ort + Einstellungen aus der Visualisierung, per sendTo("renderWidget")
   Optional übernimmt das Widget die Textfarbe der Visualisierung. */
import { IobWebComponent, defineWebComponent } from "@iobroker/web-components/element";

const ATTRS = ["temp", "feels", "prob", "wind", "hum", "press", "uv"];
const TXT = {
	pick: { en: "Please choose a widget in the settings.", de: "Bitte in den Einstellungen ein Widget auswählen." },
	pickLoc: { en: "Please choose a location in the settings.", de: "Bitte in den Einstellungen einen Ort auswählen." },
	loading: { en: "Loading weather …", de: "Wetter wird geladen …" },
	error: { en: "Widget could not be loaded", de: "Widget konnte nicht geladen werden" },
};

function toHex(color) {
	// CSS-Farbe (rgb(), #abc, Name …) -> #rrggbb
	const m = /^#([0-9a-f]{6})$/i.exec(color || "");
	if (m) {
		return color.toLowerCase();
	}
	const s = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(color || "");
	if (s) {
		return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
	}
	const r = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(color || "");
	if (r) {
		return `#${[r[1], r[2], r[3]].map(v => Number(v).toString(16).padStart(2, "0")).join("")}`;
	}
	return "";
}

class OpenMeteoWidget extends IobWebComponent {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._key = "";
		this._html = "";
		this._msg = "";
		this._seq = 0;
	}

	_instance(id) {
		const p = String(id || "").split(".");
		return p.length >= 2 ? `${p[0]}.${p[1]}` : "";
	}

	getStateIds(s) {
		if (s.mode === "custom") {
			if (!s.location) {
				return [];
			}
			const loc = String(s.location).split(".").slice(0, 3).join("."); // openmeteo-notify.0.<ort>
			return [`${loc}.widgetUpdated`];
		}
		return s.widget ? [s.widget] : [];
	}

	_follow() {
		if (!this.settings.follow) {
			return null;
		}
		const text = toHex(this.theme && this.theme.text);
		return text ? { text } : null;
	}

	render() {
		const s = this.settings || {};
		let key;
		let request = null;
		if (s.mode === "custom") {
			if (!s.location) {
				return this._show("", this.text(TXT.pickLoc));
			}
			const loc = String(s.location).split(".").slice(0, 3).join(".");
			const chartAttrs = [];
			if (s.chartStart && ATTRS.includes(s.chartStart) && s[`attr_${s.chartStart}`] !== false) {
				chartAttrs.push(s.chartStart);
			}
			for (const a of ATTRS) {
				if (s[`attr_${a}`] !== false && !chartAttrs.includes(a)) {
					chartAttrs.push(a);
				}
			}
			const widget = {
				variant: s.variant,
				days: s.days,
				theme: s.theme,
				textBase: s.textBase,
				bgColor: s.bgColor,
				hourlyRange: s.hourlyRange,
				hourlyStep: s.hourlyStep,
				scaleHeader: s.scaleHeader,
				scaleDetails: s.scaleDetails,
				scaleForecast: s.scaleForecast,
				showWarnBadge: s.showWarnBadge,
				showMoon: s.showMoon,
				nowcast: s.nowcast,
				chartShowDetails: s.chartShowDetails,
				chartShowWind: s.chartShowWind,
				chartView: s.chartView,
				chartAttrs,
			};
			request = { instance: this._instance(loc), msg: { location: loc, widget, follow: this._follow() } };
			key = JSON.stringify([request.msg, this.states[`${loc}.widgetUpdated`]?.val]);
		} else {
			if (!s.widget) {
				return this._show("", this.text(TXT.pick));
			}
			const follow = this._follow();
			if (!follow) {
				// ohne Farbübernahme: das fertige HTML aus dem Datenpunkt direkt anzeigen
				const v = this.states[s.widget]?.val;
				return this._show(typeof v === "string" ? v : "", typeof v === "string" ? "" : this.text(TXT.loading));
			}
			request = { instance: this._instance(s.widget), msg: { widgetId: s.widget, follow } };
			key = JSON.stringify([request.msg, this.states[s.widget]?.ts]);
		}
		if (key === this._key) {
			return this._show(this._html, this._msg);
		}
		this._key = key;
		if (!this.socket || !request.instance) {
			return this._show(this._html, this.text(TXT.loading));
		}
		const seq = ++this._seq;
		this.socket
			.sendTo(request.instance, "renderWidget", request.msg)
			.then(res => {
				if (seq !== this._seq) {
					return;
				}
				if (res && typeof res.html === "string") {
					this._show(res.html, "");
				} else {
					this._show("", `${this.text(TXT.error)}${res && res.error ? `: ${res.error}` : ""}`);
				}
			})
			.catch(
				e => seq === this._seq && this._show("", `${this.text(TXT.error)}: ${e && e.message ? e.message : e}`),
			);
		if (!this._html) {
			this._show("", this.text(TXT.loading));
		}
	}

	_show(html, msg) {
		if (this._shownHtml === html && this._shownMsg === msg && this._shownEdit === this.editMode) {
			return;
		}
		this._html = html;
		this._msg = msg;
		this._shownHtml = html;
		this._shownMsg = msg;
		this._shownEdit = this.editMode;
		const body = msg
			? `<div class="msg">${msg.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c])}</div>`
			: html;
		this.shadowRoot.innerHTML =
			`<style>:host{display:block;width:100%;height:100%;overflow:hidden;color:inherit;font:inherit}` +
			`.wrap{width:100%;container-type:inline-size;margin:0 auto;${this.editMode ? "pointer-events:none;" : ""}}` +
			`.msg{padding:12px;opacity:.7;font-size:14px}</style><div class="wrap">${body}</div>`;
		this._fit();
	}

	// Das Widget skaliert mit der Breite. Ist es dadurch höher als die Kachel, wird es als Ganzes
	// verkleinert, statt einen Scrollbalken zu zeigen.
	_fit() {
		const wrap = this.shadowRoot.querySelector(".wrap");
		if (!wrap) {
			return;
		}
		wrap.style.zoom = "";
		const top = wrap.getBoundingClientRect().top;
		let bottom = 0;
		for (const el of wrap.querySelectorAll("*")) {
			const r = el.getBoundingClientRect();
			if (r.height && getComputedStyle(el).display !== "none") {
				bottom = Math.max(bottom, r.bottom - top);
			}
		}
		const avail = this.getBoundingClientRect().height;
		if (bottom > avail + 1 && avail > 20) {
			wrap.style.zoom = String(Math.max(0.5, avail / bottom));
		}
	}

	connectedCallback() {
		super.connectedCallback && super.connectedCallback();
		if (!this._ro && typeof ResizeObserver !== "undefined") {
			let t = null;
			this._ro = new ResizeObserver(() => {
				clearTimeout(t);
				t = setTimeout(() => this._fit(), 50);
			});
		}
		this._ro && this._ro.observe(this);
	}

	disconnectedCallback() {
		super.disconnectedCallback && super.disconnectedCallback();
		this._ro && this._ro.disconnect();
	}
}

defineWebComponent("iob-openmeteo-widget", OpenMeteoWidget);
