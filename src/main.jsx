import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cinzel-decorative/latin-400.css';
import '@fontsource/cinzel-decorative/latin-700.css';
import '@fontsource/great-vibes/latin-400.css';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
