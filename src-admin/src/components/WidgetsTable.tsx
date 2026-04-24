import React from 'react';
import {
    Box, Button, IconButton, Typography, Slider, TextField, Switch, FormControlLabel,
    Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { I18n } from '@iobroker/adapter-react-v5';
import { Location, Widget } from '../types';

interface Props {
    widgets: Widget[];
    locations: Location[];
    daysCount: number;
    onChange: (widgets: Widget[]) => void;
}

const PRESETS: Record<'dark' | 'light', { bgColor: string; textBase: string }> = {
    dark:  { bgColor: 'transparent', textBase: '#000000' },
    light: { bgColor: 'transparent', textBase: '#ffffff' },
};

function makeId(): string {
    return Math.random().toString(36).substring(2, 8);
}

const ColorSwatch: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
    <Box
        component="input"
        type="color"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
            width: 36, height: 36, border: '1px solid', borderColor: 'divider',
            borderRadius: 1, padding: '2px', cursor: 'pointer', background: 'none',
        }}
    />
);

const WidgetsTable: React.FC<Props> = ({ widgets, locations, daysCount, onChange }) => {
    const update = (index: number, patch: Partial<Widget>): void => {
        const updated = widgets.map((w, i) => i === index ? { ...w, ...patch } : w);
        onChange(updated);
    };

    const add = (): void => {
        const defaultLoc = locations[0]?.name || '';
        const defaultDays = ([5, 7, 14] as const).find(d => d <= daysCount) ?? 5;
        onChange([...widgets, {
            id: makeId(),
            locationName: defaultLoc,
            days: defaultDays,
            theme: 'dark',
            width: 450,
            bgColor: 'transparent',
            textBase: '#000000',
        }]);
    };

    const remove = (index: number): void => {
        onChange(widgets.filter((_, i) => i !== index));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
                {I18n.t('widgetHint')}
            </Typography>

            {widgets.map((w, i) => {
                const isTransparent = !w.bgColor || w.bgColor === 'transparent';
                const resolvedBg = isTransparent ? '#1e1e1e' : w.bgColor;
                const resolvedText = w.textBase || PRESETS[w.theme ?? 'dark'].textBase;

                return (
                    <Box key={w.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2">
                                Widget {i + 1} — DP: <code>{w.locationName ? `${w.locationName}.widget.${w.id}` : '…'}</code>
                            </Typography>
                            <IconButton onClick={() => remove(i)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
                            {/* Location */}
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>{I18n.t('location')}</InputLabel>
                                <Select
                                    value={w.locationName}
                                    label={I18n.t('location')}
                                    onChange={e => update(i, { locationName: e.target.value })}
                                >
                                    {locations.map(loc => (
                                        <MenuItem key={loc.name} value={loc.name}>{loc.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Days */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    {I18n.t('widgetDays')}
                                </Typography>
                                <ToggleButtonGroup
                                    value={w.days}
                                    exclusive
                                    size="small"
                                    onChange={(_, v) => v && update(i, { days: v })}
                                >
                                    {([5, 7, 14] as const).map(d => (
                                        <ToggleButton key={d} value={d} disabled={d > daysCount}>
                                            {d}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>

                            {/* Theme preset */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    {I18n.t('widgetTheme')}
                                </Typography>
                                <ToggleButtonGroup
                                    value={w.theme ?? 'dark'}
                                    exclusive
                                    size="small"
                                    onChange={(_, v) => {
                                        if (!v) return;
                                        if (v === 'custom') {
                                            // pre-fill from current preset so pickers start with sensible values
                                            const base = PRESETS[(w.theme as 'dark' | 'light') ?? 'dark'] ?? PRESETS.dark;
                                            update(i, { theme: 'custom', bgColor: w.bgColor || base.bgColor, textBase: w.textBase || base.textBase });
                                        } else {
                                            update(i, { theme: v, ...PRESETS[v as 'dark' | 'light'] });
                                        }
                                    }}
                                >
                                    <ToggleButton value="dark">{I18n.t('widgetDark')}</ToggleButton>
                                    <ToggleButton value="light">{I18n.t('widgetLight')}</ToggleButton>
                                    <ToggleButton value="custom">{I18n.t('widgetCustom')}</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {/* Custom color pickers — only when theme === 'custom' */}
                            {w.theme === 'custom' && <>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        {I18n.t('widgetBgColor')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={isTransparent}
                                                    onChange={e => update(i, { bgColor: e.target.checked ? 'transparent' : '#1e1e1e' })}
                                                />
                                            }
                                            label={<Typography variant="caption">{I18n.t('widgetTransparent')}</Typography>}
                                            sx={{ m: 0 }}
                                        />
                                        <ColorSwatch
                                            value={resolvedBg}
                                            onChange={v => update(i, { bgColor: v })}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        {I18n.t('widgetTextColor')}
                                    </Typography>
                                    <ColorSwatch
                                        value={resolvedText}
                                        onChange={v => update(i, { textBase: v })}
                                    />
                                </Box>
                            </>}

                            {/* Width */}
                            <Box sx={{ minWidth: 220 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    {I18n.t('widgetWidth')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Slider
                                        value={w.width ?? 450}
                                        min={200}
                                        max={900}
                                        step={10}
                                        size="small"
                                        sx={{ width: 140 }}
                                        onChange={(_, v) => update(i, { width: v as number })}
                                    />
                                    <TextField
                                        value={w.width ?? 450}
                                        type="number"
                                        size="small"
                                        sx={{ width: 75 }}
                                        inputProps={{ min: 200, max: 900, step: 10 }}
                                        onChange={e => {
                                            const v = Math.min(900, Math.max(200, parseInt(e.target.value) || 450));
                                            update(i, { width: v });
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">px</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                );
            })}

            <Box>
                <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small">
                    {I18n.t('addWidget')}
                </Button>
            </Box>
        </Box>
    );
};

export default WidgetsTable;
