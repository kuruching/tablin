import { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { Group } from '../types/index';
import { type TranslationKey } from '../config/i18n';

import titleLogoja from '../assets/title_logo_ja1.svg';
import titleLogoen from '../assets/title_logo_en1.svg';
import demo1 from '../assets/demo1.svg';
import demo2 from '../assets/demo2.svg';
import demo3 from '../assets/demo3.svg';
import demo4 from '../assets/demo4.svg';
import demo5 from '../assets/demo5.svg';
import clearIcon from '../assets/clear.svg';
import lineIcon from '../assets/comment.svg';
import './CreateGroup.css';

type CreateGroupProps = {
  locale: string;
  t: (key: TranslationKey) => string;
};

export default function CreateGroup({ locale, t }: CreateGroupProps) {
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const urlSectionRef = useRef<HTMLDivElement>(null);
  const MAX_MEMBERS = 4;
  const hasValidName = memberNames.some(n => n.trim() !== '');

  const handleNameChange = (i: number, v: string) => {
    const copy = [...memberNames];
    copy[i] = v;
    setMemberNames(copy);
  };

  const addInputField = () => {
    if (memberNames.length >= MAX_MEMBERS) return;
    setMemberNames([...memberNames, '']);
  };

  const removeInputField = (i: number) => {
    if (memberNames.length <= 1) return;
    setMemberNames(memberNames.filter((_, idx) => idx !== i));
  };

  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    demoRef.current?.scrollTo({ left: 50 });
  }, []);

  const createGroup = async () => {
    const validNames = memberNames.map(n => n.trim()).filter(Boolean);

    if (validNames.length === 0) {
      return alert(t('alertEnterMember'));
    }

    setLoading(true);

    const { data: group, error } = await supabase
      .from('groups')
      .insert({})
      .select()
      .single();

    if (error) {
      setLoading(false);
      return alert(t('failedCreateGroup'));
    }

    const typedGroup = group as Group;

    const members = validNames.map(name => ({
      group_id: typedGroup.id,
      name,
    }));

    const { error: mError } = await supabase
      .from('members')
      .insert(members);

    if (mError) {
      setLoading(false);
      return alert(t('failedRegisterMember'));
    }

    const url = `${window.location.origin}${window.location.pathname}?g=${typedGroup.id}`;

    setGeneratedUrl(url);
    setLoading(false);

    setTimeout(() => {
      urlSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(t('failedCopyUrl'));
    }
  };

return (
  <div className="cg-page">

    {/* HEADER */}
    <div className="cg-header">
      <img
        src={locale === 'ja-JP' ? titleLogoja : titleLogoen}
        className="cg-header-logo"
      />
      <p className="cg-sub">
        {t('registerFree')}<br />{t('simpleShare')}
      </p>
    </div>

    {/* DEMO CAROUSEL */}
    <div className="cg-center">
      <div className="cg-demo-wrap" ref={demoRef}>
        <div className="cg-demo-track">
          {[demo1, demo2, demo3, demo4, demo5].map((img, i) => (
            <div key={i} className="cg-demo-card">
              <img src={img} className="cg-demo-img" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* COMMENTS */}
    <div className="cg-center">
      <p className="cg-sub">
        <ul className="cg-comment-list">
          <li>
            {t('unlockMemberLimit')}
            <span className="cg-comingsoon-badge">{t('comingSoon')}</span>
          </li>
          <li>
            {t('exportCsvAll')}
            <span className="cg-comingsoon-badge">{t('comingSoon')}</span>
          </li>
          <li>
            {t('autoDeleteOneYear')}
            <span className="cg-comingsoon-badge">{t('comingSoon')}</span>
          </li>
        </ul>
      </p>
    </div>

    {/* FORM */}
    <div className="cg-center">
      <div className="cg-card">
        <label className="cg-label">
          {t('nameLabel').replace('{MAX_MEMBERS}', String(MAX_MEMBERS))}
        </label>

        {memberNames.map((name, i) => (
          <div key={i} className="cg-row">
            <div className="cg-mark-col">
              {i === 0 ? (
                <span className="cg-required">*</span>
              ) : (
                <span className="cg-optional">{t('optional')}</span>
              )}
            </div>

            <input
              value={name}
              placeholder={t('newMemberName')}
              onChange={(e) => handleNameChange(i, e.target.value)}
              className="cg-input"
              disabled={loading || !!generatedUrl}
            />

            {i !== 0 && (
              <button
                onClick={() => removeInputField(i)}
                className="cg-remove-btn"
              >
                <img src={clearIcon} alt="clear" className="cg-clear-icon" />
              </button>
            )}
          </div>
        ))}

        {memberNames.length < MAX_MEMBERS && !generatedUrl && (
          <button onClick={addInputField} className="cg-add-btn">
            {t('plusMark')} {t('addMember')}
          </button>
        )}

        {!generatedUrl ? (
          <button
            onClick={createGroup}
            disabled={loading || !hasValidName}
            className="cg-primary-btn"
            style={{
              opacity: hasValidName ? 1 : 0.4,
              cursor: hasValidName ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? t('creatingUrl') : t('createUrl')}
          </button>
        ) : (
          <div className="cg-success">
            ✓ {t('createdSuccess')}
          </div>
        )}
      </div>
    </div>

{/* URL */}
{generatedUrl && (
  <div ref={urlSectionRef} className="cg-url-box">
    <div className="cg-url-title">{t('shareUrlLabel')}</div>

    <a href={generatedUrl} className="cg-url">
      {generatedUrl}
    </a>

    <div className="cg-actions">
      <button onClick={copyToClipboard} className="cg-copy-btn">
        {copied ? t('copied') : t('copyUrl')}
      </button>

      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(generatedUrl)}`}
        className="cg-line-btn"
        target="_blank"
      >
        <img src={lineIcon} alt="line" className="line-icon"/>LINE
      </a>
    </div>
  </div>
)}

{/* CONTACT */}
<div className="cg-contact">
  <a href="mailto:kubotay0507@gmail.com" className="cg-contact-link">
    Contact
  </a>
</div>
    </div>
  );
}
