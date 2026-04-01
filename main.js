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

// Precipitation type codes
const RAIN_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]);
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
function weatherIconUrl(code, iconSet) {
	const padded = String(code).padStart(2, "0");
	const ext = iconSet === "basmilius_animated" ? "svg" : "png";
	return `/openmeteo.admin/icons/${iconSet}/wmo_${padded}.${ext}`;
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
		this.on("ready", this.onReady.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	async onReady() {
		await this.setState("info.connection", false, true);

		// Sofort beim Start abrufen
		await this.runUpdate();

		// Danach stündlich wiederholen
		this.updateInterval = this.setInterval(
			async () => {
				await this.runUpdate();
			},
			60 * 60 * 1000,
		);
	}

	/**
	 * Runs a full weather update for all configured locations
	 */
	async runUpdate() {
		let locations = this.config.locations;
		const daysCount = this.config.daysCount || 7;
		const hourlyDays = this.config.hourlyDays || 3;
		const temperatureUnit = this.config.temperatureUnit || "celsius";
		const windspeedUnit = this.config.windspeedUnit || "kmh";
		const precipitationUnit = this.config.precipitationUnit || "mm";
		const iconSet = this.config.iconSet || "basmilius";

		if (!Array.isArray(locations) || locations.length === 0) {
			// Fallback: use ioBroker system coordinates from system.config
			const sysConfig = await this.getForeignObjectAsync("system.config");
			const lat = sysConfig && sysConfig.common && sysConfig.common.latitude;
			const lon = sysConfig && sysConfig.common && sysConfig.common.longitude;
			const city = (sysConfig && sysConfig.common && sysConfig.common.city) || "Home";
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
				);

				await this.setObjectNotExistsAsync(locId, {
					type: "channel",
					common: { name: loc.name },
					native: {},
				});

				await this.processData(data, locId, daysCount, hourlyDays, units, iconSet);
				await this.cleanupLocation(locId, daysCount, hourlyDays);
				anySuccess = true;
				this.log.info(`OpenMeteo aktualisiert: ${loc.name} (${daysCount} Tage, ${hourlyDays} davon stündlich)`);
			} catch (err) {
				this.log.error(`Fehler beim Abrufen der Wetterdaten für "${loc.name}": ${err.message}`);
			}
		}

		await this.setState("info.connection", anySuccess, true);
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
	 * @returns {Promise<object>} Parsed JSON response from Open-Meteo API
	 */
	fetchWeather(lat, lon, daysCount, temperatureUnit, windspeedUnit, precipitationUnit) {
		return new Promise((resolve, reject) => {
			const url =
				`https://api.open-meteo.com/v1/forecast` +
				`?latitude=${lat}&longitude=${lon}` +
				`&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min` +
				`,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,windgusts_10m_max` +
				`,winddirection_10m_dominant,sunrise,sunset,uv_index_max,sunshine_duration` +
				`&hourly=temperature_2m,apparent_temperature,precipitation_probability` +
				`,precipitation,weathercode,windspeed_10m,winddirection_10m,cloudcover` +
				`&current=temperature_2m,apparent_temperature,precipitation,weathercode` +
				`,windspeed_10m,windgusts_10m,winddirection_10m,cloudcover` +
				`&timezone=Europe/Berlin&forecast_days=${daysCount}` +
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
	async processData(data, locId, daysCount, hourlyDays, units, iconSet) {
		const { tempUnit, windUnit, precipUnit, windspeedUnit } = units;
		const d = data.daily;
		const h = data.hourly;
		const cur = data.current;

		// --- Current weather channel ---
		if (cur) {
			const curCode = cur.weathercode;
			const curIcon = ICONS[curCode] || "🌡️";
			const curDesc = DESCRIPTIONS[curCode] || "Unbekannt";

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
			await this.setDP(`${locId}.current.icon_url`, weatherIconUrl(curCode, iconSet), {
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
				description: DESCRIPTIONS[h.weathercode[i]] || "Unbekannt",
			};
		}

		const shortParts = [];

		for (let i = 0; i < d.time.length; i++) {
			const date = new Date(d.time[i]);
			const weekday = WEEKDAYS[date.getDay()];
			const icon = ICONS[d.weathercode[i]] || "🌡️";
			const desc = DESCRIPTIONS[d.weathercode[i]] || "Unbekannt";
			const prefix = `${locId}.day${i + 1}`;
			const tempMax = Math.round(d.temperature_2m_max[i] * 10) / 10;
			const tempMin = Math.round(d.temperature_2m_min[i] * 10) / 10;
			const feelsMax = Math.round(d.apparent_temperature_max[i] * 10) / 10;
			const feelsMin = Math.round(d.apparent_temperature_min[i] * 10) / 10;
			const sunH = Math.round(d.sunshine_duration[i] / 360) / 10;
			const precipType = precipitationType(d.weathercode[i]);

			await this.setObjectNotExistsAsync(prefix, {
				type: "channel",
				common: { name: `Tag ${i + 1}: ${weekday} ${d.time[i]}` },
				native: {},
			});

			await this.setDP(`${prefix}.date`, d.time[i], { name: "Datum", type: "string", role: "date" });
			await this.setDP(`${prefix}.weekday`, weekday, { name: "Wochentag", type: "string", role: "dayofweek" });
			await this.setDP(`${prefix}.icon`, icon, { name: "Icon", type: "string", role: "weather.icon.name" });
			await this.setDP(`${prefix}.icon_url`, weatherIconUrl(d.weathercode[i], iconSet), {
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
			await this.setDP(`${prefix}.sunrise`, d.sunrise[i], {
				name: "Sonnenaufgang",
				type: "string",
				role: "date.sunrise",
			});
			await this.setDP(`${prefix}.sunset`, d.sunset[i], {
				name: "Sonnenuntergang",
				type: "string",
				role: "date.sunset",
			});
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
					await this.setDP(`${hPath}.icon_url`, weatherIconUrl(hData.weathercode, iconSet), {
						name: "Icon URL",
						type: "string",
						role: "weather.icon",
					});
					await this.setDP(`${hPath}.description`, hData.description, {
						name: "Beschreibung",
						type: "string",
						role: "weather.state",
					});
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
