import { Product } from '../schemas/product';

// ============================================================
// HERBAMED SOLUTIONS - Full AI-readable catalog
// ============================================================
export const herbamedProducts: Product[] = [
  {
    id: 'hm-whey-001',
    merchantId: 'herbamed',
    name: 'HerbaMed Whey Protein',
    description: 'High-quality whey protein concentrate with 24g protein per serving. Supports muscle recovery and growth. Available in chocolate and vanilla flavors.',
    category: 'protein',
    subcategory: 'whey-protein',
    price: 4299,
    currency: 'INR',
    stock: 150,
    variants: [
      { id: 'hm-whey-001-choc-1kg', name: 'Chocolate 1kg', price: 4299, stock: 80, attributes: { flavor: 'chocolate', weight: '1kg' } },
      { id: 'hm-whey-001-van-1kg', name: 'Vanilla 1kg', price: 4299, stock: 50, attributes: { flavor: 'vanilla', weight: '1kg' } },
      { id: 'hm-whey-001-choc-2kg', name: 'Chocolate 2kg', price: 7999, stock: 20, attributes: { flavor: 'chocolate', weight: '2kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '24', unit: 'g' },
      { key: 'servingsPerContainer', value: '30' },
      { key: 'type', value: 'Whey Concentrate' },
      { key: 'suitableFor', value: 'Muscle Building, Recovery' },
      { key: 'allergens', value: 'Milk, Soy' },
    ],
    reviews: { rating: 4.1, reviewCount: 4820, highlights: ['Good taste', 'Mixes well', 'Affordable'] },
    relatedProducts: ['hm-premium-whey-002', 'hm-recovery-005', 'hm-bars-007'],
    compatibilityTags: ['muscle-building', 'recovery', 'post-workout', 'weight-gain'],
    isActive: true,
  },
  {
    id: 'hm-premium-whey-002',
    merchantId: 'herbamed',
    name: 'HerbaMed Premium Whey Protein',
    description: 'Premium whey protein isolate with 28g protein per serving, low carb, enriched with digestive enzymes. Superior absorption and muscle synthesis support.',
    category: 'protein',
    subcategory: 'whey-protein',
    price: 4999,
    currency: 'INR',
    stock: 80,
    variants: [
      { id: 'hm-pwhey-002-choc-1kg', name: 'Rich Chocolate 1kg', price: 4999, stock: 40, attributes: { flavor: 'rich-chocolate', weight: '1kg' } },
      { id: 'hm-pwhey-002-van-1kg', name: 'French Vanilla 1kg', price: 4999, stock: 25, attributes: { flavor: 'french-vanilla', weight: '1kg' } },
      { id: 'hm-pwhey-002-coffee-1kg', name: 'Coffee Mocha 1kg', price: 4999, stock: 15, attributes: { flavor: 'coffee-mocha', weight: '1kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '28', unit: 'g' },
      { key: 'servingsPerContainer', value: '30' },
      { key: 'type', value: 'Whey Isolate' },
      { key: 'additives', value: 'Digestive Enzymes, BCAAs' },
      { key: 'suitableFor', value: 'Muscle Building, Lean Muscle, Recovery' },
      { key: 'allergens', value: 'Milk' },
    ],
    reviews: { rating: 4.5, reviewCount: 5231, highlights: ['Premium quality', 'Low carb', 'Great mixability', 'Fast absorption'] },
    relatedProducts: ['hm-whey-001', 'hm-recovery-005', 'hm-multivit-004'],
    compatibilityTags: ['muscle-building', 'lean-muscle', 'recovery', 'post-workout', 'low-carb'],
    isActive: true,
  },
  {
    id: 'hm-plant-003',
    merchantId: 'herbamed',
    name: 'HerbaMed Plant Protein',
    description: 'Plant-based protein blend from pea, brown rice, and hemp. 22g protein per serving. Vegan-friendly with complete amino acid profile.',
    category: 'protein',
    subcategory: 'plant-protein',
    price: 3499,
    currency: 'INR',
    stock: 100,
    variants: [
      { id: 'hm-plant-003-choc-1kg', name: 'Chocolate 1kg', price: 3499, stock: 60, attributes: { flavor: 'chocolate', weight: '1kg' } },
      { id: 'hm-plant-003-berry-1kg', name: 'Mixed Berry 1kg', price: 3499, stock: 40, attributes: { flavor: 'mixed-berry', weight: '1kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '22', unit: 'g' },
      { key: 'servingsPerContainer', value: '30' },
      { key: 'type', value: 'Plant Blend (Pea, Rice, Hemp)' },
      { key: 'suitableFor', value: 'Muscle Building, Vegan, Dairy-Free' },
      { key: 'allergens', value: 'None' },
    ],
    reviews: { rating: 4.0, reviewCount: 2150, highlights: ['Vegan', 'No bloating', 'Good flavor'] },
    relatedProducts: ['hm-multivit-004', 'hm-omega-006'],
    compatibilityTags: ['muscle-building', 'vegan', 'dairy-free', 'plant-based'],
    isActive: true,
  },
  {
    id: 'hm-multivit-004',
    merchantId: 'herbamed',
    name: 'HerbaMed Daily Multivitamin',
    description: 'Comprehensive daily multivitamin with 23 essential vitamins and minerals. Supports overall health, immunity, and energy levels.',
    category: 'vitamins',
    subcategory: 'multivitamin',
    price: 899,
    currency: 'INR',
    stock: 200,
    variants: [
      { id: 'hm-multivit-004-60', name: '60 Tablets', price: 899, stock: 120, attributes: { count: '60', form: 'tablet' } },
      { id: 'hm-multivit-004-120', name: '120 Tablets', price: 1599, stock: 80, attributes: { count: '120', form: 'tablet' } },
    ],
    attributes: [
      { key: 'vitamins', value: '23 Essential Vitamins & Minerals' },
      { key: 'servingSize', value: '1 tablet daily' },
      { key: 'suitableFor', value: 'General Health, Immunity, Energy' },
    ],
    reviews: { rating: 4.3, reviewCount: 3400, highlights: ['Good value', 'Complete formula', 'Easy to swallow'] },
    relatedProducts: ['hm-omega-006', 'hm-recovery-005'],
    compatibilityTags: ['general-health', 'immunity', 'energy', 'daily-supplement'],
    isActive: true,
  },
  {
    id: 'hm-recovery-005',
    merchantId: 'herbamed',
    name: 'HerbaMed Recovery Supplement',
    description: 'Post-workout recovery blend with glutamine, BCAAs, and electrolytes. Reduces muscle soreness and accelerates recovery.',
    category: 'recovery',
    subcategory: 'post-workout',
    price: 699,
    currency: 'INR',
    stock: 120,
    variants: [
      { id: 'hm-recovery-005-orange', name: 'Orange 500g', price: 699, stock: 70, attributes: { flavor: 'orange', weight: '500g' } },
      { id: 'hm-recovery-005-lemon', name: 'Lemon-Lime 500g', price: 699, stock: 50, attributes: { flavor: 'lemon-lime', weight: '500g' } },
    ],
    attributes: [
      { key: 'keyIngredients', value: 'Glutamine, BCAAs, Electrolytes' },
      { key: 'servingsPerContainer', value: '30' },
      { key: 'suitableFor', value: 'Post-Workout Recovery, Muscle Soreness' },
    ],
    reviews: { rating: 4.2, reviewCount: 1890, highlights: ['Great for recovery', 'Tastes good', 'Reduces soreness'] },
    relatedProducts: ['hm-whey-001', 'hm-premium-whey-002', 'hm-electrolytes-008'],
    compatibilityTags: ['recovery', 'post-workout', 'muscle-soreness', 'bcaa'],
    isActive: true,
  },
  {
    id: 'hm-omega-006',
    merchantId: 'herbamed',
    name: 'HerbaMed Omega-3 Fish Oil',
    description: 'Triple-strength omega-3 with EPA and DHA. Supports heart health, brain function, and joint mobility.',
    category: 'vitamins',
    subcategory: 'omega-3',
    price: 599,
    currency: 'INR',
    stock: 180,
    variants: [
      { id: 'hm-omega-006-60', name: '60 Softgels', price: 599, stock: 100, attributes: { count: '60', form: 'softgel' } },
      { id: 'hm-omega-006-120', name: '120 Softgels', price: 999, stock: 80, attributes: { count: '120', form: 'softgel' } },
    ],
    attributes: [
      { key: 'epa', value: '360', unit: 'mg' },
      { key: 'dha', value: '240', unit: 'mg' },
      { key: 'suitableFor', value: 'Heart Health, Brain Function, Joints' },
    ],
    reviews: { rating: 4.4, reviewCount: 2700, highlights: ['No fishy aftertaste', 'Good dosage', 'Pure quality'] },
    relatedProducts: ['hm-multivit-004'],
    compatibilityTags: ['heart-health', 'brain-health', 'joints', 'general-health'],
    isActive: true,
  },
  {
    id: 'hm-bars-007',
    merchantId: 'herbamed',
    name: 'HerbaMed Protein Bars (Box of 6)',
    description: 'High-protein snack bars with 20g protein each. Low sugar, great taste. Perfect for on-the-go nutrition.',
    category: 'snacks',
    subcategory: 'protein-bars',
    price: 499,
    currency: 'INR',
    stock: 250,
    variants: [
      { id: 'hm-bars-007-choc', name: 'Dark Chocolate (6 bars)', price: 499, stock: 100, attributes: { flavor: 'dark-chocolate', count: '6' } },
      { id: 'hm-bars-007-peanut', name: 'Peanut Butter (6 bars)', price: 499, stock: 80, attributes: { flavor: 'peanut-butter', count: '6' } },
      { id: 'hm-bars-007-almond', name: 'Almond Crunch (6 bars)', price: 499, stock: 70, attributes: { flavor: 'almond-crunch', count: '6' } },
    ],
    attributes: [
      { key: 'proteinPerBar', value: '20', unit: 'g' },
      { key: 'sugar', value: '3', unit: 'g' },
      { key: 'calories', value: '220', unit: 'kcal' },
      { key: 'suitableFor', value: 'Snacking, On-the-go, Pre-workout' },
    ],
    reviews: { rating: 4.0, reviewCount: 3200, highlights: ['Great taste', 'Low sugar', 'Filling'] },
    relatedProducts: ['hm-whey-001', 'hm-electrolytes-008'],
    compatibilityTags: ['snacks', 'pre-workout', 'on-the-go', 'high-protein'],
    isActive: true,
  },
  {
    id: 'hm-electrolytes-008',
    merchantId: 'herbamed',
    name: 'HerbaMed Electrolyte Mix',
    description: 'Sugar-free electrolyte hydration mix with sodium, potassium, and magnesium. Prevents dehydration during intense workouts.',
    category: 'hydration',
    subcategory: 'electrolytes',
    price: 349,
    currency: 'INR',
    stock: 300,
    variants: [
      { id: 'hm-elec-008-citrus', name: 'Citrus Burst (30 sachets)', price: 349, stock: 150, attributes: { flavor: 'citrus', count: '30' } },
      { id: 'hm-elec-008-watermelon', name: 'Watermelon (30 sachets)', price: 349, stock: 100, attributes: { flavor: 'watermelon', count: '30' } },
      { id: 'hm-elec-008-unflavored', name: 'Unflavored (30 sachets)', price: 329, stock: 50, attributes: { flavor: 'unflavored', count: '30' } },
    ],
    attributes: [
      { key: 'sodium', value: '500', unit: 'mg' },
      { key: 'potassium', value: '200', unit: 'mg' },
      { key: 'magnesium', value: '60', unit: 'mg' },
      { key: 'sugar', value: '0', unit: 'g' },
      { key: 'suitableFor', value: 'Hydration, Intra-workout, Endurance' },
    ],
    reviews: { rating: 4.3, reviewCount: 1500, highlights: ['Zero sugar', 'Great hydration', 'Convenient sachets'] },
    relatedProducts: ['hm-recovery-005', 'hm-bars-007'],
    compatibilityTags: ['hydration', 'intra-workout', 'endurance', 'sugar-free'],
    isActive: true,
  },
];

// ============================================================
// NUTRIWORLD - Full AI-readable catalog (competitor)
// ============================================================
export const nutriworldProducts: Product[] = [
  {
    id: 'nw-whey-001',
    merchantId: 'nutriworld',
    name: 'NutriWorld Gold Whey',
    description: 'Gold standard whey protein with 25g protein per serving. Triple-filtered for purity. Available in multiple flavors.',
    category: 'protein',
    subcategory: 'whey-protein',
    price: 4499,
    currency: 'INR',
    stock: 100,
    variants: [
      { id: 'nw-whey-001-choc', name: 'Double Chocolate 1kg', price: 4499, stock: 50, attributes: { flavor: 'double-chocolate', weight: '1kg' } },
      { id: 'nw-whey-001-straw', name: 'Strawberry 1kg', price: 4499, stock: 30, attributes: { flavor: 'strawberry', weight: '1kg' } },
      { id: 'nw-whey-001-cookies', name: 'Cookies & Cream 1kg', price: 4499, stock: 20, attributes: { flavor: 'cookies-cream', weight: '1kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '25', unit: 'g' },
      { key: 'servingsPerContainer', value: '30' },
      { key: 'type', value: 'Whey Concentrate + Isolate Blend' },
      { key: 'suitableFor', value: 'Muscle Building, Recovery' },
    ],
    reviews: { rating: 4.2, reviewCount: 3800, highlights: ['Great flavors', 'High purity', 'Trusted brand'] },
    relatedProducts: ['nw-casein-002', 'nw-preworkout-005'],
    compatibilityTags: ['muscle-building', 'recovery', 'post-workout'],
    isActive: true,
  },
  {
    id: 'nw-casein-002',
    merchantId: 'nutriworld',
    name: 'NutriWorld Casein Protein',
    description: 'Slow-release micellar casein for overnight muscle recovery. 24g protein per serving with sustained amino acid delivery.',
    category: 'protein',
    subcategory: 'casein-protein',
    price: 3999,
    currency: 'INR',
    stock: 60,
    variants: [
      { id: 'nw-casein-002-choc', name: 'Chocolate 1kg', price: 3999, stock: 35, attributes: { flavor: 'chocolate', weight: '1kg' } },
      { id: 'nw-casein-002-van', name: 'Vanilla 1kg', price: 3999, stock: 25, attributes: { flavor: 'vanilla', weight: '1kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '24', unit: 'g' },
      { key: 'type', value: 'Micellar Casein' },
      { key: 'suitableFor', value: 'Overnight Recovery, Muscle Preservation' },
    ],
    reviews: { rating: 4.0, reviewCount: 1200, highlights: ['Good for night use', 'Thick texture', 'Slow release'] },
    relatedProducts: ['nw-whey-001', 'nw-vitamins-004'],
    compatibilityTags: ['muscle-building', 'recovery', 'overnight', 'slow-release'],
    isActive: true,
  },
  {
    id: 'nw-plant-003',
    merchantId: 'nutriworld',
    name: 'NutriWorld Vegan Pro',
    description: 'Organic vegan protein from pea and quinoa. 20g protein per serving with naturally sourced ingredients.',
    category: 'protein',
    subcategory: 'plant-protein',
    price: 3299,
    currency: 'INR',
    stock: 75,
    variants: [
      { id: 'nw-plant-003-vanilla', name: 'Natural Vanilla 1kg', price: 3299, stock: 40, attributes: { flavor: 'vanilla', weight: '1kg' } },
      { id: 'nw-plant-003-choc', name: 'Cacao 1kg', price: 3299, stock: 35, attributes: { flavor: 'cacao', weight: '1kg' } },
    ],
    attributes: [
      { key: 'proteinPerServing', value: '20', unit: 'g' },
      { key: 'type', value: 'Organic Pea + Quinoa' },
      { key: 'suitableFor', value: 'Vegan, Dairy-Free, Organic' },
    ],
    reviews: { rating: 3.9, reviewCount: 980, highlights: ['Organic', 'Clean ingredients', 'Mild taste'] },
    relatedProducts: ['nw-vitamins-004', 'nw-bcaa-006'],
    compatibilityTags: ['vegan', 'organic', 'plant-based', 'dairy-free'],
    isActive: true,
  },
  {
    id: 'nw-vitamins-004',
    merchantId: 'nutriworld',
    name: 'NutriWorld Multi-Pro Vitamins',
    description: 'Advanced multivitamin formula with probiotics. 25 vitamins and minerals plus gut health support.',
    category: 'vitamins',
    subcategory: 'multivitamin',
    price: 999,
    currency: 'INR',
    stock: 150,
    variants: [
      { id: 'nw-vit-004-60', name: '60 Capsules', price: 999, stock: 90, attributes: { count: '60', form: 'capsule' } },
      { id: 'nw-vit-004-90', name: '90 Capsules', price: 1399, stock: 60, attributes: { count: '90', form: 'capsule' } },
    ],
    attributes: [
      { key: 'vitamins', value: '25 Vitamins & Minerals + Probiotics' },
      { key: 'suitableFor', value: 'General Health, Gut Health, Immunity' },
    ],
    reviews: { rating: 4.1, reviewCount: 2100, highlights: ['With probiotics', 'Good formula', 'No stomach issues'] },
    relatedProducts: ['nw-whey-001'],
    compatibilityTags: ['general-health', 'gut-health', 'immunity', 'probiotics'],
    isActive: true,
  },
  {
    id: 'nw-preworkout-005',
    merchantId: 'nutriworld',
    name: 'NutriWorld Pre-Workout Blast',
    description: 'High-energy pre-workout with caffeine, beta-alanine, and citrulline. Boosts focus, endurance, and pump.',
    category: 'performance',
    subcategory: 'pre-workout',
    price: 799,
    currency: 'INR',
    stock: 90,
    variants: [
      { id: 'nw-pre-005-fruit', name: 'Fruit Punch 300g', price: 799, stock: 50, attributes: { flavor: 'fruit-punch', weight: '300g' } },
      { id: 'nw-pre-005-blue', name: 'Blue Raspberry 300g', price: 799, stock: 40, attributes: { flavor: 'blue-raspberry', weight: '300g' } },
    ],
    attributes: [
      { key: 'caffeine', value: '200', unit: 'mg' },
      { key: 'betaAlanine', value: '3.2', unit: 'g' },
      { key: 'suitableFor', value: 'Pre-Workout, Energy, Focus' },
    ],
    reviews: { rating: 4.3, reviewCount: 1600, highlights: ['Great energy', 'Good pump', 'No crash'] },
    relatedProducts: ['nw-whey-001', 'nw-bcaa-006'],
    compatibilityTags: ['pre-workout', 'energy', 'focus', 'endurance'],
    isActive: true,
  },
  {
    id: 'nw-bcaa-006',
    merchantId: 'nutriworld',
    name: 'NutriWorld BCAA Complex',
    description: 'Branch-chain amino acids in 2:1:1 ratio. Supports muscle recovery and prevents muscle breakdown during training.',
    category: 'recovery',
    subcategory: 'bcaa',
    price: 649,
    currency: 'INR',
    stock: 110,
    variants: [
      { id: 'nw-bcaa-006-grape', name: 'Grape 400g', price: 649, stock: 60, attributes: { flavor: 'grape', weight: '400g' } },
      { id: 'nw-bcaa-006-green-apple', name: 'Green Apple 400g', price: 649, stock: 50, attributes: { flavor: 'green-apple', weight: '400g' } },
    ],
    attributes: [
      { key: 'ratio', value: '2:1:1 (Leucine:Isoleucine:Valine)' },
      { key: 'suitableFor', value: 'Intra-Workout, Recovery, Anti-Catabolic' },
    ],
    reviews: { rating: 4.0, reviewCount: 890, highlights: ['Good ratio', 'Mixes well', 'Effective'] },
    relatedProducts: ['nw-whey-001', 'nw-preworkout-005'],
    compatibilityTags: ['recovery', 'intra-workout', 'anti-catabolic', 'bcaa'],
    isActive: true,
  },
];

// ============================================================
// HEALTHKART DEMO - Partial AI-readable catalog
// ============================================================
export const healthkartProducts: Product[] = [
  {
    id: 'hk-whey-001',
    merchantId: 'healthkart',
    name: 'HealthKart Whey Protein',
    description: 'Basic whey protein supplement.',
    category: 'protein',
    price: 3999,
    currency: 'INR',
    stock: 50,
    variants: [], // No variants - partial catalog
    attributes: [
      { key: 'proteinPerServing', value: '22', unit: 'g' },
    ],
    reviews: { rating: 3.8, reviewCount: 0 }, // No review count
    relatedProducts: [],
    compatibilityTags: ['protein'],
    isActive: true,
  },
  {
    id: 'hk-mass-002',
    merchantId: 'healthkart',
    name: 'HealthKart Mass Gainer',
    description: 'Weight gainer supplement.',
    category: 'protein',
    price: 2999,
    currency: 'INR',
    stock: 30,
    variants: [],
    attributes: [],
    reviews: { rating: 3.5, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: ['weight-gain'],
    isActive: true,
  },
  {
    id: 'hk-multi-003',
    merchantId: 'healthkart',
    name: 'HealthKart Multivitamin',
    description: 'Daily multivitamin tablets.',
    category: 'vitamins',
    price: 699,
    currency: 'INR',
    stock: 100,
    variants: [],
    attributes: [],
    reviews: { rating: 0, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: ['vitamins'],
    isActive: true,
  },
  {
    id: 'hk-bcaa-004',
    merchantId: 'healthkart',
    name: 'HealthKart BCAA',
    description: 'BCAA supplement for recovery.',
    category: 'recovery',
    price: 599,
    currency: 'INR',
    stock: 0, // Out of stock
    variants: [],
    attributes: [],
    reviews: { rating: 0, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: ['recovery'],
    isActive: true,
  },
];

// ============================================================
// WELLNESSHUB - Poor AI-readable catalog
// ============================================================
export const wellnessHubProducts: Product[] = [
  {
    id: 'wh-001',
    merchantId: 'wellnesshub',
    name: 'Protein Powder',
    description: '', // No description
    category: 'supplements',
    price: 3500,
    currency: 'INR',
    stock: -1, // Invalid stock
    variants: [],
    attributes: [],
    reviews: { rating: 0, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: [],
    isActive: true,
  },
  {
    id: 'wh-002',
    merchantId: 'wellnesshub',
    name: 'Vitamins',
    description: 'Some vitamins',
    category: 'supplements',
    price: 500,
    currency: 'INR',
    stock: -1,
    variants: [],
    attributes: [],
    reviews: { rating: 0, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: [],
    isActive: true,
  },
  {
    id: 'wh-003',
    merchantId: 'wellnesshub',
    name: 'Supplement',
    description: '',
    category: 'other',
    price: 0, // Missing price (set to 0)
    currency: 'INR',
    stock: -1,
    variants: [],
    attributes: [],
    reviews: { rating: 0, reviewCount: 0 },
    relatedProducts: [],
    compatibilityTags: [],
    isActive: true,
  },
];

// ============================================================
// ALL PRODUCTS indexed by merchant
// ============================================================
export const allProducts: Record<string, Product[]> = {
  herbamed: herbamedProducts,
  nutriworld: nutriworldProducts,
  healthkart: healthkartProducts,
  wellnesshub: wellnessHubProducts,
};

export function getProductById(merchantId: string, productId: string): Product | undefined {
  return allProducts[merchantId]?.find(p => p.id === productId);
}

export function searchProductsInCatalog(
  merchantId: string,
  query: string,
  category?: string,
  maxPrice?: number
): Product[] {
  const products = allProducts[merchantId] || [];
  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/[\s,]+/).filter(w => w.length > 2);

  return products.filter(p => {
    const pText = `${p.name} ${p.description} ${p.category} ${p.subcategory || ''} ${p.compatibilityTags.join(' ')}`.toLowerCase();
    const matchesQuery = !queryLower || pText.includes(queryLower) || (words.length > 0 && words.some(w => pText.includes(w)));
    const matchesCategory = !category || p.category.toLowerCase().includes(category.toLowerCase()) || (p.subcategory ? p.subcategory.toLowerCase().includes(category.toLowerCase()) : false);
    const matchesPrice = !maxPrice || p.price <= maxPrice;
    return matchesQuery && matchesCategory && matchesPrice && p.isActive;
  });
}

export function getAllProductsFlat(): Product[] {
  return Object.values(allProducts).flat();
}

export function getProductMargin(product: Product): { costPrice: number; marginAmount: number; marginPercent: number } {
  let marginPct = product.marginPercent;
  if (marginPct === undefined) {
    if (product.name.toLowerCase().includes('premium') || product.name.toLowerCase().includes('isolate')) {
      marginPct = 46;
    } else if (product.category === 'recovery' || product.category === 'vitamins' || product.category === 'snacks') {
      marginPct = 52;
    } else {
      marginPct = 35;
    }
  }
  const costPrice = product.costPrice ?? Math.round(product.price * (1 - marginPct / 100));
  const marginAmount = Math.max(0, product.price - costPrice);
  return { costPrice, marginAmount, marginPercent: marginPct };
}
