import { useState, useCallback, useRef } from 'react';

/* ── EMI formula ── */
function calculateEMI(principal, annualRate, tenureYears) {
  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100;
  const n = parseFloat(tenureYears) * 12;

  if (r === 0) {
    const emi = P / n;
    return { emi, totalPayment: P, totalInterest: 0 };
  }

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return { emi, totalPayment, totalInterest };
}

/* ── Currency formatter ── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/* ── Slider progress style ── */
function sliderStyle(value, min, max) {
  const pct = ((value - min) / (max - min)) * 100;
  return { '--val': `${pct}%` };
}

export default function App() {
  const [loanAmount, setLoanAmount]     = useState('500000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenure, setTenure]             = useState('5');
  const [result, setResult]             = useState(null);
  const [errors, setErrors]             = useState({});
  const [calculating, setCalculating]   = useState(false);
  const resultRef                        = useRef(null);

  /* ── Validation ── */
  const validate = useCallback(() => {
    const e = {};
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate);
    const T = parseFloat(tenure);

    if (!loanAmount || isNaN(P) || P <= 0)              e.loanAmount    = 'Enter a valid loan amount';
    if (P > 100_000_000)                                 e.loanAmount    = 'Amount too large (max ₹10 Cr)';
    if (!interestRate || isNaN(R) || R <= 0 || R > 50)  e.interestRate  = 'Enter rate between 0.1% – 50%';
    if (!tenure || isNaN(T) || T < 1 || T > 30)         e.tenure        = 'Enter tenure between 1 – 30 years';
    return e;
  }, [loanAmount, interestRate, tenure]);

  /* ── Calculate ── */
  const handleCalculate = useCallback(() => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setCalculating(true);
    setTimeout(() => {
      const res = calculateEMI(loanAmount, interestRate, tenure);
      setResult(res);
      setCalculating(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 350);
  }, [loanAmount, interestRate, tenure, validate]);

  /* ── Clear errors on change ── */
  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setResult(null);
  };

  /* ── Breakdown percentages ── */
  const principalPct = result ? (parseFloat(loanAmount) / result.totalPayment) * 100 : 0;
  const interestPct  = result ? (result.totalInterest / result.totalPayment)   * 100 : 0;

  return (
    <div className="app-wrapper">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-badge">
          <span className="dot" /> EMI Calculator &nbsp;·&nbsp; 2026
        </div>
        <h1>
          Calculate Your&nbsp;
          <span className="gradient-text">Loan EMI</span>
        </h1>
        <p className="subtitle">
          Instantly compute your monthly installment, total interest &amp; payment breakdown — all in one place.
        </p>
      </header>

      {/* ── Calculator Card ── */}
      <main className="calculator-card" aria-label="EMI Calculator">

        <div className="form-grid">

          {/* Loan Amount */}
          <div className="input-group">
            <label className="input-label" htmlFor="loanAmount">
              Loan Amount
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="loanAmount"
                className="form-input"
                type="number"
                min="1"
                max="100000000"
                placeholder="5,00,000"
                value={loanAmount}
                onChange={handleChange(setLoanAmount, 'loanAmount')}
              />
            </div>
            <input
              type="range"
              className="range-slider"
              min="10000"
              max="10000000"
              step="10000"
              value={loanAmount || 10000}
              style={sliderStyle(loanAmount || 10000, 10000, 10000000)}
              onChange={handleChange(setLoanAmount, 'loanAmount')}
              aria-label="Loan Amount slider"
            />
            <div className="slider-labels"><span>₹10K</span><span>₹1 Cr</span></div>
            {errors.loanAmount && <p className="error-msg">⚠ {errors.loanAmount}</p>}
          </div>

          {/* Interest Rate */}
          <div className="input-group">
            <label className="input-label" htmlFor="interestRate">
              Interest Rate
            </label>
            <div className="input-wrapper">
              <span className="input-prefix" style={{ color: '#A0855C' }}>%</span>
              <input
                id="interestRate"
                className="form-input"
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                placeholder="8.5"
                value={interestRate}
                onChange={handleChange(setInterestRate, 'interestRate')}
              />
              <span className="input-suffix">p.a.</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min="1"
              max="30"
              step="0.1"
              value={interestRate || 1}
              style={sliderStyle(interestRate || 1, 1, 30)}
              onChange={handleChange(setInterestRate, 'interestRate')}
              aria-label="Interest Rate slider"
            />
            <div className="slider-labels"><span>1%</span><span>30%</span></div>
            {errors.interestRate && <p className="error-msg">⚠ {errors.interestRate}</p>}
          </div>

          {/* Tenure */}
          <div className="input-group">
            <label className="input-label" htmlFor="tenure">
          Loan Tenure
            </label>
            <div className="input-wrapper">
              <span className="input-prefix" style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Yr</span>
              <input
                id="tenure"
                className="form-input"
                type="number"
                min="1"
                max="30"
                placeholder="5"
                value={tenure}
                onChange={handleChange(setTenure, 'tenure')}
              />
              <span className="input-suffix">yrs</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min="1"
              max="30"
              step="1"
              value={tenure || 1}
              style={sliderStyle(tenure || 1, 1, 30)}
              onChange={handleChange(setTenure, 'tenure')}
              aria-label="Tenure slider"
            />
            <div className="slider-labels"><span>1 yr</span><span>30 yrs</span></div>
            {errors.tenure && <p className="error-msg">⚠ {errors.tenure}</p>}
          </div>

        </div>

        {/* Calculate Button */}
        <button
          id="calculate-btn"
          className="calc-btn"
          onClick={handleCalculate}
          disabled={calculating}
          aria-label="Calculate EMI"
        >
          {calculating ? (
            <>Calculating… ⏳</>
          ) : (
            <>Calculate EMI <span className="btn-icon">→</span></>
          )}
        </button>

        {/* ── Results ── */}
        {result && (
          <section className="results-section" ref={resultRef} aria-label="EMI Results">

            <div className="results-divider">
              <span>Your Breakdown</span>
            </div>

            {/* 3-card grid */}
            <div className="results-grid">

              <div className="result-card emi">
                <div className="result-icon">💳</div>
                <div className="result-label">Monthly EMI</div>
                <div className="result-value count-anim" id="monthly-emi">
                  {fmt(result.emi)}
                </div>
              </div>

              <div className="result-card interest">
                <div className="result-icon">📈</div>
                <div className="result-label">Total Interest</div>
                <div className="result-value count-anim" id="total-interest">
                  {fmt(result.totalInterest)}
                </div>
              </div>

              <div className="result-card total">
                <div className="result-icon">🏦</div>
                <div className="result-label">Total Payment</div>
                <div className="result-value count-anim" id="total-payment">
                  {fmt(result.totalPayment)}
                </div>
              </div>

            </div>

            {/* Breakdown bar */}
            <div className="breakdown-bar-wrap">
              <h3>Principal vs Interest Ratio</h3>
              <div className="bar-track" role="img" aria-label={`Principal ${principalPct.toFixed(0)}%, Interest ${interestPct.toFixed(0)}%`}>
                <div className="bar-principal" style={{ width: `${principalPct}%` }} />
                <div className="bar-interest"  style={{ width: `${interestPct}%` }} />
              </div>
              <div className="bar-legend">
                <div className="legend-item">
                  <span className="legend-dot principal" />
                  Principal — {principalPct.toFixed(1)}% ({fmt(parseFloat(loanAmount))})
                </div>
                <div className="legend-item">
                  <span className="legend-dot interest" />
                  Interest — {interestPct.toFixed(1)}% ({fmt(result.totalInterest)})
                </div>
              </div>
            </div>

          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="author-card">
          <div className="author-avatar">SK</div>
          <div className="author-name">Shubham Kumar</div>
          <div className="author-email">shubhambr@gmail.com</div>
        </div>

        <div>
          <a
            id="digital-heroes-btn"
            className="cta-btn"
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <span className="rocket">🚀</span> */}
            Built for Digital Heroes
          </a>
        </div>

        <p className="footer-note">
          © {new Date().getFullYear()} Shubham Kumar · All calculations are indicative
        </p>
      </footer>

    </div>
  );
}
