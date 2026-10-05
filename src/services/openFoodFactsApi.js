import axios from 'axios';
import { deriveChemicalFormula } from '../utils/chemicalFormulas.js';

// Primary and fallback domains (net is more reliable when org returns 503)
const BASES = [
  'https://world.openfoodfacts.net',
  'https://world.openfoodfacts.org',
];

async function fetchFromBases(path, config = {}) {
  let lastError = null;
  for (const base of BASES) {
    try {
      const response = await axios.get(`${base}${path}`, {
        ...config,
        timeout: 6000,
        headers: {
          'User-Agent': 'ChemAware/1.0 (Web3 Chemical Platform; https://github.com/shubhsawa/Chemical-inventory-and-information)',
          ...(config.headers || {}),
        },
      });
      if (response?.data) {
        return response.data;
      }
    } catch (err) {
      lastError = err;
      // Try next base domain on error (e.g. 503 or network timeout)
    }
  }
  throw lastError || new Error('All OpenFoodFacts endpoints failed');
}

/**
 * Searches food & cosmetic products by free-text name.
 */
export async function searchProducts(query, limit = 10) {
  try {
    const data = await fetchFromBases('/cgi/search.pl', {
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
  const partial = {
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
    category: 'food',
  };

  return {
    ...partial,
    molecularFormula: deriveChemicalFormula(partial),
  };
}

/**
 * Full detail lookup by barcode.
 */
export async function getProductByBarcode(barcode) {
  try {
    const data = await fetchFromBases(`/api/v2/product/${barcode}.json`);
    if (data.status !== 1) return null;
    return normalizeProduct(data.product);
  } catch (err) {
    console.warn('[openFoodFactsApi] Barcode lookup failed', barcode, err?.message);
    return null;
  }
}
