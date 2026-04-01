import React from 'react';
import { GenericApp, GenericAppProps, GenericAppState, AdminConnection, I18n } from '@iobroker/adapter-react-v5';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import SettingsPanel from './components/SettingsPanel';
import { OpenMeteoConfig } from './types';

import en from './i18n/en.json';
import de from './i18n/de.json';

interface AppState extends GenericAppState {
    native: OpenMeteoConfig;
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

    render(): React.JSX.Element {
        if (!this.state.loaded) {
            return super.render();
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflowY: 'auto', margin: 16, width: 'calc(100% - 32px)', paddingBottom: 8 }}>
                            <SettingsPanel
                                native={this.state.native as OpenMeteoConfig}
                                onChange={(newNative: OpenMeteoConfig) => {
                                    this.setState({
                                        native: newNative as any,
                                        changed: this.getIsChanged(newNative as any),
                                    });
                                }}
                                themeType={this.state.themeType}
                            />
                        </div>
                        {this.renderError()}
                        {this.renderSaveCloseButtons()}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export default App;
