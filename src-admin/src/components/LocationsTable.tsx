import React, { useState } from 'react';
import {
    Box, Button, IconButton, TextField, Typography,
    ToggleButtonGroup, ToggleButton, CircularProgress, Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { I18n } from '@iobroker/adapter-react-v5';
import { Location } from '../types';

interface Props {
    locations: Location[];
    onChange: (locations: Location[]) => void;
    themeType?: string;
}

type InputMode = 'coords' | 'address';

interface RowState {
    mode: InputMode;
    addressText: string;
    geocoding: boolean;
    geoError: string;
}

function osmEmbedUrl(lat: number, lon: number): string {
    const d = 0.01;
    const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    if (!lat && !lon) return null;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    const item = await res.json();
    if (!item || item.error) return null;
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const road = addr.road || addr.pedestrian || addr.suburb || '';
    return road ? `${city}, ${road}`.replace(/^, /, '') : city || item.display_name?.split(',')[0] || null;
}

async function geocode(address: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];
    // Build Ort_Straße style name from address components
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const road = addr.road || addr.pedestrian || addr.suburb || '';
    const autoName = road ? `${city}_${road}`.replace(/\s+/g, '_') : city || item.display_name.split(',')[0];
    return {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: autoName,
    };
}

const LocationsTable: React.FC<Props> = ({ locations, onChange }) => {
    const [rowStates, setRowStates] = useState<RowState[]>(() =>
        locations.map(() => ({ mode: 'coords' as InputMode, addressText: '', geocoding: false, geoError: '' }))
    );

    const updateRow = (index: number, patch: Partial<RowState>): void => {
        setRowStates(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
    };

    const updateLoc = (index: number, field: keyof Location, value: any): void => {
        onChange(locations.map((loc, i) =>
            i === index ? { ...loc, [field]: field === 'name' ? value : parseFloat(value) || 0 } : loc
        ));
    };

    const add = (): void => {
        onChange([...locations, { name: '', lat: 0, lon: 0 }]);
        setRowStates(prev => [...prev, { mode: 'coords', addressText: '', geocoding: false, geoError: '' }]);
    };

    const remove = (index: number): void => {
        onChange(locations.filter((_, i) => i !== index));
        setRowStates(prev => prev.filter((_, i) => i !== index));
    };

    const doGeocode = async (index: number): Promise<void> => {
        const text = rowStates[index]?.addressText;
        if (!text) return;
        updateRow(index, { geocoding: true, geoError: '' });
        try {
            const result = await geocode(text);
            if (!result) {
                updateRow(index, { geocoding: false, geoError: 'Adresse nicht gefunden' });
                return;
            }
            onChange(locations.map((loc, i) =>
                i === index ? { name: result.displayName, lat: result.lat, lon: result.lon } : loc
            ));
            updateRow(index, { geocoding: false, geoError: '' });
        } catch {
            updateRow(index, { geocoding: false, geoError: 'Fehler bei der Geocodierung' });
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {locations.map((loc, i) => {
                const rs = rowStates[i] || { mode: 'coords', addressText: '', geocoding: false, geoError: '' };
                const hasCoords = loc.lat !== 0 || loc.lon !== 0;

                return (
                    <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2">{I18n.t('location')} {i + 1}</Typography>
                            <IconButton onClick={() => remove(i)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            {/* Left: inputs */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 320 }}>
                                <TextField
                                    label={I18n.t('locationName')}
                                    value={loc.name}
                                    onChange={e => updateLoc(i, 'name', e.target.value)}
                                    sx={{ width: 300 }}
                                    size="small"
                                    required
                                    error={!loc.name.trim()}
                                    helperText={!loc.name.trim() ? I18n.t('locationNameRequired') : undefined}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary">{I18n.t('inputMode')}:</Typography>
                                    <ToggleButtonGroup
                                        value={rs.mode}
                                        exclusive
                                        size="small"
                                        onChange={(_, v) => v && updateRow(i, { mode: v, geoError: '' })}
                                    >
                                        <ToggleButton value="coords">{I18n.t('inputCoords')}</ToggleButton>
                                        <ToggleButton value="address">{I18n.t('inputAddress')}</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                {rs.mode === 'coords' ? (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            label={I18n.t('latitude')}
                                            type="number"
                                            value={loc.lat}
                                            inputProps={{ min: -90, max: 90, step: 0.0001 }}
                                            onChange={e => updateLoc(i, 'lat', e.target.value)}
                                            onBlur={async () => {
                                                const addr = await reverseGeocode(loc.lat, loc.lon);
                                                if (addr) updateRow(i, { addressText: addr });
                                            }}
                                            sx={{ width: 145 }}
                                            size="small"
                                        />
                                        <TextField
                                            label={I18n.t('longitude')}
                                            type="number"
                                            value={loc.lon}
                                            inputProps={{ min: -180, max: 180, step: 0.0001 }}
                                            onChange={e => updateLoc(i, 'lon', e.target.value)}
                                            onBlur={async () => {
                                                const addr = await reverseGeocode(loc.lat, loc.lon);
                                                if (addr) updateRow(i, { addressText: addr });
                                            }}
                                            sx={{ width: 145 }}
                                            size="small"
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                        <TextField
                                            label={I18n.t('addressSearch')}
                                            value={rs.addressText}
                                            placeholder="Hauptstraße 1, 57290 Neunkirchen"
                                            onChange={e => updateRow(i, { addressText: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && doGeocode(i)}
                                            sx={{ width: 260 }}
                                            size="small"
                                            error={!!rs.geoError}
                                            helperText={rs.geoError || ' '}
                                        />
                                        <Tooltip title={I18n.t('geocode')}>
                                            <span>
                                                <IconButton
                                                    onClick={() => doGeocode(i)}
                                                    disabled={rs.geocoding || !rs.addressText}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    {rs.geocoding
                                                        ? <CircularProgress size={18} />
                                                        : <MyLocationIcon />
                                                    }
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                )}

                                {hasCoords && rs.mode === 'address' && (
                                    <Typography variant="caption" color="success.main">
                                        ✓ {loc.name} ({loc.lat.toFixed(4)}, {loc.lon.toFixed(4)})
                                    </Typography>
                                )}
                            </Box>

                            {/* Right: OSM map preview */}
                            {hasCoords && (
                                <Box sx={{ flexShrink: 0 }}>
                                    <iframe
                                        title={`map-${i}`}
                                        src={osmEmbedUrl(loc.lat, loc.lon)}
                                        width={260}
                                        height={180}
                                        style={{ border: '1px solid #ccc', borderRadius: 4, display: 'block' }}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                );
            })}

            <Box>
                <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small">
                    {I18n.t('addLocation')}
                </Button>
            </Box>
        </Box>
    );
};

export default LocationsTable;
