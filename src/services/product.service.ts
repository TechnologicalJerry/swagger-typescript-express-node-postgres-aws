import { Product, ProductCreationAttributes } from '../models/product.model';
import { logger } from '../config/logger';

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  userId: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export class ProductService {
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const productData: ProductCreationAttributes = {
        name: data.name,
        price: data.price,
        stock: data.stock ?? 0,
        userId: data.userId,
      };
      if (data.description !== undefined) productData.description = data.description;
      if (data.imageUrl !== undefined) productData.imageUrl = data.imageUrl;

      const product = await Product.create(productData);
      return product;
    } catch (error) {
      logger.error('Error creating product', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const product = await Product.findByPk(id, {
        include: ['user'],
      });
      return product;
    } catch (error) {
      logger.error('Error getting product by ID', error);
      throw error;
    }
  }

  async getAllProducts(limit = 10, offset = 0): Promise<{ products: Product[]; total: number }> {
    try {
      const { rows: products, count: total } = await Product.findAndCountAll({
        limit,
        offset,
        include: ['user'],
        order: [['createdAt', 'DESC']],
      });

      return { products, total };
    } catch (error) {
      logger.error('Error getting all products', error);
      throw error;
    }
  }

  async updateProduct(id: number, data: UpdateProductData, userId: number): Promise<Product> {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if user owns the product
      if (product.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own products');
      }

      await product.update(data);
      return product;
    } catch (error) {
      logger.error('Error updating product', error);
      throw error;
    }
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if user owns the product
      if (product.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own products');
      }

      await product.destroy();
    } catch (error) {
      logger.error('Error deleting product', error);
      throw error;
    }
  }

  async getProductsByUserId(userId: number): Promise<Product[]> {
    try {
      const products = await Product.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      return products;
    } catch (error) {
      logger.error('Error getting products by user ID', error);
      throw error;
    }
  }
}

export const productService = new ProductService();

