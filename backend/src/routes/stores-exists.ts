import { Router } from 'express';
// Replace with your actual DB/service lookup
// import { findStoreBySlug } from '../../services/storeService';

const router = Router();

// POST /api/stores-exists
router.post('/stores-exists', async (req, res) => {
  const { storeSlug, storeName, email1, email2 } = req.body;

  if (!storeSlug) {
    return res.status(400).json({ success: false, error: 'storeSlug is required' });
  }

  try {
    // const store = await findStoreBySlug(storeSlug);
    const store = null; // placeholder until DB service wired
    res.json({ success: true, exists: !!store, storeId: store?.id ?? null });
  } catch (err) {
    console.error('check-exists error', err);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

export default router;
