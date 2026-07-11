import axios from 'axios';

const BASE = 'https://world.openfoodfacts.org';

const client = axios.create({ baseURL: BASE, timeout: 15000 });

/**
 * Searches food & cosmetic products by free-text name.
 */
export async function searchProducts(query, limit = 10) {
  try {
    const { data } = await client.get('/cgi/search.pl', {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: limit,
      },
    });
    return (data.products || []).map(normalizeProduct);
  } catch (err) {
    console.warn('[openFoodFactsApi] Search failed', err?.message);
    return [];
  }
}

function normalizeProduct(p) {
  return {
    source: 'openfoodfacts',
    id: p.code,
    name: p.product_name || p.generic_name || 'Unnamed product',
    manufacturer: p.brands || 'Unknown brand',
    image: p.image_front_small_url || p.image_url,
    ingredients: p.ingredients_text || 'Not listed',
    ingredientsList: (p.ingredients || []).map((i) => i.text).filter(Boolean),
    additives: p.additives_tags || [],
    allergens: (p.allergens || '').split(',').filter(Boolean),
    nutriScore: p.nutriscore_grade,
    novaGroup: p.nova_group,
    ecoScore: p.ecoscore_grade,
    categories: p.categories,
  };
}

/**
 * Full detail lookup by barcode.
 */
export async function getProductByBarcode(barcode) {
  const { data } = await client.get(`/api/v2/product/${barcode}.json`);
  if (data.status !== 1) return null;
  return normalizeProduct(data.product);
}
