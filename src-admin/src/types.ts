export interface Location {
	name: string;
	lat: number;
	lon: number;
}

export interface Widget {
	id: string;
	locationName: string;
	days: 5 | 7 | 14;
	variant: "simple" | "detailed";
	theme: "light" | "dark" | "custom";
	width: number;
	bgColor: string; // hex '#rrggbb' or 'transparent'
	textBase: string; // hex '#rrggbb'
	hourlyRange?: number; // hours to show from now (default 20)
	hourlyStep?: number; // step in hours (default 2)
	scaleHeader?: number; // header section font scale -5..+5 (default 0)
	scaleDetails?: number; // details section font scale -5..+5 (default 0)
	scaleForecast?: number; // forecast section font scale -5..+5 (default 0)
	showWarnBadge?: boolean; // show blinking badge for active official warnings (default true)
	showMoon?: boolean; // show moon phase overlay on forecast icons (default true)
}

export interface WallpaperConfig {
	position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	showLocation: boolean;
	showTemperature: boolean;
	showWindDirection: boolean;
	showWindSpeed: boolean;
	fontSize: number; // px, 10-100
	textColor: string; // hex '#rrggbb'
	bgColor: string; // hex '#rrggbb'
	bgOpacity: number; // %, 0-100
	edgeMargin: number; // px, 0-100 - Abstand der Anzeige vom Bildschirmrand
	warnEnabled: boolean; // amtliche Warnungen als Text-Banner anzeigen
	warnTextColor: string; // hex '#rrggbb'
	warnFontSize: number; // px, 10-100
	carouselEnabled: boolean; // zwischen mehreren Orten durchblaettern (Pfeile links/rechts)
	// Uhrzeit ist ein eigenstaendiges, unabhaengig positionierbares Element (nicht Teil
	// der Info-Anzeige oben) - eigene Position/Farben/Groesse/Randabstand.
	timeEnabled: boolean;
	timePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	timeTextColor: string; // hex '#rrggbb'
	timeBgColor: string; // hex '#rrggbb'
	timeBgOpacity: number; // %, 0-100
	timeFontSize: number; // px, 10-100
	timeEdgeMargin: number; // px, 0-100
}

export interface OpenMeteoConfig {
	locations: Location[];
	daysCount: number;
	hourlyDays: number;
	temperatureUnit: "celsius" | "fahrenheit";
	windspeedUnit: "kmh" | "ms" | "mph" | "kn";
	precipitationUnit: "mm" | "inch";
	iconSet: "wmo" | "basmilius" | "basmilius_animated" | "amcharts_animated" | "amcharts_static" | "custom";
	updateInterval: number;
	liveUpdateMinutes: number; // 0 = deaktiviert; schneller Takt fuer nur current.* + Wallpaper
	enableAirQuality: boolean;
	enableAirQualityHourly: boolean;
	enableAstronomy: boolean;
	enableAstronomyHourly: boolean;
	enableAgriculture: boolean;
	enableAgricultureHourly: boolean;
	enablePollen: boolean;
	enablePollenHourly: boolean;
	enableComfort: boolean;
	enableComfortHourly: boolean;
	warnOfficialFetch: boolean;
	warnOfficial: boolean;
	warnOfficialMinLevel: number;
	warnExcludeKeywords: string;
	warnIntervalMinutes: number;
	warnNotifyLift: boolean;
	widgets: Widget[];
	warnStorm: boolean;
	warnStormBft: number;
	warnThunderstorm: boolean;
	warnFrost: boolean;
	warnFrostThreshold: number;
	warnLeadHours: number;
	wallpaper: WallpaperConfig;
}
