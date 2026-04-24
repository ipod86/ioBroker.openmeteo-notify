import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';

interface Props {
    iconSet: string;
    onChange: (iconSet: string) => void;
}

const PREVIEW_CODES = ['00', '01', '03', '45', '61', '63', '73', '80', '95', '99'];

const AMCHARTS_PREVIEW: Record<string, string> = {
    '00': 'day', '01': 'cloudy-day-1', '03': 'cloudy-day-3',
    '45': 'cloudy', '61': 'rainy-3', '63': 'rainy-4',
    '73': 'snowy-2', '80': 'rainy-4', '95': 'thunder', '99': 'thunder',
};

const ICON_SETS = [
    { value: 'basmilius',          label: 'Meteocons (statisch)',  ext: 'png', amcharts: false, custom: false },
    { value: 'basmilius_animated', label: 'Meteocons (animiert)',  ext: 'svg', amcharts: false, custom: false },
    { value: 'amcharts_animated',  label: 'amCharts (animiert)',   ext: 'svg', amcharts: true,  custom: false },
    { value: 'amcharts_static',    label: 'amCharts (statisch)',   ext: 'svg', amcharts: true,  custom: false },
    { value: 'wmo_svg',            label: 'WMO OGC',              ext: 'svg', amcharts: false, custom: false },
    { value: 'custom',             label: 'Custom',               ext: 'svg', amcharts: false, custom: true  },
];

const IconSetPicker: React.FC<Props> = ({ iconSet, onChange }) => {
    const current = ICON_SETS.find(s => s.value === iconSet) || ICON_SETS[0];
    const folder = iconSet === 'amcharts_animated' ? 'animated' : 'static';

    const getIconUrl = (code: string): string => {
        if (current.custom) {
            return `/adapter/openmeteo-notify/icons/custom/wmo_${code}.svg`;
        }
        if (current.amcharts) {
            const name = AMCHARTS_PREVIEW[code] || 'cloudy';
            return `./icons/amcharts/${folder}/${name}.svg`;
        }
        return `./icons/${current.value}/wmo_${code}.${current.ext}`;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl sx={{ width: 320 }}>
                <InputLabel>{I18n.t('iconSet')}</InputLabel>
                <Select
                    value={iconSet}
                    label={I18n.t('iconSet')}
                    onChange={e => onChange(e.target.value)}
                >
                    {ICON_SETS.map(s => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {current.amcharts && (
                <Typography variant="caption" color="warning.main">
                    ⚠ amCharts: Regen, Schnee und Gewitter haben keine Tag/Nacht-Variante.
                    Icons © <a href="https://www.amcharts.com/free-animated-svg-weather-icons/" target="_blank" rel="noreferrer">amCharts</a> (CC BY 4.0)
                </Typography>
            )}

            {current.custom && (
                <Typography variant="caption" color="info.main" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {I18n.t('iconSetCustomHint')}
                </Typography>
            )}

            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {current.custom ? I18n.t('iconSetCustomPreviewHint') : I18n.t('iconSetHelp')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {PREVIEW_CODES.map(code => (
                        <Box
                            key={code}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
                        >
                            <img
                                src={getIconUrl(code)}
                                alt={`wmo_${code}`}
                                width={48}
                                height={48}
                                style={{ objectFit: 'contain' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <Typography variant="caption" color="text.secondary">{code}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default IconSetPicker;
