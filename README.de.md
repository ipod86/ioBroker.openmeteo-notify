![Logo](admin/openmeteo.png)

# ioBroker.openmeteo

## ioBroker-Adapter für Open-Meteo Wettervorhersagen

Dieser Adapter ruft Wetterdaten von der kostenlosen [Open-Meteo API](https://open-meteo.com) ab und stellt sie als ioBroker-Datenpunkte bereit. Es wird kein API-Schlüssel benötigt.

## Funktionen

- **Kostenlos & kein API-Schlüssel** – Open-Meteo ist eine freie, quelloffene Wetter-API
- **Mehrere Standorte** – beliebig viele Standorte konfigurierbar
- **Systemstandort als Fallback** – verwendet ioBroker-Systemkoordinaten, wenn kein Standort konfiguriert ist
- **Konfigurierbarer Vorhersagezeitraum** – bis zu 16 Tage täglich, bis zu 16 Tage stündlich
- **Konfigurierbares Aktualisierungsintervall** – 60 Min, 120 Min oder täglich um 01:00 Uhr
- **Einheiten** – Temperatur (°C / °F), Wind (km/h, m/s, mph, kn), Niederschlag (mm / inch)
- **3 Wetter-Icon-Sets** mit Live-Vorschau in den Einstellungen:
  - Meteocons von Bas Milius – statische PNG (Standard)
  - Meteocons von Bas Milius – animierte SVG
  - WMO OGC meteorologische Symbole – PNG
- **Tag/Nacht-Icons** – Meteocons wechseln automatisch zur Nacht-Variante basierend auf `is_day`
- **Windrichtung** – Grad, Himmelsrichtungstext (N/NE/E/…), Pfeil-Emoji (⬆️↗️…), SVG-Pfeilicon
- **Windstärke** – Beaufort-Skala (0–12) mit Meteocons Beaufort-Icons
- **`info.lastUpdate`** – Zeitstempel der letzten erfolgreichen Aktualisierung

### Optionale Datengruppen (einzeln schaltbar, je mit „auch stündlich"-Option)

| Gruppe | Standard | Datenpunkte |
|--------|----------|-------------|
| **Luftqualität** | an | european_aqi, PM10, PM2.5, NO₂, CO, Staub, Ozon → `current.air_quality` / `hXX.air_quality` |
| **Astronomie** | an | Sonnenauf/-untergang, Mondphase, Mondauf/-untergang → `dayX.astronomy` / `hXX.astronomy` |
| **Agrar / Solar** | aus | Solarstrahlung, CAPE, Bodentemperatur, Globalstrahlung → `*.agriculture` |
| **Pollen** | aus | Erle, Birke, Gräser, Beifuß, Olive, Ambrosia mit Textstufe → `dayX.pollen` / `hXX.pollen` |

Wird eine Gruppe deaktiviert, werden die zugehörigen Kanäle beim nächsten Update automatisch gelöscht.

## Installation

Adapter über die ioBroker-Admin-Oberfläche installieren (nach „openmeteo" suchen).

## Konfiguration

| Einstellung | Beschreibung | Standard |
|-------------|--------------|----------|
| Standorte | Name, Breitengrad, Längengrad | ioBroker-Systemstandort |
| Vorhersagetage | Täglicher Vorhersagezeitraum (1–16) | 7 |
| Stundentage | Tage mit Stundenwerten (0–16) | 3 |
| Temperatureinheit | °C oder °F | °C |
| Windeinheit | km/h, m/s, mph, kn | km/h |
| Niederschlagseinheit | mm oder inch | mm |
| Icon-Set | Wetter-Icon-Set | Meteocons statisch |
| Aktualisierungsintervall | 60 Min / 120 Min / täglich um 01:00 | 60 Min |
| Luftqualität | AQI + Feinstaub aktivieren | an |
| Luftqualität – auch stündlich | Stündliche AQI/PM unter `hXX.air_quality` | aus |
| Astronomie | Sonne & Mond aktivieren | an |
| Astronomie – auch stündlich | Astronomiedaten pro Stundenslot | aus |
| Agrar / Solar | Strahlung, CAPE, Bodentemperatur aktivieren | aus |
| Agrar – auch stündlich | Stündliche Agrardaten | aus |
| Pollen | Pollendaten aktivieren (nur Europa) | aus |
| Pollen – auch stündlich | Stündliche Pollen pro Typ | aus |

## Datenpunkte

Der Adapter legt Datenpunkte unter `openmeteo.<instanz>.<standort>` an.

### Aktuelles Wetter (`current`)

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
| `windspeed` | Windgeschwindigkeit | km/h … |
| `windgusts` | Windböen | km/h … |
| `winddirection` | Windrichtung | ° |
| `winddirection_text` | Windrichtungstext | N/NE/… |
| `winddirection_icon` | Windrichtungs-Emoji | ⬆️↗️… |
| `winddirection_icon_url` | Windrichtungs-Pfeilicon-URL | |
| `windbeaufort` | Windstärke Beaufort | 0–12 |
| `windbeaufort_icon_url` | Beaufort-Icon-URL | |
| `air_quality.*` | AQI, PM10, PM2.5, NO₂, CO, Staub, Ozon *(wenn aktiviert)* | |
| `pollen.*` | Aktuelle Pollen pro Typ *(wenn aktiviert)* | Körner/m³ |
| `agriculture.*` | Solarstrahlung, CAPE, Bodentemperatur *(wenn aktiviert)* | |

### Tagesvorhersage (`day1` … `day16`)

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `date` / `weekday` | Datum / Wochentag |
| `icon` / `icon_url` | Wetter-Icon (Tag/Nacht-Variante) |
| `description` | Wetterbeschreibung |
| `temp_max` / `temp_min` | Temperatur max/min |
| `feels_like_max` / `feels_like_min` | Gefühlte Temperatur max/min |
| `weathercode` | WMO-Wettercode |
| `precipitation` | Niederschlagssumme |
| `rain` / `snowfall` | Regen- / Schneefallsumme |
| `rain_probability` | Niederschlagswahrscheinlichkeit |
| `windspeed` / `windgusts` | Windgeschwindigkeit / Böen max |
| `winddirection` / `_text` / `_icon` / `_icon_url` | Windrichtung |
| `windbeaufort` / `windbeaufort_icon_url` | Beaufort-Skala |
| `uv_index` | UV-Index max |
| `sunshine_hours` / `daylight_hours` | Sonnenschein- / Tageslichtdauer | h |
| `cloud_cover_max` | Bewölkung max | % |
| `dew_point_mean` / `humidity_mean` / `pressure_mean` | Tages-Mittelwerte | |
| `astronomy.sunrise` / `astronomy.sunset` | Sonnenauf/-untergang *(wenn aktiviert)* | |
| `astronomy.moon_phase_val` / `_text` / `_icon_url` | Mondphase *(wenn aktiviert)* | |
| `astronomy.moonrise` / `astronomy.moonset` | Mondauf/-untergang *(wenn aktiviert)* | |
| `agriculture.solar_radiation_sum` / `.evapotranspiration` | Solar / Evapotranspiration *(wenn aktiviert)* | |
| `pollen.alder` … `pollen.ragweed` | Tagesmax. Pollen + Textstufe *(wenn aktiviert, Tag 1–4)* | |

### Stundenwerte (`day1.hourly.h00` … `h23`)

Temperatur, gefühlte Temperatur, Niederschlag, Regen, Schneefall, Schneehöhe, Regenwahrscheinlichkeit, Bewölkung, Luftfeuchtigkeit, Taupunkt, Luftdruck, Sichtweite, Tag/Nacht, Windgeschwindigkeit, Windrichtung (Text/Emoji/Icon), Beaufort, Wettercode, Icon/Icon-URL, Beschreibung.

Optional pro Stunde (wenn Gruppe aktiviert + „auch stündlich"):

| Kanal | Datenpunkte |
|-------|-------------|
| `hXX.air_quality` | european_aqi, PM10, PM2.5, NO₂, CO, Staub, Ozon |
| `hXX.astronomy` | Sonnenauf/-untergang, Mondphase (val/text/icon), Mondauf/-untergang |
| `hXX.agriculture` | Solarstrahlung, CAPE, Bodentemperatur, Globalstrahlung |
| `hXX.pollen` | Erle … Ambrosia + Textstufe (Keine/Niedrig/Mittel/Hoch) |

### Zusammenfassung

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `weather_short` | Kurzübersicht aller Vorhersagetage als Text |
| `info.lastUpdate` | Zeitstempel der letzten erfolgreichen Aktualisierung |

## Icon-Lizenzen

- **Meteocons** von [Bas Milius](https://github.com/basmilius/weather-icons) – MIT-Lizenz
- **WMO meteorologische Symbole** von [OGC MetOcean DWG](https://github.com/OGCMetOceanDWG/WorldWeatherSymbols) – CC BY 4.0

## Haftungsausschluss

Dieser Adapter verwendet die Open-Meteo API. Der Name und das Logo von Open-Meteo sind Eigentum der jeweiligen Inhaber. Dieser Adapter ist ein unabhängiges Community-Projekt und steht in keiner Verbindung zu Open-Meteo.

## Changelog

### 0.0.36
* Mehrsprachige Wetterbeschreibungen, Mondphasen und Pollenstufen (11 Sprachen: de, en, fr, it, es, pt, nl, pl, ru, uk, zh-cn)
* Wochentagsabkürzungen pro Sprache lokalisiert
* Zeitzone wird aus der ioBroker-Systemkonfiguration gelesen (`system.config.common.timezone`); Fallback: `auto`

## Lizenz

MIT License

Copyright (c) 2026 ipod86
