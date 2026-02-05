import { Request, Response, NextFunction } from 'express';
import { productService, CreateProductData, UpdateProductData } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { logger } from '../config/logger';

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;
      const createData: CreateProductData = {
        name,
        price: parseFloat(price),
        stock: stock !== undefined && stock !== '' ? parseInt(String(stock), 10) : 0,
        userId: req.user.userId,
      };
      if (description !== undefined) createData.description = description;
      if (imageUrl !== undefined) createData.imageUrl = imageUrl;
      const product = await productService.createProduct(createData);

      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      logger.error('Create product error', error);
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (id === undefined) {
        sendError(res, 'Product ID required', 400);
        return;
      }
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      const product = await productService.getProductById(productId);
      if (!product) {
        sendError(res, 'Product not found', 404);
        return;
      }

      sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      logger.error('Get product error', error);
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string || '10', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await productService.getAllProducts(limit, offset);
      
      sendSuccess(res, result, 'Products retrieved successfully');
    } catch (error) {
      logger.error('Get all products error', error);
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (id === undefined) {
        sendError(res, 'Product ID required', 400);
        return;
      }
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;
      const updateData: UpdateProductData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(String(price));
      if (stock !== undefined) updateData.stock = parseInt(String(stock), 10);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      const product = await productService.updateProduct(productId, updateData, req.user.userId);

      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      logger.error('Update product error', error);
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (id === undefined) {
        sendError(res, 'Product ID required', 400);
        return;
      }
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      await productService.deleteProduct(productId, req.user.userId);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      logger.error('Delete product error', error);
      next(error);
    }
  }

  async getMyProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const products = await productService.getProductsByUserId(req.user.userId);
      sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      logger.error('Get my products error', error);
      next(error);
    }
  }
}

export const productController = new ProductController();

