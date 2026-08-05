// ─────────────────────────────────────────────────────────────
// Synthetic assortment + competitive pricing data.
// Illustrative mock data — not real transactions or real pricing.
// ─────────────────────────────────────────────────────────────

const ASSORTMENT_CATEGORIES = [
  {
    id: "chilled", name: "Chilled Foods", skus: 214, sales30d: 68400, sellThrough: 74.2,
    own:        { min: 2.5, q1: 4.0, median: 5.5, q3: 7.2, max: 11.0 },
    competitor: { min: 2.0, q1: 3.5, median: 4.8, q3: 6.0, max: 9.0 },
    ownShare: 20.1, compShare: 15.8, categoryShare: 17.4,
  },
  {
    id: "bread", name: "Bread & Pastries", skus: 156, sales30d: 41200, sellThrough: 81.6,
    own:        { min: 1.8, q1: 2.5, median: 3.2, q3: 4.0, max: 6.5 },
    competitor: { min: 1.5, q1: 2.2, median: 2.9, q3: 3.6, max: 5.8 },
    ownShare: 19.4, compShare: 15.5, categoryShare: 15.0,
  },
  {
    id: "snacks", name: "Snacks & Confectionery", skus: 268, sales30d: 55700, sellThrough: 69.8,
    own:        { min: 1.2, q1: 2.0, median: 2.8, q3: 3.8, max: 6.0 },
    competitor: { min: 1.0, q1: 1.8, median: 2.5, q3: 3.3, max: 5.2 },
    ownShare: 19.8, compShare: 15.9, categoryShare: 18.2,
  },
  {
    id: "icecream", name: "Ice Cream & Dessert", skus: 132, sales30d: 33900, sellThrough: 65.1,
    own:        { min: 2.0, q1: 3.5, median: 4.5, q3: 5.8, max: 9.5 },
    competitor: { min: 1.8, q1: 3.0, median: 4.0, q3: 5.0, max: 8.0 },
    ownShare: 19.9, compShare: 16.2, categoryShare: 17.0,
  },
  {
    id: "frozen", name: "Frozen Foods", skus: 189, sales30d: 61300, sellThrough: 70.4,
    own:        { min: 3.0, q1: 5.0, median: 6.8, q3: 8.5, max: 13.0 },
    competitor: { min: 2.5, q1: 4.2, median: 5.8, q3: 7.2, max: 11.0 },
    ownShare: 19.3, compShare: 16.4, categoryShare: 15.6,
  },
  {
    id: "confectionery", name: "Confectionery", skus: 241, sales30d: 58100, sellThrough: 72.9,
    own:        { min: 1.5, q1: 3.0, median: 4.2, q3: 5.5, max: 9.0 },
    competitor: { min: 1.3, q1: 2.6, median: 3.6, q3: 4.8, max: 7.8 },
    ownShare: 20.4, compShare: 15.1, categoryShare: 24.3,
  },
  {
    id: "meat", name: "Processed Meat", skus: 173, sales30d: 72600, sellThrough: 68.3,
    own:        { min: 3.5, q1: 5.5, median: 7.0, q3: 9.0, max: 14.0 },
    competitor: { min: 3.0, q1: 4.8, median: 6.2, q3: 7.8, max: 12.0 },
    ownShare: 19.1, compShare: 16.6, categoryShare: 18.0,
  },
  {
    id: "dairy", name: "Dairy", skus: 198, sales30d: 49500, sellThrough: 76.8,
    own:        { min: 2.2, q1: 3.2, median: 4.0, q3: 5.0, max: 7.5 },
    competitor: { min: 2.0, q1: 2.9, median: 3.6, q3: 4.5, max: 6.8 },
    ownShare: 20.2, compShare: 15.3, categoryShare: 13.6,
  },
  {
    id: "alcohol", name: "Alcohol & Beer", skus: 147, sales30d: 91200, sellThrough: 59.7,
    own:        { min: 4.0, q1: 7.5, median: 10.5, q3: 14.0, max: 22.0 },
    competitor: { min: 3.5, q1: 6.8, median: 9.5, q3: 12.5, max: 19.5 },
    ownShare: 20.7, compShare: 16.0, categoryShare: 19.4,
  },
  {
    id: "prepared", name: "Prepared Foods", skus: 121, sales30d: 45800, sellThrough: 63.5,
    own:        { min: 3.2, q1: 5.0, median: 6.5, q3: 8.2, max: 12.5 },
    competitor: { min: 2.8, q1: 4.4, median: 5.7, q3: 7.1, max: 10.8 },
    ownShare: 19.6, compShare: 15.7, categoryShare: 12.1,
  },
  {
    id: "softdrinks", name: "Soft Drinks", skus: 176, sales30d: 38200, sellThrough: 79.3,
    own:        { min: 1.0, q1: 1.8, median: 2.4, q3: 3.2, max: 5.5 },
    competitor: { min: 0.9, q1: 1.6, median: 2.1, q3: 2.8, max: 4.8 },
    ownShare: 20.5, compShare: 16.1, categoryShare: 10.4,
  },
  {
    id: "teacoffee", name: "Tea & Coffee", skus: 169, sales30d: 47100, sellThrough: 66.9,
    own:        { min: 2.5, q1: 4.5, median: 6.0, q3: 8.0, max: 13.5 },
    competitor: { min: 2.2, q1: 3.9, median: 5.2, q3: 6.9, max: 11.5 },
    ownShare: 20.0, compShare: 15.6, categoryShare: 16.7,
  },
];

const SKU_PERFORMANCE = [
  { sku: "Free-Range Eggs, dozen", category: "Dairy", units: 4820, revenue: 21690, margin: 31.2, sellThrough: 91.4, trend: "up" },
  { sku: "Craft Lager 6-pack", category: "Alcohol & Beer", units: 2140, revenue: 24824, margin: 38.6, sellThrough: 84.7, trend: "up" },
  { sku: "Sourdough Loaf", category: "Bread & Pastries", units: 3960, revenue: 15840, margin: 42.1, sellThrough: 88.2, trend: "up" },
  { sku: "Single-Origin Ground Coffee", category: "Tea & Coffee", units: 1870, revenue: 16043, margin: 46.8, sellThrough: 79.5, trend: "up" },
  { sku: "Rotisserie Chicken", category: "Prepared Foods", units: 2410, revenue: 21690, margin: 27.4, sellThrough: 93.1, trend: "flat" },
  { sku: "Frozen Mixed Berries", category: "Frozen Foods", units: 1680, revenue: 9744, margin: 33.9, sellThrough: 68.3, trend: "flat" },
  { sku: "Sparkling Water 12-pack", category: "Soft Drinks", units: 3120, revenue: 8112, margin: 29.7, sellThrough: 82.6, trend: "up" },
  { sku: "Kettle-Cooked Chips, family", category: "Snacks & Confectionery", units: 2960, revenue: 8880, margin: 35.5, sellThrough: 71.9, trend: "flat" },
  { sku: "Dark Chocolate Bar 100g", category: "Confectionery", units: 4410, revenue: 15435, margin: 44.2, sellThrough: 76.8, trend: "up" },
  { sku: "Deli Sliced Turkey 200g", category: "Processed Meat", units: 2210, revenue: 15911, margin: 24.6, sellThrough: 58.4, trend: "down" },
  { sku: "Store-Brand Vanilla Ice Cream 1L", category: "Ice Cream & Dessert", units: 1540, revenue: 6930, margin: 22.8, sellThrough: 51.2, trend: "down" },
  { sku: "Imported Brie 200g", category: "Chilled Foods", units: 690, revenue: 4485, margin: 19.3, sellThrough: 39.7, trend: "down" },
];
