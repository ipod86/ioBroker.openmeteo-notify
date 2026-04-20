import React from 'react';
import { Box, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import { OpenMeteoConfig } from '../types';
import LocationsTable from './LocationsTable';
import IconSetPicker from './IconSetPicker';

interface Props {
    native: OpenMeteoConfig;
    onChange: (newNative: OpenMeteoConfig) => void;
    themeType?: string;
}

const SettingsPanel: React.FC<Props> = ({ native, onChange, themeType }) => {
    const update = (field: keyof OpenMeteoConfig, value: any): void => {
        onChange({ ...native, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Locations */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('locations')}</Typography>
                <LocationsTable
                    locations={native.locations || []}
                    onChange={locs => update('locations', locs)}
                    themeType={themeType}
                />
            </Box>

            <Divider />

            {/* Forecast */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('forecast')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label={I18n.t('daysCount')}
                        type="number"
                        value={native.daysCount ?? 7}
                        inputProps={{ min: 1, max: 16 }}
                        onChange={e => update('daysCount', parseInt(e.target.value))}
                        error={(native.daysCount ?? 7) < 1 || (native.daysCount ?? 7) > 16}
                        helperText={(native.daysCount ?? 7) < 1 || (native.daysCount ?? 7) > 16
                            ? I18n.t('validRange', '1–16')
                            : I18n.t('daysCountHelp')}
                        sx={{ width: 200 }}
                    />
                    <TextField
                        label={I18n.t('hourlyDays')}
                        type="number"
                        value={native.hourlyDays ?? 3}
                        inputProps={{ min: 0, max: 16 }}
                        onChange={e => update('hourlyDays', parseInt(e.target.value))}
                        error={(native.hourlyDays ?? 3) < 0 || (native.hourlyDays ?? 3) > (native.daysCount ?? 7)}
                        helperText={(native.hourlyDays ?? 3) < 0 || (native.hourlyDays ?? 3) > (native.daysCount ?? 7)
                            ? I18n.t('hourlyDaysExceedsDaysCount')
                            : (native.hourlyDays ?? 3) >= 7
                                ? I18n.t('hourlyDaysHighWarning')
                                : I18n.t('hourlyDaysHelp')}
                        FormHelperTextProps={{ style: (native.hourlyDays ?? 3) >= 7 ? { color: '#ed6c02' } : undefined }}
                        sx={{ width: 200 }}
                    />
                </Box>
            </Box>

            <Divider />

            {/* Units */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('units')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ width: 180 }}>
                        <InputLabel>{I18n.t('temperatureUnit')}</InputLabel>
                        <Select
                            value={native.temperatureUnit || 'celsius'}
                            label={I18n.t('temperatureUnit')}
                            onChange={e => update('temperatureUnit', e.target.value)}
                        >
                            <MenuItem value="celsius">{I18n.t('celsius')}</MenuItem>
                            <MenuItem value="fahrenheit">{I18n.t('fahrenheit')}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: 180 }}>
                        <InputLabel>{I18n.t('windspeedUnit')}</InputLabel>
                        <Select
                            value={native.windspeedUnit || 'kmh'}
                            label={I18n.t('windspeedUnit')}
                            onChange={e => update('windspeedUnit', e.target.value)}
                        >
                            <MenuItem value="kmh">km/h</MenuItem>
                            <MenuItem value="ms">m/s</MenuItem>
                            <MenuItem value="mph">mph</MenuItem>
                            <MenuItem value="kn">kn</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: 180 }}>
                        <InputLabel>{I18n.t('precipitationUnit')}</InputLabel>
                        <Select
                            value={native.precipitationUnit || 'mm'}
                            label={I18n.t('precipitationUnit')}
                            onChange={e => update('precipitationUnit', e.target.value)}
                        >
                            <MenuItem value="mm">mm</MenuItem>
                            <MenuItem value="inch">inch</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Divider />

            {/* Icons */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('icons')}</Typography>
                <IconSetPicker
                    iconSet={native.iconSet || 'basmilius'}
                    onChange={val => update('iconSet', val)}
                />
            </Box>

            <Divider />

            {/* Update interval */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('updateInterval')}</Typography>
                <FormControl sx={{ width: 200 }}>
                    <InputLabel>{I18n.t('updateInterval')}</InputLabel>
                    <Select
                        value={native.updateInterval || 60}
                        label={I18n.t('updateInterval')}
                        onChange={e => update('updateInterval', Number(e.target.value))}
                    >
                        <MenuItem value={60}>60 {I18n.t('minutes')}</MenuItem>
                        <MenuItem value={120}>120 {I18n.t('minutes')}</MenuItem>
                        <MenuItem value={1440}>{I18n.t('dailyAt1am')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Divider />

            {/* Optional data */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('optionalData')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>

                    {/* Air Quality */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={native.enableAirQuality !== false} onChange={e => update('enableAirQuality', e.target.checked)} />}
                            label={I18n.t('enableAirQuality')}
                            sx={{ minWidth: 280 }}
                        />
                        {native.enableAirQuality !== false && (
                            <FormControlLabel
                                control={<Switch checked={!!native.enableAirQualityHourly} onChange={e => update('enableAirQualityHourly', e.target.checked)} />}
                                label={I18n.t('alsoHourly')}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                        {I18n.t('enableAirQualityHelp')}
                    </Typography>

                    {/* Astronomy */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={native.enableAstronomy !== false} onChange={e => update('enableAstronomy', e.target.checked)} />}
                            label={I18n.t('enableAstronomy')}
                            sx={{ minWidth: 280 }}
                        />
                        {native.enableAstronomy !== false && (
                            <FormControlLabel
                                control={<Switch checked={!!native.enableAstronomyHourly} onChange={e => update('enableAstronomyHourly', e.target.checked)} />}
                                label={I18n.t('alsoHourly')}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                        {I18n.t('enableAstronomyHelp')}
                    </Typography>

                    {/* Agriculture */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={!!native.enableAgriculture} onChange={e => update('enableAgriculture', e.target.checked)} />}
                            label={I18n.t('enableAgriculture')}
                            sx={{ minWidth: 280 }}
                        />
                        {native.enableAgriculture && (
                            <FormControlLabel
                                control={<Switch checked={!!native.enableAgricultureHourly} onChange={e => update('enableAgricultureHourly', e.target.checked)} />}
                                label={I18n.t('alsoHourly')}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                        {I18n.t('enableAgricultureHelp')}
                    </Typography>

                    {/* Pollen */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={!!native.enablePollen} onChange={e => update('enablePollen', e.target.checked)} />}
                            label={I18n.t('enablePollen')}
                            sx={{ minWidth: 280 }}
                        />
                        {native.enablePollen && (
                            <FormControlLabel
                                control={<Switch checked={native.enablePollenHourly !== false} onChange={e => update('enablePollenHourly', e.target.checked)} />}
                                label={I18n.t('alsoHourly')}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                        {I18n.t('enablePollenHelp')}
                    </Typography>

                    {/* Comfort indices */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <FormControlLabel
                            control={<Switch checked={!!native.enableComfort} onChange={e => update('enableComfort', e.target.checked)} />}
                            label={I18n.t('enableComfort')}
                            sx={{ minWidth: 280 }}
                        />
                        {native.enableComfort && (
                            <FormControlLabel
                                control={<Switch checked={!!native.enableComfortHourly} onChange={e => update('enableComfortHourly', e.target.checked)} />}
                                label={I18n.t('alsoHourly')}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                        {I18n.t('enableComfortHelp')}
                    </Typography>

                </Box>
            </Box>

        </Box>
    );
};

export default SettingsPanel;
