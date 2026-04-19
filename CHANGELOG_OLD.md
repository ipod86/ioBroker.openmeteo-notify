# Older Changelog

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
## 0.0.44
* (ipod86) fix dark theme: set theme-aware background color on root wrapper

## 0.0.43
* Fix: remove auto-location entry written to `system.config` on first start

## 0.0.42
* Remove automatic reverse geocoding from location settings table

For older changelog entries see [CHANGELOG_OLD.md](CHANGELOG_OLD.md).
