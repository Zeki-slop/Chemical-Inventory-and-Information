import axios from 'axios';

const BASE = 'https://api.fda.gov';
const API_KEY = import.meta.env.VITE_OPENFDA_API_KEY || '';

const client = axios.create({ baseURL: BASE, timeout: 15000 });

function withKey(params) {
  return API_KEY ? { ...params, api_key: API_KEY } : params;
}

/**
 * Searches drug labels (medicines) by brand or generic name.
 */
export async function searchDrugs(query, limit = 10) {
  const search = `openfda.brand_name:"${query}" openfda.generic_name:"${query}"`;
  try {
    const { data } = await client.get('/drug/label.json', {
      params: withKey({
        search: `openfda.brand_name:"${query}"+OR+openfda.generic_name:"${query}"`,
        limit,
      }),
    });
    return (data.results || []).map(normalizeDrugResult);
  } catch (err) {
    console.warn('[openFdaApi] Drug search failed', err?.response?.status, search);
    return [];
  }
}

function normalizeDrugResult(result) {
  const openfda = result.openfda || {};
  return {
    source: 'openfda',
    id: result.id || openfda.spl_id?.[0] || crypto.randomUUID(),
    name: openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown Medicine',
    manufacturer: openfda.manufacturer_name?.[0] || 'Unknown manufacturer',
    genericName: openfda.generic_name?.[0],
    activeIngredients: result.active_ingredient || [],
    warnings: result.warnings || result.warnings_and_cautions || [],
    sideEffects: result.adverse_reactions || [],
    dosage: result.dosage_and_administration || [],
    indications: result.indications_and_usage || [],
  };
}

/**
 * Fetches a single drug label's full detail by its openFDA record id.
 */
export async function getDrugDetails(id) {
  const { data } = await client.get('/drug/label.json', {
    params: withKey({ search: `id:"${id}"`, limit: 1 }),
  });
  const result = data.results?.[0];
  return result ? normalizeDrugResult(result) : null;
}

/**
 * Food and cosmetic recall/enforcement data — useful for the
 * "Regulatory Information" section on the Chemical Details page.
 */
export async function searchEnforcementReports(query, limit = 5) {
  try {
    const { data } = await client.get('/food/enforcement.json', {
      params: withKey({ search: `product_description:"${query}"`, limit }),
    });
    return data.results || [];
  } catch (err) {
    console.warn('[openFdaApi] Enforcement search failed', err?.response?.status);
    return [];
  }
}
