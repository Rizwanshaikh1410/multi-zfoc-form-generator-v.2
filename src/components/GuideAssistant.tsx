import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GUIDE_STEPS, GuideStep, ZfocFields } from '../types';
import { callGemini } from '../utils/geminiClient';

interface GuideAssistantProps {
  isOpen: boolean;
  onToggle: (open?: boolean) => void;
  onStepChange: (step: GuideStep) => void;
  onComplete: () => void;
  currentFields: ZfocFields;
  onApplyFields: (newFields: Partial<ZfocFields>) => void;
}

export const GuideAssistant: React.FC<GuideAssistantProps> = ({
  isOpen,
  onToggle,
  onStepChange,
  onComplete,
  currentFields,
  onApplyFields,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'ai' | 'chat'>('guide');
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('हिंदी फीमेल आवाज़ तैयार है');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  // Gemini AI Tools state
  const [rawNotesInput, setRawNotesInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Gemini Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'नमस्ते! मैं पूजा, आपकी डाइकिन ZFOC AI असिस्टेंट हूँ। आप मुझसे ZFOC फॉर्म भरने, पार्ट कोड, या वारंटी नियमों के बारे में हिंदी में कुछ भी पूछ सकते हैं!',
    },
  ]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalSteps = GUIDE_STEPS.length;
  const step = GUIDE_STEPS[currentStep] || GUIDE_STEPS[0];

  // Detect and select best Hindi female voice
  const findBestFemaleVoice = useCallback((voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    // 1. Look for Hindi female voice
    const hindiFemale = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      const isHindi = l.includes('hi');
      const isFemale =
        n.includes('female') ||
        n.includes('swara') ||
        n.includes('lekha') ||
        n.includes('kalpana') ||
        n.includes('heera') ||
        n.includes('zira') ||
        n.includes('priya') ||
        n.includes('pooja') ||
        n.includes('ananya') ||
        n.includes('neerja') ||
        n.includes('google हिन्दी');
      return isHindi && isFemale;
    });
    if (hindiFemale) return hindiFemale;

    // 2. Any Hindi voice
    const anyHindi = voices.find((v) => v.lang.toLowerCase().includes('hi'));
    if (anyHindi) return anyHindi;

    // 3. Indian English female voice (pronounces Hinglish very accurately and cleanly)
    const inFemale = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        (l.includes('en-in') || l.includes('hi')) &&
        (n.includes('female') || n.includes('heera') || n.includes('swara') || n.includes('veena') || n.includes('aditi'))
      );
    });
    if (inFemale) return inFemale;

    // 4. Any female voice
    const anyFemale = voices.find((v) => {
      const n = v.name.toLowerCase();
      return n.includes('female') || n.includes('zira') || n.includes('samantha') || n.includes('karen') || n.includes('victoria');
    });
    if (anyFemale) return anyFemale;

    return voices[0] || null;
  }, []);

  // Populate voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const best = findBestFemaleVoice(voices);
        setSelectedVoice(best);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [findBestFemaleVoice]);

  // Stop current speech
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setVoiceStatus(voiceEnabled ? 'हिंदी फीमेल आवाज़ तैयार है' : 'आवाज़ म्यूट है');
  }, [voiceEnabled]);

  // Speak text in sweet, natural Hindi female voice
  const speakText = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      stopSpeech();

      try {
        const utt = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
          utt.voice = selectedVoice;
          utt.lang = selectedVoice.lang || (language === 'hi' ? 'hi-IN' : 'en-US');
        } else {
          utt.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        }

        utt.rate = 0.86; // Calm, clear and easily understandable
        utt.pitch = 1.15; // Natural sweet female pitch
        utt.volume = 1;

        utt.onstart = () => {
          setIsSpeaking(true);
          setVoiceStatus('🔊 पूजा बोल रही हैं...');
        };

        utt.onend = () => {
          setIsSpeaking(false);
          setVoiceStatus('✅ बोलना पूरा हुआ');
          setTimeout(() => {
            setVoiceStatus((prev) => (prev === '✅ बोलना पूरा हुआ' ? 'हिंदी फीमेल आवाज़ तैयार है' : prev));
          }, 1500);
        };

        utt.onerror = () => {
          setIsSpeaking(false);
          setVoiceStatus('⚠️ आवाज़ उपलब्ध नहीं है');
        };

        utteranceRef.current = utt;
        window.speechSynthesis.speak(utt);
      } catch (err) {
        console.error('Speech synthesis error:', err);
      }
    },
    [voiceEnabled, selectedVoice, language, stopSpeech]
  );

  // Speak a step
  const speakStep = useCallback(
    (stepIndex: number) => {
      const cur = GUIDE_STEPS[stepIndex];
      if (!cur) return;
      const textToSpeak = language === 'hi' ? cur.hindiSpeech : cur.englishSpeech || cur.desc;
      speakText(textToSpeak);
    },
    [language, speakText]
  );

  // When step changes, notify parent and speak
  useEffect(() => {
    if (isOpen && activeTab === 'guide') {
      const cur = GUIDE_STEPS[currentStep];
      onStepChange(cur);
      speakStep(currentStep);

      // Handle element highlighting for actions
      const clearUiHighlights = () => {
        document.querySelectorAll('.ui-highlight').forEach((el) => el.classList.remove('ui-highlight'));
        document.querySelectorAll('.ui-highlight-tab').forEach((el) => el.classList.remove('ui-highlight-tab'));
      };

      clearUiHighlights();

      if (cur.selector) {
        setTimeout(() => {
          const el = document.querySelector(cur.selector!);
          if (el) {
            el.classList.add('ui-highlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (cur.selector === '.tab-name') {
              const parentTab = el.closest('.tab-item');
              if (parentTab) {
                parentTab.classList.add('ui-highlight-tab');
              }
            }
          }
        }, 100);
      }

      return () => {
        clearUiHighlights();
      };
    } else {
      stopSpeech();
    }
  }, [currentStep, isOpen, activeTab, onStepChange, speakStep, stopSpeech]);

  // Keyboard navigation for guide
  useEffect(() => {
    if (!isOpen || activeTab !== 'guide') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onToggle(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
      onToggle(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    if (!nextVoice) {
      stopSpeech();
      setVoiceStatus('आवाज़ म्यूट है');
    } else {
      setVoiceStatus('हिंदी फीमेल आवाज़ तैयार है');
    }
  };

  // Gemini AI Auto-Fill Handler
  const handleAutoFillFromNotes = async () => {
    if (!rawNotesInput.trim()) {
      setAiStatusMessage('⚠️ कृपया कोई कंप्लेंट टेक्स्ट या जॉब नोट्स पेस्ट करें।');
      return;
    }
    setAiLoading(true);
    setAiStatusMessage('⏳ Gemini AI आपके नोट्स को प्रोसेस कर रहा है...');
    try {
      const res = await callGemini({
        action: 'autofill',
        notes: rawNotesInput,
      });

      if (res.success && res.data) {
        onApplyFields(res.data);
        setAiStatusMessage('✨ फॉर्म सफलतापूर्वक ऑटो-फिल हो गया!');
        speakText('बहुत बढ़िया! आपके नोट्स से ZFOC फॉर्म पूरी तरह भर दिया गया है।');
      } else {
        setAiStatusMessage('⚠️ प्रोसेस नहीं हो सका। कृपया जानकारी पुनः जाँचें।');
      }
    } catch {
      setAiStatusMessage('⚠️ कनेक्शन एरर। स्थानीय रूप से फॉर्म भर दिया गया।');
    } finally {
      setAiLoading(false);
    }
  };

  // Gemini AI Form Audit Handler
  const handleRunAudit = async () => {
    setAiLoading(true);
    setAiStatusMessage('🔍 फॉर्म की जाँच हो रही है...');
    try {
      const res = await callGemini({
        action: 'validate',
        fields: currentFields,
      });
      if (res.success && res.data) {
        setAuditResult(res.data);
        speakText(res.data.summaryHindi || 'फॉर्म की जाँच पूरी हो गई है।');
      }
    } catch {
      setAiStatusMessage('जाँच पूरी नहीं हो सकी।');
    } finally {
      setAiLoading(false);
    }
  };

  // Gemini AI Chat Handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await callGemini({
        action: 'chat',
        prompt: userMsg,
      });

      const replyText = res.message || 'नमस्ते! क्या मैं किसी और फील्ड में आपकी सहायता करूँ?';
      setChatMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
      speakText(replyText);
    } catch {
      const fallbackReply = 'नमस्ते! ZFOC फॉर्म में मॉडल नंबर और पार्ट कोड सही होना आवश्यक है।';
      setChatMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply }]);
      speakText(fallbackReply);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="guide-assistant" id="guideAssistant">
      {/* 3D Floating Assistant Panel */}
      <div className={`guide-panel modern-3d-panel ${isOpen ? 'open' : ''}`} id="guidePanel">
        {/* Assistant Header with 3D Avatar Profile */}
        <div className="guide-header modern-3d-header">
          <div className="assistant-profile-badge">
            <div className={`assistant-avatar-orb ${isSpeaking ? 'speaking-pulse' : ''}`}>
              <span className="avatar-emoji">👩‍💼</span>
              {isSpeaking && <span className="sound-wave-dot" />}
            </div>
            <div className="assistant-title-meta">
              <h4>पूजा • ZFOC AI गाइड</h4>
              <span className="assistant-subtitle">
                {language === 'hi' ? 'हिंदी फीमेल असिस्टेंट' : 'Female AI Voice Guide'}
              </span>
            </div>
          </div>

          <div className="header-right-controls">
            {/* Language Switch */}
            <button
              className="lang-pill-btn"
              onClick={() => setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'))}
              title="हिंदी / English बदलें"
              type="button"
            >
              {language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 Eng'}
            </button>
            <button
              className="close-guide-btn"
              id="closeGuideBtn"
              title="बंद करें"
              onClick={() => onToggle(false)}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3D Tab Navigation */}
        <div className="guide-mode-tabs">
          <button
            className={`mode-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
            type="button"
          >
            🧭 {language === 'hi' ? 'स्टेप गाइड' : 'Step Guide'}
          </button>
          <button
            className={`mode-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
            type="button"
          >
            ✨ {language === 'hi' ? 'Gemini AI टूल्स' : 'Gemini AI'}
          </button>
          <button
            className={`mode-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            type="button"
          >
            💬 {language === 'hi' ? 'AI चैट' : 'AI Chat'}
          </button>
        </div>

        {/* TAB 1: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="guide-tab-content">
            {/* Progress Dots */}
            <div className="guide-progress" id="guideProgress">
              {GUIDE_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
                  onClick={() => setCurrentStep(i)}
                  title={`Step ${i + 1}`}
                />
              ))}
            </div>

            {/* Current Step Card */}
            <div className="guide-step-card-3d" id="guideStep">
              <div className="step-card-top">
                <span className="step-number-3d" id="stepNum">
                  {currentStep + 1}
                </span>
                <div className="step-labels">
                  <span className="step-main-label" id="stepLabel">
                    {language === 'hi' ? step.hindiLabel || step.label : step.label}
                  </span>
                  <span className="step-badge-tag">
                    {step.key ? '📝 फॉर्म फील्ड' : '⚡ एक्शन'}
                  </span>
                </div>
                <button
                  className="voice-replay-btn"
                  onClick={() => speakStep(currentStep)}
                  title="फिर से सुनें"
                  type="button"
                >
                  🔊
                </button>
              </div>

              <div className="step-desc-3d" id="stepDesc">
                {language === 'hi' ? step.hindiDesc || step.desc : step.desc}
              </div>

              {/* Sound visualizer animation if speaking */}
              {isSpeaking && (
                <div className="voice-waves-visualizer">
                  <span className="wave-bar bar-1" />
                  <span className="wave-bar bar-2" />
                  <span className="wave-bar bar-3" />
                  <span className="wave-bar bar-4" />
                  <span className="wave-bar bar-5" />
                  <span className="wave-text">पूजा बोल रही हैं...</span>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="guide-nav modern-3d-nav">
              <button
                className="btn-3d btn-prev"
                id="guidePrev"
                onClick={handlePrev}
                disabled={currentStep === 0}
                style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
                type="button"
              >
                ← {language === 'hi' ? 'पिछला' : 'Prev'}
              </button>
              <button
                className="btn-3d btn-next"
                id="guideNext"
                onClick={handleNext}
                type="button"
              >
                {currentStep === totalSteps - 1
                  ? language === 'hi'
                    ? '✅ पूरा हुआ'
                    : '✅ Done'
                  : language === 'hi'
                  ? 'अगला →'
                  : 'Next →'}
              </button>
              <button
                className="btn-3d btn-skip"
                id="guideSkip"
                onClick={() => {
                  stopSpeech();
                  onToggle(false);
                }}
                type="button"
              >
                ✕ {language === 'hi' ? 'छोड़ें' : 'Skip'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Gemini AI Tools (Auto-fill, Presets, Form Audit) */}
        {activeTab === 'ai' && (
          <div className="guide-tab-content ai-tools-tab">
            <div className="ai-tool-box">
              <div className="tool-header">
                <h5>⚡ स्मार्ट ऑटो-फिल (Gemini AI)</h5>
                <span className="ai-badge">Google Gemini</span>
              </div>
              <p className="tool-hint">
                WhatsApp कंप्लेंट, सर्विस रिपोर्ट या टेक्नीशियन नोट यहाँ पेस्ट करें। Gemini अपने आप ZFOC फॉर्म भर देगा!
              </p>
              <textarea
                className="ai-notes-textarea"
                value={rawNotesInput}
                onChange={(e) => setRawNotesInput(e.target.value)}
                placeholder="उदा: Customer Lotus Electronics, Model FCQF18ARV16, Sr 0020050, blower damaged abnormal noise, part turbo fan required 1 nos warranty..."
                rows={3}
              />
              <div className="tool-actions-row">
                <button
                  className="btn-3d btn-gemini-fill"
                  onClick={handleAutoFillFromNotes}
                  disabled={aiLoading}
                  type="button"
                >
                  {aiLoading ? '⏳ AI भर रहा है...' : '✨ 1-क्लिक ऑटो-फिल करें'}
                </button>
                <button
                  className="btn-3d btn-gemini-sample"
                  onClick={() =>
                    setRawNotesInput(
                      'Customer Lotus Electronics, model FCQF18ARV16, serial no 0020050, blower damaged abnormal sound, replacement part 4904178 turbo fan rotor required 1 nos warranty claim.'
                    )
                  }
                  type="button"
                >
                  डेमो नोट
                </button>
              </div>
              {aiStatusMessage && <div className="ai-status-banner">{aiStatusMessage}</div>}
            </div>

            {/* AI Form Audit */}
            <div className="ai-tool-box">
              <div className="tool-header">
                <h5>🔍 AI फॉर्म ऑडिट एवं सत्यापन</h5>
                <button
                  className="btn-3d btn-audit-trigger"
                  onClick={handleRunAudit}
                  disabled={aiLoading}
                  type="button"
                >
                  जाँचें
                </button>
              </div>
              {auditResult ? (
                <div className="audit-result-card">
                  <div className="audit-score-row">
                    <span>स्कोर: <strong>{auditResult.score}/100</strong></span>
                    <span className={`status-pill ${auditResult.status}`}>
                      {auditResult.status === 'valid' ? '✅ मान्य (Valid)' : '⚠️ सुधार आवश्यक'}
                    </span>
                  </div>
                  <p className="audit-summary">{auditResult.summaryHindi}</p>
                  {auditResult.suggestions && auditResult.suggestions.length > 0 && (
                    <ul className="audit-list">
                      {auditResult.suggestions.map((s: string, idx: number) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="tool-hint">
                  बटन दबाकर देखें कि आपके फॉर्म में कोई आवश्यक डाइकिन फील्ड छूट तो नहीं गई।
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Interactive AI Chat */}
        {activeTab === 'chat' && (
          <div className="guide-tab-content chat-tab">
            <div className="chat-messages-container">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble-row ${msg.role}`}>
                  {msg.role === 'assistant' && <span className="chat-avatar">👩‍💼</span>}
                  <div className="chat-bubble">{msg.text}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="chat-bubble-row assistant">
                  <span className="chat-avatar">👩‍💼</span>
                  <div className="chat-bubble typing">पूजा सोच रही हैं...</div>
                </div>
              )}
            </div>

            <div className="chat-input-bar">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="पूजा से हिंदी में पूछें..."
              />
              <button
                className="btn-chat-send"
                onClick={handleSendChatMessage}
                disabled={aiLoading || !chatInput.trim()}
                type="button"
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Voice status bottom indicator */}
        <div className="guide-voice-indicator-3d">
          <div className="voice-info-left">
            <span
              className={`voice-dot-3d ${!voiceEnabled ? 'inactive' : isSpeaking ? 'speaking' : 'ready'}`}
              id="voiceDot"
            />
            <span className="voice-status-text" id="voiceStatus">
              {voiceStatus}
            </span>
          </div>

          <div className="voice-controls-right">
            {availableVoices.length > 0 && (
              <select
                className="voice-selector-dropdown"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const v = availableVoices.find((item) => item.name === e.target.value);
                  if (v) setSelectedVoice(v);
                }}
                title="फीमेल आवाज़ चुनें"
              >
                {availableVoices
                  .filter((v) => v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.toLowerCase().includes('female'))
                  .slice(0, 8)
                  .map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name.length > 22 ? v.name.substring(0, 22) + '...' : v.name}
                    </option>
                  ))}
              </select>
            )}
            <button
              className="voice-mute-toggle-btn"
              id="voiceToggle"
              onClick={toggleVoice}
              title={voiceEnabled ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'}
              type="button"
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating 3D Action Button */}
      <button
        className={`guide-toggle-btn-3d ${isOpen ? 'active' : ''}`}
        id="guideToggleBtn"
        title="पूजा - ZFOC AI गाइड (हिंदी फीमेल आवाज़)"
        onClick={() => onToggle()}
        type="button"
      >
        <span className="btn-avatar-icon">👩‍💼</span>
        {!isOpen && (
          <span className="badge-3d" id="guideBadge">
            {totalSteps - currentStep}
          </span>
        )}
        <span className="guide-floating-label">AI गाइड</span>
      </button>
    </div>
  );
};
