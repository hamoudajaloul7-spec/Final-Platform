import { Request, Response } from 'express';
import StoreSlider from '@models/StoreSlider';
import Store from '@models/Store';
import logger from '@utils/logger';

export const getStoreSliders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const sliders = await StoreSlider.findAll({
      where: { storeId: store.id },
      order: [['sortOrder', 'ASC']],
    });

    res.json({ success: true, data: sliders.map(s => s.toJSON()) });
  } catch (error) {
    logger.error('Error fetching store sliders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sliders' });
  }
};

export const createStoreSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { title, subtitle, buttonText, imagePath, sortOrder, metadata } = req.body;

    if (!title || !imagePath) {
      res.status(400).json({ success: false, error: 'title and imagePath are required' });
      return;
    }

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const slider = await StoreSlider.create({
      storeId: store.id,
      title: title.slice(0, 255),
      subtitle: subtitle ? subtitle.slice(0, 512) : undefined,
      buttonText: buttonText ? buttonText.slice(0, 128) : undefined,
      imagePath: imagePath,
      sortOrder: sortOrder || 0,
      metadata: metadata || null,
    });

    logger.info(`Slider created for store ${storeId}: ${slider.id}`);
    res.status(201).json({ success: true, data: slider });
  } catch (error) {
    logger.error('Error creating store slider:', error);
    res.status(500).json({ success: false, error: 'Failed to create slider' });
  }
};

export const updateStoreSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, sliderId } = req.params;
    const { title, subtitle, buttonText, imagePath, sortOrder, metadata } = req.body;

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const slider = await StoreSlider.findOne({
      where: { id: sliderId, storeId: store.id },
    });

    if (!slider) {
      res.status(404).json({ success: false, error: 'Slider not found' });
      return;
    }

    await slider.update({
      ...(title && { title: title.slice(0, 255) }),
      ...(subtitle !== undefined && { subtitle: subtitle ? subtitle.slice(0, 512) : null }),
      ...(buttonText !== undefined && { buttonText: buttonText ? buttonText.slice(0, 128) : null }),
      ...(imagePath && { imagePath: imagePath }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(metadata !== undefined && { metadata }),
    });

    logger.info(`Slider updated: ${sliderId}`);
    res.json({ success: true, data: slider });
  } catch (error) {
    logger.error('Error updating store slider:', error);
    res.status(500).json({ success: false, error: 'Failed to update slider' });
  }
};

export const deleteStoreSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, sliderId } = req.params;

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const slider = await StoreSlider.findOne({
      where: { id: sliderId, storeId: store.id },
    });

    if (!slider) {
      res.status(404).json({ success: false, error: 'Slider not found' });
      return;
    }

    await slider.destroy();

    logger.info(`Slider deleted: ${sliderId}`);
    res.json({ success: true, message: 'Slider deleted successfully' });
  } catch (error) {
    logger.error('Error deleting store slider:', error);
    res.status(500).json({ success: false, error: 'Failed to delete slider' });
  }
};

export const bulkDeleteStoreSliders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { sliderIds } = req.body;

    if (!sliderIds || !Array.isArray(sliderIds)) {
      res.status(400).json({ success: false, error: 'sliderIds must be an array' });
      return;
    }

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const deleted = await StoreSlider.destroy({
      where: { storeId: store.id, id: sliderIds },
    });

    logger.info(`${deleted} sliders deleted for store ${storeId}`);
    res.json({ success: true, message: `${deleted} sliders deleted` });
  } catch (error) {
    logger.error('Error bulk deleting store sliders:', error);
    res.status(500).json({ success: false, error: 'Failed to delete sliders' });
  }
};

export const updateSlidersOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { sliders } = req.body;

    if (!Array.isArray(sliders)) {
      res.status(400).json({ success: false, error: 'sliders must be an array' });
      return;
    }

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    for (const slider of sliders) {
      await StoreSlider.update(
        { sortOrder: slider.sortOrder },
        { where: { id: slider.id, storeId: store.id } }
      );
    }

    logger.info(`Sliders order updated for store ${storeId}`);
    res.json({ success: true, message: 'Sliders order updated successfully' });
  } catch (error) {
    logger.error('Error updating sliders order:', error);
    res.status(500).json({ success: false, error: 'Failed to update sliders order' });
  }
};

export const uploadSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const numericStoreId = Number(storeId);

    let store = Number.isFinite(numericStoreId)
      ? await Store.findByPk(numericStoreId)
      : null;
    if (!store) {
      store = await Store.findOne({
        where: { slug: storeId }
      });
    }
    if (!store) {
      store = await Store.findOne({
        where: { merchantId: storeId }
      });
    }
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const imagePath = `/assets/${store.id}/sliders/${req.file.filename}`;

    logger.info(`Slider image uploaded for store ${storeId}: ${req.file.filename}`);
    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        imagePath: imagePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error('Error uploading slider image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
};

