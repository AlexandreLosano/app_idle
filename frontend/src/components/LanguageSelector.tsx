import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt', fiCode: 'br', sigla: 'PT', label: 'Português' },
  { code: 'en', fiCode: 'gb', sigla: 'EN', label: 'English' },
  { code: 'de', fiCode: 'de', sigla: 'DE', label: 'Deutsch' },
  { code: 'fr', fiCode: 'fr', sigla: 'FR', label: 'Français' },
  { code: 'es', fiCode: 'es', sigla: 'ES', label: 'Español' },
  { code: 'it', fiCode: 'it', sigla: 'IT', label: 'Italiano' },
  { code: 'nl', fiCode: 'nl', sigla: 'NL', label: 'Nederlands' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setOpen(false);
  };

  return (
    <div className="lang-picker" ref={ref}>
      <button className={`lang-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className={`fi fi-${current.fiCode}`} />
        <span className="lang-sigla">{current.sigla}</span>
        <span className="lang-caret">▾</span>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map(({ code, fiCode, sigla, label }) => (
            <button
              key={code}
              className={`lang-option${code === i18n.language ? ' active' : ''}`}
              onClick={() => handleSelect(code)}
            >
              <span className={`fi fi-${fiCode}`} />
              <span className="lang-sigla">{sigla}</span>
              <span className="lang-name">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
