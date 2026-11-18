export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="TapeVerdict home">
          <span className="wordmark-mark" aria-hidden="true">T</span>
          <span>TapeVerdict</span>
        </a>
        <span className="network-label">X LAYER / TAPEOUT</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">A clearer view of on-chain websites</p>
        <h1 id="page-title">
          File integrity is not the same as <span>content safety.</span>
        </h1>
        <p className="intro">
          TapeOut verifies that website files match their on-chain fingerprints.
          TapeVerdict is being built to inspect those files for indicators that
          visitors should know about.
        </p>

        <div className="status-card" role="status">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <p className="status-title">The assessment engine is in progress</p>
            <p className="status-copy">
              Ratings are not available yet. No site has been assessed by this
              application.
            </p>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <span>Transparent checks. Evidence you can inspect.</span>
        <span>Built for TapeOut on X Layer</span>
      </footer>
    </main>
  );
}
