import { NextRequest, NextResponse } from 'next/server';
import { allProducts, getProductById, searchProductsInCatalog } from '@/lib/data/products';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products?merchant=herbamed&search=whey&category=protein&maxPrice=5000
 */
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get('merchant');
  const search = req.nextUrl.searchParams.get('search');
  const category = req.nextUrl.searchParams.get('category');
  const maxPrice = req.nextUrl.searchParams.get('maxPrice');
  const productId = req.nextUrl.searchParams.get('id');

  // Single product lookup
  if (productId && merchantId) {
    const product = getProductById(merchantId, productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  // Search/filter
  if (search) {
    const merchantIds = merchantId ? [merchantId] : Object.keys(allProducts);
    const results = merchantIds.flatMap(mId =>
      searchProductsInCatalog(mId, search, category || undefined, maxPrice ? parseInt(maxPrice) : undefined)
    );
    return NextResponse.json({ products: results, count: results.length });
  }

  // List all products for a merchant
  if (merchantId) {
    const products = allProducts[merchantId] || [];
    return NextResponse.json({ products, count: products.length, merchantId });
  }

  // List all products
  const allFlat = Object.entries(allProducts).map(([mId, products]) => ({
    merchantId: mId,
    products,
    count: products.length,
  }));

  return NextResponse.json({
    merchants: allFlat,
    totalProducts: allFlat.reduce((sum, m) => sum + m.count, 0),
  });
}
