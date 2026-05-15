import React from 'react';
import { Alert, Box, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import { OpenMeteoConfig } from '../types';

interface Props {
    native: OpenMeteoConfig;
    onChange: (newNative: OpenMeteoConfig) => void;
    notificationManagerInstalled?: boolean;
    notificationManagerRunning?: boolean;
}

const WarningsPanel: React.FC<Props> = ({ native, onChange, notificationManagerInstalled, notificationManagerRunning }) => {
    const update = (field: keyof OpenMeteoConfig, value: any): void => {
        onChange({ ...native, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {notificationManagerInstalled === false && (
                <Alert severity="warning">
                    {I18n.t('notificationManagerMissingHint')}
                </Alert>
            )}
            {notificationManagerInstalled === true && notificationManagerRunning === false && (
                <Alert severity="warning">
                    {I18n.t('notificationManagerNotRunningHint')}
                </Alert>
            )}
            {notificationManagerInstalled === true && notificationManagerRunning === true && (
                <Alert severity="info">
                    {I18n.t('notificationManagerFoundHint')}
                </Alert>
            )}
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
                    {native.warnOfficial && (
                        <FormControl sx={{ width: 360, ml: 2, mt: 1 }} size="small">
                            <InputLabel>{I18n.t('warnOfficialMinLevel')}</InputLabel>
                            <Select
                                value={native.warnOfficialMinLevel ?? 2}
                                label={I18n.t('warnOfficialMinLevel')}
                                onChange={e => update('warnOfficialMinLevel', Number(e.target.value))}
                            >
                                <MenuItem value={1}>1 – Vorinformation / Minor</MenuItem>
                                <MenuItem value={2}>2 – Warnung / Moderate</MenuItem>
                                <MenuItem value={3}>3 – Markante Warnung / Severe</MenuItem>
                                <MenuItem value={4}>4 – Extreme Warnung / Extreme</MenuItem>
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {I18n.t('warnOfficialMinLevelHelp')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                                {I18n.t(`warnLevelDesc${native.warnOfficialMinLevel ?? 2}`)}
                            </Typography>
                        </FormControl>
                    )}
                    {native.warnOfficial && (
                        <FormControl sx={{ width: 240, ml: 2, mt: 1 }} size="small">
                            <InputLabel>{I18n.t('warnIntervalMinutes')}</InputLabel>
                            <Select
                                value={native.warnIntervalMinutes ?? 5}
                                label={I18n.t('warnIntervalMinutes')}
                                onChange={e => update('warnIntervalMinutes', Number(e.target.value))}
                            >
                                <MenuItem value={5}>5 min</MenuItem>
                                <MenuItem value={10}>10 min</MenuItem>
                                <MenuItem value={15}>15 min</MenuItem>
                                <MenuItem value={30}>30 min</MenuItem>
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {I18n.t('warnIntervalMinutesHelp')}
                            </Typography>
                        </FormControl>
                    )}
                    {native.warnOfficial && (
                        <Box sx={{ ml: 2, mt: 1 }}>
                            <FormControlLabel
                                control={<Switch checked={!!native.warnNotifyLift} onChange={e => update('warnNotifyLift', e.target.checked)} />}
                                label={I18n.t('warnNotifyLift')}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                {I18n.t('warnNotifyLiftHelp')}
                            </Typography>
                        </Box>
                    )}
                    {native.warnOfficial && (
                        <TextField
                            label={I18n.t('warnExcludeKeywords')}
                            value={native.warnExcludeKeywords ?? ''}
                            onChange={e => update('warnExcludeKeywords', e.target.value)}
                            placeholder={I18n.t('warnExcludeKeywordsPlaceholder')}
                            helperText={I18n.t('warnExcludeKeywordsHelp')}
                            sx={{ width: 360, ml: 2, mt: 1 }}
                            size="small"
                        />
                    )}
                </Box>
            </Box>

            <Divider />

            {/* Calculated warnings */}
            <Box>
                <Typography variant="h6" gutterBottom>{I18n.t('warningsOpenMeteo')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{I18n.t('warningsOpenMeteoHint')}</Typography>
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
                            error={(native.warnFrostThreshold ?? 0) < -20 || (native.warnFrostThreshold ?? 0) > 5}
                            helperText={(native.warnFrostThreshold ?? 0) < -20 || (native.warnFrostThreshold ?? 0) > 5
                                ? I18n.t('validRange', '−20–5')
                                : I18n.t('warnFrostThresholdHelp')}
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
                                onChange={e => update('warnLeadHours', parseInt(e.target.value))}
                                error={(native.warnLeadHours ?? 2) < 1 || (native.warnLeadHours ?? 2) > 24}
                                helperText={(native.warnLeadHours ?? 2) < 1 || (native.warnLeadHours ?? 2) > 24
                                    ? I18n.t('validRange', '1–24')
                                    : I18n.t('warnLeadHoursHelp')}
                                sx={{ width: 200, mt: 1 }}
                            />
                            {(native.updateInterval || 60) > 60 && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    {I18n.t('warnNeedsHourlyInterval')}
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
