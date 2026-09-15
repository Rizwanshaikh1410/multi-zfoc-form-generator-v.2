import React from 'react';
import { FIELD_DEFS, ZfocFields } from '../types';

interface ZfocTableProps {
  fields: ZfocFields;
  onChangeField: (key: keyof ZfocFields, value: string) => void;
  highlightedKey: keyof ZfocFields | null;
}

export const ZfocTable: React.FC<ZfocTableProps> = ({
  fields,
  onChangeField,
  highlightedKey,
}) => {
  return (
    <div className="zfoc-form-wrapper modern-3d-card" id="zfocFormWrapper">
      <div className="table-top-indicator">
        <div className="table-title-pill">
          <span className="pill-dot" />
          <span>Daikin Airconditioning India Pvt. Ltd. — ZFOC Format</span>
        </div>
      </div>

      <table className="zfoc-table modern-3d-table" id="zfocTable">
        <colgroup>
          <col style={{ width: '32%' }} />
          <col style={{ width: '68%' }} />
        </colgroup>
        <tbody>
          {/* 2 Top spacing rows */}
          <tr>
            <td colSpan={2} style={{ border: 'none', padding: '3px 0', background: 'transparent' }} />
          </tr>
          <tr>
            <td colSpan={2} style={{ border: 'none', padding: '3px 0', background: 'transparent' }} />
          </tr>

          {/* 12 Form Fields */}
          {FIELD_DEFS.map((def) => {
            const val = fields[def.key] ?? '';
            const isOrder = def.key === 'orderType';
            const isPart = def.key === 'partCodeName';
            const isHighlighted = highlightedKey === def.key;

            return (
              <tr
                key={def.key}
                id={`fieldRow_${def.key}`}
                className={`field-row ${isOrder ? 'order-type-row' : ''} ${isPart ? 'part-row' : ''} ${
                  isHighlighted ? 'field-highlight' : ''
                }`}
                data-field-key={def.key}
              >
                <td className="label-cell">
                  <div className="label-content-wrap">
                    <span className="label-en">{def.label}</span>
                    <span className="label-hi">{def.hindiLabel}</span>
                  </div>
                </td>
                <td className="value-cell" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id={`input_${def.key}`}
                    data-key={def.key}
                    value={val}
                    onChange={(e) => onChangeField(def.key, e.target.value)}
                    placeholder={def.placeholder}
                    className="zfoc-cell-input"
                  />
                  <div
                    className="guide-arrow"
                    id={`guideArrow_${def.key}`}
                    style={{ display: isHighlighted ? 'block' : 'none' }}
                  >
                    👉
                  </div>
                </td>
              </tr>
            );
          })}

          {/* Bottom spacing rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={`spacer_${i}`}>
              <td colSpan={2} style={{ border: 'none', padding: '3px 0', background: 'transparent' }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
