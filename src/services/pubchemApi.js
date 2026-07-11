import axios from 'axios';

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

const client = axios.create({ baseURL: BASE, timeout: 15000 });

/**
 * Searches PubChem compounds by name and returns a normalized list of
 * lightweight results suitable for search-result cards.
 */
export async function searchCompoundsByName(name, limit = 10) {
  const { data } = await client.get(`/compound/name/${encodeURIComponent(name)}/cids/JSON`);
  const cids = (data?.IdentifierList?.CID || []).slice(0, limit);
  if (cids.length === 0) return [];
  return getCompoundSummaries(cids);
}

/**
 * Fetches key properties for a batch of CIDs in a single request.
 */
export async function getCompoundSummaries(cids) {
  const idList = cids.join(',');
  const props = [
    'IUPACName',
    'MolecularFormula',
    'MolecularWeight',
    'CanonicalSMILES',
    'XLogP',
    'Title',
  ].join(',');

  const { data } = await client.get(`/compound/cid/${idList}/property/${props}/JSON`);
  const rows = data?.PropertyTable?.Properties || [];

  return rows.map((row) => ({
    source: 'pubchem',
    id: String(row.CID),
    name: row.Title || row.IUPACName || `CID ${row.CID}`,
    molecularFormula: row.MolecularFormula,
    molecularWeight: row.MolecularWeight,
    iupacName: row.IUPACName,
    smiles: row.CanonicalSMILES,
    logP: row.XLogP,
  }));
}

/**
 * Full detail fetch for a single compound, including synonyms and
 * safety/GHS classification data where available.
 */
export async function getCompoundDetails(cid) {
  const [summaryRes, synonymsRes, casRes] = await Promise.allSettled([
    getCompoundSummaries([cid]),
    client.get(`/compound/cid/${cid}/synonyms/JSON`),
    client.get(`/compound/cid/${cid}/xrefs/RN/JSON`),
  ]);

  const summary = summaryRes.status === 'fulfilled' ? summaryRes.value[0] : null;
  const synonyms =
    synonymsRes.status === 'fulfilled'
      ? synonymsRes.value.data?.InformationList?.Information?.[0]?.Synonym || []
      : [];
  const casNumbers =
    casRes.status === 'fulfilled'
      ? casRes.value.data?.InformationList?.Information?.[0]?.RN || []
      : [];

  return {
    ...summary,
    synonyms: synonyms.slice(0, 12),
    casNumber: casNumbers[0] || 'Not available',
    pubchemUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
  };
}

/**
 * PubChem's PUG-View endpoint exposes richer, human-curated sections
 * (toxicity, hazards, uses) that the PUG-REST property endpoint doesn't.
 * We pull specific headings when present, tolerating absence gracefully.
 */
export async function getCompoundSafetySections(cid) {
  try {
    const { data } = await client.get(`/../pug_view/data/compound/${cid}/JSON`, {
      baseURL: 'https://pubchem.ncbi.nlm.nih.gov/rest',
    });
    const sections = data?.Record?.Section || [];
    const findSection = (heading) =>
      sections.find((s) => s.TOCHeading?.toLowerCase().includes(heading.toLowerCase()));

    const extractText = (section) => {
      if (!section) return [];
      const out = [];
      const walk = (node) => {
        node.Information?.forEach((info) => {
          info.Value?.StringWithMarkup?.forEach((s) => out.push(s.String));
        });
        node.Section?.forEach(walk);
      };
      walk(section);
      return out.slice(0, 5);
    };

    return {
      uses: extractText(findSection('Uses')),
      toxicity: extractText(findSection('Toxicity')),
      hazards: extractText(findSection('Hazards')) || extractText(findSection('GHS Classification')),
      environmentalImpact: extractText(findSection('Environmental Fate')),
    };
  } catch (err) {
    console.warn('[pubchemApi] Safety sections unavailable for CID', cid, err?.message);
    return { uses: [], toxicity: [], hazards: [], environmentalImpact: [] };
  }
}
