import React from 'react';

export default function About() {
  return (
    <div className="container ca-section" style={{ maxWidth: 860 }}>
      <h1 className="h3 fw-bold mb-4">About ChemAware</h1>

      <section className="mb-5">
        <h2 className="h5 fw-semibold mb-2">Project Purpose</h2>
        <p className="text-muted">
          ChemAware helps everyday consumers understand what chemicals are present in the medicines,
          food, cosmetics, and cleaning products they use — translating dense scientific data into a
          searchable, digestible format, while letting the community independently verify claims
          instead of relying on a single, editable source of truth.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h5 fw-semibold mb-2">How the APIs Work</h2>
        <div className="accordion" id="apiAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#pubchem">
                PubChem
              </button>
            </h2>
            <div id="pubchem" className="accordion-collapse collapse show" data-bs-parent="#apiAccordion">
              <div className="accordion-body text-muted small">
                The National Institutes of Health's open chemistry database. ChemAware queries it for
                molecular formula, weight, structure, CAS numbers, synonyms, and curated safety sections
                like toxicity and hazard classifications.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#openfda">
                OpenFDA
              </button>
            </h2>
            <div id="openfda" className="accordion-collapse collapse" data-bs-parent="#apiAccordion">
              <div className="accordion-body text-muted small">
                The U.S. FDA's public API for drug labels and enforcement/recall data — used for medicine
                ingredients, warnings, dosage, and side effects.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#off">
                Open Food Facts
              </button>
            </h2>
            <div id="off" className="accordion-collapse collapse" data-bs-parent="#apiAccordion">
              <div className="accordion-body text-muted small">
                A collaborative, open database of food (and increasingly cosmetic) products worldwide —
                used for ingredients, additives, allergens, and Nutri-Score/NOVA classifications.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="h5 fw-semibold mb-2">Why Web3 Is Used</h2>
        <p className="text-muted">
          Public API data is useful but centrally controlled and occasionally incomplete. ChemAware adds
          a permissionless layer on top: any wallet holder can submit a report about a product, which is
          hashed and timestamped on a public blockchain. Because blockchain records can't be silently
          altered after the fact, users get a tamper-evident trail of who claimed what, and when — with
          community upvotes and flags acting as a lightweight, transparent reputation signal.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h5 fw-semibold mb-2">Blockchain Architecture</h2>
        <ol className="text-muted">
          <li>User connects MetaMask and writes a report in the app.</li>
          <li>The full report JSON is pinned to IPFS via Pinata, producing a content-addressed CID.</li>
          <li>A keccak256 hash of that same JSON, plus the CID, is written to the <code>ChemAwareRegistry</code> smart contract on Sepolia (or a local Hardhat network).</li>
          <li>Anyone can re-fetch the IPFS content and re-hash it locally to confirm it matches the on-chain hash — proving the content hasn't been altered since submission.</li>
          <li>Other wallets can upvote or flag the report; each address may only do so once per report, enforced by the contract.</li>
        </ol>
      </section>

      <section>
        <h2 className="h5 fw-semibold mb-2">Future Scope</h2>
        <ul className="text-muted">
          <li>AI-powered natural-language risk summaries of complex safety data</li>
          <li>Reputation-weighted voting so long-standing, accurate contributors carry more signal</li>
          <li>Multi-chain support and gas-less submissions via meta-transactions</li>
          <li>Barcode scanning for instant mobile lookups</li>
        </ul>
      </section>
    </div>
  );
}
