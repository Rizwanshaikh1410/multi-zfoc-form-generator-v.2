import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_FIELDS, GuideStep, ToastMessage, ZfocEntry, ZfocFields } from './types';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { Tabs } from './components/Tabs';
import { ZfocTable } from './components/ZfocTable';
import { GuideAssistant } from './components/GuideAssistant';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { downloadExcel } from './utils/exportExcel';
import { downloadPDF } from './utils/exportPdf';

export default function App() {
  const [entries, setEntries] = useState<ZfocEntry[]>([
    {
      id: 'entry_1',
      name: 'ZFOC_1',
      fields: { ...DEFAULT_FIELDS },
    },
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('ZFOC_Sheets');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('zfoc-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const [guideOpen, setGuideOpen] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<keyof ZfocFields | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zfoc-theme', theme);
  }, [theme]);

  // Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAddTab = () => {
    const count = entries.length + 1;
    const newName = `ZFOC_${count}`;
    const newEntry: ZfocEntry = {
      id: `entry_${Date.now()}_${count}`,
      name: newName,
      fields: { ...DEFAULT_FIELDS },
    };
    setEntries((prev) => [...prev, newEntry]);
    setSelectedIndex(entries.length);
    showToast(`✅ नई ZFOC शीट जोड़ी गई: ${newName}`, 'success');
  };

  const handleDeleteTab = (index: number) => {
    if (entries.length <= 1) {
      showToast('❌ अंतिम शीट को डिलीट नहीं किया जा सकता।', 'error');
      return;
    }
    const targetName = entries[index].name;
    if (!window.confirm(`क्या आप शीट "${targetName}" डिलीट करना चाहते हैं?`)) return;

    setEntries((prev) => prev.filter((_, i) => i !== index));

    setSelectedIndex((prev) => {
      if (prev >= entries.length - 1) return Math.max(0, entries.length - 2);
      if (prev === index && index > 0) return index - 1;
      return prev;
    });

    showToast('🗑️ शीट सफलतापूर्वक डिलीट कर दी गई।', 'success');
  };

  const handleRenameTab = (index: number, newName: string) => {
    setEntries((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, name: newName } : item))
    );
  };

  const handleFieldChange = (key: keyof ZfocFields, value: string) => {
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === selectedIndex
          ? {
              ...entry,
              fields: {
                ...entry.fields,
                [key]: value,
              },
            }
          : entry
      )
    );
  };

  // Bulk apply fields (from Gemini AI auto-fill or presets)
  const handleApplyFields = (newFields: Partial<ZfocFields>) => {
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === selectedIndex
          ? {
              ...entry,
              fields: {
                ...entry.fields,
                ...newFields,
              },
            }
          : entry
      )
    );
    showToast('✨ Gemini AI ने शीट में जानकारी भर दी!', 'success');
  };

  const handleResetAll = () => {
    if (entries.length === 0) {
      showToast('❌ रिसेट करने के लिए कोई शीट नहीं है।', 'error');
      return;
    }
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        fields: { ...DEFAULT_FIELDS },
      }))
    );
    showToast('🔄 सभी शीट्स डिफॉल्ट वैल्यूज पर रिसेट हो गईं।', 'success');
  };

  const handleClearAll = () => {
    if (entries.length === 0) {
      showToast('❌ कोई शीट उपलब्ध नहीं है।', 'error');
      return;
    }
    if (!window.confirm('⚠️ इससे सभी शीट्स हट जाएंगी और 1 नई फ्रेश शीट बन जाएगी। क्या आप जारी रखना चाहते हैं?')) {
      return;
    }
    setEntries([
      {
        id: `entry_${Date.now()}`,
        name: 'ZFOC_1',
        fields: { ...DEFAULT_FIELDS },
      },
    ]);
    setSelectedIndex(0);
    showToast('🧹 सभी शीट्स साफ कर दी गईं। नई शीट तैयार है।', 'success');
  };

  const handleDownloadExcel = () => {
    try {
      if (entries.length === 0) {
        showToast('❌ एक्सपोर्ट करने के लिए कोई शीट नहीं है।', 'error');
        return;
      }
      const savedFileName = downloadExcel(entries, fileName);
      showToast(`✅ एक्सेल फाइल डाउनलोड हो गई: ${savedFileName}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`❌ एक्सेल एक्सपोर्ट विफल: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (entries.length === 0) {
        showToast('❌ एक्सपोर्ट करने के लिए कोई शीट नहीं है।', 'error');
        return;
      }
      const savedFileName = downloadPDF(entries, fileName);
      showToast(`✅ पीडीएफ फाइल डाउनलोड हो गई: ${savedFileName}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`❌ पीडीएफ एक्सपोर्ट विफल: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter for Excel download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleDownloadExcel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entries, fileName]);

  const handleGuideStepChange = (step: GuideStep) => {
    if (step.key) {
      setHighlightedKey(step.key);
      const rowEl = document.querySelector(`[data-field-key="${step.key}"]`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedKey(null);
    }
  };

  const currentEntry = entries[selectedIndex] || entries[0];

  return (
    <>
      <div className="app-wrapper modern-3d-app" id="zfocAppWrapper">
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onResetAll={handleResetAll}
          onClearAll={handleClearAll}
          onStartGuide={() => setGuideOpen(true)}
        />

        <Controls
          fileName={fileName}
          onFileNameChange={setFileName}
          onDownloadExcel={handleDownloadExcel}
          onDownloadPDF={handleDownloadPDF}
        />

        <Tabs
          entries={entries}
          selectedIndex={selectedIndex}
          onSelectTab={setSelectedIndex}
          onRenameTab={handleRenameTab}
          onDeleteTab={handleDeleteTab}
          onAddTab={handleAddTab}
        />

        <main id="formArea" className="form-main-area">
          {entries.length === 0 ? (
            <div className="empty-sheets-card modern-3d-card">
              <p>कोई शीट नहीं है। नई ZFOC शीट बनाने के लिए ऊपर "+" पर क्लिक करें।</p>
              <button className="btn-3d btn-guide-primary" onClick={handleAddTab} type="button">
                + नई शीट जोड़ें
              </button>
            </div>
          ) : (
            <ZfocTable
              fields={currentEntry.fields}
              onChangeField={handleFieldChange}
              highlightedKey={highlightedKey}
            />
          )}
        </main>

        <Footer />
      </div>

      <GuideAssistant
        isOpen={guideOpen}
        onToggle={(open) => setGuideOpen(open !== undefined ? open : !guideOpen)}
        onStepChange={handleGuideStepChange}
        onComplete={() => {
          showToast('🎉 सभी स्टेप्स पूरे हुए! अब आप एक्सेल या पीडीएफ डाउनलोड कर सकते हैं।', 'success');
          setHighlightedKey(null);
        }}
        currentFields={currentEntry.fields}
        onApplyFields={handleApplyFields}
      />

      <Toast toast={toast} />
    </>
  );
}
