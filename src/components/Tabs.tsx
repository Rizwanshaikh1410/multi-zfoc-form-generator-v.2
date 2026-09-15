import React, { useRef } from 'react';
import { ZfocEntry } from '../types';

interface TabsProps {
  entries: ZfocEntry[];
  selectedIndex: number;
  onSelectTab: (index: number) => void;
  onRenameTab: (index: number, newName: string) => void;
  onDeleteTab: (index: number) => void;
  onAddTab: () => void;
}

export const Tabs: React.FC<TabsProps> = ({
  entries,
  selectedIndex,
  onSelectTab,
  onRenameTab,
  onDeleteTab,
  onAddTab,
}) => {
  return (
    <div className="tabs-container modern-3d-tabs-bar" id="tabsContainer">
      <div className="tabs-scroll-track">
        {entries.map((entry, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <div
              key={entry.id}
              className={`tab-item modern-3d-tab ${isActive ? 'active' : ''}`}
              data-index={idx}
              id={`tabItem_${idx}`}
              onClick={() => onSelectTab(idx)}
            >
              <span className="tab-folder-icon">📑</span>
              <TabNameSpan
                name={entry.name}
                onRename={(newName) => onRenameTab(idx, newName)}
              />
              <span
                className="tab-delete modern-3d-delete"
                id={`tabDelete_${idx}`}
                title="Delete this sheet"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTab(idx);
                }}
              >
                ✕
              </span>
            </div>
          );
        })}
      </div>

      <button
        className="tab-add modern-3d-add-btn"
        id="addEntryBtn"
        title="नई ZFOC शीट जोड़ें (Add new ZFOC sheet)"
        onClick={onAddTab}
        type="button"
      >
        <span className="add-plus-symbol">+</span>
        <span className="add-btn-text">नई शीट</span>
      </button>
    </div>
  );
};

interface TabNameSpanProps {
  name: string;
  onRename: (name: string) => void;
}

const TabNameSpan: React.FC<TabNameSpanProps> = ({ name, onRename }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleBlur = () => {
    if (!spanRef.current) return;
    const text = spanRef.current.innerText.trim() || 'ZFOC';
    spanRef.current.innerText = text;
    onRename(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      spanRef.current?.blur();
    }
  };

  const handleDoubleClick = () => {
    if (!spanRef.current) return;
    spanRef.current.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(spanRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <span
      ref={spanRef}
      className="tab-name"
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      title="नाम बदलने के लिए डबल-क्लिक करें (Double-click to rename)"
    >
      {name}
    </span>
  );
};
