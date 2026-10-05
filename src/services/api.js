import * as pubchem from './pubchemApi.js';
import * as openFda from './openFdaApi.js';
import * as openFoodFacts from './openFoodFactsApi.js';
import { computeSafetyScore } from '../utils/safetyScore.js';
import { deriveChemicalFormula } from '../utils/chemicalFormulas.js';

/**
 * Unified search across all three public data sources. Designed so a new
 * source can be added by writing a `services/xApi.js` module that exports a
 * `search*` function returning normalized objects, then adding one entry here.
 */
export async function searchAll(query, { limit = 8 } = {}) {
  const [compounds, drugs, foodProducts] = await Promise.allSettled([
    pubchem.searchCompoundsByName(query, limit),
    openFda.searchDrugs(query, limit),
    openFoodFacts.searchProducts(query, limit),
  ]);

  const results = [
    ...(compounds.status === 'fulfilled' ? compounds.value.map((c) => ({ ...c, category: 'chemical' })) : []),
    ...(drugs.status === 'fulfilled' ? drugs.value.map((d) => ({ ...d, category: 'medicine' })) : []),
    ...(foodProducts.status === 'fulfilled'
      ? foodProducts.value.map((f) => ({ ...f, category: 'food' }))
      : []),
  ];

  return results.map((r) => {
    const formula = r.molecularFormula || deriveChemicalFormula(r);
    return {
      ...r,
      molecularFormula: formula,
      safetyScore: computeSafetyScore(r),
    };
  });
}

export async function getDetailsFor(source, id) {
  let result;
  switch (source) {
    case 'pubchem': {
      const [details, safety] = await Promise.all([
        pubchem.getCompoundDetails(id),
        pubchem.getCompoundSafetySections(id),
      ]);
      result = { ...details, ...safety, source, category: 'chemical' };
      break;
    }
    case 'openfda': {
      const details = await openFda.getDrugDetails(id);
      result = { ...details, source, category: 'medicine' };
      break;
    }
    case 'openfoodfacts': {
      const details = await openFoodFacts.getProductByBarcode(id);
      result = { ...details, source, category: 'food' };
      break;
    }
    default:
      throw new Error(`Unknown data source: ${source}`);
  }

  if (result && !result.molecularFormula) {
    result.molecularFormula = deriveChemicalFormula(result);
  }
  return result;
}

export const sources = { pubchem, openFda, openFoodFacts };
