import { z } from 'zod';

export const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  attributes: z.record(z.string(), z.string()).optional(),
});

export const ReviewSummarySchema = z.object({
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  highlights: z.array(z.string()).optional(),
});

export const ProductAttributeSchema = z.object({
  key: z.string(),
  value: z.string(),
  unit: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('INR'),
  stock: z.number().int().nonnegative(),
  variants: z.array(VariantSchema).default([]),
  attributes: z.array(ProductAttributeSchema).default([]),
  reviews: ReviewSummarySchema,
  relatedProducts: z.array(z.string()).default([]),
  compatibilityTags: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  costPrice: z.number().positive().optional(),
  marginPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
});

export type Variant = z.infer<typeof VariantSchema>;
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;
export type Product = z.infer<typeof ProductSchema>;
