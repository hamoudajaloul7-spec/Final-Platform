// Main entry point for the React application
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { removeStoreCompletely } from '@/data/ecommerceData'

declare global {
  interface Window {
    removeStore: (slug: string) => void;
  }
}

if (import.meta.env.PROD) {
  const devtoolsOpen = () => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      window.location.href = 'about:blank';
    }
  };

  setInterval(devtoolsOpen, 1000);

  const disableContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const disableKeyboard = (e: KeyboardEvent) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'Shift' && e.key === 'K')) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('contextmenu', disableContextMenu);
  document.addEventListener('keydown', disableKeyboard);
}

window.removeStore = (slug: string) => {
  removeStoreCompletely(slug);
  setTimeout(() => window.location.reload(), 2000);
};

createRoot(document.getElementById('root')!).render(
  <App />
)
