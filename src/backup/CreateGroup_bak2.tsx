import React, { useState, useRef } from 'react';
import { supabase } from '../config/supabase';
import type { Group } from '../types/index';
import { type TranslationKey } from '../config/i18n';

import titleLogo from '../assets/title_logo_en1.svg';

type CreateGroupProps = {
  locale: string;
  t: (key: TranslationKey) => string;
};

export default function CreateGroup({
  locale,
  t,
}: CreateGroupProps) {
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const urlSectionRef = useRef<HTMLDivElement>(null);

  const MAX_MEMBERS = 4;
  const placeholders = ['Alice', 'アリス', '愛麗絲', '앨리스'];
  const hasValidName = memberNames.some(name => name.trim() !== '');

  const handleNameChange = (index: number, value: string) => {
    const updatedNames = [...memberNames];
    updatedNames[index] = value;
    setMemberNames(updatedNames);
  };

  const addInputField = () => {
    if (memberNames.length >= MAX_MEMBERS) return;
    setMemberNames([...memberNames, '']);
  };

  const removeInputField = (index: number) => {
    if (memberNames.length <= 1) return;
    const updatedNames = memberNames.filter((_, i) => i !== index);
    setMemberNames(updatedNames);
  };

  const createGroup = async () => {
    const validNames = memberNames.map(n => n.trim()).filter(n => n !== '');

    if (validNames.length === 0) {
      return alert(t('alertEnterMember'));
    }

    setLoading(true);

    const { data: group, error: gError } = await supabase
      .from('groups')
      .insert({})
      .select()
      .single();

    if (gError) {
      setLoading(false);
      return alert(t('failedCreateGroup'));
    }

    const typedGroup = group as Group;

    const membersToInsert = validNames.map(name => ({
      group_id: typedGroup.id,
      name: name,
    }));

    const { error: mError } = await supabase
      .from('members')
      .insert(membersToInsert);

    if (mError) {
      console.error(mError);
      setLoading(false);
      return alert(t('failedRegisterMember'));
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?g=${typedGroup.id}`;
    setGeneratedUrl(shareUrl);
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

  const isButtonDisabled = loading || !hasValidName;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>

      {/* ① ヒーロー */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img src={titleLogo} alt="logo" style={{ width: '280px', marginBottom: '12px' }} />

        <h1 style={{ fontSize: '18px', marginBottom: '8px' }}>
          URLひとつでツケ・割り勘をリアルタイム共有
        </h1>

        <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>
          ログイン不要・インストール不要。<br />
          メンバーを登録するだけで共有URLを発行できます。
        </p>
      </div>

      {/* ② CTA */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() =>
            document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })
          }
          style={{
            flex: 1,
            padding: '12px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          {t('createUrl')}
        </button>
      </div>

      {/* ③ フォーム本体 */}
      <div id="create-form">
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            {t('nameLabel').replace("{MAX_MEMBERS}", String(MAX_MEMBERS))}
          </label>

          {memberNames.map((name, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ width: '32px', textAlign: 'center' }}>
                {index === 0 && (
                  <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>*</span>
                )}
              </div>

              <input
                type="text"
                placeholder={placeholders[index] || `Member ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                disabled={loading || !!generatedUrl}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />

              <div style={{ width: '42px' }}>
                {memberNames.length > 1 && !generatedUrl && (
                  <button
                    type="button"
                    onClick={() => removeInputField(index)}
                    disabled={loading}
                    style={{
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      width: '100%',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          {memberNames.length < MAX_MEMBERS && !generatedUrl && (
            <button
              type="button"
              onClick={addInputField}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px dashed #ccc',
                background: '#fff',
                borderRadius: '4px',
                marginBottom: '15px',
              }}
            >
              ＋ {t('addMember')}
            </button>
          )}

          {!generatedUrl ? (
            <button
              onClick={createGroup}
              disabled={isButtonDisabled}
              style={{
                width: '100%',
                padding: '12px',
                background: isButtonDisabled ? '#ccc' : '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              {loading ? t('creatingUrl') : t('createUrl')}
            </button>
          ) : (
            <div style={{ textAlign: 'center', margin: '20px 0', color: '#52c41a', fontWeight: 'bold' }}>
              ✓ {t('createdSuccess')}
            </div>
          )}
        </div>
      </div>

      {/* ④ URL表示 */}
      {generatedUrl && (
        <div
          ref={urlSectionRef}
          style={{
            marginTop: '40px',
            padding: '16px',
            background: '#f6f8fa',
            border: '1px solid #e1e4e8',
            borderRadius: '6px',
          }}
        >
          <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            🔗 {t('shareUrlLabel')}
          </label>

          <a
            href={generatedUrl}
            style={{
              display: 'block',
              padding: '12px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              wordBreak: 'break-all',
            }}
          >
            {generatedUrl}
          </a>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={copyToClipboard}
              style={{
                flex: 1,
                padding: '12px',
                background: copied ? '#52c41a' : '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              {copied ? t('copied') : t('copyUrl')}
            </button>

            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(generatedUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '12px',
                background: '#06C755',
                color: '#fff',
                textAlign: 'center',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              LINE
            </a>
          </div>

          <p style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>
            {t('shareHint')}
          </p>
        </div>
      )}
    </div>
  );
}