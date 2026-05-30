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

  // スクロール先の要素を指すためのRef
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
    // 1. メンバー名に入力があるかチェック（空白は除外）
    const validNames = memberNames.map(n => n.trim()).filter(n => n !== '');
    if (validNames.length === 0) {
      return alert(t('alertEnterMember'));
    }

    setLoading(true);
    
    // 2. groups テーブルに空のオブジェクトでインサート（Supabase側で自動でIDが発行される）
    const { data: group, error: gError } = await supabase.from('groups').insert({}).select().single();
    if (gError) {
      setLoading(false);
      return alert(t('failedCreateGroup'));
    }

    const typedGroup = group as Group;

    // 2. ここで、新しく発行された「typedGroup.id」を各メンバーに紐付けます
    const membersToInsert = validNames.map(name => ({ 
      group_id: typedGroup.id, 
      name: name 
    }));

    // 3. membersテーブルにメンバー一覧を一括インサートします
    const { error: mError } = await supabase
      .from('members')
      .insert(membersToInsert);
    
    if (mError) {
      console.error('Members Insert Error:', mError);
      setLoading(false);
      return alert(t('failedRegisterMember'));
    }

    // 💡 即時リダイレクトせず、URLを生成して状態にセットする
    const shareUrl = `${window.location.origin}${window.location.pathname}?g=${typedGroup.id}`;
    setGeneratedUrl(shareUrl);
    setLoading(false);

    // 生成されたURLエリアへスムーズにスクロール
    setTimeout(() => {
      urlSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // クリップボードにコピーする関数
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後に「コピー完了」を元に戻す
    } catch (err) {
      alert(t('failedCopyUrl'));
    }
  };

  const isButtonDisabled = loading || !hasValidName;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <img src={titleLogo} alt="Dark" style={{ width: '480px', height: '118px' }} />
      <p style={{ color: '#666', fontSize: '14px' }}>
        {t('message')}
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          {t('nameLabel').replace("{MAX_MEMBERS}", String(MAX_MEMBERS))}
        </label>

        {memberNames.map((name, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <div style={{ width: '32px', textAlign: 'center' }}>
              {index === 0 ? (
                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }} title={t('required')}>*</span>
              ) : (
                <span style={{ color: '#aaa', fontSize: '12px' }} title={t('optionalInput')}>{t('optional')}</span>
              )}
            </div>

            <input 
              type="text" 
              placeholder={placeholders[index] || `Member ${index + 1}`}
              value={name} 
              onChange={(e) => handleNameChange(index, e.target.value)}
              disabled={loading || !!generatedUrl}
              translate="no"
              style={{ 
                flex: 1, 
                padding: '10px', 
                boxSizing: 'border-box', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                borderColor: index === 0 ? '#0070f3' : '#ccc'
              }}
            />

            <div style={{ width: '42px' }}>
              {memberNames.length > 1 && !generatedUrl && (
                <button
                  type="button"
                  onClick={() => removeInputField(index)}
                  disabled={loading}
                  style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
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
            style={{ width: '100%', padding: '10px', background: '#fff', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555', marginBottom: '15px' }}
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
              color: isButtonDisabled ? '#888' : '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold', 
              fontSize: '16px'
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

      {/* 💡 スマホに最適化したURL表示エリア */}
      {generatedUrl && (
        <div 
          ref={urlSectionRef} 
          style={{ 
            marginTop: '40px', 
            padding: '16px', 
            background: '#f6f8fa', 
            border: '1px solid #e1e4e8', 
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px' }}>
            🔗 {t('shareUrlLabel')}
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 💡 スマホの画面幅でも絶対に横スクロールさせないリンクエリア */}
            <a 
              href={generatedUrl} 
              style={{ 
                padding: '12px 10px', 
                background: '#fff', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                color: '#0070f3', 
                textDecoration: 'none',
                fontSize: '13px',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
                display: 'block',
                lineHeight: '1.4',
                boxSizing: 'border-box'
              }}
            >
              {generatedUrl}
            </a>

            {/* 操作ボタンエリア */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={copyToClipboard}
                style={{ 
                  flex: 1,
                  padding: '12px 8px', 
                  background: copied ? '#52c41a' : '#0070f3', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.3s',
                  boxSizing: 'border-box'
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
                  padding: '12px 8px', 
                  background: '#06C755', 
                  color: '#fff', 
                  textDecoration: 'none',
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <span></span>
              </a>
            </div>
          </div>
          
          <p style={{ fontSize: '11px', color: '#666', marginTop: '12px', marginBottom: 0, lineHeight: '1.4' }}>
            {t('shareHint')}
          </p>
        </div>
      )}
    </div>
  );
}