import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';

interface Props {
    iconSet: string;
    onChange: (iconSet: string) => void;
}

const PREVIEW_CODES = ['00', '01', '03', '45', '61', '63', '73', '80', '95', '99'];

const ICON_SETS = [
    { value: 'basmilius', label: 'Meteocons (statisch)', ext: 'png' },
    { value: 'basmilius_animated', label: 'Meteocons (animiert SVG)', ext: 'svg' },
    { value: 'wmo', label: 'WMO OGC (meteorologische Symbole)', ext: 'png' },
];

const IconSetPicker: React.FC<Props> = ({ iconSet, onChange }) => {
    const current = ICON_SETS.find(s => s.value === iconSet) || ICON_SETS.find(s => s.value === 'basmilius')!;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl sx={{ width: 300 }}>
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

            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {I18n.t('iconSetHelp')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {PREVIEW_CODES.map(code => (
                        <Box
                            key={code}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <img
                                src={`./icons/${current.value}/wmo_${code}.${current.ext}`}
                                alt={`wmo_${code}`}
                                width={48}
                                height={48}
                                style={{ objectFit: 'contain' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {code}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default IconSetPicker;
