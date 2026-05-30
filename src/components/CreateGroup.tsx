import React, { useState, useRef, useEffect } from 'react';
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
  const placeholders = ['Alice', 'アリス', '愛麗絲', '앨리스'];

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
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <img src={(locale === 'ja-JP' ? titleLogoja : titleLogoen)} style={{ height: 54 }} />
        <p style={styles.sub}>
          完全無料・登録不要ですぐ使える。
          <br />メンバーを入力し、URLを発行するだけで、
          <br />貸し借り状態をリアルタイムに共有。
        </p>
      </div>

      {/* DEMO CAROUSEL */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={styles.demoWrap} ref={demoRef}>
          <div style={styles.demoTrack}>
            {[demo1, demo2, demo3, demo4, demo5].map((img, i) => (
              <div key={i} style={styles.demoCard}>
                <img src={img} style={styles.demoImg} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* COMMENTS */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <p style={styles.sub}>
          <ul style={{textAlign : 'left', marginRight : 10}}>
          <li>メンバー数制限解放
            <span style={{ fontSize: '11px', border: '1px solid', backgroundColor: '#e5e7eb', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('comingSoon')}</span>
          </li>
          <li>全履歴CSV出力
            <span style={{ fontSize: '11px', border: '1px solid', backgroundColor: '#e5e7eb', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('comingSoon')}</span>
          </li>
          <li>一年放置のURLは自動削除
            <span style={{ fontSize: '11px', border: '1px solid', backgroundColor: '#e5e7eb', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('comingSoon')}</span>
          </li>
          </ul>
        </p>
      </div>
      
      {/* FORM */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={styles.card}>
          <label style={styles.label}>
            {t('nameLabel').replace('{MAX_MEMBERS}', String(MAX_MEMBERS))}
          </label>

          {memberNames.map((name, i) => (
            <div key={i} style={styles.row}>
              <div style={styles.markCol}>
                {i === 0 ? (
                  <span style={styles.required}>*</span>
                ) : (
                  <span style={styles.optional}>{t('optional')}</span>
                )}
              </div>

              <input
                value={name}
                placeholder={placeholders[i] || `Member ${i + 1}`}
                onChange={(e) => handleNameChange(i, e.target.value)}
                style={styles.input}
                disabled={loading || !!generatedUrl}
              />

              {i !== 0 && (
              <button
                onClick={() => removeInputField(i)}
                style={styles.removeBtn}
              >
                <img src={clearIcon} alt="clear" style={{ width: '16px', height: '16px' }} />
              </button>
              )}
            </div>
          ))}

          {memberNames.length < MAX_MEMBERS && !generatedUrl && (
            <button onClick={addInputField} style={styles.addBtn}>
              {t('plusMark')} {t('addMember')}
            </button>
          )}

          {!generatedUrl ? (
            <button
              onClick={createGroup}
              disabled={loading || !hasValidName}
              style={{
                ...styles.primaryBtn,
                opacity: hasValidName ? 1 : 0.4,
                cursor: hasValidName ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? t('creatingUrl') : t('createUrl')}
            </button>
          ) : (
            <div style={styles.success}>
              ✓ {t('createdSuccess')}
            </div>
          )}
        </div>
      </div>

      {/* URL */}
      {generatedUrl && (
        <div ref={urlSectionRef} style={styles.urlBox}>
          <div style={{ fontWeight: 600 }}>{t('shareUrlLabel')}</div>

          <a href={generatedUrl} style={styles.url}>
            {generatedUrl}
          </a>

          <div style={styles.actions}>
            <button onClick={copyToClipboard} style={styles.copyBtn}>
              {copied ? t('copied') : t('copyUrl')}
            </button>

            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(generatedUrl)}`}
              style={styles.lineBtn}
              target="_blank"
            >
              LINE
            </a>
          </div>
        </div>
      )}
      
      {/* CONTACT */}
      <div style={{
        marginTop: 40,
        textAlign: 'center'
      }}>
        <a href="mailto:kubotay0507@gmail.com" style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)'
        }}>
          Contact
        </a>
      </div>
    </div>
  );
}

/* =========================
   STRIPE FINAL STYLE
========================= */

const styles: Record<string, React.CSSProperties> = {

  page: {
    minHeight: '100svh',
    background: 'linear-gradient(180deg, #111827, #243058)',
    padding: 20,
    fontFamily: 'system-ui',
    color: '#fff',
  },

  header: {
    textAlign: 'center',
    marginBottom: 24,
  },

  sub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 10,
  },

  /* ===== DEMO ===== */
demoWrap: {
  overflowX: 'auto',
  display: 'flex',
  width: '100%',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
},

demoTrack: {
  display: 'flex',
  gap: 16,
  padding: '8px 16px',
  margin: '0 auto',
  width: 'max-content',
},

demoCard: {
  flex: '0 0 auto',
  width: 140,
  scrollSnapAlign: 'center',
},

  demoImg: {
    width: '100%',
    borderRadius: 12,
  },

  /* ===== FORM ===== */

  card: {
    background: '#fff',
    color: '#111',
    borderRadius: 18,
    padding: 18,
    margin: 10,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },

  label: {
    fontWeight: 700,
    marginBottom: 12,
    display: 'block',
  },

row: {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 12,
},

  markCol: {
    width: 34,
  },

  required: {
    color: '#ff3b30',
    fontWeight: 700,
  },

  optional: {
    fontSize: 11,
    color: '#aaa',
  },

input: {
  width: 180,
  background: '#fff',
  border: '1px solid #e6e8ee',
  borderRadius: 12,
  padding: '12px 14px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
},

  removeBtn: {
    border: 'none',
    background: 'transparent',
    color: '#999',
    cursor: 'pointer',
  },

  addBtn: {
    width: '100%',
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: '1px dashed #ddd',
    background: '#fafafa',
    color: '#222',
    cursor: 'pointer',
  },

  primaryBtn: {
    width: '100%',
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    background: '#635bff',
    color: '#fff',
    fontWeight: 700,
    border: 'none',
  },

  success: {
    marginTop: 16,
    color: '#22c55e',
    textAlign: 'center',
    fontWeight: 600,
  },

  /* ===== URL ===== */

  urlBox: {
    marginTop: 20,
    padding: 10,
  },

  url: {
    display: 'block',
    marginTop: 8,
    color: '#8ab4ff',
    wordBreak: 'break-all',
  },

  actions: {
    display: 'flex',
    gap: 10,
    marginTop: 10,
  },

  copyBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    background: '#635bff',
    color: '#fff',
    border: 'none',
  },

  lineBtn: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    borderRadius: 10,
    background: '#06C755',
    color: '#fff',
    textDecoration: 'none',
  },
};