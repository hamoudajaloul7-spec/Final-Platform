import { Router } from 'express'; 
import { findStoreBySlug, findStoreByName, findUsersByEmails } from '../services/storeService';
import { sendSuccess, sendError } from '@utils/response';

const router = Router();

/**
 * GET /api/stores-exists
 * Health check / browser test endpoint
 */
router.get('/stores-exists', (_req, res) => {
    sendSuccess(res, { 
        message: 'Stores existence check endpoint is live. Use POST to verify a specific store.',
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/stores-exists
 * Real check for store existence in database
 */
router.post('/stores-exists', async (req, res) => { 
    const { storeSlug, storeName, email1, email2 } = req.body;

    if (!storeSlug && !storeName && !email1 && !email2) { 
        return sendError(res, 'At least one identifier (slug, name, or email) is required', 400); 
    }

    try { 
        const results: any = {
            exists: false
        };

        // Check store by slug
        if (storeSlug) {
            const storeBySlug = await findStoreBySlug(storeSlug);
            if (storeBySlug) {
                results.exists = true;
                results.store = storeBySlug;
            }
        }

        // Check store by name (if not already found by slug)
        if (!results.exists && storeName) {
            const storeByName = await findStoreByName(storeName);
            if (storeByName) {
                results.exists = true;
                results.store = storeByName;
            }
        }

        // Check users by emails
        const emailsToCheck = [email1, email2].filter(Boolean);
        if (emailsToCheck.length > 0) {
            const users = await findUsersByEmails(emailsToCheck);
            if (users.length > 0) {
                results.exists = true;
                results.emails = users.map(u => ({ email: u.email }));
            }
        }

        sendSuccess(res, results);
    } catch (err) { 
        console.error('stores-exists error', err); 
        sendError(res, 'Internal server error', 500); 
    } 
});

export default router;
