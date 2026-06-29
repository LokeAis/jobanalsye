import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PremiumProvider} from './premium/PremiumContext';
import {FeedbackProvider} from './ui/Feedback';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeedbackProvider>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </FeedbackProvider>
  </StrictMode>,
);
