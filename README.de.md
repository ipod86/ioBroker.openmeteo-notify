![Logo](admin/openmeteo-notify.png)

# ioBroker.openmeteo-notify

[![NPM version](https://img.shields.io/npm/v/iobroker.openmeteo-notify.svg)](https://www.npmjs.com/package/iobroker.openmeteo-notify)
[![Downloads](https://img.shields.io/npm/dm/iobroker.openmeteo-notify.svg)](https://www.npmjs.com/package/iobroker.openmeteo-notify)
![Number of Installations](https://iobroker.live/badges/openmeteo-notify-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/openmeteo-notify-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.openmeteo-notify.png?downloads=true)](https://nodei.co/npm/iobroker.openmeteo-notify/)

**Tests:** ![Test and Release](https://github.com/ipod86/ioBroker.openmeteo-notify/workflows/Test%20and%20Release/badge.svg)

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
| **Solar & Klima** | aus | Solarstrahlung, CAPE, Bodentemperatur, Globalstrahlung → `*.agriculture` |
| **Komfortindizes** | aus | Hitzeindex, Windchill, Humidex, UV-Index → `*.comfort` |
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

Adapter über die ioBroker-Admin-Oberfläche installieren (nach „openmeteo-notify" suchen).

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
| Solar & Klima | Strahlung, CAPE, Bodentemperatur aktivieren | aus |
| Solar & Klima – auch stündlich | Stündliche Agrardaten | aus |
| Komfortindizes | Hitzeindex, Windchill, Humidex, UV-Index aktivieren | aus |
| Komfortindizes – auch stündlich | Stündliche Komfortdaten | aus |
| Pollen | Pollendaten aktivieren (nur Europa) | aus |
| Pollen – auch stündlich | Stündliche Pollen pro Typ | aus |
| DWD-Warnungen | DWD-Daten aktivieren (nur Deutschland) | aus |
| Amtliche Warnungen als Notification | Amtliche Warnungen senden (DE: DWD, EU: MeteoAlarm) | aus |
| Sturmwarnung | Aus Open-Meteo-Vorhersage berechnet, weltweit | aus |
| Gewitterwarnung | Aus Open-Meteo-Vorhersage berechnet, weltweit | aus |
| Vorlaufzeit (Stunden) | Wie viele Stunden im Voraus warnen (Sturm/Gewitter) | 2 |

## Datenpunkte

Der Adapter legt Datenpunkte unter `openmeteo-notify.<instanz>.<standort>` an.

### Aktuelles Wetter (`current`)

| Datenpunkt | Beschreibung | Einheit |
|-----------|--------------|---------|
| `temperature` | Aktuelle Temperatur | °C/°F |
| `feels_like` | Gefühlte Temperatur – kombiniert Hitze, Luftfeuchte und Wind | °C/°F |
| `weathercode` | WMO-Wettercode (0 = klar, 95/99 = Gewitter) – vollständige Tabelle: [WMO 4677](https://open-meteo.com/en/docs#weathercode) | |
| `description` | Lesbare Wetterbeschreibung (11 Sprachen) | |
| `icon` | Wetter-Emoji | |
| `icon_url` | Wetter-Icon-URL (Icon-Set in den Einstellungen wählbar) | |
| `precipitation` | Gesamtniederschlag letzte Stunde | mm/inch |
| `rain` | Regen letzte Stunde | mm/inch |
| `snowfall` | Schneefall letzte Stunde | cm |
| `snow_depth` | Aktuelle Schneehöhe am Boden | cm |
| `cloudcover` | Bewölkung | % |
| `humidity` | Relative Luftfeuchtigkeit | % |
| `dew_point` | Taupunkt – Temperatur, bei der die Luft gesättigt ist; nahe an der Lufttemperatur = hohe Luftfeuchte | °C/°F |
| `pressure` | Luftdruck auf Meereshöhe reduziert (MSL) | hPa |
| `visibility` | Horizontale Sichtweite | m |
| `is_day` | `true` zwischen Sonnenauf- und -untergang | boolean |
| `windspeed` | Windgeschwindigkeit (Einheit wählbar: km/h, m/s, mph, kn) | km/h … |
| `windgusts` | Maximale Windböengeschwindigkeit | km/h … |
| `winddirection` | Windrichtung (meteorologisch: Richtung, aus der der Wind kommt) | ° |
| `winddirection_text` | Himmelsrichtungstext | N/NE/… |
| `winddirection_icon` | Himmelsrichtungs-Emoji | ⬆️↗️… |
| `winddirection_icon_url` | Windrichtungs-Pfeilicon-URL | |
| `windbeaufort` | Windstärke nach Beaufort-Skala (0 = Stille, 8 = Sturm, 12 = Orkan) | 0–12 |
| `windbeaufort_icon_url` | Beaufort-Icon-URL | |
| `summary` | Natürlichsprachige Wetterzusammenfassung (11 Sprachen) | |
| `air_quality.*` | AQI, PM10, PM2.5, NO₂, CO, Staub, Ozon *(wenn aktiviert)* | |
| `pollen.*` | Aktuelle Pollen pro Typ *(wenn aktiviert)* | Körner/m³ |
| `agriculture.solar_radiation` | Kurzwellige Solarstrahlung am Boden *(wenn aktiviert)* | W/m² |
| `agriculture.cape` | CAPE – konvektive verfügbare potenzielle Energie: Energie für Gewitterentwicklung; > 500 J/kg = nennenswert, > 2000 J/kg = heftig *(wenn aktiviert)* | J/kg |
| `agriculture.soil_temp` | Bodentemperatur in 0 cm Tiefe *(wenn aktiviert)* | °C/°F |
| `comfort.heat_index` | Hitzeindex (Rothfusz) – wie heiß es sich durch Temperatur und Luftfeuchte anfühlt; nur sinnvoll ≥ 27 °C und ≥ 40 % rF, sonst `null` *(wenn aktiviert)* | °C/°F |
| `comfort.windchill` | Windchill (NWS) – wie kalt es sich durch Wind anfühlt; nur sinnvoll ≤ 10 °C und Wind > 4,8 km/h, sonst `null` *(wenn aktiviert)* | °C/°F |
| `comfort.humidex` | Humidex (kanadische Formel) – kombinierter Hitze-Feuchte-Index; ab 40 unangenehm, ab 46 gefährlich *(wenn aktiviert)* | °C/°F |
| `comfort.humidex_level` | Humidex-Unbehagen-Stufe: 1 = kein Unbehagen (<29) · 2 = leicht (29–34) · 3 = deutlich (35–39) · 4 = stark (40–45) · 5 = gefährlich (≥46) *(wenn aktiviert)* | 1–5 |
| `comfort.uv_index` | UV-Index (0–11+) – Intensität der UV-Strahlung am Boden *(wenn aktiviert)* | |
| `comfort.uv_level` | UV-Schutzstufe (WHO-Skala): `low` (0–2, kein Schutz nötig) · `moderate` (3–5, Sonnenschutz) · `high` (6–7) · `very_high` (8–10) · `extreme` (≥11) *(wenn aktiviert)* | |

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
| `uv_index` | Tagesmaximum UV-Index *(mit Wolkeneinfluss)* | |
| `uv_index_clear_sky` | Tagesmaximum UV-Index bei vollständig wolkenlosem Himmel – zeigt das UV-Potenzial unabhängig von Wolken | |
| `sunshine_hours` | Stunden mit direkter Sonneneinstrahlung | h |
| `daylight_hours` | Gesamtstunden zwischen Sonnenauf- und -untergang | h |
| `cloud_cover_max` | Maximale Bewölkung des Tages | % |
| `temp_mean` / `feels_like_mean` | Tagesmitteltemperatur / gefühlte Temperatur | °C/°F |
| `precipitation_hours` | Anzahl der Stunden mit messbarem Niederschlag | h |
| `showers` | Konvektiver (schauertypischer) Niederschlag – kurz und intensiv; getrennt von kontinuierlichem `rain` | mm/inch |
| `snowfall_height_min` | Niedrigste Schneefallgrenze am Tag (0 m = Schnee bis ins Tal) | m ü. M. |
| `freezing_level_height_min` | Niedrigste Höhe der 0-°C-Isothermen am Tag | m ü. M. |
| `dew_point_mean` / `humidity_mean` / `pressure_mean` | Tages-Mittelwerte | |
| `summary_day` / `summary_night` | Tages- / Nacht-Wetterzusammenfassung (11 Sprachen) | |
| `has_storm` / `has_thunderstorm` | Sturm- / Gewitterwarnung für den Tag | boolean |
| `air_quality.european_aqi_max` … `ozone_max` | Tagesmax. AQI, PM10, PM2.5, NO₂, CO, Staub, Ozon *(wenn aktiviert)* | |
| `astronomy.sunrise` / `astronomy.sunset` | Sonnenauf/-untergang *(wenn aktiviert)* | |
| `astronomy.solar_noon` | Zeitpunkt der höchsten Sonnenposition *(wenn aktiviert)* | |
| `astronomy.solar_elevation_max` | Sonnenwinkel über dem Horizont zum Sonnenmittag – 90° = senkrecht, 0° = Horizont *(wenn aktiviert)* | ° |
| `astronomy.moon_phase_val` | Mondphase als Zahl: 0 = Neumond · 0,25 = erstes Viertel · 0,5 = Vollmond · 0,75 = letztes Viertel *(wenn aktiviert)* | 0–1 |
| `astronomy.moon_phase_text` / `_icon_url` | Mondphase als Text / Icon *(wenn aktiviert)* | |
| `astronomy.moonrise` / `astronomy.moonset` | Mondauf/-untergang *(wenn aktiviert)* | |
| `agriculture.solar_radiation_sum` | Gesamte Solarstrahlung des Tages *(wenn aktiviert)* | MJ/m² |
| `agriculture.evapotranspiration` | FAO-56-Referenz-Evapotranspiration (ET₀) – wie viel Wasser Pflanzen und Boden abgeben; für Bewässerungsplanung *(wenn aktiviert)* | mm |
| `agriculture.lifted_index_min` | Tagesminimum Lifted Index – atmosphärische Stabilität: negativ = instabil/Gewitterrisiko, stark negativ (< −6) = heftiges Gewitterrisiko *(wenn aktiviert)* | K |
| `comfort.heat_index_max` | Tagesmaximum Hitzeindex *(wenn aktiviert)* | °C/°F |
| `comfort.windchill_min` | Tagesminimum Windchill *(wenn aktiviert)* | °C/°F |
| `comfort.humidex_max` / `.humidex_level` | Maximum Humidex / Unbehagen-Stufe (1–5, siehe Abschnitt Aktuell) *(wenn aktiviert)* | |
| `comfort.uv_index_max` / `.uv_level` | Maximum UV-Index / Stufe (siehe Abschnitt Aktuell) *(wenn aktiviert)* | |
| `pollen.alder` … `pollen.ragweed` | Tagesmax. Pollen + Textstufe (Keine/Niedrig/Mittel/Hoch) *(wenn aktiviert, Tag 1–4)* | Körner/m³ |

### Stundenwerte (`day1.hourly.h00` … `h23`)

Temperatur, gefühlte Temperatur, Niederschlag, Regen, Schneefall, Schneehöhe, Schneefallgrenze, Regenwahrscheinlichkeit, Bewölkung, Luftfeuchtigkeit, Taupunkt, Luftdruck, Sichtweite, Tag/Nacht, Windgeschwindigkeit, Windrichtung (Text/Emoji/Icon), Beaufort, UV-Index, Gefriergrenze, Wettercode, Icon/Icon-URL, Beschreibung, `is_storm`/`is_thunderstorm`.

Optional pro Stunde (wenn Gruppe aktiviert + „auch stündlich"):

| Kanal | Datenpunkte |
|-------|-------------|
| `hXX.air_quality` | european_aqi, PM10, PM2.5, NO₂, CO, Staub, Ozon |
| `hXX.astronomy` | Sonnenauf/-untergang, Mondphase (val/text/icon), Mondauf/-untergang |
| `hXX.agriculture` | solar_radiation (W/m²), CAPE (J/kg), soil_temp (°C/°F), irradiance = Globalstrahlung auf geneigter Fläche (W/m²), lifted_index (K) |
| `hXX.comfort` | heat_index, windchill, humidex, humidex_level, uv_index, uv_level |
| `hXX.pollen` | Erle … Ambrosia + Textstufe (Keine/Niedrig/Mittel/Hoch) |

### Amtliche Warnungen (`warnings`)

| Datenpunkt | Beschreibung |
|-----------|--------------|
| `warnings.source` | Warnquelle: `"DWD"` oder `"MeteoAlarm"` |
| `warnings.active` | Mindestens eine aktive Warnung |
| `warnings.count` | Anzahl aktiver Warnungen |
| `warnings.max_level` | Höchste Warnstufe: 1 = Gering · 2 = Mäßig · 3 = Schwer · 4 = Extrem |
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

### **WORK IN PROGRESS**
* (ipod86) Neues Icon-Set: eigene SVG-Icons hochladen über Admin → Dateien
* (ipod86) Eigene Icons: Nacht-Icons mit Fallback auf Tag-Icon
* (ipod86) Icon-Vorschau in den Einstellungen über /files/-URL (kein Cache-Problem)
* (ipod86) Eigene Icons als Base64-Data-URL im Widget-Datenpunkt eingebettet (funktioniert in allen VIS/Dashboard-Kontexten)
* (ipod86) Neues Icon-Set: WMO OGC SVG-Symbole mit themenabhängiger Farbinvertierung
* (ipod86) Widget: vollständig responsives Layout via CSS Container Queries (kein JavaScript erforderlich)
* (ipod86) Widget: konfigurierbare Breite (200–900 px) mit Slider in den Einstellungen
* (ipod86) Widget: eigenes Farbschema mit individuellem Hintergrund- und Textfarb-Picker
* (ipod86) Widget: MDI-SVG-Icons ersetzen Emojis (themenabhängige Farbe)
* (ipod86) Komfort-Indizes: Hitzeindex, Windchill, Humidex, UV-Index (optional, auch stündlich)
* (ipod86) Einstellungen: Inline-Validierung mit Fehlerhinweisen für alle Zahlenfelder
* (ipod86) Einstellungen: Speichern wird bei ungültiger Konfiguration gesperrt
* (ipod86) Doku: README.txt im icons/custom/-Ordner mit Dateiliste und Größenhinweisen

### 0.1.1 (2026-04-19)
* (ipod86) Adapter umbenannt zu ioBroker.openmeteo-notify

### 0.1.0 (2026-04-16)
* (ipod86) Amtliche Warnungen: DE über DWD, EU über MeteoAlarm – automatische Erkennung per Koordinaten
* (ipod86) Einheitlicher `standort.warnings.*`-Ordner für alle amtlichen Warnungen mit `source`-Datenpunkt
* (ipod86) Einzelner `warnOfficial`-Schalter ersetzt die separaten Einstellungen `enableDwd` / `warnDwd`
* (ipod86) Neue tägliche Datenpunkte: `temp_mean`, `feels_like_mean`, `precipitation_hours`, `showers`, `uv_index_clear_sky`, `snowfall_height_min`
* (ipod86) Neue stündliche Datenpunkte: `snowfall_height`, `freezing_level_height`, `uv_index`
* (ipod86) Astronomie: `solar_noon` und `solar_elevation_max` ergänzt (via SunCalc berechnet)
* (ipod86) Fix: Tageskanal-Namen nicht mehr eingefroren auf Erstellungsdatum

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
