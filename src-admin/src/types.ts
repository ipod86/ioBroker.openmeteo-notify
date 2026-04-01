export interface Location {
    name: string;
    lat: number;
    lon: number;
}

export interface OpenMeteoConfig {
    locations: Location[];
    daysCount: number;
    hourlyDays: number;
    temperatureUnit: 'celsius' | 'fahrenheit';
    windspeedUnit: 'kmh' | 'ms' | 'mph' | 'kn';
    precipitationUnit: 'mm' | 'inch';
    iconSet: 'wmo' | 'basmilius' | 'basmilius_animated';
    updateInterval: number;
    enableAirQuality: boolean;
    enableAstronomy: boolean;
    enableAgriculture: boolean;
    enableAgricultureHourly: boolean;
    enablePollen: boolean;
    enablePollenHourly: boolean;
}
