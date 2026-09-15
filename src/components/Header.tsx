import React from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetAll: () => void;
  onClearAll: () => void;
  onStartGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onResetAll,
  onClearAll,
  onStartGuide,
}) => {
  return (
    <header className="app-header modern-3d-header-bar">
      <div className="header-brand-wrap">
        <div className="header-icon-3d">
          <span className="icon-main">📋</span>
          <span className="icon-glow" />
        </div>
        <div>
          <h1 id="appHeaderTitle" className="app-title-3d">
            ZFOC <span className="title-highlight">Multi‑Sheet</span>
          </h1>
          <p className="app-subtitle-3d">
            Daikin Zero Free Of Cost Warranty Form Generator
          </p>
        </div>
      </div>

      <div className="header-actions" id="headerActions">
        <button
          className="btn-3d btn-theme-toggle"
          id="themeToggle"
          onClick={onToggleTheme}
          title="Toggle dark/light mode"
          type="button"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <button
          className="btn-3d btn-reset"
          id="resetAllBtn"
          onClick={onResetAll}
          title="Reset all entries to default values"
          type="button"
        >
          ↻ Reset
        </button>

        <button
          className="btn-3d btn-clear"
          id="clearAllBtn"
          onClick={onClearAll}
          title="Remove all sheets and create one fresh sheet"
          type="button"
        >
          🗑️ Clear
        </button>

        <button
          className="btn-3d btn-guide-primary"
          id="guideStartBtn"
          onClick={onStartGuide}
          title="हिंदी AI गाइड प्रारंभ करें (Start Hindi Guide)"
          type="button"
        >
          <span className="assistant-guide-emoji">👩‍💼</span> पूजा AI गाइड
        </button>
      </div>
    </header>
  );
};
