import { useMemo, useState } from 'react';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const PRESETS = [
  { key: 'smartphone', label: 'Smartphone', aliases: ['celular', 'iphone', 'telefone'], price: 2500, category: 'Eletrônicos', ii: 60, ipi: 15, pis: 2.1, cofins: 9.65, icms: 20 },
  { key: 'notebook', label: 'Notebook', aliases: ['laptop', 'computador'], price: 4200, category: 'Eletrônicos', ii: 60, ipi: 15, pis: 2.1, cofins: 9.65, icms: 20 },
  { key: 'bicicleta', label: 'Bicicleta', aliases: ['bike'], price: 1800, category: 'Mobilidade', ii: 60, ipi: 10, pis: 2.1, cofins: 9.65, icms: 18 },
  { key: 'cafe', label: 'Café especial', aliases: ['cafe', 'grao', 'grão'], price: 65, category: 'Alimentos', ii: 60, ipi: 0, pis: 1.65, cofins: 7.6, icms: 12 },
  { key: 'servico', label: 'Serviço digital', aliases: ['software', 'assinatura', 'saas'], price: 120, category: 'Serviços', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6, icms: 5 },
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

const parseMoneyFromText = (value) => {
  const text = String(value || '').replace(/\s/g, '');
  const match = text.match(/(?:r\$|brl)?(\d{2,6})(?:[,.](\d{2}))?/i);
  if (!match) return '';
  const whole = Number(match[1]);
  const cents = match[2] ? Number(match[2]) / 100 : 0;
  return String(whole + cents);
};

const parseNameFromInput = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'Bem personalizado';
  try {
    const url = new URL(raw);
    const chunks = decodeURIComponent(`${url.hostname} ${url.pathname}`)
      .replace(/[._/-]+/g, ' ')
      .split(' ')
      .filter((part) => part.length > 2 && !['www', 'com', 'br', 'produto', 'item'].includes(part.toLowerCase()));
    return chunks.slice(0, 4).join(' ') || url.hostname;
  } catch {
    return raw.slice(0, 80);
  }
};

const calcInstallment = (amount, months, monthlyRate) => {
  if (months <= 1) return { installment: amount, total: amount, interest: 0 };
  const rate = monthlyRate / 100;
  if (rate <= 0) {
    return { installment: amount / months, total: amount, interest: 0 };
  }
  const installment = amount * (rate / (1 - Math.pow(1 + rate, -months)));
  const total = installment * months;
  return { installment, total, interest: total - amount };
};

const calcScenario = ({ price, freight, insurance, rates, mode, remessa, exchange, installments, monthlyInterest, inflationAnnual }) => {
  const base = Math.max(0, price) + Math.max(0, freight) + Math.max(0, insurance);
  let importDuty = 0;
  let ipiValue = 0;
  let pisValue = 0;
  let cofinsValue = 0;
  let icmsValue = 0;

  if (mode === 'importado') {
    const usdEquivalent = exchange > 0 ? base / exchange : base;
    const discount = remessa === 'certificado' && usdEquivalent > 50 ? 30 * exchange : 0;
    const iiRate = remessa === 'certificado' && usdEquivalent <= 50 ? 0 : rates.ii;
    importDuty = Math.max(0, base * (iiRate / 100) - discount);
    const icmsBase = (base + importDuty) / Math.max(0.01, 1 - rates.icms / 100);
    icmsValue = Math.max(0, icmsBase * (rates.icms / 100));
  } else {
    ipiValue = price * (rates.ipi / 100);
    pisValue = price * (rates.pis / 100);
    cofinsValue = price * (rates.cofins / 100);
    icmsValue = price * (rates.icms / 100);
  }

  const taxes = importDuty + ipiValue + pisValue + cofinsValue + icmsValue;
  const cashTotal = base + taxes;
  const credit = calcInstallment(cashTotal, installments, monthlyInterest);
  const inflationAdjusted = cashTotal * Math.pow(1 + inflationAnnual / 100, installments / 12);

  return {
    base,
    importDuty,
    ipiValue,
    pisValue,
    cofinsValue,
    icmsValue,
    taxes,
    cashTotal,
    credit,
    inflationAdjusted,
    inflationImpact: inflationAdjusted - cashTotal,
  };
};

const SmartTaxSearch = () => {
  const [query, setQuery] = useState('smartphone');
  const [manualPrice, setManualPrice] = useState('');
  const [freight, setFreight] = useState('120');
  const [insurance, setInsurance] = useState('0');
  const [mode, setMode] = useState('importado');
  const [remessa, setRemessa] = useState('certificado');
  const [exchange, setExchange] = useState('5.40');
  const [installments, setInstallments] = useState('10');
  const [monthlyInterest, setMonthlyInterest] = useState('1.99');
  const [inflationAnnual, setInflationAnnual] = useState('4.5');
  const [customRates, setCustomRates] = useState({ ii: 60, ipi: 15, pis: 2.1, cofins: 9.65, icms: 20 });
  const [saved, setSaved] = useState([]);

  const preset = findPreset(query);
  const detectedPrice = parseMoneyFromText(query);
  const base = preset || {
    label: parseNameFromInput(query),
    category: 'Personalizado',
    price: detectedPrice || 1000,
    ...customRates,
  };

  const price = Number(manualPrice || detectedPrice || base.price || 0);
  const rates = mode === 'manual' ? customRates : { ...customRates, ...base };

  const result = useMemo(() => calcScenario({
    price,
    freight: Number(freight || 0),
    insurance: Number(insurance || 0),
    rates: {
      ii: Number(rates.ii || 0),
      ipi: Number(rates.ipi || 0),
      pis: Number(rates.pis || 0),
      cofins: Number(rates.cofins || 0),
      icms: Number(rates.icms || 0),
    },
    mode,
    remessa,
    exchange: Number(exchange || 0),
    installments: Math.max(1, Number.parseInt(installments, 10) || 1),
    monthlyInterest: Number(monthlyInterest || 0),
    inflationAnnual: Number(inflationAnnual || 0),
  }), [price, freight, insurance, rates, mode, remessa, exchange, installments, monthlyInterest, inflationAnnual]);

  const burden = result.cashTotal ? (result.taxes / result.cashTotal) * 100 : 0;
  const suggestions = PRESETS.filter((item) => item.key !== base.key).slice(0, 4);

  const saveScenario = () => {
    setSaved((prev) => [
      {
        label: base.label,
        total: result.credit.total,
        cashTotal: result.cashTotal,
        taxes: result.taxes,
      },
      ...prev,
    ].slice(0, 3));
  };

  return (
    <section className="tax-lab">
      <div className="panel-heading">
        <span className="eyebrow">Calculadora de compra</span>
        <h2>Teste preço final, impostos, juros e inflação antes de comprar.</h2>
        <p>Cole um link ou descrição, ajuste as variáveis e veja para onde vai cada parte do custo estimado.</p>
      </div>

      <div className="tax-grid advanced-tax-grid">
        <div className="tax-control-panel">
          <label className="field-label" htmlFor="tax-query">Link, produto ou descrição</label>
          <textarea
            id="tax-query"
            className="ec-input tax-textarea"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              const parsed = parseMoneyFromText(event.target.value);
              if (parsed && !manualPrice) setManualPrice(parsed);
            }}
            placeholder="Ex: https://loja.com/notebook-4200 ou notebook gamer R$ 4200"
          />

          <div className="tax-suggestions">
            {suggestions.map((item) => (
              <button type="button" key={item.key} onClick={() => { setQuery(item.label); setManualPrice(String(item.price)); }}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="segmented">
            <button type="button" className={mode === 'importado' ? 'active' : ''} onClick={() => setMode('importado')}>Importado</button>
            <button type="button" className={mode === 'nacional' ? 'active' : ''} onClick={() => setMode('nacional')}>Nacional</button>
            <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Manual</button>
          </div>

          {mode === 'importado' && (
            <div className="split-fields">
              <div>
                <label className="field-label" htmlFor="tax-remessa">Remessa Conforme</label>
                <select id="tax-remessa" className="ec-select" value={remessa} onChange={(event) => setRemessa(event.target.value)}>
                  <option value="certificado">Site certificado</option>
                  <option value="nao_certificado">Site não certificado</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="tax-exchange">Dólar usado no cálculo</label>
                <input id="tax-exchange" className="ec-input" type="number" min="0" step="0.01" value={exchange} onChange={(event) => setExchange(event.target.value)} />
              </div>
            </div>
          )}

          <div className="split-fields">
            <div>
              <label className="field-label" htmlFor="tax-price">Preço do produto</label>
              <input id="tax-price" className="ec-input" type="number" min="0" step="10" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} placeholder={String(base.price)} />
            </div>
            <div>
              <label className="field-label" htmlFor="tax-freight">Frete</label>
              <input id="tax-freight" className="ec-input" type="number" min="0" step="10" value={freight} onChange={(event) => setFreight(event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="tax-insurance">Seguro</label>
              <input id="tax-insurance" className="ec-input" type="number" min="0" step="10" value={insurance} onChange={(event) => setInsurance(event.target.value)} />
            </div>
          </div>

          <div className="split-fields">
            <div>
              <label className="field-label" htmlFor="tax-installments">Parcelas</label>
              <input id="tax-installments" className="ec-input" type="number" min="1" max="48" step="1" value={installments} onChange={(event) => setInstallments(event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="tax-interest">Juros ao mês</label>
              <input id="tax-interest" className="ec-input" type="number" min="0" step="0.01" value={monthlyInterest} onChange={(event) => setMonthlyInterest(event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="tax-inflation">Inflação esperada ao ano</label>
              <input id="tax-inflation" className="ec-input" type="number" min="0" step="0.1" value={inflationAnnual} onChange={(event) => setInflationAnnual(event.target.value)} />
            </div>
          </div>

          {mode === 'manual' && (
            <div className="rates-grid">
              {['ii', 'ipi', 'pis', 'cofins', 'icms'].map((key) => (
                <div key={key}>
                  <label className="field-label" htmlFor={`tax-rate-${key}`}>{key.toUpperCase()} %</label>
                  <input
                    id={`tax-rate-${key}`}
                    className="ec-input"
                    type="number"
                    step="0.01"
                    value={customRates[key]}
                    onChange={(event) => setCustomRates((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
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
            <div className="risk-chip">{burden.toFixed(1)}% tributos</div>
          </div>

          <div className="total-price">{BRL.format(result.credit.total)}</div>
          <p className="tax-total-caption">
            {installments}x de {BRL.format(result.credit.installment)}. À vista estimado: {BRL.format(result.cashTotal)}.
          </p>
          <div className="tax-progress">
            <span style={{ width: `${Math.min(100, burden)}%` }} />
          </div>

          <div className="tax-breakdown">
            {[
              ['Produto + frete + seguro', result.base],
              ['Imposto de Importação', result.importDuty],
              ['IPI', result.ipiValue],
              ['PIS', result.pisValue],
              ['COFINS', result.cofinsValue],
              ['ICMS estadual', result.icmsValue],
              ['Juros do parcelamento', result.credit.interest],
              ['Efeito inflação no prazo', result.inflationImpact],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{BRL.format(value)}</strong>
              </div>
            ))}
          </div>

          <div className="cost-destination-grid">
            <article>
              <span>Federal</span>
              <strong>{BRL.format(result.importDuty + result.ipiValue + result.pisValue + result.cofinsValue)}</strong>
              <p>II, IPI, PIS e COFINS quando aplicáveis.</p>
            </article>
            <article>
              <span>Estado</span>
              <strong>{BRL.format(result.icmsValue)}</strong>
              <p>ICMS estimado conforme alíquota informada.</p>
            </article>
            <article>
              <span>Crédito</span>
              <strong>{BRL.format(result.credit.interest)}</strong>
              <p>Custo financeiro das parcelas.</p>
            </article>
          </div>

          <button type="button" className="ec-btn" onClick={saveScenario}>Guardar cenário</button>

          {saved.length > 0 && (
            <div className="saved-scenarios">
              <span className="eyebrow">Cenários recentes</span>
              {saved.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <strong>{item.label}</strong>
                  <span>{BRL.format(item.total)} no parcelado</span>
                </div>
              ))}
            </div>
          )}

          <div className="tax-note">
            Estimativa educativa. Regras variam por NCM, estado, câmbio, loja, regime tributário e data da compra.
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartTaxSearch;
