import { Router } from 'express'; 
import { findStoreBySlug } from '../services/storeService';

const router = Router();

// GET /api/stores-exists (for testing)
router.get('/stores-exists', (req, res) => {
    res.json({ success: true, message: 'Stores existence check endpoint is live. Please use POST for actual check.' });
});

// POST /api/stores-exists 
router.post('/stores-exists', async (req, res) => { 
    const { storeSlug, storeName, email1, email2 } = req.body;

    if (!storeSlug) { 
      return res.status(400).json({ success: false, error: 'storeSlug is required' }); 
    }

    try { 
         const store = await findStoreBySlug(storeSlug); 
         res.json({ success: true, exists: !!store, storeId: store?.id ?? null });
    } catch (err) { 
        console.error('check-exists error', err); 
        res.status(500).json({ success: false, error: 'internal_error' }); 
    } 
});

export default router;
