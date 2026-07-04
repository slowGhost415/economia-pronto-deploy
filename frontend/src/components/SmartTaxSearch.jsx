import { useMemo, useState } from 'react';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const PRESETS = [
  { key: 'smartphone', label: 'Smartphone', aliases: ['celular', 'iphone', 'telefone'], price: 2500, category: 'Eletronicos', ii: 16, ipi: 15, pis: 2.1, cofins: 9.65, icms: 18 },
  { key: 'notebook', label: 'Notebook', aliases: ['laptop', 'computador'], price: 4200, category: 'Eletronicos', ii: 16, ipi: 15, pis: 2.1, cofins: 9.65, icms: 18 },
  { key: 'bicicleta', label: 'Bicicleta', aliases: ['bike'], price: 1800, category: 'Mobilidade', ii: 20, ipi: 10, pis: 2.1, cofins: 9.65, icms: 17 },
  { key: 'cafe', label: 'Cafe especial', aliases: ['cafe', 'grao'], price: 65, category: 'Alimentos', ii: 10, ipi: 0, pis: 1.65, cofins: 7.6, icms: 12 },
  { key: 'servico', label: 'Servico digital', aliases: ['software', 'assinatura', 'saas'], price: 120, category: 'Servicos', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6, icms: 5 },
];

const norm = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const findPreset = (query) => {
  const q = norm(query);
  if (!q) return PRESETS[0];
  return PRESETS.find((item) => (
    norm(item.label).includes(q)
    || item.key.includes(q)
    || item.aliases.some((alias) => norm(alias).includes(q) || q.includes(norm(alias)))
  )) || null;
};

const calc = ({ price, freight, ii, ipi, pis, cofins, icms }) => {
  const cif = price + freight;
  const importDuty = cif * (ii / 100);
  const ipiValue = (cif + importDuty) * (ipi / 100);
  const pisValue = cif * (pis / 100);
  const cofinsValue = cif * (cofins / 100);
  const icmsBase = cif + importDuty + ipiValue + pisValue + cofinsValue;
  const icmsValue = icmsBase * (icms / 100);
  const total = icmsBase + icmsValue;
  const taxes = importDuty + ipiValue + pisValue + cofinsValue + icmsValue;
  return { cif, importDuty, ipiValue, pisValue, cofinsValue, icmsValue, total, taxes };
};

const SmartTaxSearch = () => {
  const [query, setQuery] = useState('smartphone');
  const [manualPrice, setManualPrice] = useState('');
  const [freight, setFreight] = useState('120');
  const [mode, setMode] = useState('automatico');
  const [customRates, setCustomRates] = useState({ ii: 16, ipi: 15, pis: 2.1, cofins: 9.65, icms: 18 });

  const preset = findPreset(query);
  const base = preset || {
    label: query || 'Bem personalizado',
    category: 'Personalizado',
    price: 1000,
    ii: customRates.ii,
    ipi: customRates.ipi,
    pis: customRates.pis,
    cofins: customRates.cofins,
    icms: customRates.icms,
  };

  const rates = mode === 'manual' ? customRates : base;
  const price = Number(manualPrice || base.price || 0);
  const freightValue = Number(freight || 0);

  const result = useMemo(() => calc({
    price,
    freight: freightValue,
    ii: Number(rates.ii || 0),
    ipi: Number(rates.ipi || 0),
    pis: Number(rates.pis || 0),
    cofins: Number(rates.cofins || 0),
    icms: Number(rates.icms || 0),
  }), [price, freightValue, rates]);

  const burden = result.total ? (result.taxes / result.total) * 100 : 0;
  const suggestions = PRESETS.filter((item) => item.key !== base.key).slice(0, 4);

  return (
    <section className="tax-lab">
      <div className="panel-heading">
        <span className="eyebrow">Busca inteligente</span>
        <h2>Calcule o preco real de um bem com impostos</h2>
        <p>Digite um item, ajuste frete e aliquotas, e veja a composicao do custo estimado.</p>
      </div>

      <div className="tax-grid">
        <div className="tax-control-panel">
          <label className="field-label">O que voce quer precificar?</label>
          <input className="ec-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex: celular, notebook, cafe, software" />

          <div className="tax-suggestions">
            {suggestions.map((item) => (
              <button type="button" key={item.key} onClick={() => { setQuery(item.label); setManualPrice(''); }}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="split-fields">
            <div>
              <label className="field-label">Preco base</label>
              <input className="ec-input" type="number" min="0" step="10" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} placeholder={String(base.price)} />
            </div>
            <div>
              <label className="field-label">Frete/seguro</label>
              <input className="ec-input" type="number" min="0" step="10" value={freight} onChange={(e) => setFreight(e.target.value)} />
            </div>
          </div>

          <div className="segmented">
            <button type="button" className={mode === 'automatico' ? 'active' : ''} onClick={() => setMode('automatico')}>Automatico</button>
            <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Manual</button>
          </div>

          {mode === 'manual' && (
            <div className="rates-grid">
              {['ii', 'ipi', 'pis', 'cofins', 'icms'].map((key) => (
                <div key={key}>
                  <label className="field-label">{key.toUpperCase()} %</label>
                  <input
                    className="ec-input"
                    type="number"
                    step="0.01"
                    value={customRates[key]}
                    onChange={(e) => setCustomRates((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tax-result-panel">
          <div className="tax-result-top">
            <div>
              <span className="eyebrow">{base.category}</span>
              <h3>{base.label}</h3>
            </div>
            <div className="risk-chip">{burden.toFixed(1)}% impostos</div>
          </div>

          <div className="total-price">{BRL.format(result.total)}</div>
          <div className="tax-progress">
            <span style={{ width: `${Math.min(100, burden)}%` }} />
          </div>

          <div className="tax-breakdown">
            {[
              ['CIF / base', result.cif],
              ['II', result.importDuty],
              ['IPI', result.ipiValue],
              ['PIS', result.pisValue],
              ['COFINS', result.cofinsValue],
              ['ICMS', result.icmsValue],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{BRL.format(value)}</strong>
              </div>
            ))}
          </div>

          <div className="ai-note">
            Estimativa educativa: regras variam por NCM, estado, regime tributario e destino. Use como simulador rapido, nao como parecer fiscal.
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartTaxSearch;
