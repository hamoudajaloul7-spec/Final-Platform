import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '@shared-types/index';
import Product from '@models/Product';
import ProductImage from '@models/ProductImage';
import Store from '@models/Store';
import { sendSuccess, sendCreated, sendError, sendNotFound, sendUnauthorized, sendPaginated } from '@utils/response';
import { calculatePagination } from '@utils/helpers';
import logger from '@utils/logger';
import { Op } from 'sequelize';

// دالة لحساب الـ badge للمنتج
const calculateBadgeForProduct = (product: any): string => {
  const views = product.views || 0;
  const likes = product.likes || 0;
  const orders = product.orders || 0;
  const quantity = product.quantity || 0;
  const originalPrice = product.originalPrice || product.price || 0;
  const price = product.price || 0;

  // 1. أولوية أولى: المنتجات غير المتوفرة
  if (quantity <= 0) {
    return 'غير متوفر';
  }

  // 2. ثانيوية ثانية: المنتجات المخفضة (تخفيض أكثر من 10%)
  if (originalPrice > price && ((originalPrice - price) / originalPrice) >= 0.1) {
    return 'تخفيضات';
  }

  // 3. ثالثوية ثالثة: المنتجات المميزة (طلبات عالية + إعجابات عالية)
  if (orders > 100 && likes > 200) {
    return 'مميزة';
  }

  // 4. رابعوية رابعة: أكثر مبيعاً (طلبات عالية)
  if (orders > 100) {
    return 'أكثر مبيعاً';
  }

  // 5. خامسة خامسة: أكثر إعجاباً (إعجابات عالية)
  if (likes > 200) {
    return 'أكثر إعجاباً';
  }

  // 6. سادسة سادسة: أكثر مشاهدة (مشاهدات عالية)
  if (views > 400) {
    return 'أكثر مشاهدة';
  }

  // 7. سابعة سابعة: أكثر طلباً (طلبات متوسطة)
  if (orders > 50) {
    return 'أكثر طلباً';
  }

  // 8. أخيراً: المنتجات الجديدة
  return 'جديد';
};

// دالة لتحديث الـ badge للمنتج
const updateProductBadge = async (product: Product): Promise<void> => {
  const calculatedBadge = calculateBadgeForProduct(product.toJSON());
  
  if (product.badge !== calculatedBadge) {
    await product.update({
      badge: calculatedBadge,
      lastBadgeUpdate: new Date()
    });
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    if (req.user.role === UserRole.CUSTOMER) {
      sendError(res, 'Only merchants and admins can create products', 403, 'FORBIDDEN');
      return;
    }

    const {
      name,
      description,
      price,
      quantity,
      stock,
      inStock,
      isAvailable,
      category,
      sku,
      images = [],
      brand,
      thumbnail,
    } = req.body;

    let storeId: number | undefined;

    if (req.user.role === UserRole.MERCHANT) {
      const store = await Store.findOne({ where: { merchantId: req.user.id } });
      if (!store) {
        sendError(res, 'Merchant store not found', 404, 'STORE_NOT_FOUND');
        return;
      }
      storeId = store.id;
    }

    const resolvedQuantity = quantity ?? stock ?? 0;
    const resolvedInStock = inStock ?? resolvedQuantity > 0;
    const resolvedIsAvailable = isAvailable ?? true;

    const product = await Product.create({
      storeId,
      name,
      description,
      price,
      quantity: resolvedQuantity,
      inStock: resolvedInStock,
      isAvailable: resolvedIsAvailable,
      category,
      sku,
      image: Array.isArray(images) && images.length > 0 ? images[0] : '',
      ...(brand !== undefined && { brand }),
      ...(thumbnail !== undefined && { thumbnail }),
    });

    if (Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((imageUrl: string, index: number) =>
          ProductImage.create({
            productId: product.id,
            imageUrl,
            sortOrder: index,
            isPrimary: index === 0,
          })
        )
      );
    }

    logger.info(`Product created: ${product.id} by user ${req.user.id}`);

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    sendCreated(res, createdProduct ?? product);
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
};

export const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', order = 'DESC', storeId, storeSlug } = req.query;
    const { page: validPage, limit: validLimit, offset } = calculatePagination(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10
    );

    let whereClause: any = {};

    if (storeId) {
      whereClause.storeId = parseInt(storeId as string);
    }

    if (storeSlug) {
      const store = await Store.findOne({ where: { slug: storeSlug as string } });
      if (store) {
        whereClause.storeId = store.id;
      }
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      offset,
      limit: validLimit,
      order: [[sortBy as string, order as string]],
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    // تحديث الـ badges للمنتجات من قاعدة البيانات (إنديش)
    const productsWithUpdatedBadges = await Promise.all(
      products.map(async (product) => {
        // ✅_FIX: Use type assertion to access included productImages
        const productData = (product as any).toJSON();
        
        // تحديث الـ badge إذا لزم الأمر
        await updateProductBadge(product);
        
        // ✅_FIX: تحويل productImages إلى images array للـ frontend
        if (productData.productImages && Array.isArray(productData.productImages)) {
          productData.images = productData.productImages
            .sort((a: any, b: any) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
            .map((img: any) => img?.imageUrl)
            .filter(Boolean);
        } else {
          productData.images = [];
        }
        
        // ✅_FIX: ضمان تعيين inStock و isAvailable
        const quantity = Number.isFinite(Number(productData.quantity)) ? Number(productData.quantity) : 0;
        productData.inStock = productData.inStock ?? (quantity > 0);
        productData.isAvailable = productData.isAvailable !== false && quantity > 0;
        
        // إضافة tags بناءً على الـ badge
        productData.tags = productData.tags || [];
        if (productData.badge && !productData.tags.includes(productData.badge)) {
          productData.tags.push(productData.badge);
        }
        
        return productData;
      })
    );

    logger.info(`Fetched ${products.length} products with updated badges`);

    sendPaginated(res, productsWithUpdatedBadges, validPage, validLimit, count);
  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
};

export const getProductById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = Number(req.params.productId);
    if (Number.isNaN(productId)) {
      sendError(res, 'Invalid product identifier', 400, 'INVALID_PRODUCT_ID');
      return;
    }

    const product = await Product.findByPk(productId, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    sendSuccess(res, product);
  } catch (error) {
    logger.error('Get product by ID error:', error);
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const productId = Number(req.params.productId);
    if (Number.isNaN(productId)) {
      sendError(res, 'Invalid product identifier', 400, 'INVALID_PRODUCT_ID');
      return;
    }

    const {
      name,
      description,
      price,
      originalPrice,
      discountPercent,
      discountType,
      discountStart,
      discountEnd,
      quantity,
      stock,
      inStock,
      isAvailable,
      category,
      images = [],
      brand,
      thumbnail,
    } = req.body;

    const product = await Product.findByPk(productId, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });
    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    if (req.user.role === UserRole.MERCHANT && product.storeId) {
      const store = await Store.findByPk(product.storeId);
      if (!store || store.merchantId !== req.user.id) {
        sendError(res, 'You do not have permission to update this product', 403, 'FORBIDDEN');
        return;
      }
    }

    const resolvedQuantity = quantity ?? stock;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (originalPrice !== undefined) updates.originalPrice = originalPrice;
    if (discountPercent !== undefined) updates.discountPercent = discountPercent;
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountStart !== undefined) updates.discountStart = discountStart;
    if (discountEnd !== undefined) updates.discountEnd = discountEnd;
    if (category !== undefined) updates.category = category;
    if (brand !== undefined) updates.brand = brand;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    if (resolvedQuantity !== undefined) {
      updates.quantity = resolvedQuantity;
      updates.inStock = inStock ?? resolvedQuantity > 0;
    } else if (inStock !== undefined) {
      updates.inStock = inStock;
    }

    await product.update(updates);

    if (Array.isArray(images)) {
      await ProductImage.destroy({ where: { productId: product.id } });
      if (images.length > 0) {
        await Promise.all(
          images.map((imageUrl: string, index: number) =>
            ProductImage.create({
              productId: product.id,
              imageUrl,
              sortOrder: index,
              isPrimary: index === 0,
            })
          )
        );
      }
    }

    await product.reload({ include: [{ model: ProductImage, as: 'productImages' }] });

    logger.info(`Product updated: ${product.id}`);

    sendSuccess(res, product);
  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const productId = Number(req.params.productId);
    if (Number.isNaN(productId)) {
      sendError(res, 'Invalid product identifier', 400, 'INVALID_PRODUCT_ID');
      return;
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }

    if (req.user.role === UserRole.MERCHANT && product.storeId) {
      const store = await Store.findByPk(product.storeId);
      if (!store || store.merchantId !== req.user.id) {
        sendError(res, 'You do not have permission to delete this product', 403, 'FORBIDDEN');
        return;
      }
    }

    await product.destroy();

    logger.info(`Product deleted: ${productId}`);

    sendSuccess(res, null, 200, 'Product deleted successfully');
  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
};


