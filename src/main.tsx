import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PremiumProvider} from './premium/PremiumContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumProvider>
      <App />
    </PremiumProvider>
  </StrictMode>,
);
