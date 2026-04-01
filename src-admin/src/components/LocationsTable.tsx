import React from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { I18n } from '@iobroker/adapter-react-v5';
import { Location } from '../types';

interface Props {
    locations: Location[];
    onChange: (locations: Location[]) => void;
    themeType?: string;
}

const LocationsTable: React.FC<Props> = ({ locations, onChange }) => {
    const update = (index: number, field: keyof Location, value: any): void => {
        const updated = locations.map((loc, i) =>
            i === index ? { ...loc, [field]: field === 'name' ? value : parseFloat(value) || 0 } : loc
        );
        onChange(updated);
    };

    const add = (): void => {
        onChange([...locations, { name: '', lat: 0, lon: 0 }]);
    };

    const remove = (index: number): void => {
        onChange(locations.filter((_, i) => i !== index));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {locations.map((loc, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        label={I18n.t('locationName')}
                        value={loc.name}
                        onChange={e => update(i, 'name', e.target.value)}
                        sx={{ width: 200 }}
                        size="small"
                    />
                    <TextField
                        label={I18n.t('latitude')}
                        type="number"
                        value={loc.lat}
                        inputProps={{ min: -90, max: 90, step: 0.0001 }}
                        onChange={e => update(i, 'lat', e.target.value)}
                        sx={{ width: 140 }}
                        size="small"
                    />
                    <TextField
                        label={I18n.t('longitude')}
                        type="number"
                        value={loc.lon}
                        inputProps={{ min: -180, max: 180, step: 0.0001 }}
                        onChange={e => update(i, 'lon', e.target.value)}
                        sx={{ width: 140 }}
                        size="small"
                    />
                    <IconButton onClick={() => remove(i)} color="error" size="small">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Box>
                <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small">
                    {I18n.t('addLocation')}
                </Button>
            </Box>
        </Box>
    );
};

export default LocationsTable;
