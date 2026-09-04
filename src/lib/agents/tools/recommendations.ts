import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getProductById, allProducts } from '../../data/products';

export const findRelatedProducts = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found' });
    }

    const related = product.relatedProducts
      .map(relId => getProductById(input.merchantId, relId))
      .filter(Boolean)
      .map(p => ({
        id: p!.id,
        name: p!.name,
        price: p!.price,
        category: p!.category,
        rating: p!.reviews.rating,
        reviewCount: p!.reviews.reviewCount,
        stock: p!.stock,
        inStock: p!.stock > 0,
      }));

    return JSON.stringify({
      sourceProduct: { id: product.id, name: product.name },
      relatedProducts: related,
      count: related.length,
    });
  },
  {
    name: 'find_related_products',
    description: 'Find products related to a given product within the same merchant catalog.',
    schema: z.object({
      productId: z.string().describe('The source product ID'),
      merchantId: z.string().describe('The merchant ID'),
    }),
  }
);

export const generateUpsellCandidates = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found' });
    }

    const merchantProducts = allProducts[input.merchantId] || [];
    
    // Find products in the same category with higher price/value
    const candidates = merchantProducts
      .filter(p => 
        p.id !== product.id &&
        p.category === product.category &&
        p.price > product.price &&
        p.stock > 0 &&
        p.isActive
      )
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceDelta: p.price - product.price,
        priceDeltaPercent: Math.round(((p.price - product.price) / product.price) * 100),
        rating: p.reviews.rating,
        reviewCount: p.reviews.reviewCount,
        stock: p.stock,
        advantages: p.attributes
          .filter(a => !product.attributes.find(pa => pa.key === a.key && pa.value === a.value))
          .map(a => `${a.key}: ${a.value}${a.unit ? ' ' + a.unit : ''}`),
        compatibilityTags: p.compatibilityTags,
      }))
      .sort((a, b) => a.priceDelta - b.priceDelta); // Sort by smallest price increase first

    return JSON.stringify({
      sourceProduct: { id: product.id, name: product.name, price: product.price },
      customerGoal: input.customerGoal || 'not specified',
      budget: input.budget || 0,
      candidates: candidates.slice(0, 3),
      count: candidates.length,
    });
  },
  {
    name: 'generate_upsell_candidates',
    description: 'Generate upsell recommendations — higher-value alternatives in the same category. Returns products with price delta and advantages.',
    schema: z.object({
      productId: z.string().describe('The current product ID'),
      merchantId: z.string().describe('The merchant ID'),
      customerGoal: z.string().optional().describe('Customer goal (e.g., "muscle building")'),
      budget: z.number().optional().describe('Customer budget in INR'),
    }),
  }
);

export const generateCrossSellCandidates = tool(
  async (input) => {
    const product = getProductById(input.merchantId, input.productId);
    if (!product) {
      return JSON.stringify({ error: 'Product not found' });
    }

    const merchantProducts = allProducts[input.merchantId] || [];
    
    // Find complementary products from different categories that share compatibility tags
    const candidates = merchantProducts
      .filter(p => {
        if (p.id === product.id) return false;
        if (p.category === product.category && p.subcategory === product.subcategory) return false;
        if (p.stock <= 0 || !p.isActive) return false;
        
        // Must share at least one compatibility tag
        const sharedTags = p.compatibilityTags.filter(t => 
          product.compatibilityTags.includes(t)
        );
        return sharedTags.length > 0;
      })
      .map(p => {
        const sharedTags = p.compatibilityTags.filter(t => 
          product.compatibilityTags.includes(t)
        );
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          rating: p.reviews.rating,
          reviewCount: p.reviews.reviewCount,
          stock: p.stock,
          relevanceScore: sharedTags.length,
          sharedTags,
          complementaryReason: `Complements ${product.name} for ${sharedTags.join(', ')}`,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return JSON.stringify({
      sourceProduct: { id: product.id, name: product.name, price: product.price },
      customerGoal: input.customerGoal || 'not specified',
      budget: input.budget || 0,
      candidates: candidates.slice(0, 5),
      count: candidates.length,
    });
  },
  {
    name: 'generate_cross_sell_candidates',
    description: 'Generate cross-sell recommendations — complementary products from different categories that share compatibility tags with the current product.',
    schema: z.object({
      productId: z.string().describe('The current product ID'),
      merchantId: z.string().describe('The merchant ID'),
      customerGoal: z.string().optional().describe('Customer goal'),
      budget: z.number().optional().describe('Customer remaining budget in INR'),
    }),
  }
);
