import { NextRequest, NextResponse } from 'next/server';
import { getMerchantById, getAllMerchants } from '@/lib/data/merchants';
import { allProducts } from '@/lib/data/products';

export const dynamic = 'force-dynamic';

/**
 * AI-readable catalog endpoint.
 * 
 * GET /api/agent/catalog?merchant=herbamed
 * 
 * Returns structured, machine-readable catalog data for a merchant.
 */
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get('merchant');

  if (!merchantId) {
    // Return index of all merchants with catalog endpoints
    const merchants = getAllMerchants();
    return NextResponse.json({
      _type: 'CatalogIndex',
      _description: 'AI-readable merchant catalog index. Use individual merchant endpoints for full product data.',
      merchants: merchants.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        catalogEndpoint: m.catalogEndpoint || null,
        transactionReady: m.transactionReady,
        aiReadable: m.aiReadable,
        productCount: (allProducts[m.id] || []).length,
      })),
    });
  }

  const merchant = getMerchantById(merchantId);
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
  }

  const products = allProducts[merchantId] || [];

  return NextResponse.json({
    _type: 'MerchantCatalog',
    _version: '1.0',
    _description: 'Machine-readable product catalog with pricing, inventory, variants, reviews, and policies.',
    merchant: {
      id: merchant.id,
      name: merchant.name,
      description: merchant.description,
      category: merchant.category,
      transactionReady: merchant.transactionReady,
      supportedPaymentMethods: merchant.supportedPaymentMethods,
    },
    policies: merchant.policies,
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      pricing: {
        price: p.price,
        currency: p.currency,
      },
      inventory: {
        stock: p.stock,
        inStock: p.stock > 0,
      },
      variants: p.variants,
      attributes: p.attributes,
      reviews: p.reviews,
      relatedProducts: p.relatedProducts,
      compatibilityTags: p.compatibilityTags,
      isActive: p.isActive,
    })),
    transactionCapability: {
      canCreateOrder: merchant.transactionReady,
      orderEndpoint: merchant.transactionReady ? '/api/razorpay/order' : null,
      paymentMethods: merchant.supportedPaymentMethods,
      currency: 'INR',
    },
    _generatedAt: new Date().toISOString(),
  });
}
