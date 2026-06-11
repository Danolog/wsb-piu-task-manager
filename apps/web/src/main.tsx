import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/space-mono/400.css';
import '@/styles/globals.css';
import { App } from '@/App';
import { AppProvider } from '@/app/AppProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Nie znaleziono elementu #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
