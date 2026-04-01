![Logo](admin/openmeteo.png)

# ioBroker.openmeteo

[![NPM version](https://img.shields.io/npm/v/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
[![Downloads](https://img.shields.io/npm/dm/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
![Number of Installations](https://iobroker.live/badges/openmeteo-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/openmeteo-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.openmeteo.png?downloads=true)](https://nodei.co/npm/iobroker.openmeteo/)

**Tests:** ![Test and Release](https://github.com/ipod86/ioBroker.openmeteo/workflows/Test%20and%20Release/badge.svg)

---

## English

### ioBroker adapter for Open-Meteo weather forecasts

This adapter retrieves weather forecast data from the free [Open-Meteo API](https://open-meteo.com) and makes it available as ioBroker data points. No API key is required. Data is updated hourly.

### Features

- **Free & no API key** – Open-Meteo is a free, open-source weather API
- **Multiple locations** – configure as many locations as you like
- **System location fallback** – if no location is configured, the adapter automatically uses the coordinates set in ioBroker system settings
- **Configurable forecast range** – up to 16 days daily, up to 16 days hourly
- **Units** – temperature (°C / °F), wind speed (km/h, m/s, mph, kn), precipitation (mm / inch)
- **3 weather icon sets** with preview in settings:
  - Meteocons by Bas Milius – static PNG (default)
  - Meteocons by Bas Milius – animated SVG
  - WMO OGC meteorological symbols – PNG
- **Wind direction** – degrees, compass text (N/NE/E/…), arrow emoji (⬆️↗️…), SVG arrow icon
- **Wind strength** – Beaufort scale (0–12) with Meteocons Beaufort icons
- **Extended weather data** – humidity, dew point, pressure, visibility, is_day, rain, snowfall, snow depth, solar radiation, CAPE
- **Pollen data** (optional, Europe only) – alder, birch, grass, mugwort, olive, ragweed in Grains/m³

### Installation

Install the adapter via the ioBroker Admin interface or directly from npm:

```bash
npm install iobroker.openmeteo
```

### Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| Locations | List of locations (name, latitude, longitude) | ioBroker system location |
| Forecast days | Number of daily forecast days (1–16) | 7 |
| Hourly days | Number of days with hourly data (0–16) | 3 |
| Temperature unit | °C or °F | °C |
| Wind speed unit | km/h, m/s, mph, kn | km/h |
| Precipitation unit | mm or inch | mm |
| Icon set | Which weather icon set to use | Meteocons (static) |
| Enable pollen | Fetch pollen data (Europe only, 4-day forecast) | off |

### Data points

The adapter creates data points under `openmeteo.<instance>.<location>`.

#### Current weather (`current`)

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
| `solar_radiation` | Shortwave solar radiation | W/m² |
| `cape` | Convective potential (CAPE) | J/kg |
| `windspeed` | Wind speed | km/h … |
| `windgusts` | Wind gusts | km/h … |
| `winddirection` | Wind direction | ° |
| `winddirection_text` | Wind direction text | N/NE/E/… |
| `winddirection_icon` | Wind direction emoji | ⬆️↗️… |
| `winddirection_icon_url` | Wind direction arrow icon URL | |
| `windbeaufort` | Wind strength Beaufort | 0–12 |
| `windbeaufort_icon_url` | Beaufort icon URL | |
| `pollen.alder` … `pollen.ragweed` | Current pollen (if enabled) | Grains/m³ |

#### Daily forecast (`day1` … `day16`)

| Data point | Description |
|-----------|-------------|
| `date` | Date |
| `weekday` | Day of week |
| `icon` / `icon_url` | Weather icon |
| `description` | Weather description |
| `temp_max` / `temp_min` | Temperature max/min |
| `feels_like_max` / `feels_like_min` | Feels-like max/min |
| `weathercode` | WMO weather code |
| `precipitation` | Total precipitation sum |
| `rain` | Rain sum |
| `snowfall` | Snowfall sum |
| `rain_probability` | Precipitation probability |
| `windspeed` / `windgusts` | Wind speed / gusts max |
| `winddirection` / `winddirection_text` / `winddirection_icon` / `winddirection_icon_url` | Wind direction |
| `windbeaufort` / `windbeaufort_icon_url` | Beaufort scale |
| `sunrise` / `sunset` | Sunrise / Sunset |
| `uv_index` | UV index max |
| `sunshine_hours` | Sunshine duration | h |
| `daylight_hours` | Daylight duration | h |
| `solar_radiation_sum` | Total solar radiation | MJ/m² |
| `evapotranspiration` | Reference evapotranspiration | mm |
| `pollen.alder` … `pollen.ragweed` | Daily max pollen (day1–day4, if enabled) | Grains/m³ |

#### Hourly values (`day1.hourly.h00` … `h23`)

Temperature, feels-like, precipitation, rain, snowfall, snow depth, rain probability, cloud cover, humidity, dew point, pressure, visibility, is_day, solar radiation, CAPE, wind speed, wind direction (incl. text/emoji/icon), Beaufort, weather code, icon.

For days with hourly data enabled: `pollen.alder` … `pollen.ragweed` per hour (if pollen enabled).

#### Summary

| Data point | Description |
|-----------|-------------|
| `weather_short` | Short text overview of all forecast days |

### Icon credits

- **Meteocons** by [Bas Milius](https://github.com/basmilius/weather-icons) – MIT License
- **WMO meteorological symbols** by [OGC MetOcean DWG](https://github.com/OGCMetOceanDWG/WorldWeatherSymbols) – CC BY 4.0
- **Beaufort icons** by [Bas Milius](https://github.com/basmilius/weather-icons) – MIT License

### Disclaimer

This adapter uses the Open-Meteo API. The Open-Meteo name and logo are property of their respective owners. This adapter is an independent community project and is not affiliated with or endorsed by Open-Meteo.

---

## Deutsch

### ioBroker-Adapter für Open-Meteo Wettervorhersagen

Dieser Adapter ruft Wetterdaten von der kostenlosen [Open-Meteo API](https://open-meteo.com) ab und stellt sie als ioBroker-Datenpunkte zur Verfügung. Es wird kein API-Schlüssel benötigt. Die Daten werden stündlich aktualisiert.

### Funktionen

- **Kostenlos & kein API-Schlüssel** – Open-Meteo ist eine freie, quelloffene Wetter-API
- **Mehrere Standorte** – beliebig viele Standorte konfigurierbar
- **Systemstandort als Fallback** – wenn kein Standort konfiguriert ist, verwendet der Adapter automatisch die in den ioBroker-Systemeinstellungen hinterlegten Koordinaten
- **Konfigurierbarer Vorhersagezeitraum** – bis zu 16 Tage täglich, bis zu 16 Tage stündlich
- **Einheiten** – Temperatur (°C / °F), Wind (km/h, m/s, mph, kn), Niederschlag (mm / inch)
- **3 Wetter-Icon-Sets** mit Vorschau in den Einstellungen:
  - Meteocons von Bas Milius – statische PNG (Standard)
  - Meteocons von Bas Milius – animierte SVG
  - WMO OGC meteorologische Symbole – PNG
- **Windrichtung** – Grad, Himmelsrichtungstext (N/NE/E/…), Pfeil-Emoji (⬆️↗️…), SVG-Pfeilicon
- **Windstärke** – Beaufort-Skala (0–12) mit Meteocons Beaufort-Icons
- **Erweiterte Wetterdaten** – Luftfeuchtigkeit, Taupunkt, Luftdruck, Sichtweite, Tag/Nacht, Regen, Schneefall, Schneehöhe, Solarstrahlung, CAPE
- **Pollendaten** (optional, nur Europa) – Erle, Birke, Gräser, Beifuß, Olive, Ambrosia in Körner/m³

### Installation

Adapter über die ioBroker-Admin-Oberfläche installieren oder direkt über npm:

```bash
npm install iobroker.openmeteo
```

### Konfiguration

| Einstellung | Beschreibung | Standard |
|-------------|--------------|----------|
| Standorte | Liste der Standorte (Name, Breitengrad, Längengrad) | ioBroker-Systemstandort |
| Vorhersagetage | Anzahl der täglichen Vorhersagetage (1–16) | 7 |
| Stundentage | Anzahl der Tage mit Stundenwerten (0–16) | 3 |
| Temperatureinheit | °C oder °F | °C |
| Windeinheit | km/h, m/s, mph, kn | km/h |
| Niederschlagseinheit | mm oder inch | mm |
| Icon-Set | Welches Wetter-Icon-Set verwendet werden soll | Meteocons (statisch) |
| Pollen aktivieren | Pollendaten abrufen (nur Europa, 4-Tage-Prognose) | aus |

### Datenpunkte

Der Adapter legt Datenpunkte unter `openmeteo.<instanz>.<standort>` an.

#### Aktuelles Wetter (`current`)

| Datenpunkt | Beschreibung | Einheit |
|-----------|--------------|---------|
| `temperature` | Aktuelle Temperatur | °C/°F |
| `feels_like` | Gefühlte Temperatur | °C/°F |
| `weathercode` | WMO-Wettercode | |
| `description` | Wetterbeschreibung | |
| `icon` | Wetter-Emoji | |
| `icon_url` | Wetter-Icon-URL | |
| `precipitation` | Gesamtniederschlag | mm/inch |
| `rain` | Regen | mm/inch |
| `snowfall` | Schneefall | cm |
| `snow_depth` | Schneehöhe | cm |
| `cloudcover` | Bewölkung | % |
| `humidity` | Relative Luftfeuchtigkeit | % |
| `dew_point` | Taupunkt | °C/°F |
| `pressure` | Luftdruck (MSL) | hPa |
| `visibility` | Sichtweite | m |
| `is_day` | Tag/Nacht | boolean |
| `solar_radiation` | Solarstrahlung | W/m² |
| `cape` | Gewitterpotenzial (CAPE) | J/kg |
| `windspeed` | Windgeschwindigkeit | km/h … |
| `windgusts` | Windböen | km/h … |
| `winddirection` | Windrichtung | ° |
| `winddirection_text` | Windrichtungstext | N/NE/E/… |
| `winddirection_icon` | Windrichtungs-Emoji | ⬆️↗️… |
| `winddirection_icon_url` | Windrichtungs-Pfeilicon-URL | |
| `windbeaufort` | Windstärke Beaufort | 0–12 |
| `windbeaufort_icon_url` | Beaufort-Icon-URL | |
| `pollen.alder` … `pollen.ragweed` | Aktuelle Pollen (wenn aktiviert) | Körner/m³ |

#### Tagesvorhersage (`day1` … `day16`)

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `date` | Datum |
| `weekday` | Wochentag |
| `icon` / `icon_url` | Wetter-Icon |
| `description` | Wetterbeschreibung |
| `temp_max` / `temp_min` | Temperatur max/min |
| `feels_like_max` / `feels_like_min` | Gefühlte Temperatur max/min |
| `weathercode` | WMO-Wettercode |
| `precipitation` | Gesamtniederschlag |
| `rain` | Regensumme |
| `snowfall` | Schneefallsumme |
| `rain_probability` | Niederschlagswahrscheinlichkeit |
| `windspeed` / `windgusts` | Windgeschwindigkeit / Böen max |
| `winddirection` / `winddirection_text` / `winddirection_icon` / `winddirection_icon_url` | Windrichtung |
| `windbeaufort` / `windbeaufort_icon_url` | Beaufort-Skala |
| `sunrise` / `sunset` | Sonnenaufgang / Sonnenuntergang |
| `uv_index` | UV-Index max |
| `sunshine_hours` | Sonnenscheindauer | h |
| `daylight_hours` | Tageslichtdauer | h |
| `solar_radiation_sum` | Solarstrahlung gesamt | MJ/m² |
| `evapotranspiration` | Referenz-Evapotranspiration | mm |
| `pollen.alder` … `pollen.ragweed` | Tagesmax. Pollen Tag 1–4 (wenn aktiviert) | Körner/m³ |

#### Stundenwerte (`day1.hourly.h00` … `h23`)

Temperatur, gefühlte Temperatur, Niederschlag, Regen, Schneefall, Schneehöhe, Regenwahrscheinlichkeit, Bewölkung, Luftfeuchtigkeit, Taupunkt, Luftdruck, Sichtweite, Tag/Nacht, Solarstrahlung, CAPE, Windgeschwindigkeit, Windrichtung (inkl. Text/Emoji/Icon), Beaufort, Wettercode, Icon.

Für Tage mit aktivierten Stundenwerten: `pollen.alder` … `pollen.ragweed` pro Stunde (wenn Pollen aktiviert).

#### Zusammenfassung

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `weather_short` | Kurzübersicht aller Vorhersagetage als Text |

### Icon-Lizenzen

- **Meteocons** von [Bas Milius](https://github.com/basmilius/weather-icons) – MIT-Lizenz
- **WMO meteorologische Symbole** von [OGC MetOcean DWG](https://github.com/OGCMetOceanDWG/WorldWeatherSymbols) – CC BY 4.0
- **Beaufort-Icons** von [Bas Milius](https://github.com/basmilius/weather-icons) – MIT-Lizenz

### Haftungsausschluss

Dieser Adapter verwendet die Open-Meteo API. Der Name und das Logo von Open-Meteo sind Eigentum der jeweiligen Inhaber. Dieser Adapter ist ein unabhängiges Community-Projekt und steht in keiner Verbindung zu Open-Meteo.

---

## Changelog

### 0.0.23
* Add current pollen values under `current.pollen`

### 0.0.22
* Add hourly pollen values under `dayX.hourly.hXX.pollen`

### 0.0.21
* Fix: pollen stored under `dayX.pollen` (daily max) instead of top-level channel

### 0.0.20
* Add extended weather data: humidity, dew point, pressure, visibility, is_day, rain, snowfall, snow depth, solar radiation, CAPE (current + hourly)
* Add daily data: rain sum, snowfall sum, daylight hours, solar radiation sum, evapotranspiration
* Add optional pollen support (Europe only) via settings toggle

### 0.0.19
* Bilingual README (EN/DE)

### 0.0.18
* Replace placeholder icon with official Open-Meteo logo

### 0.0.17
* Fix: windspeedUnit not available in processData

### 0.0.16
* Add wind direction emoji (⬆️↗️➡️↘️⬇️↙️⬅️↖️)
* Add Beaufort scale datapoints and Meteocons Beaufort icons

### 0.0.15
* Add wind direction datapoints (degrees, text, icon, icon_url) for current/daily/hourly
* Add 8 SVG wind direction arrow icons

### 0.0.14
* Remove unused Sentry plugin config

### 0.0.13
* Fix: icon preview hidden behind save/close toolbar
* Auto-fill locations from ioBroker system.config on first open

### 0.0.12
* Fix: settings page scrolling
* Default icon set changed to Meteocons

### 0.0.11
* Add React admin UI with icon set picker and live preview
* Add Meteocons (static PNG + animated SVG) icon sets

### 0.0.4
* Read ioBroker system.config coordinates as fallback location

### 0.0.2
* Switch to daemon mode for immediate fetch on start

### 0.0.1
* Initial release

---

## License

MIT License

Copyright (c) 2026 David G. <david@graef.email>

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
