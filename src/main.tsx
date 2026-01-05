import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { removeStoreCompletely } from '@/data/ecommerceData'

declare global {
  interface Window {
    removeStore: (slug: string) => void;
  }
}

window.removeStore = (slug: string) => {
  removeStoreCompletely(slug);
  setTimeout(() => window.location.reload(), 2000);
};

createRoot(document.getElementById('root')!).render(
  <App />
)
