import React from 'react';
import { GenericApp, GenericAppProps, GenericAppState, AdminConnection, I18n } from '@iobroker/adapter-react-v5';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { Box, Tab, Tabs } from '@mui/material';
import SettingsPanel from './components/SettingsPanel';
import WidgetsTable from './components/WidgetsTable';
import { OpenMeteoConfig } from './types';

import en from './i18n/en.json';
import de from './i18n/de.json';

interface AppState extends GenericAppState {
    native: OpenMeteoConfig;
    tab: number;
}

class App extends GenericApp<GenericAppProps, AppState> {
    constructor(props: GenericAppProps) {
        super(props, {
            encryptedFields: [],
            Connection: AdminConnection,
            translations: { en, de },
        } as any);
    }

    onPrepareSave(settings: Record<string, any>): boolean {
        super.onPrepareSave(settings);
        return true;
    }

    validateConfig(native: OpenMeteoConfig): void {
        const locInvalid = (native.locations || []).some(loc => !loc.name?.trim());
        if (locInvalid) {
            this.setConfigurationError(I18n.t('locationNameRequired'));
            return;
        }
        const warningsActive = native.warnStorm || native.warnThunderstorm;
        if (warningsActive && (native.updateInterval || 60) > 60) {
            this.setConfigurationError(I18n.t('warnNeedsHourlyInterval'));
            return;
        }
        if (warningsActive && (native.warnLeadHours ?? 2) > 24) {
            this.setConfigurationError(I18n.t('warnLeadHoursTooHigh'));
            return;
        }
        if (native.warnDwd && !native.enableDwd) {
            this.setConfigurationError(I18n.t('warnDwdNeedsEnabled'));
            return;
        }

        this.setConfigurationError('');
    }

    render(): React.JSX.Element {
        if (!this.state.loaded) {
            return super.render();
        }

        const tab = (this.state as any).tab ?? 0;
        const native = this.state.native as OpenMeteoConfig;

        const handleChange = (newNative: OpenMeteoConfig): void => {
            this.validateConfig(newNative);
            this.setState({
                native: newNative as any,
                changed: this.getIsChanged(newNative as any),
            });
        };

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: 'background.default', color: 'text.primary' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                            <Tabs value={tab} onChange={(_, v) => this.setState({ tab: v } as any)}>
                                <Tab label={I18n.t('tabSettings')} />
                                <Tab label={I18n.t('tabWidgets')} />
                            </Tabs>
                        </Box>
                        <div style={{ flex: 1, overflowY: 'auto', margin: 16, width: 'calc(100% - 32px)', paddingBottom: 120 }}>
                            {tab === 0 && (
                                <SettingsPanel
                                    native={native}
                                    onChange={handleChange}
                                    themeType={this.state.themeType}
                                />
                            )}
                            {tab === 1 && (
                                <WidgetsTable
                                    widgets={native.widgets || []}
                                    locations={native.locations || []}
                                    onChange={wgts => handleChange({ ...native, widgets: wgts })}
                                />
                            )}
                        </div>
                        {this.renderError()}
                        {this.renderSaveCloseButtons()}
                    </Box>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export default App;
