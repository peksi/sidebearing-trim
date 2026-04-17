import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebearing } from "sidebearing-trim/react";
import { GlyphDiagram } from "./GlyphDiagram";

const FONT_SOURCE = "https://cdn.jsdelivr.net/npm/@fontsource/work-sans/files/work-sans-latin-600-normal.woff";

export function Preface() {
  const [trimEnabled, setTrimEnabled] = useState(false);

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">sidebearing-trim</Link>
        <div className="nav-links">
          <Link to="/#usage">Usage</Link>
          <Link to="/#demo">Demo</Link>
          <Link to="/#api">API</Link>
        </div>
      </nav>
      <main className="main">
        <section id="concept" className="section">
          <Link to="/" className="preface-back-link">← Back</Link>
          <p className="preface-eyebrow">Preface</p>
          <h2>Why should I care?</h2>
          <p>
            You're a frontend developer. You've been handed a task where you make card component with image and text. Designer sitting next to you is asking why the title isn't aligning with the image nor subtitle. You don't know. Nobody knows. But things have always been that way. The whole internet has been built that way.
          </p>
          <figure className="article-card-figure">
            <div className="article-card">
              <img
                className="article-card-img"
                src={`${import.meta.env.BASE_URL}middagsfjellet.jpeg`}
                alt=""
                aria-hidden="true"
              />
              <div className="article-card-body">
                <div className="article-card-guide" />
                <span className="article-card-cat">Travel</span>
                <h3 className="article-card-title">Life in the mountains</h3>
                <p className="article-card-meta">17.4.2026 · 3 min read</p>
                <p className="article-card-excerpt">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                </p>
              </div>
            </div>
            <figcaption className="article-card-caption">Pay attention to the left align of the card title. Do you see the gap?</figcaption>
          </figure>

          <p>
            You point out that it's the exact same thing that they've got on Figma. (Unless they've lived through the pixel perfect era of things and nudged some marigns, to which you point out that it isn't 2011 anymore.)
          </p>

          <figure className="inline-figure">
            <img src={`${import.meta.env.BASE_URL}figma-example.gif`} alt="Figma showing the card with misaligned title" className="inline-figure-img" />
            <figcaption className="article-card-caption">Non-constant left-align haunts designers in Figma too.</figcaption>
          </figure>

          <p>
            However this alignment gap is intentional and mostly a good thing. It's called a sidebearing and fonts have them by design.
            It is the whitespace baked into the glyph box.
          </p>

          <figure className="inline-figure">
            <GlyphDiagram />
            <figcaption className="article-card-caption">
              Glyphs from the font 'Work Sans Regular' by Wei Huang. Left sidebearing (LSB) and right sidebearing (RSB) highlighted in amber are the sidebearing spaces baked into the glyph box. The advance width is the total horizontal space the glyph occupies; unitsPerEm (teal) is the coordinate grid the font is drawn on.
            </figcaption>
          </figure>

          <p>
            At body text sizes, sidebearings are working as is. The
            spacing around each glyph is intentional, considered by the font designer
            to create optical consistency in running text.
            However, at larger display sizes the variable amount of sidebearing in the start of the left aligned lines may become noticeable.
          </p>
          <p>
            People have been noticing and acknowledging it. [<a href="https://github.com/w3c/csswg-drafts/issues/5466" target="_blank" rel="noreferrer">1</a>] There's even a <a href="https://lists.w3.org/Archives/Public/www-style/2014Jan/0242.html" target="_blank" rel="noreferrer">W3C CSS proposal from 2014</a> that has remained stale.
            Apart from some hacks [<a href="https://johndjameson.com/posts/sidebearings-and-alignment" target="_blank" rel="noreferrer">2</a>] [<a href="https://www.figma.com/community/plugin/1007645801320386272/text-visual-alignment" target="_blank" rel="noreferrer">3</a>], we still are left without a proper solution.
          </p>

          <p><strong>sidebearing-trim</strong> to the rescue! It reads each glyph's OpenType
            metrics, measures where the first ink actually lands on each line,
            and shifts the element left by exactly that amount.
          </p>
        </section>

        <section id="try-it" className="section">
          <h2>Try it</h2>
          <p>Toggle the trim on and off to see the difference on this card title.</p>
          <figure className="article-card-figure">
            <div className="article-card">
              <img
                className="article-card-img"
                src={`${import.meta.env.BASE_URL}middagsfjellet.jpeg`}
                alt=""
                aria-hidden="true"
              />
              <div className="article-card-body">
                <div className="article-card-guide" />
                <span className="article-card-cat">Travel</span>
                <Sidebearing
                  as="h3"
                  fontSource={FONT_SOURCE}
                  trim={trimEnabled}
                  className="article-card-title preface-demo-title"
                >
                  Life in the mountains
                </Sidebearing>
                <p className="article-card-meta">17.4.2026 · 3 min read</p>
                <p className="article-card-excerpt">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                </p>
                <div className="specimen-header" style={{ marginTop: "1.25rem" }}>
                  <label className="toggle-row">
                    <span className="toggle-track">
                      <input
                        type="checkbox"
                        checked={trimEnabled}
                        onChange={(e) => setTrimEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </span>
                  </label>
                  <span className="specimen-label">Sidebearing trim</span>
                </div>
              </div>
            </div>
          </figure>
        </section>

        <section id="acknowledgements" className="section">
          <h2>Acknowledgements</h2>
          <p>Thanks to Niklas Ekholm at <a href="https://helsinkitypestudio.com/" target="_blank" rel="noreferrer">Helsinki Type Studio</a> for sharing his knowledge on typography.</p>
        </section>
      </main>
      <footer className="footer">
        <p>Made by <a href="https://pekkalammi.com" target="_blank" rel="noreferrer">Pekka Lammi</a> · MIT License</p>
      </footer>
    </>
  );
}
