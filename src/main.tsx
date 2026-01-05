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
  const disableContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const disableKeyboard = (e: KeyboardEvent) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'I'))) {
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
