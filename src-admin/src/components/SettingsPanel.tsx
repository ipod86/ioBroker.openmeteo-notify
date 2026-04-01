import React from 'react';
import { Box, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
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
                        onChange={e => update('daysCount', parseInt(e.target.value) || 7)}
                        helperText={I18n.t('daysCountHelp')}
                        sx={{ width: 200 }}
                    />
                    <TextField
                        label={I18n.t('hourlyDays')}
                        type="number"
                        value={native.hourlyDays ?? 3}
                        inputProps={{ min: 0, max: 16 }}
                        onChange={e => update('hourlyDays', parseInt(e.target.value) || 0)}
                        helperText={I18n.t('hourlyDaysHelp')}
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
        </Box>
    );
};

export default SettingsPanel;
