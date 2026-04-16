![Logo](admin/openmeteo.png)

# ioBroker.openmeteo

[![NPM version](https://img.shields.io/npm/v/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
[![Downloads](https://img.shields.io/npm/dm/iobroker.openmeteo.svg)](https://www.npmjs.com/package/iobroker.openmeteo)
![Number of Installations](https://iobroker.live/badges/openmeteo-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/openmeteo-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.openmeteo.png?downloads=true)](https://nodei.co/npm/iobroker.openmeteo/)

**Tests:** ![Test and Release](https://github.com/ipod86/ioBroker.openmeteo/workflows/Test%20and%20Release/badge.svg)

## ioBroker-Adapter für Open-Meteo Wettervorhersagen

Dieser Adapter ruft Wetterdaten von der kostenlosen [Open-Meteo API](https://open-meteo.com) ab und stellt sie als ioBroker-Datenpunkte bereit. Es wird kein API-Schlüssel benötigt.

## Highlights

### Konfigurierbares HTML-Widget
Der Adapter erzeugt einen fertigen HTML-Datenpunkt (`widget`), der direkt in VIS, vis-2 oder jedem ioBroker-Dashboard eingebettet werden kann — ohne externe Tools oder manuelles CSS. Theme (hell/dunkel), Hintergrundtransparenz, Kartentransparenz, Schriftgröße und Kartenfarbe sind direkt in den Adaptereinstellungen konfigurierbar.

### Volltextsuche für Adressen
Standorte müssen nicht als reine Koordinaten eingegeben werden. Die Einstellungs-UI bietet eine **freie Adresssuche** — einfach Stadt, Adresse oder Region eingeben, die Koordinaten werden automatisch aufgelöst. Für jeden Standort wird eine OpenStreetMap-Vorschau angezeigt. Mehrere Standorte können parallel konfiguriert werden.

### Bis zu 16 Tage Vorhersage
Je nach gewähltem Wettermodell sind tägliche Vorhersagen für bis zu **16 Tage** verfügbar — deutlich mehr als die typischen 5–7 Tage der meisten Adapter.

### Wetter-Zusammenfassungstexte
Der Adapter erzeugt natürlichsprachige Wetterzusammenfassungen (`current.summary`, `dayX.summary_day`, `dayX.summary_night`) in **11 Sprachen**, unter Verwendung von DWD-Standardschwellenwerten für Temperatur, Wind und Niederschlag, einschließlich CAPE-basiertem Gewitterrisiko.

## Funktionen

- **Kostenlos & kein API-Schlüssel** – Open-Meteo ist eine freie, quelloffene Wetter-API
- **Mehrere Standorte** – beliebig viele Standorte konfigurierbar, jeweils mit Adresssuche und Kartenvorschau
- **Systemstandort als Fallback** – verwendet ioBroker-Systemkoordinaten, wenn kein Standort konfiguriert ist
- **Konfigurierbarer Vorhersagezeitraum** – bis zu 16 Tage täglich, bis zu 16 Tage stündlich
- **Konfigurierbares Aktualisierungsintervall** – 60 Min, 120 Min oder täglich um 01:00 Uhr
- **Einheiten** – Temperatur (°C / °F), Wind (km/h, m/s, mph, kn), Niederschlag (mm / inch)
- **5 Wetter-Icon-Sets** mit Live-Vorschau in den Einstellungen:
  - Meteocons von Bas Milius – statische PNG (Standard)
  - Meteocons von Bas Milius – animierte SVG
  - amCharts Weather Icons – animierte SVG *(Regen/Schnee/Gewitter: keine Tag/Nacht-Variante)*
  - amCharts Weather Icons – statische SVG *(Regen/Schnee/Gewitter: keine Tag/Nacht-Variante)*
  - WMO OGC meteorologische Symbole – PNG
- **Tag/Nacht-Icons** – Meteocons und amCharts wechseln automatisch zur Nacht-Variante basierend auf `is_day`
- **Windrichtung** – Grad, Himmelsrichtungstext (N/NE/E/…), Pfeil-Emoji (⬆️↗️…), SVG-Pfeilicon
- **Windstärke** – Beaufort-Skala (0–12) mit Meteocons Beaufort-Icons
- **`info.lastUpdate`** – Zeitstempel der letzten erfolgreichen Aktualisierung

### Optionale Datengruppen (einzeln schaltbar, je mit „auch stündlich"-Option)

| Gruppe | Standard | Datenpunkte |
|--------|----------|-------------|
| **Luftqualität** | an | european_aqi, PM10, PM2.5, NO₂, CO, Staub, Ozon → `current.air_quality` / `hXX.air_quality` |
| **Astronomie** | an | Sonnenauf/-untergang, Sonnenhöchststand, Mittagszeit, Mondphase, Mondauf/-untergang → `dayX.astronomy` / `hXX.astronomy` |
| **Agrar / Solar** | aus | Solarstrahlung, CAPE, Bodentemperatur, Globalstrahlung → `*.agriculture` |
| **Pollen** | aus | Erle, Birke, Gräser, Beifuß, Olive, Ambrosia mit Textstufe → `dayX.pollen` / `hXX.pollen` |
| **DWD-Warnungen** | aus | Offizielle Warnungen des Deutschen Wetterdienstes (nur Deutschland) → `standort.warnings.*` |

Wird eine Gruppe deaktiviert, werden die zugehörigen Kanäle beim nächsten Update automatisch gelöscht.

### Amtliche Unwetterwarnungen

Der Adapter integriert amtliche Warnungen nationaler Wetterdienste. Aktivierung über den Schalter **„Amtliche Unwetterwarnungen als Notification senden"**. Der Dienst wird automatisch anhand der Standortkoordinaten ermittelt:

| Land | Dienst | Abdeckung |
|------|--------|-----------|
| Deutschland (DE) | [DWD](https://www.dwd.de) – Deutscher Wetterdienst | Alle Warntypen, 4 Warnstufen |
| EU-Länder | [MeteoAlarm](https://www.meteoalarm.org) | Alle Warntypen, Polygon-basiertes Matching |
| Andere | — | Nicht verfügbar (berechnete Open-Meteo-Warnungen nutzen) |

Warnungen werden unabhängig vom Dienst unter `standort.warnings.*` gespeichert. Ein Datenpunkt `warnings.source` zeigt `"DWD"` oder `"MeteoAlarm"`.

## Installation

Adapter über die ioBroker-Admin-Oberfläche installieren (nach „openmeteo" suchen).

## Konfiguration

| Einstellung | Beschreibung | Standard |
|-------------|--------------|----------|
| Standorte | Name + freie Adresssuche oder Koordinaten; OSM-Kartenvorschau | ioBroker-Systemstandort |
| Vorhersagetage | Täglicher Vorhersagezeitraum (1–16) | 7 |
| Stundentage | Tage mit Stundenwerten (0–16) | 3 |
| Temperatureinheit | °C oder °F | °C |
| Windeinheit | km/h, m/s, mph, kn | km/h |
| Niederschlagseinheit | mm oder inch | mm |
| Icon-Set | Wetter-Icon-Set mit Live-Vorschau | Meteocons statisch |
| Aktualisierungsintervall | 60 Min / 120 Min / täglich um 01:00 | 60 Min |
| Widget-Theme | Helles oder dunkles Theme für das HTML-Widget | hell |
| Widget Hintergrund-Transparenz | Hintergrundtransparenz des HTML-Widgets | 100% |
| Widget Karten-Transparenz | Kartentransparenz des HTML-Widgets | 100% |
| Widget Schriftgröße | Schriftgröße im HTML-Widget | 14px |
| Widget Kartenfarbe | Hintergrundfarbe der Karten | #ffffff |
| Kompaktansicht | Kompaktes Layout im HTML-Widget | aus |
| Luftqualität | AQI + Feinstaub aktivieren | an |
| Luftqualität – auch stündlich | Stündliche AQI/PM unter `hXX.air_quality` | aus |
| Astronomie | Sonne & Mond aktivieren | an |
| Astronomie – auch stündlich | Astronomiedaten pro Stundenslot | aus |
| Agrar / Solar | Strahlung, CAPE, Bodentemperatur aktivieren | aus |
| Agrar – auch stündlich | Stündliche Agrardaten | aus |
| Pollen | Pollendaten aktivieren (nur Europa) | aus |
| Pollen – auch stündlich | Stündliche Pollen pro Typ | aus |
| DWD-Warnungen | DWD-Daten aktivieren (nur Deutschland) | aus |
| Amtliche Warnungen als Notification | Amtliche Warnungen senden (DE: DWD, EU: MeteoAlarm) | aus |
| Sturmwarnung | Aus Open-Meteo-Vorhersage berechnet, weltweit | aus |
| Gewitterwarnung | Aus Open-Meteo-Vorhersage berechnet, weltweit | aus |
| Vorlaufzeit (Stunden) | Wie viele Stunden im Voraus warnen (Sturm/Gewitter) | 2 |

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
| `summary` | Natürlichsprachige Wetterzusammenfassung (11 Sprachen) | |
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
| `uv_index` / `uv_index_clear_sky` | UV-Index max / UV-Index bei wolkenlosem Himmel | |
| `sunshine_hours` / `daylight_hours` | Sonnenschein- / Tageslichtdauer | h |
| `cloud_cover_max` | Bewölkung max | % |
| `temp_mean` / `feels_like_mean` | Tagesmitteltemperatur / gefühlte Temperatur | °C/°F |
| `precipitation_hours` | Stunden mit Niederschlag | h |
| `showers` | Konvektiver Niederschlag | mm/inch |
| `snowfall_height_min` | Niedrigste Schneefallgrenze bei Niederschlag | m |
| `dew_point_mean` / `humidity_mean` / `pressure_mean` | Tages-Mittelwerte | |
| `summary_day` / `summary_night` | Tages- / Nacht-Wetterzusammenfassung (11 Sprachen) | |
| `has_storm` / `has_thunderstorm` | Sturm- / Gewitterwarnung für den Tag | boolean |
| `air_quality.european_aqi_max` … `ozone_max` | Tagesmax. AQI, PM10, PM2.5, NO₂, CO, Staub, Ozon *(wenn aktiviert)* | |
| `astronomy.sunrise` / `astronomy.sunset` | Sonnenauf/-untergang *(wenn aktiviert)* | |
| `astronomy.solar_noon` / `astronomy.solar_elevation_max` | Sonnenmittag / max. Sonnenhöhenwinkel *(wenn aktiviert)* | / ° |
| `astronomy.moon_phase_val` / `_text` / `_icon_url` | Mondphase *(wenn aktiviert)* | |
| `astronomy.moonrise` / `astronomy.moonset` | Mondauf/-untergang *(wenn aktiviert)* | |
| `agriculture.solar_radiation_sum` / `.evapotranspiration` | Solar / Evapotranspiration *(wenn aktiviert)* | |
| `pollen.alder` … `pollen.ragweed` | Tagesmax. Pollen + Textstufe *(wenn aktiviert, Tag 1–4)* | |

### Stundenwerte (`day1.hourly.h00` … `h23`)

Temperatur, gefühlte Temperatur, Niederschlag, Regen, Schneefall, Schneehöhe, Schneefallgrenze, Regenwahrscheinlichkeit, Bewölkung, Luftfeuchtigkeit, Taupunkt, Luftdruck, Sichtweite, Tag/Nacht, Windgeschwindigkeit, Windrichtung (Text/Emoji/Icon), Beaufort, UV-Index, Gefriergrenze, Wettercode, Icon/Icon-URL, Beschreibung, `is_storm`/`is_thunderstorm`.

Optional pro Stunde (wenn Gruppe aktiviert + „auch stündlich"):

| Kanal | Datenpunkte |
|-------|-------------|
| `hXX.air_quality` | european_aqi, PM10, PM2.5, NO₂, CO, Staub, Ozon |
| `hXX.astronomy` | Sonnenauf/-untergang, Mondphase (val/text/icon), Mondauf/-untergang |
| `hXX.agriculture` | Solarstrahlung, CAPE, Bodentemperatur, Globalstrahlung |
| `hXX.pollen` | Erle … Ambrosia + Textstufe (Keine/Niedrig/Mittel/Hoch) |

### Amtliche Warnungen (`warnings`)

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `warnings.source` | Warnquelle: `"DWD"` oder `"MeteoAlarm"` |
| `warnings.active` | Mindestens eine aktive Warnung |
| `warnings.count` | Anzahl aktiver Warnungen |
| `warnings.max_level` | Höchste Warnstufe (1–4) |
| `warnings.max_level_text` | Warnstufe als Text |
| `warnings.warning_N.active` | Warnslot N aktiv |
| `warnings.warning_N.event` | Ereignistyp |
| `warnings.warning_N.level` / `.level_text` | Warnstufe |
| `warnings.warning_N.headline` | Warnüberschrift |
| `warnings.warning_N.description` | Warntextbeschreibung |
| `warnings.warning_N.start` / `.end` | Gültigkeitszeitraum |

*(Nur wenn „Amtliche Warnungen" aktiviert und ein unterstütztes Land erkannt wird.)*

### Zusammenfassung & Widget

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `current.summary` | Natürlichsprachige Zusammenfassung der aktuellen Bedingungen (11 Sprachen) |
| `dayX.summary_day` | Tages-Wetterzusammenfassung für den Vorhersagetag (11 Sprachen) |
| `dayX.summary_night` | Nacht-Wetterzusammenfassung für den Vorhersagetag (11 Sprachen) |
| `weather_short` | Kurzübersicht aller Vorhersagetage als Text |
| `widget` | Fertiger HTML-Datenpunkt für VIS / vis-2 / Dashboards (konfigurierbares Erscheinungsbild) |
| `info.lastUpdate` | Zeitstempel der letzten erfolgreichen Aktualisierung |

## Icon-Lizenzen

- **Meteocons** von [Bas Milius](https://github.com/basmilius/weather-icons) – MIT-Lizenz
- **amCharts Weather Icons** von [amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/) – [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **WMO meteorologische Symbole** von [OGC MetOcean DWG](https://github.com/OGCMetOceanDWG/WorldWeatherSymbols) – CC BY 4.0

## Haftungsausschluss

Dieser Adapter verwendet die Open-Meteo API. Der Name und das Logo von Open-Meteo sind Eigentum der jeweiligen Inhaber. Dieser Adapter ist ein unabhängiges Community-Projekt und steht in keiner Verbindung zu Open-Meteo.

## Changelog

### 0.0.46 (2026-04-08)
* (ipod86) CHANGELOG_OLD.md hinzugefügt; release-script eingerichtet

### 0.0.45
* Wetterwarnungen (Sturm/Gewitter) über das ioBroker-Benachrichtigungssystem
* Konfigurierbarer Beaufort-Schwellenwert für Sturmwarnungen (Bft 1–12, Standard Bft 8)
* Tägliche Datenpunkte `has_storm` / `has_thunderstorm` pro Standort
* Stündliche Datenpunkte `is_storm` / `is_thunderstorm` (wenn Stundendaten aktiviert)
* Sturmerkennung basiert auf Windböen (`windgusts_10m`)
* Warnmeldung enthält Von/Bis-Uhrzeit; Tagesversatz bei Ereignissen über Mitternacht
* Warnungen nutzen rohe API-Daten — kein Mindest-`hourlyDays`-Wert erforderlich
* i18n-Übersetzungen für alle neuen Einstellungen in 11 Sprachen

### 0.0.44
* (ipod86) Dunkles Theme: Theme-abhängige Hintergrundfarbe am Root-Wrapper gesetzt

### 0.0.43
* Fix: automatisch angelegter Standorteintrag in `system.config` beim ersten Start entfernt

### 0.0.42
* Automatische Rückwärts-Geocodierung aus der Standorttabelle entfernt

For older changelog entries see [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

## Lizenz

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
