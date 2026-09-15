import React from 'react';

interface ControlsProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  onDownloadExcel: () => void;
  onDownloadPDF: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  fileName,
  onFileNameChange,
  onDownloadExcel,
  onDownloadPDF,
}) => {
  return (
    <div className="controls modern-3d-controls" id="controlsSection">
      <div className="file-name-group-3d">
        <label htmlFor="fileNameInput" id="fileNameLabel" className="file-label-3d">
          <span className="file-icon-badge">📁</span>
          <span className="file-label-text">
            File Name <span className="file-label-sub">(फाइल नाम)</span>
          </span>
        </label>
        <div className="input-3d-wrap">
          <input
            type="text"
            id="fileNameInput"
            className="file-input-3d"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder="ZFOC_Sheets"
          />
        </div>
      </div>

      <div className="btn-group-3d" id="exportBtnGroup">
        <button
          className="btn-3d btn-export-excel"
          id="excelExportBtn"
          onClick={onDownloadExcel}
          type="button"
          title="Download multi-sheet Excel (.xlsx) [Ctrl + Enter]"
        >
          <svg className="btn-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <path d="M9 13l2 3-2 3h1.5l1.5-2.25L13.5 19H15l-2-3 2-3h-1.5L12 14.25 10.5 13H9z" />
          </svg>
          <span className="btn-text-content">
            <strong>Download Excel</strong>
            <small className="btn-subtext">.xlsx (Multi-Sheet)</small>
          </span>
        </button>

        <button
          className="btn-3d btn-export-pdf"
          id="pdfExportBtn"
          onClick={onDownloadPDF}
          type="button"
          title="Download combined PDF document"
        >
          <svg className="btn-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <path d="M9 13l2 3-2 3h1.5l1.5-2.25L13.5 19H15l-2-3 2-3h-1.5L12 14.25 10.5 13H9z" />
          </svg>
          <span className="btn-text-content">
            <strong>Download PDF</strong>
            <small className="btn-subtext">.pdf (A4 Formatted)</small>
          </span>
        </button>
      </div>
    </div>
  );
};
