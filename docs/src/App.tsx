import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebearing } from "sidebearing-trim/react";

const installSnippet = `npm install sidebearing-trim`;

const vanillaSnippet = `import { trimSidebearings } from "sidebearing-trim";

const element = document.querySelector(".headline");
await trimSidebearings(element, "/fonts/inter-latin-400-normal.woff");`;

const reactSnippet = `import { Sidebearing } from "sidebearing-trim/react";

<Sidebearing
  as="h1"
  trim
  fontSource="/fonts/inter-latin-400-normal.woff"
>
  Lorem <em>ipsum</em> dolor sit amet
</Sidebearing>`;

const demoFonts = [
  { label: "Work Sans",        url: "https://cdn.jsdelivr.net/npm/@fontsource/work-sans/files/work-sans-latin-400-normal.woff" },
  { label: "Inter",            url: "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff" },
  { label: "Roboto",           url: "https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-latin-400-normal.woff" },
  { label: "Playfair Display", url: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff" },
  { label: "Lato",             url: "https://cdn.jsdelivr.net/npm/@fontsource/lato/files/lato-latin-400-normal.woff" },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle-row">
      <span className="toggle-track">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </span>
      <span className="toggle-label-text">{label}</span>
    </label>
  );
}


function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`copy-btn${copied ? " copied" : ""}`}
      onClick={handleCopy}
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function App() {
  const [trimEnabled, setTrimEnabled] = useState(true);
  const [heroTrimEnabled, setHeroTrimEnabled] = useState(true);
  const [heroAutoToggle, setHeroAutoToggle] = useState(true);
  const [selectedFont, setSelectedFont] = useState(demoFonts[0]);
  const [demoText, setDemoText] = useState(
    "Typography should align by visible ink, not by sidebearing."
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!heroAutoToggle) return;
    const id = setInterval(() => setHeroTrimEnabled((v) => !v), 2000);
    return () => clearInterval(id);
  }, [heroAutoToggle]);

  useEffect(() => {
    const face = new FontFace(selectedFont.label, `url(${selectedFont.url})`);
    // FontFaceSet.add() is a valid browser API but missing from TypeScript's DOM types.
    face.load().then((loaded) => (document.fonts as unknown as { add(f: FontFace): void }).add(loaded)).catch(() => {});
  }, [selectedFont]);

  useEffect(() => {
    if (wrapperRef.current && textareaRef.current) {
      textareaRef.current.style.height = wrapperRef.current.offsetHeight + "px";
    }
  });
  return (
    <div className="site">
      {/* ── Nav ── */}
      <nav className="nav">
        <Link to="/" className="nav-logo">sidebearing-trim</Link>
        <div className="nav-links">
          <a href="#usage">Usage</a>
          <a href="#demo">Demo</a>
          <a href="#api">API</a>
        </div>
      </nav>

      <>
      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-inner">
        <div className="hero-content">
        <a
            href="https://github.com/peksi/sidebearing-trim"
            target="_blank"
            rel="noreferrer"
            className="hero-github-badge"
            aria-label="View sidebearing-trim on GitHub"
          >
            <img
              src="https://img.shields.io/github/stars/peksi/sidebearing-trim?style=social"
              alt="GitHub stars"
              loading="lazy"
            />
          </a>
          <h1 className="hero-title">
            sidebearing<span className="hero-dash">-</span>trim
          </h1>
          <p className="hero-desc">
            Align columns by visible ink, <br /> not by glyph box width.
          </p>
          <div className="hero-install">
            <code>{installSnippet}</code>
            <CopyButton text={installSnippet} />
          </div>
        </div>

        {/* Visual specimen — article card */}
        <div className="hero-visual">
          <div className="hero-card-wrap">
          
          <div className="article-card">
            <div className="article-card-body" onMouseEnter={() => setHeroAutoToggle(false)}>
              <div className="article-card-guide" />
              <Sidebearing
                as="h3"
                fontSource="https://cdn.jsdelivr.net/npm/@fontsource/work-sans/files/work-sans-latin-600-normal.woff"
                trim={heroTrimEnabled}
                className="article-card-title"
              >
                Here's an example
              </Sidebearing>
              <p className="article-card-meta">17.4.2026 · 3 min read</p>
              <p className="article-card-excerpt">
                Look how the title box left alignment gets fixed by toggling the button
              </p>
              <div className="specimen-header" style={{ marginBottom: "0.75rem", marginTop: "1.75rem" }}>
                <Toggle
                  checked={heroTrimEnabled}
                  onChange={(v) => { setHeroAutoToggle(false); setHeroTrimEnabled(v); }}
                  label=""
                />
                <span className="specimen-label">
                  Sidebearing trim
                </span>
              </div>
              <Link to="/preface" className="hero-card-why-link">Why should I care?</Link>
            </div>
          </div>
          </div>
        </div>
        </div>{/* .hero-inner */}
      </header>

      <main className="main">
        <section id="preface" className="section">
          <h2>Why should I care?</h2>
          <p>Text never starts exacatly from the edge of the textbox. Sometimes it might become an issue. This package solves that issue.</p>
          <p>You can read the full backstory and motivation <Link to="/preface">here</Link>.</p>
        </section>

        {/* ── Usage ── */}
        <section id="usage" className="section">
          <h2>Usage</h2>
          <div className="usage-grid">
            <div>
              <div className="usage-block-title">
                <span className="badge badge-js">JS</span>
                Vanilla JavaScript
              </div>
              <div className="code-block">
                <CopyButton text={vanillaSnippet} />
                <pre>
                  <code>{vanillaSnippet}</code>
                </pre>
              </div>
            </div>

            <div>
              <div className="usage-block-title">
                <span className="badge badge-react">React</span>
                React Component
              </div>
              <div className="code-block">
                <CopyButton text={reactSnippet} />
                <pre>
                  <code>{reactSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Live Demo ── */}
        <section id="demo" className="section">
          <h2>Demo</h2>
          <p>
            Type your own lines into the box and toggle the trim to compare optical alignment against box-origin
            alignment. The red line marks the layout edge. 
          </p>

          <div className="demo-controls">
            <label className="toggle-row">
              <span className="toggle-track">
                <input
                  type="checkbox"
                  checked={trimEnabled}
                  onChange={(e) => setTrimEnabled(e.target.checked)}
                />
                <span className="toggle-slider" />
              </span>
              <span className="toggle-label-text">
                {trimEnabled ? "Trim enabled" : "Trim disabled"}
              </span>
            </label>

            <label className="font-select-row">
              <span className="toggle-label-text">Font</span>
              <select
                className="font-select"
                value={selectedFont.url}
                onChange={(e) =>
                  setSelectedFont(demoFonts.find((f) => f.url === e.target.value)!)
                }
              >
                {demoFonts.map((f) => (
                  <option key={f.url} value={f.url}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="demo-stage">
            <div className="demo-ink-guide" />
            <div className="demo-editable" ref={wrapperRef}>
              <Sidebearing
                as="p"
                fontSource={selectedFont.url}
                trim={trimEnabled}
                style={{ margin: 0, fontSize: "clamp(32px, 7vw, 100px)", lineHeight: 1.25, fontFamily: `'${selectedFont.label}', sans-serif`, pointerEvents: "none", whiteSpace: "pre-wrap" }}
              >
                {demoText.endsWith("\n") ? demoText + "\u00A0" : demoText}
              </Sidebearing>
              <textarea
                ref={textareaRef}
                className="demo-overlay-input"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                style={{ fontSize: "clamp(32px, 7vw, 100px)", lineHeight: 1.25, fontFamily: `'${selectedFont.label}', sans-serif` }}
              />
            </div>
          </div>
        </section>

        {/* ── API ── */}
        <section id="api" className="section">
          <h2>API</h2>

          <div className="api-entry">
            <code className="api-sig">
              trimSidebearings(elements, fontSource, options?)
            </code>
            <p>
              Vanilla JS function. Measures sidebearing for each element and
              applies a negative (or positive) <code>margin-inline-start</code>.
            </p>
            <table className="api-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>elements</code>
                  </td>
                  <td>
                    <code>Element | NodeList</code>
                  </td>
                  <td>Target element(s) to trim</td>
                </tr>
                <tr>
                  <td>
                    <code>fontSource</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>URL to the WOFF font file</td>
                </tr>
                <tr>
                  <td>
                    <code>options</code>
                  </td>
                  <td>
                    <code>object?</code>
                  </td>
                  <td>Optional configuration</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="api-entry">
            <code className="api-sig">
              {'<Sidebearing fontSource="..." trim as="h1">'}
            </code>
            <p>
              React component. Wraps any element and re-runs on content or font
              changes.
            </p>
            <table className="api-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>fontSource</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>URL to the WOFF font file</td>
                </tr>
                <tr>
                  <td>
                    <code>trim</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>Enable or disable trimming</td>
                </tr>
                <tr>
                  <td>
                    <code>as</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    HTML element to render (default: <code>span</code>)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Limitations ── */}
        <section id="limitations" className="section">
          <h2>Known limitations</h2>
          <ul className="limitations-list">
            {[
              "Requires mounted DOM nodes for visual line-start detection.",
              "Only .woff fonts are supported — .woff2 support would add ~1.15 MB to the bundle due to Brotli decompression.",
              "You need to have the .woff file at hand",
              "No RTL support (yet!)"
            ].map((note) => (
              <li key={note}>
                <span className="li-icon">!</span>
                {note}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="footer">
        <p>Made by <a href="https://pekkalammi.com" target="_blank">Pekka Lammi</a> · MIT License</p>
      </footer>
      </>

    </div>
  );
}
