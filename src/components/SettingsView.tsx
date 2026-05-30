import React, { useState } from 'react';
import type { Member } from '../types';
import { type TranslationKey } from '../config/i18n';

import backIcon from '../assets/back.svg';
import sunIcon from '../assets/sun.svg';
import moonIcon from '../assets/moon.svg';

type SettingsViewProps = {
  themeMode: 'light' | 'dark';
  setThemeMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  currentMember: Member | null;
  members: Member[];
  groupStatus: { is_premium: boolean; premium_payer_id: string | number | null };
  supports: { member_id: string | number }[]; 
  locale: string;
  currency: string;
  plusColor: 'blue' | 'red';
  minusColor: 'blue' | 'red';
  newMemberName: string;
  setNewMemberName: (val: string) => void;
  onBack: () => void;
  onUpdateName: (name: string) => void;
  onAddMember: () => void;
  onDeleteMember: (id: string | number) => void;
  onPlusColorChange: (color: 'blue' | 'red') => void;
  onMinusColorChange: (color: 'blue' | 'red') => void;
  onLocaleChange: (locale: string) => void;
  onCurrencyChange: (currency: string) => void;
  onDeleteGroup: () => Promise<void>;
  t: (key: TranslationKey) => string;
};

export default function SettingsView({
  themeMode,
  setThemeMode,
  currentMember,
  members,
  groupStatus,
  supports,
  locale,
  currency,
  plusColor,
  minusColor,
  newMemberName,
  setNewMemberName,
  onBack,
  onUpdateName,
  onAddMember,
  onDeleteMember,
  onPlusColorChange,
  onMinusColorChange,
  onLocaleChange,
  onCurrencyChange,
  onDeleteGroup,
  t,
}: SettingsViewProps) {
  
  const isDark = themeMode === 'dark';
  
  const isSupporter = (currentMember && supports && Array.isArray(supports)) 
  ? supports.some(s => String(s.member_id) === String(currentMember.id)) 
  : false;

  const viewBgColor = isDark ? '#111827' : '#f9fafb';
  const cardBgColor = isDark ? '#1f2937' : '#ffffff';
  const mainTextColor = isDark ? '#f9fafb' : '#111827';
  const subTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const inputBorderColor = isDark ? '#4b5563' : '#d1d5db';

  const sectionTitleColor = mainTextColor;

  const sectionTitleStyle = { 
    fontSize: '13px', 
    fontWeight: '700', 
    color: sectionTitleColor, 
    marginBottom: '8px', 
    marginTop: '16px', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em', 
    display: 'flex', 
    alignItems: 'center' 
  };
  const cardStyle = { background: cardBgColor, borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '16px', border: isDark ? `1px solid ${borderColor}` : 'none' };
  const settingInputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${inputBorderColor}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, backgroundColor: isDark ? '#374151' : '#ffffff', color: mainTextColor };
  const themeToggleStyle = { flex: 1, padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' };

  const circleButtonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isDark ? '#374151' : '#ffffff',
    border: 'none',
    boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'normal',
    padding: 0,
    outline: 'none',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    lineHeight: '1'
  };

  const getStatusBadge = (isPremium: boolean) => (
    <span style={{ 
      fontSize: '10px', 
      padding: '2px 6px', 
      borderRadius: '4px', 
      marginLeft: '6px', 
      fontWeight: 'bold',
      backgroundColor: isPremium ? (isDark ? '#064e3b' : '#ecfdf5') : (isDark ? '#374151' : '#f3f4f6'),
      color: isPremium ? (isDark ? '#34d399' : '#059669') : subTextColor,
      border: `1px solid ${isPremium ? (isDark ? '#047857' : '#a7f3d0') : borderColor}`,
      textTransform: 'none'
    }}>
      {isPremium ? 'PRO' : 'FREE'}
    </span>
  );

  // 1. ローカルステートを定義
  const [localName, setLocalName] = useState(currentMember?.name || '');

  // 3. 入力処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  // 4. 更新処理
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    if (newValue !== (currentMember?.name || '')) {
      onUpdateName(newValue);
      setLocalName(newValue);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', backgroundColor: viewBgColor, minHeight: '100dvh', boxSizing: 'border-box', position: 'relative', paddingTop: '56px', paddingBottom: '40px', transition: 'background-color 0.2s ease' }}>
      
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', backgroundColor: cardBgColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1000, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '576px', margin: '0 auto', position: 'relative' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '6px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0 }} title={t('back')}>
            <img src={backIcon} alt={t('back')} style={{ width: '20px', height: '20px', filter: isDark ? 'invert(1)' : 'none' }} />
          </button>
          <div style={{ margin: '0 auto', fontSize: '16px', fontWeight: 'bold', color: mainTextColor }}>{t('setting')}</div>
        </div>
      </header>

      <div style={{ marginTop: '8px' }}>
        <div style={sectionTitleStyle}>{t('profile')}
            {isSupporter && (
                <span style={{ 
                fontSize: '10px', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                marginLeft: '6px', 
                fontWeight: 'bold',
                backgroundColor: isDark ? '#453511' : '#fffbeb',
                color: isDark ? '#fef3c7' : '#b45309',
                border: `1px solid ${isDark ? '#d97706' : '#fcd34d'}`
                }}>
                {t('supporter')}
                </span>
            )}
        </div>
        <div style={cardStyle}>
          {currentMember ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: subTextColor, fontWeight: '600' }}>{t('displayName')}</label>
              </div>
              <input 
                type="text" 
                value={localName}
                onChange={handleChange}
                onBlur={handleBlur}
                style={settingInputStyle} 
                placeholder={t('newDisplayName')}
              />
              <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'left' }}>{t('displayNameWarning')}</span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>{t('noUserSelected')}</p>
          )}
        </div>

        <div style={sectionTitleStyle}>
          {t('groupMembers')}
          {getStatusBadge(groupStatus.is_premium)}
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {members.map(m => {
              const isCurrent = currentMember?.id === m.id;
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ fontSize: '14px', color: mainTextColor, fontWeight: '400' }}>
                    {m.name} {isCurrent && <span style={{ fontSize: '11px', color: isDark ? '#60a5fa' : '#1d4ed8', backgroundColor: isDark ? '#1e3a8a' : '#eff6ff', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', fontWeight: '400' }}>{t('you')}</span>}
                  </span>
                  {!isCurrent ? (
                    <button 
                      onClick={() => onDeleteMember(m.id)} 
                      style={{ ...circleButtonStyle, color: mainTextColor }}
                      title={t('remove')}
                    >
                      {t('minusMark')}
                    </button>
                  ) : (
                    <div style={{ width: '32px', height: '32px' }} />
                  )}
                </div>
              );
            })}
          </div>
          
          {members.length < 4 && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder={t('newMemberName')} 
                value={newMemberName} 
                onChange={(e) => setNewMemberName(e.target.value)} 
                style={{ ...settingInputStyle, flex: 1 }} 
              />
              <button 
                onClick={onAddMember} 
                style={{ ...circleButtonStyle, color: isDark ? '#ffffff' : '#000000' }}
                title={t('add')}
              >
                {t('plusMark')}
              </button>
            </div>
          )}

          <div style={{ backgroundColor: isDark ? '#374151' : '#f9fafb', border: `1px dashed ${inputBorderColor}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: subTextColor, fontWeight: '500' , display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {t('unlockMemberLimit')}
              <span style={{ fontSize: '11px', backgroundColor: isDark ? '#4b5563' : '#e5e7eb', color: subTextColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('comingSoon')}</span>
            </span>
            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
              🔒 {t('unlockMemberDetails')}
            </p>
          </div>
        </div>

        <div style={sectionTitleStyle}>{t('theme')}</div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: subTextColor, marginBottom: '6px' }}>{t('mode')}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setThemeMode('light')}
                  style={{ 
                    ...themeToggleStyle, 
                    border: !isDark ? `2px solid ${mainTextColor}` : `1px solid ${borderColor}`, 
                    backgroundColor: !isDark ? cardBgColor : (isDark ? '#374151' : '#f3f4f6'), 
                    color: !isDark ? mainTextColor : '#9ca3af', 
                    fontWeight: !isDark ? '600' : '400' 
                  }}
                >
                  <img src={sunIcon} alt="Light" style={{ width: '16px', height: '16px', filter: isDark ? 'invert(1)' : 'none' }} /> {t('light')}
                </button>
                <button 
                  onClick={() => setThemeMode('dark')}
                  style={{ 
                    ...themeToggleStyle, 
                    border: isDark ? `2px solid ${mainTextColor}` : `1px solid ${borderColor}`, 
                    backgroundColor: isDark ? cardBgColor : (isDark ? '#374151' : '#f3f4f6'), 
                    color: isDark ? mainTextColor : '#6b7280', 
                    fontWeight: isDark ? '600' : '400' 
                  }}
                >
                  <img src={moonIcon} alt="Dark" style={{ width: '16px', height: '16px', filter: isDark ? 'invert(1)' : 'none' }} /> {t('dark')}
                </button>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: subTextColor, marginBottom: '14px' }}>{t('plColor')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: subTextColor, fontWeight: '500' }}>{t('plus')}</span>
                  <div style={{ display: 'flex', background: isDark ? '#374151' : '#f3f4f6', padding: '3px', borderRadius: '9px', width: '100px' }}>
                    <button type="button" onClick={() => onPlusColorChange('blue')} style={{ flex: 1, border: 'none', padding: '6px 0', fontSize: '12px', borderRadius: '7px', cursor: 'pointer', backgroundColor: plusColor === 'blue' ? cardBgColor : 'transparent', color: plusColor === 'blue' ? (isDark ? '#60a5fa' : '#2563eb') : subTextColor }}>{t('blue')}</button>
                    <button type="button" onClick={() => onPlusColorChange('red')} style={{ flex: 1, border: 'none', padding: '6px 0', fontSize: '12px', borderRadius: '7px', cursor: 'pointer', backgroundColor: plusColor === 'red' ? cardBgColor : 'transparent', color: plusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : subTextColor }}>{t('red')}</button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: subTextColor, fontWeight: '500' }}>{t('minus')}</span>
                  <div style={{ display: 'flex', background: isDark ? '#374151' : '#f3f4f6', padding: '3px', borderRadius: '9px', width: '100px' }}>
                    <button type="button" onClick={() => onMinusColorChange('blue')} style={{ flex: 1, border: 'none', padding: '6px 0', fontSize: '12px', borderRadius: '7px', cursor: 'pointer', backgroundColor: minusColor === 'blue' ? cardBgColor : 'transparent', color: minusColor === 'blue' ? (isDark ? '#60a5fa' : '#2563eb') : subTextColor }}>{t('blue')}</button>
                    <button type="button" onClick={() => onMinusColorChange('red')} style={{ flex: 1, border: 'none', padding: '6px 0', fontSize: '12px', borderRadius: '7px', cursor: 'pointer', backgroundColor: minusColor === 'red' ? cardBgColor : 'transparent', color: minusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : subTextColor }}>{t('red')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={sectionTitleStyle}>{t('languageCurrency')}</div>
        <div style={{ ...cardStyle, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '12px', textAlign: 'left' }}>
            <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', color: subTextColor, marginBottom: '4px' }}>{t('language')}</label>
            <select 
                value={locale} 
                onChange={(e) => onLocaleChange(e.target.value)} 
                style={{ ...settingInputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
                <option value="ja-JP">日本語 (ja-JP)</option>
                <option value="en-US">English (en-US)</option>
                {/*
                <option value="zh-TW">繁體中文 (zh-TW)</option>
                <option value="ko-KR">한국어 (ko-KR)</option>
                */}
            </select>
            </div>
            <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', color: subTextColor, marginBottom: '4px' }}>{t('currency')}</label>
            <select 
                value={currency} 
                onChange={(e) => onCurrencyChange(e.target.value)} 
                style={{ ...settingInputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
                <option value="JPY">JPY (¥)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                {/*
                <option value="KRW">KRW (₩)</option>
                <option value="TWD">TWD (NT$)</option>
                */}
            </select>
            </div>
        </div>
        </div>

        <div style={sectionTitleStyle}>
          {t('dataManagement')}
          {getStatusBadge(groupStatus.is_premium)}
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: subTextColor }}>{t('exportCsv')}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                🔒 {t('exportCsvDetails')}
              </p>
            </div>
            <span style={{ fontSize: '11px', backgroundColor: isDark ? '#4b5563' : '#e5e7eb', color: subTextColor, padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{t('comingSoon')}</span>
          </div>
        </div>

        <div style={sectionTitleStyle}>{t('reset')}</div>
        <div style={{ ...cardStyle, border: '1px solid #fca5a5', backgroundColor: isDark ? '#7f1d1d' : '#fff5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#fca5a5' : '#991b1b' }}>{t('deleteGroupDetails')}</span>
              <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#f87171' : '#ef4444' }}>{t('deleteGroupWarning')}</p>
            </div>
            <button onClick={() => {
                const isConfirmed = window.confirm(t('confirmDeleteGroup'));
                if (isConfirmed) onDeleteGroup();
            }} style={{ width: '135px', padding: '8px 0', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t('deleteGroup')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}