/**
 * Utility to resolve or derive chemical formulas for products (foods, cosmetics,
 * medicines, and mixtures) that may not have a single pure PubChem compound record.
 */

// Additive E-numbers to formula and human-readable chemical name
const ADDITIVE_FORMULAS = {
  'e270': { formula: 'C₃H₆O₃', name: 'Lactic acid' },
  'e330': { formula: 'C₆H₈O₇', name: 'Citric acid' },
  'e260': { formula: 'CH₃COOH', name: 'Acetic acid' },
  'e300': { formula: 'C₆H₈O₆', name: 'Ascorbic acid (Vitamin C)' },
  'e500': { formula: 'NaHCO₃', name: 'Sodium bicarbonate' },
  'e509': { formula: 'CaCl₂', name: 'Calcium chloride' },
  'e200': { formula: 'C₆H₈O₂', name: 'Sorbic acid' },
  'e202': { formula: 'C₆H₇KO₂', name: 'Potassium sorbate' },
  'e210': { formula: 'C₇H₆O₂', name: 'Benzoic acid' },
  'e211': { formula: 'C₇H₅NaO₂', name: 'Sodium benzoate' },
  'e250': { formula: 'NaNO₂', name: 'Sodium nitrite' },
  'e251': { formula: 'NaNO₃', name: 'Sodium nitrate' },
  'e621': { formula: 'C₅H₈NO₄Na', name: 'Monosodium glutamate (MSG)' },
  'e170': { formula: 'CaCO₃', name: 'Calcium carbonate' },
  'e508': { formula: 'KCl', name: 'Potassium chloride' },
  'e516': { formula: 'CaSO₄', name: 'Calcium sulfate' },
  'e339': { formula: 'Na₃PO₄', name: 'Sodium phosphate' },
  'e450': { formula: 'Na₄P₂O₇', name: 'Sodium diphosphate' },
  'e452': { formula: '(NaPO₃)ₙ', name: 'Polyphosphates' },
  'e951': { formula: 'C₁₄H₁₈N₂O₅', name: 'Aspartame' },
  'e955': { formula: 'C₁₂H₁₉Cl₃O₈', name: 'Sucralose' },
  'e950': { formula: 'C₄H₄KNO₄S', name: 'Acesulfame K' },
  'e420': { formula: 'C₆H₁₄O₆', name: 'Sorbitol' },
  'e422': { formula: 'C₃H₈O₃', name: 'Glycerol' },
  'e100': { formula: 'C₂₁H₂₀O₆', name: 'Curcumin' },
  'e160a': { formula: 'C₄₀H₅₆', name: 'Beta-carotene' },
  'e322': { formula: 'C₄₂H₈₀NO₈P', name: 'Lecithin' },
};

// Known common food/mixture categories and names to active chemical components
const COMMON_PRODUCT_FORMULAS = [
  {
    regex: /\b(cheese|cheeses|cheddar|fromage|frommage|mozzarella|parmesan|gouda|brie|paneer|ricotta|feta|emmental|edam)\b/i,
    formula: 'C₃H₆O₃ (Lactic acid), NaCl (Salt)',
  },
  {
    regex: /\b(yogurt|yoghurt|yaourt|kefir|curd)\b/i,
    formula: 'C₃H₆O₃ (Lactic acid)',
  },
  {
    regex: /\b(milk|lait|dairy|cream|crème)\b/i,
    formula: 'C₁₂H₂₂O₁₁ (Lactose)',
  },
  {
    regex: /\b(butter|beurre|ghee)\b/i,
    formula: 'C₄H₈O₂ (Butyric acid)',
  },
  {
    regex: /\b(vinegar|vinaigre)\b/i,
    formula: 'CH₃COOH (Acetic acid)',
  },
  {
    regex: /\b(salt|sel|table salt)\b/i,
    formula: 'NaCl (Sodium chloride)',
  },
  {
    regex: /\b(sugar|sucre|sucrose|cane sugar)\b/i,
    formula: 'C₁₂H₂₂O₁₁ (Sucrose)',
  },
  {
    regex: /\b(baking soda|sodium bicarbonate)\b/i,
    formula: 'NaHCO₃ (Sodium bicarbonate)',
  },
  {
    regex: /\b(coffee|café|cafe|espresso|tea|thé|energy drink)\b/i,
    formula: 'C₈H₁₀N₄O₂ (Caffeine)',
  },
  {
    regex: /\b(chocolate|chocolat|cocoa|cacao)\b/i,
    formula: 'C₇H₈N₄O₂ (Theobromine)',
  },
  {
    regex: /\b(beer|wine|vodka|whiskey|whisky|spirit|alcohol|alcool|liquor)\b/i,
    formula: 'C₂H₆O (Ethanol)',
  },
  {
    regex: /\b(lemon|lime|citrus|orange juice|lemonade)\b/i,
    formula: 'C₆H₈O₇ (Citric acid)',
  },
  {
    regex: /\b(apple|pomme|cider)\b/i,
    formula: 'C₄H₆O₅ (Malic acid)',
  },
  {
    regex: /\b(cola|soda|soft drink)\b/i,
    formula: 'H₃PO₄ (Phosphoric acid), C₈H₁₀N₄O₂ (Caffeine)',
  },
  {
    regex: /\b(olive oil|vegetable oil|cooking oil)\b/i,
    formula: 'C₁₈H₃₄O₂ (Oleic acid)',
  },
  {
    regex: /\b(bleach|javel)\b/i,
    formula: 'NaClO (Sodium hypochlorite)',
  },
  {
    regex: /\b(soap|savon)\b/i,
    formula: 'C₁₈H₃₅NaO₂ (Sodium stearate)',
  },
];

// Common active drug ingredients to molecular formulas
const DRUG_INGREDIENTS = [
  { regex: /paracetamol|acetaminophen/i, formula: 'C₈H₉NO₂ (Paracetamol)' },
  { regex: /ibuprofen/i, formula: 'C₁₃H₁₈O₂ (Ibuprofen)' },
  { regex: /aspirin|acetylsalicylic/i, formula: 'C₉H₈O₄ (Aspirin)' },
  { regex: /amoxicillin/i, formula: 'C₁₆H₁₉N₃O₅S (Amoxicillin)' },
  { regex: /metformin/i, formula: 'C₄H₁₁N₅ (Metformin)' },
  { regex: /omeprazole/i, formula: 'C₁₇H₁₉N₃O₃S (Omeprazole)' },
  { regex: /cetirizine/i, formula: 'C₂₁H₂₅ClN₂O₃ (Cetirizine)' },
  { regex: /diphenhydramine/i, formula: 'C₁₇H₂₁NO (Diphenhydramine)' },
  { regex: /atorvastatin/i, formula: 'C₃₃H₃₅FN₂O₅ (Atorvastatin)' },
  { regex: /azithromycin/i, formula: 'C₃₈H₇₂N₂O₁₂ (Azithromycin)' },
  { regex: /ciprofloxacin/i, formula: 'C₁₇H₁₈FN₃O₃ (Ciprofloxacin)' },
  { regex: /losartan/i, formula: 'C₂₂H₂₃ClN₆O (Losartan)' },
  { regex: /hydrochlorothiazide/i, formula: 'C₇H₈ClN₃O₄S₂ (Hydrochlorothiazide)' },
  { regex: /salbutamol|albuterol/i, formula: 'C₁₃H₂₁NO₃ (Albuterol)' },
  { regex: /lisinopril/i, formula: 'C₂₁H₃₁N₃O₅ (Lisinopril)' },
  { regex: /amlodipine/i, formula: 'C₂₀H₂₅ClN₂O₅ (Amlodipine)' },
  { regex: /prednisone/i, formula: 'C₂₁H₂₆O₅ (Prednisone)' },
];

/**
 * Derives the characteristic chemical formula for a product, compound, or mixture.
 */
export function deriveChemicalFormula(item) {
  if (!item) return null;

  // 1. If product already has a verified molecular formula (e.g. from PubChem), retain it
  if (item.molecularFormula && item.molecularFormula !== '—') {
    return item.molecularFormula;
  }

  const name = item.name || item.product_name || '';
  const categories = item.categories || '';
  const genericName = item.genericName || '';
  const fullText = `${name} ${categories} ${genericName}`.toLowerCase();

  // 2. Check medicine active ingredients or drug names in text
  const activeText = Array.isArray(item.activeIngredients)
    ? item.activeIngredients.join(' ')
    : `${item.activeIngredients || ''} ${fullText}`;

  for (const drug of DRUG_INGREDIENTS) {
    if (drug.regex.test(activeText) || drug.regex.test(fullText)) {
      return drug.formula;
    }
  }

  // 3. Check product name & category patterns (e.g. cheese, chocolate, milk, vinegar)
  for (const entry of COMMON_PRODUCT_FORMULAS) {
    if (entry.regex.test(fullText)) {
      return entry.formula;
    }
  }

  // 4. Check additives if available
  const additives = item.additives || item.additives_tags || [];
  for (const code of additives) {
    const cleanCode = String(code).toLowerCase().replace(/^en:/, '').trim();
    if (ADDITIVE_FORMULAS[cleanCode]) {
      return `${ADDITIVE_FORMULAS[cleanCode].formula} (${ADDITIVE_FORMULAS[cleanCode].name})`;
    }
  }

  // 5. Check ingredient text for chemical keywords
  const ingredients = typeof item.ingredients === 'string'
    ? item.ingredients.toLowerCase()
    : (item.ingredientsList || []).join(' ').toLowerCase();

  if (/ferment.*lacti|lactic acid|acide lactique/i.test(ingredients)) {
    return 'C₃H₆O₃ (Lactic acid)';
  }
  if (/\bsel\b|\bsalt\b|chlorure de sodium|sodium chloride/i.test(ingredients)) {
    return 'NaCl (Sodium chloride)';
  }
  if (/acide citrique|citric acid/i.test(ingredients)) {
    return 'C₆H₈O₇ (Citric acid)';
  }
  if (/bicarbonate/i.test(ingredients)) {
    return 'NaHCO₃ (Sodium bicarbonate)';
  }
  if (/sucre|sugar|sucrose/i.test(ingredients)) {
    return 'C₁₂H₂₂O₁₁ (Sucrose)';
  }

  return null;
}
