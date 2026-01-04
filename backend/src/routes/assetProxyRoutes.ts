import { Router, Request, Response } from 'express';
import logger from '@utils/logger';

const router = Router();

interface AssetProxyRequest extends Request {
  params: {
    storeSlug: string;
    imageType: string;
    fileName: string;
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wbakbuqvdbmweujkbzxn.supabase.co';
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'ishro-assets';

router.get('/:storeSlug/:imageType/:fileName', async (req: AssetProxyRequest, res: Response) => {
  try {
    const { storeSlug, imageType, fileName } = req.params;

    if (!storeSlug || !imageType || !fileName) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const allowedImageTypes = ['products', 'sliders', 'logo'];
    if (!allowedImageTypes.includes(imageType)) {
      res.status(400).json({ error: 'Invalid image type' });
      return;
    }

    const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${storeSlug}/${imageType}/${fileName}`;

    logger.info(`🔗 Proxying asset: ${supabaseUrl}`);

    const response = await fetch(supabaseUrl);

    if (!response.ok) {
      logger.error(`❌ Failed to fetch asset from Supabase: ${response.status}`);
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    logger.error('Error proxying asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
