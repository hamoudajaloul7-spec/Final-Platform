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

router.get('/proxy', async (req: Request, res: Response) => {
  try {
    const src = req.query.src as string;

    if (!src) {
      res.status(400).json({ error: 'Missing src parameter' });
      return;
    }

    // Decode URL if needed
    const imageUrl = src.startsWith('http') ? src : decodeURIComponent(src);

    logger.info(`🔗 Proxying generic asset: ${imageUrl}`);

    const response = await fetch(imageUrl);

    if (!response.ok) {
      logger.error(`❌ Failed to fetch asset: ${response.status}`);
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set caching for 1 year for performance
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    logger.error('Error in generic proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.options('/:storeSlug/:imageType/:fileName', (req: AssetProxyRequest, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

router.get('/:storeSlug/:imageType/:fileName', async (req: AssetProxyRequest, res: Response) => {
  try {
    const { storeSlug, imageType, fileName } = req.params;

    if (!storeSlug || !imageType || !fileName) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const allowedImageTypes = ['products', 'sliders', 'logo', 'ads', 'DiscountSlider'];
    if (!allowedImageTypes.includes(imageType)) {
      res.status(400).json({ error: 'Invalid image type' });
      return;
    }

    const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/stores/${storeSlug}/${imageType}/${fileName}`;

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
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
