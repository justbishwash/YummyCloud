import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initOneSignal } from './utils/onesignal';
import useAppStore from './store/useAppStore';

initOneSignal();

useAppStore.getState().fetchSettings().then(() => {
  document.title = useAppStore.getState().appName;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
