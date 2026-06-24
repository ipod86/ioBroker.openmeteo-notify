export interface Location {
    name: string;
    lat: number;
    lon: number;
}

export interface Widget {
    id: string;
    locationName: string;
    days: 5 | 7 | 14;
    variant: 'simple' | 'detailed';
    theme: 'light' | 'dark' | 'custom';
    width: number;
    bgColor: string;    // hex '#rrggbb' or 'transparent'
    textBase: string;   // hex '#rrggbb'
    hourlyRange?: number; // hours to show from now (default 20)
    hourlyStep?: number;  // step in hours (default 2)
    scaleHeader?: number;    // header section font scale -5..+5 (default 0)
    scaleDetails?: number;   // details section font scale -5..+5 (default 0)
    scaleForecast?: number;  // forecast section font scale -5..+5 (default 0)
    showWarnBadge?: boolean; // show blinking badge for active official warnings (default true)
    showMoon?: boolean;      // show moon phase overlay on forecast icons (default true)
}

export interface OpenMeteoConfig {
    locations: Location[];
    daysCount: number;
    hourlyDays: number;
    temperatureUnit: 'celsius' | 'fahrenheit';
    windspeedUnit: 'kmh' | 'ms' | 'mph' | 'kn';
    precipitationUnit: 'mm' | 'inch';
    iconSet: 'wmo' | 'basmilius' | 'basmilius_animated' | 'amcharts_animated' | 'amcharts_static' | 'custom';
    updateInterval: number;
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
}
