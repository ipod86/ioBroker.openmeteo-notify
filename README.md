![Logo](admin/openmeteo.png)

# ioBroker.openmeteo

[![NPM version](https://img.shields.io/npm/v/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
[![Downloads](https://img.shields.io/npm/dm/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
![Number of Installations](https://iobroker.live/badges/openmeteo-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/openmeteo-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.openmeteo.png?downloads=true)](https://nodei.co/npm/iobroker.openmeteo/)

**Tests:** ![Test and Release](https://github.com/ipod86/ioBroker.openmeteo/workflows/Test%20and%20Release/badge.svg)

## ioBroker adapter for Open-Meteo weather forecasts

This adapter retrieves weather forecast data from the free [Open-Meteo API](https://open-meteo.com) and makes it available as ioBroker data points. No API key is required.

## Highlights

### Configurable HTML widget
The adapter generates a ready-to-use HTML data point (`widget`) that can be embedded directly in VIS, vis-2 or any ioBroker dashboard — no external tools or manual CSS needed. Theme (light/dark), background transparency, card transparency, font size and card color are all configurable directly in the adapter settings.

### Full-text address search
Locations do not have to be entered as raw coordinates. The settings UI offers a **free-text address search** — just type a city, address or region and the coordinates are resolved automatically. An OpenStreetMap preview is shown for each location. Multiple locations can be configured in parallel.

### Up to 16 days forecast
Depending on the selected weather model, daily forecasts for up to **16 days** are available — significantly more than the typical 5–7 days of most adapters.

### Weather summary texts
The adapter generates natural-language weather summaries (`current.summary`, `dayX.summary_day`, `dayX.summary_night`) in **11 languages**, using DWD-standard thresholds for temperature, wind and precipitation, including CAPE-based thunderstorm risk.

## Features

- **Free & no API key** – Open-Meteo is a free, open-source weather API
- **Multiple locations** – configure as many locations as you like, each with address search and map preview
- **System location fallback** – uses ioBroker system coordinates if no location is configured
- **Configurable forecast range** – up to 16 days daily, up to 16 days hourly
- **Configurable update interval** – 60 min, 120 min, or daily at 01:00
- **Units** – temperature (°C / °F), wind speed (km/h, m/s, mph, kn), precipitation (mm / inch)
- **5 weather icon sets** with live preview in settings:
  - Meteocons by Bas Milius – static PNG (default)
  - Meteocons by Bas Milius – animated SVG
  - amCharts Weather Icons – animated SVG *(rain/snow/thunder: no day/night variant)*
  - amCharts Weather Icons – static SVG *(rain/snow/thunder: no day/night variant)*
  - WMO OGC meteorological symbols – PNG
- **Day/night icons** – Meteocons and amCharts clear/cloudy icons switch to night variants based on `is_day`
- **Wind direction** – degrees, compass text (N/NE/E/…), arrow emoji (⬆️↗️…), SVG arrow icon
- **Wind strength** – Beaufort scale (0–12) with Meteocons Beaufort icons
- **`info.lastUpdate`** – timestamp of last successful update

### Optional data groups (individually switchable, each with "also hourly" option)

| Group | Default | Data points |
|-------|---------|-------------|
| **Air Quality** | on | european_aqi, PM10, PM2.5, NO₂, CO, dust, ozone → `current.air_quality` / `hXX.air_quality` |
| **Astronomy** | on | sunrise, sunset, moon phase, moonrise, moonset → `dayX.astronomy` / `hXX.astronomy` |
| **Agriculture / Solar** | off | solar radiation, CAPE, soil temperature, irradiance → `*.agriculture` |
| **Pollen** | off | alder, birch, grass, mugwort, olive, ragweed with level text → `dayX.pollen` / `hXX.pollen` |

When a group is disabled, its data point channels are automatically deleted on the next update.

## Installation

Install via the ioBroker Admin interface (search for "openmeteo").

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| Locations | Name + free-text address search or coordinates; OSM map preview | ioBroker system location |
| Forecast days | Daily forecast range (1–16) | 7 |
| Hourly days | Days with hourly data (0–16) | 3 |
| Temperature unit | °C or °F | °C |
| Wind speed unit | km/h, m/s, mph, kn | km/h |
| Precipitation unit | mm or inch | mm |
| Icon set | Weather icon set with live preview | Meteocons static |
| Update interval | 60 min / 120 min / daily at 01:00 | 60 min |
| Widget theme | Light or dark theme for the HTML widget | light |
| Widget bg opacity | Background transparency of the HTML widget | 100% |
| Widget card opacity | Card transparency of the HTML widget | 100% |
| Widget font size | Font size in the HTML widget | 14px |
| Widget card color | Card background color | #ffffff |
| Compact view | Use compact layout in the HTML widget | off |
| Air Quality | Enable AQI + particulate matter | on |
| Air Quality – also hourly | Hourly AQI/PM under `hXX.air_quality` | off |
| Astronomy | Enable sun & moon data | on |
| Astronomy – also hourly | Echo astronomy data per hourly slot | off |
| Agriculture / Solar | Enable radiation, CAPE, soil temp | off |
| Agriculture – also hourly | Hourly agricultural data | off |
| Pollen | Enable pollen data (Europe only) | off |
| Pollen – also hourly | Hourly pollen per type | off |

## Data points

The adapter creates data points under `openmeteo.<instance>.<location>`.

### Current weather (`current`)

| Data point | Description | Unit |
|-----------|-------------|------|
| `temperature` | Current temperature | °C/°F |
| `feels_like` | Feels-like temperature | °C/°F |
| `weathercode` | WMO weather code | |
| `description` | Weather description | |
| `icon` | Weather emoji | |
| `icon_url` | Weather icon URL | |
| `precipitation` | Total precipitation | mm/inch |
| `rain` | Rain amount | mm/inch |
| `snowfall` | Snowfall | cm |
| `snow_depth` | Snow depth | cm |
| `cloudcover` | Cloud cover | % |
| `humidity` | Relative humidity | % |
| `dew_point` | Dew point | °C/°F |
| `pressure` | Atmospheric pressure (MSL) | hPa |
| `visibility` | Visibility | m |
| `is_day` | Daylight indicator | boolean |
| `windspeed` | Wind speed | km/h … |
| `windgusts` | Wind gusts | km/h … |
| `winddirection` | Wind direction | ° |
| `winddirection_text` | Wind direction text | N/NE/… |
| `winddirection_icon` | Wind direction emoji | ⬆️↗️… |
| `winddirection_icon_url` | Wind direction arrow icon URL | |
| `windbeaufort` | Wind strength Beaufort | 0–12 |
| `windbeaufort_icon_url` | Beaufort icon URL | |
| `air_quality.*` | AQI, PM10, PM2.5, NO₂, CO, dust, ozone *(if enabled)* | |
| `pollen.*` | Current pollen per type *(if enabled)* | Grains/m³ |
| `agriculture.*` | Solar radiation, CAPE, soil temperature *(if enabled)* | |

### Daily forecast (`day1` … `day16`)

| Data point | Description |
|-----------|-------------|
| `date` / `weekday` | Date / day of week |
| `icon` / `icon_url` | Weather icon (day/night variant) |
| `description` | Weather description |
| `temp_max` / `temp_min` | Temperature max/min |
| `feels_like_max` / `feels_like_min` | Feels-like max/min |
| `weathercode` | WMO weather code |
| `precipitation` | Precipitation sum |
| `rain` / `snowfall` | Rain / snowfall sum |
| `rain_probability` | Precipitation probability |
| `windspeed` / `windgusts` | Wind speed / gusts max |
| `winddirection` / `_text` / `_icon` / `_icon_url` | Wind direction |
| `windbeaufort` / `windbeaufort_icon_url` | Beaufort scale |
| `uv_index` | UV index max |
| `sunshine_hours` / `daylight_hours` | Sunshine / daylight duration | h |
| `cloud_cover_max` | Max cloud cover | % |
| `dew_point_mean` / `humidity_mean` / `pressure_mean` | Daily mean values | |
| `air_quality.european_aqi_max` … `ozone_max` | Daily max AQI, PM10, PM2.5, NO₂, CO, dust, ozone *(if enabled)* | |
| `astronomy.sunrise` / `astronomy.sunset` | Sunrise / sunset *(if enabled)* | |
| `astronomy.moon_phase_val` / `_text` / `_icon_url` | Moon phase *(if enabled)* | |
| `astronomy.moonrise` / `astronomy.moonset` | Moon rise / set *(if enabled)* | |
| `agriculture.solar_radiation_sum` / `.evapotranspiration` | Solar / evapotranspiration *(if enabled)* | |
| `pollen.alder` … `pollen.ragweed` | Daily max pollen + level text *(if enabled, day1–4)* | |

### Hourly values (`day1.hourly.h00` … `h23`)

Temperature, feels-like, precipitation, rain, snowfall, snow depth, rain probability, cloud cover, humidity, dew point, pressure, visibility, is_day, wind speed, wind direction (text/emoji/icon), Beaufort, weather code, icon/icon_url, description.

Optional per hour (if enabled + "also hourly"):

| Channel | Data points |
|---------|-------------|
| `hXX.air_quality` | european_aqi, PM10, PM2.5, NO₂, CO, dust, ozone |
| `hXX.astronomy` | sunrise, sunset, moon_phase_val/text/icon_url, moonrise, moonset |
| `hXX.agriculture` | solar_radiation, CAPE, soil_temp, irradiance |
| `hXX.pollen` | alder … ragweed + level text (Keine/Niedrig/Mittel/Hoch) |

### Summary & widget

| Data point | Description |
|-----------|-------------|
| `current.summary` | Natural-language weather summary for current conditions (11 languages) |
| `dayX.summary_day` | Daytime weather summary for the forecast day (11 languages) |
| `dayX.summary_night` | Night-time weather summary for the forecast day (11 languages) |
| `weather_short` | Short text overview of all forecast days |
| `widget` | Ready-to-use HTML snippet for VIS / vis-2 / dashboards (configurable appearance) |
| `info.lastUpdate` | Timestamp of last successful update |

## Icon credits

- **Meteocons** by [Bas Milius](https://github.com/basmilius/weather-icons) – MIT License
- **amCharts Weather Icons** by [amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/) – [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **WMO meteorological symbols** by [OGC MetOcean DWG](https://github.com/OGCMetOceanDWG/WorldWeatherSymbols) – CC BY 4.0

## Disclaimer

This adapter uses the Open-Meteo API. The Open-Meteo name and logo are property of their respective owners. This adapter is an independent community project and is not affiliated with or endorsed by Open-Meteo.

## Changelog
### 0.0.46 (2026-04-08)
* (ipod86) add CHANGELOG_OLD.md; add release-script

### 0.0.45
* Weather warnings (storm/thunderstorm) via ioBroker notification system
* Configurable Beaufort threshold for storm warnings (Bft 1–12, default Bft 8)
* Daily `has_storm` / `has_thunderstorm` datapoints per location
* Hourly `is_storm` / `is_thunderstorm` datapoints (when hourly data enabled)
* Storm detection based on wind gusts (`windgusts_10m`)
* Warning message includes from/to time; day offset shown when event spans midnight
* Warnings use raw API data — no minimum `hourlyDays` setting required
* i18n translations for all new settings in 11 languages

### 0.0.44
* (ipod86) fix dark theme: set theme-aware background color on root wrapper

### 0.0.43
* Fix: remove auto-location entry written to `system.config` on first start

### 0.0.42
* Remove automatic reverse geocoding from location settings table

## License

MIT License

Copyright (c) 2026 ipod86

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
