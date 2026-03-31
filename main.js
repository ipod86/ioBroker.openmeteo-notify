"use strict";

/*
 * Created with @iobroker/create-adapter v3.1.2
 */

const utils = require("@iobroker/adapter-core");
const https = require("https");

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const DESCRIPTIONS = {
	0: "Klar",
	1: "Überwiegend klar",
	2: "Teilweise bewölkt",
	3: "Bedeckt",
	45: "Nebel",
	48: "Gefrierender Nebel",
	51: "Leichter Nieselregen",
	53: "Nieselregen",
	55: "Starker Nieselregen",
	61: "Leichter Regen",
	63: "Regen",
	65: "Starker Regen",
	71: "Leichter Schnee",
	73: "Schnee",
	75: "Starker Schnee",
	77: "Schneekörner",
	80: "Leichte Schauer",
	81: "Schauer",
	82: "Starke Schauer",
	85: "Leichte Schneeschauer",
	86: "Schneeschauer",
	95: "Gewitter",
	96: "Gewitter mit Hagel",
	99: "Schweres Gewitter",
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
	61: "🌦️",
	63: "🌧️",
	65: "🌧️",
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

class Openmeteo extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	constructor(options) {
		super({
			...options,
			name: "openmeteo",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	async onReady() {
		await this.setState("info.connection", false, true);

		const lat = this.config.lat;
		const lon = this.config.lon;
		const daysCount = this.config.daysCount || 7;
		const hourlyDays = this.config.hourlyDays || 3;

		if (hourlyDays > daysCount) {
			this.log.error(
				`hourlyDays (${hourlyDays}) darf nicht größer als daysCount (${daysCount}) sein!`,
			);
			this.terminate();
			return;
		}

		try {
			const data = await this.fetchWeather(lat, lon, daysCount);
			await this.setState("info.connection", true, true);
			await this.processData(data, daysCount, hourlyDays);
			await this.cleanup(daysCount, hourlyDays);
			this.log.info(
				`OpenMeteo aktualisiert (${daysCount} Tage, ${hourlyDays} davon stündlich)`,
			);
		} catch (err) {
			this.log.error(`Fehler beim Abrufen der Wetterdaten: ${err.message}`);
			await this.setState("info.connection", false, true);
		}

		this.terminate();
	}

	/**
	 * Fetches weather data from Open-Meteo API
	 *
	 * @param {number} lat - Latitude
	 * @param {number} lon - Longitude
	 * @param {number} daysCount - Number of forecast days
	 * @returns {Promise<object>}
	 */
	fetchWeather(lat, lon, daysCount) {
		return new Promise((resolve, reject) => {
			const url =
				`https://api.open-meteo.com/v1/forecast` +
				`?latitude=${lat}&longitude=${lon}` +
				`&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
				`,precipitation_probability_max,weathercode,windspeed_10m_max` +
				`,winddirection_10m_dominant,sunrise,sunset,uv_index_max,sunshine_duration` +
				`&hourly=temperature_2m,apparent_temperature,precipitation_probability` +
				`,precipitation,weathercode,windspeed_10m,cloudcover` +
				`&timezone=Europe/Berlin&forecast_days=${daysCount}`;

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
	 * Processes weather data and writes all states
	 *
	 * @param {object} data - Raw API response
	 * @param {number} daysCount - Number of days
	 * @param {number} hourlyDays - Number of days with hourly data
	 */
	async processData(data, daysCount, hourlyDays) {
		const d = data.daily;
		const h = data.hourly;

		// Group hourly values by date
		const hoursByDate = {};
		for (let i = 0; i < h.time.length; i++) {
			const dateKey = h.time[i].substring(0, 10);
			const hour = parseInt(h.time[i].substring(11, 13));
			if (!hoursByDate[dateKey]) hoursByDate[dateKey] = [];
			hoursByDate[dateKey][hour] = {
				temperature: Math.round(h.temperature_2m[i] * 10) / 10,
				feels_like: Math.round(h.apparent_temperature[i] * 10) / 10,
				precipitation: h.precipitation[i],
				rain_prob: h.precipitation_probability[i],
				windspeed: h.windspeed_10m[i],
				cloudcover: h.cloudcover[i],
				weathercode: h.weathercode[i],
				icon: ICONS[h.weathercode[i]] || "🌡️",
				description: DESCRIPTIONS[h.weathercode[i]] || "Unbekannt",
			};
		}

		const shortParts = [];

		for (let i = 0; i < d.time.length; i++) {
			const date = new Date(d.time[i]);
			const weekday = WEEKDAYS[date.getDay()];
			const icon = ICONS[d.weathercode[i]] || "🌡️";
			const desc = DESCRIPTIONS[d.weathercode[i]] || "Unbekannt";
			const prefix = `day${i + 1}`;
			const tempMax = Math.round(d.temperature_2m_max[i] * 10) / 10;
			const tempMin = Math.round(d.temperature_2m_min[i] * 10) / 10;
			const sunH = Math.round(d.sunshine_duration[i] / 360) / 10;

			await this.setObjectNotExistsAsync(prefix, {
				type: "channel",
				common: { name: `Tag ${i + 1}: ${weekday} ${d.time[i]}` },
				native: {},
			});

			await this.setDP(`${prefix}.date`,            d.time[i],                           { name: "Datum",              type: "string", role: "date" });
			await this.setDP(`${prefix}.weekday`,          weekday,                             { name: "Wochentag",          type: "string", role: "dayofweek" });
			await this.setDP(`${prefix}.icon`,             icon,                                { name: "Icon",               type: "string", role: "weather.icon.name" });
			await this.setDP(`${prefix}.description`,      desc,                                { name: "Beschreibung",       type: "string", role: "weather.state" });
			await this.setDP(`${prefix}.temp_max`,         tempMax,                             { name: "Temp. Max",          type: "number", unit: "°C",  role: "value.temperature.max" });
			await this.setDP(`${prefix}.temp_min`,         tempMin,                             { name: "Temp. Min",          type: "number", unit: "°C",  role: "value.temperature.min" });
			await this.setDP(`${prefix}.weathercode`,      d.weathercode[i],                   { name: "Wettercode",         type: "number",              role: "value" });
			await this.setDP(`${prefix}.precipitation`,    d.precipitation_sum[i],             { name: "Niederschlag",       type: "number", unit: "mm",  role: "value.precipitation" });
			await this.setDP(`${prefix}.rain_probability`, d.precipitation_probability_max[i], { name: "Regenwahrsch.",      type: "number", unit: "%",   role: "value.precipitation.chance" });
			await this.setDP(`${prefix}.windspeed`,        d.windspeed_10m_max[i],             { name: "Wind Max",           type: "number", unit: "km/h",role: "value.speed.max.wind" });
			await this.setDP(`${prefix}.winddirection`,    d.winddirection_10m_dominant[i],    { name: "Windrichtung",       type: "number", unit: "°",   role: "value.direction.wind" });
			await this.setDP(`${prefix}.sunrise`,          d.sunrise[i],                       { name: "Sonnenaufgang",      type: "string",              role: "date.sunrise" });
			await this.setDP(`${prefix}.sunset`,           d.sunset[i],                        { name: "Sonnenuntergang",    type: "string",              role: "date.sunset" });
			await this.setDP(`${prefix}.uv_index`,         d.uv_index_max[i],                  { name: "UV-Index",           type: "number",              role: "value.uv" });
			await this.setDP(`${prefix}.sunshine_hours`,   sunH,                               { name: "Sonnenstunden",      type: "number", unit: "h",   role: "value" });

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
					if (!hData) continue;
					const hKey = `h${String(hh).padStart(2, "0")}`;
					const hPath = `${prefix}.hourly.${hKey}`;

					await this.setObjectNotExistsAsync(hPath, {
						type: "channel",
						common: { name: `${String(hh).padStart(2, "0")}:00 Uhr` },
						native: {},
					});

					await this.setDP(`${hPath}.temperature`,   hData.temperature,   { name: "Temperatur",    type: "number", unit: "°C",  role: "value.temperature" });
					await this.setDP(`${hPath}.feels_like`,    hData.feels_like,    { name: "Gefühlt",       type: "number", unit: "°C",  role: "value.temperature.feelslike" });
					await this.setDP(`${hPath}.precipitation`, hData.precipitation, { name: "Niederschlag",  type: "number", unit: "mm",  role: "value.precipitation.hour" });
					await this.setDP(`${hPath}.rain_prob`,     hData.rain_prob,     { name: "Regenwahrsch.", type: "number", unit: "%",   role: "value.precipitation.chance" });
					await this.setDP(`${hPath}.windspeed`,     hData.windspeed,     { name: "Wind",          type: "number", unit: "km/h",role: "value.speed.wind" });
					await this.setDP(`${hPath}.cloudcover`,    hData.cloudcover,    { name: "Bewölkung",     type: "number", unit: "%",   role: "value.clouds" });
					await this.setDP(`${hPath}.weathercode`,   hData.weathercode,   { name: "Wettercode",    type: "number",              role: "value" });
					await this.setDP(`${hPath}.icon`,          hData.icon,          { name: "Icon",          type: "string",              role: "weather.icon.name" });
					await this.setDP(`${hPath}.description`,   hData.description,   { name: "Beschreibung",  type: "string",              role: "weather.state" });
				}
			}

			shortParts.push(`${weekday} ${Math.round(tempMax)}° ${icon}`);
		}

		await this.setDP("weather_short", shortParts.join(" | "), {
			name: "Wetter Kurzübersicht",
			type: "string",
			role: "weather.title",
		});
	}

	/**
	 * Removes orphaned states when daysCount or hourlyDays was reduced
	 *
	 * @param {number} daysCount - Current days count
	 * @param {number} hourlyDays - Current hourly days count
	 */
	async cleanup(daysCount, hourlyDays) {
		// Delete entire day channels beyond daysCount (up to max 16)
		for (let i = daysCount + 1; i <= 16; i++) {
			try {
				await this.delObjectAsync(`day${i}`, { recursive: true });
				this.log.debug(`Tag ${i} gelöscht`);
			} catch {
				// Object didn't exist, ignore
			}
		}
		// Delete only hourly sub-channels for days beyond hourlyDays
		for (let i = hourlyDays + 1; i <= daysCount; i++) {
			try {
				await this.delObjectAsync(`day${i}.hourly`, { recursive: true });
				this.log.debug(`Stundenwerte Tag ${i} gelöscht`);
			} catch {
				// Object didn't exist, ignore
			}
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 *
	 * @param {() => void} callback - Callback function
	 */
	onUnload(callback) {
		try {
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
