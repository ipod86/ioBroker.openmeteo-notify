import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

declare global {
    interface Window {
        adapterName: string;
        sentryDSN: string;
    }
}

window.adapterName = 'openmeteo-notify';
window.sentryDSN = '';

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
}
