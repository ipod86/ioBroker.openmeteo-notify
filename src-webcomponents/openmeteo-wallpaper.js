/* global document */
/* Web-Komponente <iob-openmeteo-wallpaper>: der animierte Wetter-Bildschirmschoner von openmeteo-notify
   als Kachel oder Vollbild in Aura, vis-2 und devices. Die Seite baut der Adapter (sendTo "renderWallpaper"),
   sie läuft in einem abgeschotteten iframe; neue Werte schickt die Komponente per postMessage hinein. */
import { IobWebComponent, defineWebComponent } from "@iobroker/web-components/element";

const KEYS = [
	"showLocation",
	"showTemperature",
	"showWindDirection",
	"showWindSpeed",
	"position",
	"fontSize",
	"textColor",
	"bgColor",
	"bgOpacity",
	"edgeMargin",
	"timeEnabled",
	"timePosition",
	"timeFontSize",
	"timeTextColor",
	"timeBgColor",
	"timeBgOpacity",
	"timeEdgeMargin",
	"warnEnabled",
	"warnFontSize",
	"warnTextColor",
];
const REFRESH_MS = 5 * 60 * 1000;
const TXT = {
	pickLoc: { en: "Please choose a location in the settings.", de: "Bitte in den Einstellungen einen Ort auswählen." },
	loading: { en: "Loading screensaver …", de: "Bildschirmschoner wird geladen …" },
	error: { en: "Screensaver could not be loaded", de: "Bildschirmschoner konnte nicht geladen werden" },
};

class OpenMeteoWallpaper extends IobWebComponent {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._key = "";
		this._seq = 0;
		this._timer = null;
	}

	_loc(s) {
		return s.location ? String(s.location).split(".").slice(0, 3).join(".") : "";
	}

	getStateIds(s) {
		const loc = this._loc(s);
		return loc ? [`${loc}.widgetUpdated`] : [];
	}

	_message(withHtml) {
		const s = this.settings || {};
		const settings = { bgPath: s.bgPath || "" };
		if (s.own) {
			for (const k of KEYS) {
				if (s[k] !== undefined && s[k] !== null && s[k] !== "") {
					settings[k] = s[k];
				}
			}
		}
		return { location: this._loc(s), settings, withHtml };
	}

	_request(withHtml) {
		const msg = this._message(withHtml);
		const instance = msg.location.split(".").slice(0, 2).join(".");
		if (!this.socket || !instance) {
			return false;
		}
		const seq = withHtml ? ++this._seq : this._seq;
		this.socket
			.sendTo(instance, "renderWallpaper", msg)
			.then(res => {
				if (seq !== this._seq) {
					return;
				}
				if (!res || res.error) {
					return withHtml && this._msg(`${this.text(TXT.error)}${res && res.error ? `: ${res.error}` : ""}`);
				}
				if (withHtml && typeof res.html === "string") {
					this._frame(res.html);
				} else if (res.values) {
					const f = this.shadowRoot.querySelector("iframe");
					f &&
						f.contentWindow &&
						f.contentWindow.postMessage({ type: "omn-wallpaper", values: res.values }, "*");
				}
			})
			.catch(
				e =>
					withHtml &&
					seq === this._seq &&
					this._msg(`${this.text(TXT.error)}: ${e && e.message ? e.message : e}`),
			);
		return true;
	}

	render() {
		const s = this.settings || {};
		const loc = this._loc(s);
		this._style();
		if (!loc) {
			this._key = "";
			return this._msg(this.text(TXT.pickLoc));
		}
		const key = JSON.stringify(this._message(true));
		const updated = this.states[`${loc}.widgetUpdated`]?.val;
		if (key !== this._key) {
			if (!this.shadowRoot.querySelector("iframe")) {
				this._msg(this.text(TXT.loading));
			}
			// erst merken, wenn wirklich gefragt wurde - ohne Verbindung beim nächsten render() erneut
			if (this._request(true)) {
				this._key = key;
				this._updated = updated;
			}
		} else if (updated !== this._updated) {
			this._updated = updated;
			this._request(false);
		}
	}

	_style() {
		const host = this.shadowRoot;
		if (!host.querySelector("style")) {
			host.innerHTML =
				`<style>:host{display:block;width:100%;height:100%;overflow:hidden;position:relative}` +
				`iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}` +
				`.msg{padding:12px;opacity:.7;font-size:14px}</style><div class="box"></div>`;
		}
		const f = host.querySelector("iframe");
		f && (f.style.pointerEvents = this.editMode ? "none" : "");
	}

	_msg(text) {
		const box = this.shadowRoot.querySelector(".box");
		const d = document.createElement("div");
		d.className = "msg";
		d.textContent = text;
		box.replaceChildren(d);
	}

	_frame(html) {
		const box = this.shadowRoot.querySelector(".box");
		const f = document.createElement("iframe");
		// eigene Skripte ja, Zugriff auf die Visualisierung nein
		f.setAttribute("sandbox", "allow-scripts");
		f.setAttribute("title", "Weather screensaver");
		f.style.pointerEvents = this.editMode ? "none" : "";
		f.srcdoc = html;
		box.replaceChildren(f);
	}

	connectedCallback() {
		super.connectedCallback && super.connectedCallback();
		clearInterval(this._timer);
		// Sonnenstand und Tageszeit ändern sich auch ohne neue Wetterdaten
		this._timer = setInterval(() => this._loc(this.settings || {}) && this._request(false), REFRESH_MS);
	}

	disconnectedCallback() {
		super.disconnectedCallback && super.disconnectedCallback();
		clearInterval(this._timer);
	}
}

defineWebComponent("iob-openmeteo-wallpaper", OpenMeteoWallpaper);
