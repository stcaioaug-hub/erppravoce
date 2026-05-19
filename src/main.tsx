import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ThemeProvider } from './contexts/ThemeContext';

const updateSW = registerSW({
  onNeedRefresh() {
    // Optionally handle update
  },
  onOfflineReady() {
    // Optionally handle offline ready
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

