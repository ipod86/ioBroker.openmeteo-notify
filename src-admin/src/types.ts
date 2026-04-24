export interface Location {
    name: string;
    lat: number;
    lon: number;
}

export interface Widget {
    id: string;
    locationName: string;
    days: 5 | 7 | 14;
    theme: 'light' | 'dark' | 'custom';
    width: number;
    bgColor: string;    // hex '#rrggbb' or 'transparent'
    textBase: string;   // hex '#rrggbb'
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
    warnOfficial: boolean;
    widgets: Widget[];
    warnStorm: boolean;
    warnStormBft: number;
    warnThunderstorm: boolean;
    warnFrost: boolean;
    warnFrostThreshold: number;
    warnLeadHours: number;
}
