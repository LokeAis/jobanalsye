import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PremiumProvider} from './premium/PremiumContext';
import {AuthProvider} from './auth/AuthContext';
import {FeedbackProvider} from './ui/Feedback';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeedbackProvider>
      <AuthProvider>
        <PremiumProvider>
          <App />
        </PremiumProvider>
      </AuthProvider>
    </FeedbackProvider>
  </StrictMode>,
);
