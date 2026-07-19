# Older Changelog

### 0.1.7 (2026-06-09)
* (ipod86) fix: translate all German common.name values and widget warning strings to English

### 0.1.6 (2026-06-06)
* (ipod86) fix: use weather.direction.wind instead of weather.direction.wind.forecast.1 for day 1+ (role not in ioBroker catalogue)
* (ipod86) chore: bump react-dom and @types/react-dom from 18 to 19

### 0.0.41
* Fix: React crash on address search in location settings (`setRowStates` inside updater)

### 0.0.40
* amCharts animated/static SVG icons (CC BY 4.0)
* HTML widget data points with light/dark theme support
* OSM map preview and address geocoding in location settings

### 0.0.39
* Weather summary sentences for `current.summary`, `dayX.summary_day` and `dayX.summary_night` in 11 languages
* DWD-standard precipitation classification: intensity (light/moderate/heavy via mm/h) × frequency (isolated/intermittent/persistent via hour count)
* Precipitation amounts shown in summary (mm for rain, cm for snow)
* CAPE-based thunderstorm risk appended to summary (≥500 J/kg: risk, ≥1000: danger, ≥2500: severe)
* DWD temperature thresholds: hot/warm/mild/cool/cold/frost/hard_frost (30/25/15/5/0/−10°C)
* DWD wind scale: breezy/fresh/strong/stormy/storm (20/29/50/62/89 km/h, Beaufort 4–10+)

### 0.0.38
* DWD-standard precipitation intensity/frequency, temperature and wind thresholds for weather summaries

### 0.0.37
* Day and night weather summary texts for each forecast day (`summary_day`, `summary_night`)
* Day/night split based on `is_day` field from API

### 0.0.36
* Multilingual weather descriptions, moon phases and pollen levels (11 languages: de, en, fr, it, es, pt, nl, pl, ru, uk, zh-cn)
* Weekday abbreviations localized per language
* Timezone now read from ioBroker system config (`system.config.common.timezone`); fallback: `auto`

### 0.0.35
* Add real Basmilius Meteocons sleet icons for WMO codes 56/57/66/67 (day, night, animated)
* Previously these codes had placeholder/missing icons; now using correct partly-cloudy/overcast sleet variants

### 0.0.34
* Add missing WMO codes 56/57 (freezing drizzle) and 66/67 (freezing rain) to descriptions, emoji icons and rain detection
* Day icons for codes 56/57/66/67 fall back to nearest equivalent in basmilius/wmo sets (night icons are complete)

### 0.0.33
* Fix: setting hourlyDays to 0 was ignored (`0 || 3` evaluated to 3) – hourly folders were never cleaned up

### 0.0.32
* Fix: pollen channels not deleted when "pollen hourly" was disabled (early return prevented cleanup)
* Fix: `enablePollenHourly` defaulted to `true` on upgrades from old config – now correctly defaults to `false`
* Fix: when both pollen and air quality disabled, leftover channels now properly cleaned up
* New: daily air quality max values under `dayX.air_quality` (european_aqi_max, pm10_max, pm2_5_max, …)

### 0.0.31
* Remove `@iobroker/plugin-sentry` dependency (not needed)
* Fix admin globalDependency minVersion to >=7.6.17
* README.md now English-only; German documentation moved to README.de.md

### 0.0.30
* Fix: hourly air quality data not written when pollen is disabled
* Fix: timer reference not cleared on timeout callback
* Fix: JSDoc for pollenLevelText corrected (4 levels, not 5)

### 0.0.29
* Default for pollen hourly changed to off

### 0.0.28
* "Also hourly" toggle for all 4 optional data groups (Air Quality, Astronomy, Agriculture, Pollen)
* Air Quality hourly: real hourly PM10/PM2.5/AQI data from Air Quality API
* Astronomy hourly: daily sun/moon values echoed per hourly slot
* Update interval options: 60 min, 120 min, or daily at 01:00 (scheduled exactly)

### 0.0.27
* "Also hourly" toggle for Agriculture and Pollen categories

### 0.0.26
* Optional data groups: Air Quality, Astronomy, Agriculture/Solar – each with auto-cleanup when disabled
* Pollen cleanup: dayX.pollen channels removed when pollen is disabled

### 0.0.25
* Moon phase per day: moon_phase_val/text/icon_url, moonrise, moonset (via SunCalc)
* Day/night icon variants for Basmilius PNG and animated SVG (based on is_day)
* AQI current data under current.air_quality: european_aqi, PM10, PM2.5, NO₂, CO, dust, ozone
* Pollen level text (_text) DPs: Keine/Niedrig/Mittel/Hoch at current/daily/hourly level
* Configurable update interval in settings
* info.lastUpdate written after each successful update
* Additional daily DPs: cloud_cover_max, dew_point_mean, humidity_mean, pressure_mean
* Additional hourly DPs: soil_temp, irradiance

### 0.0.11
* Add React admin UI with icon set picker and live preview
* Add Meteocons (static PNG + animated SVG) icon sets

### 0.0.4
* Read ioBroker system.config coordinates as fallback location

### 0.0.2
* Switch to daemon mode for immediate fetch on start

### 0.0.1
* Initial release
## 0.1.10 (2026-06-23)
* (ipod86) fix: improve air quality/pollen error log message – distinguish timeout from unsupported region

## 0.1.9 (2026-06-22)
* (ipod86) fix: increase HTTP request timeout from 10s to 30s
* (ipod86) fix: remove spurious enableWarnOfficialFetch from native defaults
* (ipod86) chore: bump @iobroker/adapter-core from 3.3.2 to 3.4.1
* (ipod86) chore: bump @iobroker/adapter-react-v5, react, @vitejs/plugin-react, vite in src-admin
* (ipod86) chore: bump ioBroker/testing-action-check from 1 to 2

## 0.1.8 (2026-06-09)
* (ipod86) fix: add 10s timeout to all HTTP requests (fetchWeather, fetchAirQuality, fetchLocationInfo, fetchMeteoAlarmWarnings, fetchDwdWarnings)
* (ipod86) fix: translate all remaining German common.name values in processData, processDwdWarnings, processMeteoAlarmWarnings
* (ipod86) fix: warning time format no longer hardcoded to de-DE locale; uses system locale
* (ipod86) fix: add interval bounds validation (1–35791 min) for updateInterval and warnIntervalMinutes
* (ipod86) fix: add missing native defaults (warnOfficialFetch, enableWarnOfficialFetch, widgets) to io-package.json
* (ipod86) fix: move _locationInfo initialization to constructor

## 0.1.7 (2026-06-09)
* (ipod86) fix: translate all German common.name values to English (Last Update, Official Warnings, Current Weather, Today/Tomorrow/Day N, Agriculture/Solar, Comfort Indices, Astronomy, Air Quality, Pollen)
* (ipod86) fix: translate German widget strings in warning overlay to English

## 0.1.6 (2026-06-06)
* (ipod86) fix: use weather.direction.wind instead of weather.direction.wind.forecast.1 for day1+ (role not in ioBroker catalogue)
* (ipod86) chore: bump react-dom and @types/react-dom from 18 to 19

## 0.1.5 (2026-06-06)
* (ipod86) fix: replace invalid object roles – use valid ioBroker role catalogue entries only (E1008)
* (ipod86) fix: update @alcalzone/release-script to >=5.2.1 (E0036)

## 0.1.4 (2026-05-31)
* (ipod86) fix: translate storm/thunderstorm/frost notification texts to system language (was always German)
* (ipod86) fix: sync i18n keys across all languages in admin/i18n and src-admin/src/i18n (W5604, W5605)
* (ipod86) fix: use this.delay() instead of plain setTimeout in retry logic (W5005)
* (ipod86) fix: engines.node >= 22, @tsconfig/node22, @types/node ^22, deploy node 24 (E0028, E3022)
* (ipod86) fix: add dependabot ignore block for @types/node major versions (E8917)
* (ipod86) fix: remove Node 20 from test matrix (W3024)
* (ipod86) fix: add tsconfig.json for proper type checking (S0087)
* (ipod86) fix: migrate i18n to short format (S5601)

## 0.1.3 (2026-04-25)
* (ipod86) Custom SVG icon set with night icon support and Base64 embedding in widget HTML
* (ipod86) WMO OGC SVG icon set with theme-aware color inversion
* (ipod86) Widget: responsive layout via CSS container queries; configurable width (200–900 px); custom color theme with background and text color pickers; MDI SVG icons
* (ipod86) Comfort indices: heat index, windchill, humidex, UV index (optional, hourly option)
* (ipod86) Settings: inline validation, save blocked on invalid config

## 0.1.2 (2026-04-19)
* (ipod86) Fix: log detailed API error reason for HTTP 4xx responses

## 0.1.1 (2026-04-19)
* (ipod86) Rename adapter to ioBroker.openmeteo-notify

## 0.1.0 (2026-04-16)
* (ipod86) Official weather warnings: DE uses DWD, EU countries use MeteoAlarm – auto-detected from coordinates
* (ipod86) Unified `location.warnings.*` folder for all official warnings with `source` data point
* (ipod86) Single `warnOfficial` toggle replaces separate `enableDwd` / `warnDwd` settings
* (ipod86) New daily data points: `temp_mean`, `feels_like_mean`, `precipitation_hours`, `showers`, `uv_index_clear_sky`, `snowfall_height_min`
* (ipod86) New hourly data points: `snowfall_height`, `freezing_level_height`, `uv_index`
* (ipod86) Astronomy: added `solar_noon` and `solar_elevation_max` (computed via SunCalc)
* (ipod86) Fix: day channel names no longer frozen to creation date

## 0.0.46 (2026-04-08)
* (ipod86) add CHANGELOG_OLD.md; add release-script

## 0.0.45
* Weather warnings (storm/thunderstorm) via ioBroker notification system
* Configurable Beaufort threshold for storm warnings (Bft 1–12, default Bft 8)
* Daily `has_storm` / `has_thunderstorm` datapoints per location
* Hourly `is_storm` / `is_thunderstorm` datapoints (when hourly data enabled)
* Storm detection based on wind gusts (`windgusts_10m`)
* Warning message includes from/to time; day offset shown when event spans midnight
* Warnings use raw API data — no minimum `hourlyDays` setting required
* i18n translations for all new settings in 11 languages

## 0.0.44
* (ipod86) fix dark theme: set theme-aware background color on root wrapper

## 0.0.43
* Fix: remove auto-location entry written to `system.config` on first start

## 0.0.42
* Remove automatic reverse geocoding from location settings table

For older changelog entries see [CHANGELOG_OLD.md](CHANGELOG_OLD.md).
