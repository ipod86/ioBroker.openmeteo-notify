import React from 'react';
import { GenericApp, GenericAppProps, GenericAppState, AdminConnection, I18n } from '@iobroker/adapter-react-v5';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { Box, Tab, Tabs } from '@mui/material';
import SettingsPanel from './components/SettingsPanel';
import WarningsPanel from './components/WarningsPanel';
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
        const daysCount = native.daysCount ?? 7;
        if (daysCount < 1 || daysCount > 16) {
            this.setConfigurationError(I18n.t('validRange', '1–16'));
            return;
        }
        const hourlyDays = native.hourlyDays ?? 3;
        if (hourlyDays < 0 || hourlyDays > daysCount) {
            this.setConfigurationError(I18n.t('hourlyDaysExceedsDaysCount'));
            return;
        }
        const warningsActive = native.warnStorm || native.warnThunderstorm || native.warnFrost;
        if (warningsActive) {
            const leadHours = native.warnLeadHours ?? 2;
            if (leadHours < 1 || leadHours > 24) {
                this.setConfigurationError(I18n.t('validRange', '1–24'));
                return;
            }
        }
        if (native.warnFrost) {
            const threshold = native.warnFrostThreshold ?? 0;
            if (threshold < -20 || threshold > 5) {
                this.setConfigurationError(I18n.t('validRange', '−20–5'));
                return;
            }
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
                                <Tab label={I18n.t('tabGeneral')} />
                                <Tab label={I18n.t('tabNotifications')} />
                                <Tab label={I18n.t('tabWidgets')} />
                            </Tabs>
                        </Box>
                        <div style={{ flex: 1, overflowY: 'auto', margin: 16, width: 'calc(100% - 32px)', paddingBottom: 120 }}>
                            {tab === 0 && (
                                <SettingsPanel
                                    native={native}
                                    onChange={handleChange}
                                    themeType={this.state.themeType}
                                    namespace={`${(this as any).adapterName ?? 'openmeteo-notify'}.${(this as any).instance ?? 0}`}
                                />
                            )}
                            {tab === 1 && (
                                <WarningsPanel
                                    native={native}
                                    onChange={handleChange}
                                />
                            )}
                            {tab === 2 && (
                                <WidgetsTable
                                    widgets={native.widgets || []}
                                    locations={native.locations || []}
                                    daysCount={native.daysCount ?? 7}
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
