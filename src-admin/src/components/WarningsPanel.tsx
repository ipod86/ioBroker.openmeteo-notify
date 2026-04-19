import React from 'react';
import { Alert, Box, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import { OpenMeteoConfig } from '../types';

interface Props {
    native: OpenMeteoConfig;
    onChange: (newNative: OpenMeteoConfig) => void;
}

const WarningsPanel: React.FC<Props> = ({ native, onChange }) => {
    const update = (field: keyof OpenMeteoConfig, value: any): void => {
        onChange({ ...native, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Official warnings */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('warnOfficial')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                        control={<Switch checked={!!native.warnOfficial} onChange={e => update('warnOfficial', e.target.checked)} />}
                        label={I18n.t('warnOfficial')}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                        {I18n.t('warnOfficialHelp')}
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Calculated warnings */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('warningsOpenMeteo')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                        control={<Switch checked={!!native.warnStorm} onChange={e => update('warnStorm', e.target.checked)} />}
                        label={I18n.t('warnStorm')}
                    />
                    {native.warnStorm && (
                        <FormControl sx={{ width: 360, ml: 2 }} size="small">
                            <InputLabel>{I18n.t('warnStormBft')}</InputLabel>
                            <Select
                                value={native.warnStormBft ?? 8}
                                label={I18n.t('warnStormBft')}
                                onChange={e => update('warnStormBft', Number(e.target.value))}
                            >
                                {[
                                    { bft: 1,  kmh: 1,   label: 'Leiser Zug' },
                                    { bft: 2,  kmh: 6,   label: 'Leichte Brise' },
                                    { bft: 3,  kmh: 12,  label: 'Schwache Brise' },
                                    { bft: 4,  kmh: 20,  label: 'Mäßige Brise' },
                                    { bft: 5,  kmh: 29,  label: 'Frische Brise' },
                                    { bft: 6,  kmh: 39,  label: 'Starke Brise' },
                                    { bft: 7,  kmh: 50,  label: 'Steifer Wind' },
                                    { bft: 8,  kmh: 62,  label: 'Stürmischer Wind', isDefault: true },
                                    { bft: 9,  kmh: 75,  label: 'Sturm' },
                                    { bft: 10, kmh: 89,  label: 'Schwerer Sturm' },
                                    { bft: 11, kmh: 103, label: 'Orkanartiger Sturm' },
                                    { bft: 12, kmh: 118, label: 'Orkan' },
                                ].map(o => (
                                    <MenuItem key={o.bft} value={o.bft}>
                                        Bft {o.bft} – {o.label} (≥ {o.kmh} km/h){o.isDefault ? ` – ${I18n.t('defaultValue')}` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControlLabel
                        control={<Switch checked={!!native.warnThunderstorm} onChange={e => update('warnThunderstorm', e.target.checked)} />}
                        label={I18n.t('warnThunderstorm')}
                    />
                    <FormControlLabel
                        control={<Switch checked={!!native.warnFrost} onChange={e => update('warnFrost', e.target.checked)} />}
                        label={I18n.t('warnFrost')}
                    />
                    {native.warnFrost && (
                        <TextField
                            label={I18n.t('warnFrostThreshold')}
                            type="number"
                            value={native.warnFrostThreshold ?? 0}
                            inputProps={{ min: -20, max: 5, step: 0.5 }}
                            onChange={e => update('warnFrostThreshold', parseFloat(e.target.value))}
                            helperText={I18n.t('warnFrostThresholdHelp')}
                            sx={{ width: 200, mt: 1, ml: 2 }}
                        />
                    )}
                    {(native.warnStorm || native.warnThunderstorm || native.warnFrost) && (
                        <>
                            <TextField
                                label={I18n.t('warnLeadHours')}
                                type="number"
                                value={native.warnLeadHours ?? 2}
                                inputProps={{ min: 1, max: 24 }}
                                onChange={e => update('warnLeadHours', parseInt(e.target.value) || 2)}
                                helperText={I18n.t('warnLeadHoursHelp')}
                                sx={{ width: 200, mt: 1 }}
                            />
                            {(native.updateInterval || 60) > 60 && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    {I18n.t('warnNeedsHourlyInterval')}
                                </Alert>
                            )}
                            {(native.warnLeadHours ?? 2) > 24 && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    {I18n.t('warnLeadHoursTooHigh')}
                                </Alert>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default WarningsPanel;
