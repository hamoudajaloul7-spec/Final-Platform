import { Router } from 'express'; 
import { findStoreBySlug } from '../services/storeService';

const router = Router();

/**
 * GET /api/stores-exists
 * Health check / browser test endpoint
 */
router.get('/stores-exists', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Stores existence check endpoint is live. Use POST to verify a specific store.',
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/stores-exists
 * Real check for store existence in database
 */
router.post('/stores-exists', async (req, res) => { 
    const { storeSlug } = req.body;

    if (!storeSlug) { 
        return res.status(400).json({ success: false, error: 'storeSlug is required' }); 
    }

    try { 
        const store = await findStoreBySlug(storeSlug); 
        res.json({ 
            success: true, 
            exists: !!store, 
            storeId: store?.id ?? null 
        });
    } catch (err) { 
        console.error('check-exists error', err); 
        res.status(500).json({ success: false, error: 'internal_error' }); 
    } 
});

export default router;
