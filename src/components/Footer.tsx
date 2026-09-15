import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer-3d" id="appFooter">
      <div className="footer-content-wrap">
        <div className="footer-copyright-card">
          <div className="copyright-badge">
            <span className="shield-icon">🛡️</span>
            <span className="copyright-text">
              Made By <strong>Rizwan Shaikh @2026</strong>
            </span>
            <span className="verified-dot" title="Verified Creator" />
          </div>
          <div className="footer-tags">
            <span className="footer-tag">Official ZFOC Multi-Sheet Format</span>
            <span className="footer-tag">Daikin Airconditioning</span>
            <span className="footer-tag">Gemini AI Assistant</span>
          </div>
        </div>
        <p className="footer-subtext">
          Each tab represents a separate ZFOC sheet. Edit fields, rename tabs, and export all as
          multi‑sheet Excel (.xlsx) or combined PDF (.pdf).
        </p>
      </div>
    </footer>
  );
};
