import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { allProducts, searchProductsInCatalog, getProductById } from '../../data/products';

export const searchProducts = tool(
  async (input) => {
    const results: Array<{
      merchantId: string;
      productId: string;
      name: string;
      price: number;
      currency: string;
      rating: number;
      reviewCount: number;
      stock: number;
      category: string;
      description: string;
    }> = [];

    const merchantIds = input.merchantId ? [input.merchantId] : Object.keys(allProducts);

    for (const mId of merchantIds) {
      const found = searchProductsInCatalog(mId, input.query, input.category, input.maxPrice);
      for (const p of found) {
        results.push({
          merchantId: mId,
          productId: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency,
          rating: p.reviews.rating,
          reviewCount: p.reviews.reviewCount,
          stock: p.stock,
          category: p.category,
          description: p.description.substring(0, 150),
        });
      }
    }

    return JSON.stringify({
      query: input.query,
      resultsCount: results.length,
      results: results.slice(0, 20),
    });
  },
  {
    name: 'search_products',
    description: 'Search products across merchant catalogs by keyword, category, and price range. Returns matching products with key details.',
    schema: z.object({
      query: z.string().describe('Search query (product name, category, or use case)'),
      category: z.string().optional().describe('Filter by category'),
      maxPrice: z.number().optional().describe('Maximum price in INR'),
      merchantId: z.string().optional().describe('Filter by specific merchant ID'),
    }),
  }
);

export const getProduct = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found', productId: input.productId, merchantId: input.merchantId });
    }
    return JSON.stringify(product);
  },
  {
    name: 'get_product',
    description: 'Get full product details including description, variants, attributes, reviews, and related products.',
    schema: z.object({
      productId: z.string().describe('The product ID'),
      merchantId: z.string().describe('The merchant ID'),
    }),
  }
);

export const getInventory = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found' });
    }
    return JSON.stringify({
      productId: product.id,
      name: product.name,
      totalStock: product.stock,
      inStock: product.stock > 0,
      variants: product.variants.map(v => ({
        id: v.id,
        name: v.name,
        stock: v.stock,
        inStock: v.stock > 0,
      })),
    });
  },
  {
    name: 'get_inventory',
    description: 'Check stock/inventory status for a specific product and its variants.',
    schema: z.object({
      productId: z.string().describe('The product ID'),
      merchantId: z.string().describe('The merchant ID'),
    }),
  }
);

export const getReviews = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found' });
    }
    return JSON.stringify({
      productId: product.id,
      name: product.name,
      rating: product.reviews.rating,
      reviewCount: product.reviews.reviewCount,
      highlights: product.reviews.highlights || [],
      ratingBreakdown: {
        excellent: Math.round(product.reviews.reviewCount * 0.4),
        good: Math.round(product.reviews.reviewCount * 0.3),
        average: Math.round(product.reviews.reviewCount * 0.15),
        poor: Math.round(product.reviews.reviewCount * 0.1),
        terrible: Math.round(product.reviews.reviewCount * 0.05),
      },
    });
  },
  {
    name: 'get_reviews',
    description: 'Get review summary for a product including rating, count, highlights, and breakdown.',
    schema: z.object({
      productId: z.string().describe('The product ID'),
      merchantId: z.string().describe('The merchant ID'),
    }),
  }
);
