import React, { useState } from 'react';
import type { Member } from '../types';
import { type TranslationKey } from '../config/i18n';

import backIcon from '../assets/back.svg';
import sunIcon from '../assets/sun.svg';
import moonIcon from '../assets/moon.svg';
import './SettingsView.css';

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

  const getStatusBadge = (isPremium: boolean) => (
    <span style={{
      fontSize: '10px',
      padding: '0 6px',
      borderRadius: '4px',
      marginLeft: '6px',
      fontWeight: 'bold',
      backgroundColor: (isDark ? '#064e3b' : '#cae6d8'),
      color: (isDark ? '#34d399' : '#059669'),
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
    <div
      className="settings-container"
      style={{
        '--bg-color': viewBgColor,
        '--main-text-color': mainTextColor,
        '--border-color': borderColor,
        '--card-bg-color': cardBgColor,
      } as React.CSSProperties}
    >
      <header
        className="settings-header"
        style={{
          '--header-bg': cardBgColor,
          '--header-border': borderColor,
        } as React.CSSProperties}
      >
        <div className="settings-header-inner">
          <button
            onClick={onBack}
            className="settings-back-button"
            title={t('back')}
          >
            <img
              src={backIcon}
              alt={t('back')}
              className="settings-back-icon"
              style={{ filter: isDark ? 'invert(1)' : 'none' }}
            />
          </button>

          <div className="settings-title">
            {t('setting')}
          </div>
        </div>
      </header>


      <div className="settings-section" style={{ '--mt': '8px' } as React.CSSProperties}>
        <div
          className="settings-section-title"
          style={{
            '--section-title-color': sectionTitleColor,
          } as React.CSSProperties}
        >
          {t('profile')}
          {isSupporter && (
            <span
              className="settings-supporter-badge"
              style={{
                '--supporter-bg': isDark ? '#453511' : '#fffbeb',
                '--supporter-color': isDark ? '#fef3c7' : '#b45309',
                '--supporter-border': isDark ? '#d97706' : '#fcd34d',
              } as React.CSSProperties}
            >
              {t('supporter')}
            </span>
          )}
        </div>
        <div
          className="settings-card"
          style={{
            '--card-bg': cardBgColor,
            '--card-border': borderColor,
          } as React.CSSProperties}
        >
          {currentMember ? (
            <div className="settings-profile-fields">
              <div className="settings-profile-label-row">
                <label
                  className="settings-profile-label"
                  style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
                >
                  {t('displayName')}
                </label>
              </div>

              <input
                type="text"
                value={localName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="settings-input"
                style={{
                  '--input-bg': isDark ? '#374151' : '#ffffff',
                  '--input-border': inputBorderColor,
                  '--input-text': mainTextColor,
                } as React.CSSProperties}
                placeholder={t('newDisplayName')}
              />

              <span className="settings-profile-warning">
                {t('displayNameWarning')}
              </span>
            </div>
          ) : (
            <p className="settings-no-user">{t('noUserSelected')}</p>
          )}
        </div>

        <div
          className="settings-section-title"
          style={{ '--section-title-color': sectionTitleColor } as React.CSSProperties}
        >
          {t('groupMembers')}
          {getStatusBadge(groupStatus.is_premium)}
        </div>
        <div
          className="settings-card"
          style={{
            '--card-bg': cardBgColor,
            '--card-border': borderColor,
          } as React.CSSProperties}
        >
          <div className="settings-members-list">
            {members.map(m => {
              const isCurrent = currentMember?.id === m.id;
              return (
                <div
                  key={m.id}
                  className="settings-member-row"
                  style={{ '--member-border': borderColor } as React.CSSProperties}
                >
                  <span
                    className="settings-member-name"
                    style={{ '--main-text-color': mainTextColor } as React.CSSProperties}
                  >
                    {m.name}{' '}
                    {isCurrent && (
                      <span
                        className="settings-member-you"
                        style={{
                          '--you-color': isDark ? '#60a5fa' : '#1d4ed8',
                          '--you-bg': isDark ? '#1e3a8a' : '#cadef8',
                        } as React.CSSProperties}
                      >
                        {t('you')}
                      </span>
                    )}
                  </span>
                  {!isCurrent ? (
                    <button
                      onClick={() => onDeleteMember(m.id)}
                      className="settings-circle-button"
                      style={{
                        '--circle-bg': isDark ? '#374151' : '#ffffff',
                        '--circle-shadow': isDark
                          ? '0 2px 4px rgba(0, 0, 0, 0.2)'
                          : '0 2px 4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.2)',
                        '--circle-color': mainTextColor,
                      } as React.CSSProperties}
                      title={t('remove')}
                    >
                      {t('minusMark')}
                    </button>
                  ) : (
                    <div className="settings-member-placeholder" />
                  )}
                </div>
              );
            })}
          </div>

          {members.length < 4 && (
            <div className="settings-member-add-row">
              <input
                type="text"
                placeholder={t('newMemberName')}
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="settings-input settings-input-flex"
                style={{
                  '--input-bg': isDark ? '#374151' : '#ffffff',
                  '--input-border': inputBorderColor,
                  '--input-text': mainTextColor,
                } as React.CSSProperties}
              />
              <button
                onClick={onAddMember}
                className="settings-circle-button"
                style={{
                  '--circle-bg': isDark ? '#374151' : '#ffffff',
                  '--circle-shadow': isDark
                    ? '0 2px 4px rgba(0, 0, 0, 0.2)'
                    : '0 2px 4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.2)',
                  '--circle-color': isDark ? '#ffffff' : '#000000',
                } as React.CSSProperties}
                title={t('add')}
              >
                {t('plusMark')}
              </button>
            </div>
          )}

          <div
            className="settings-unlock-box"
            style={{
              '--unlock-bg': isDark ? '#374151' : '#f9fafb',
              '--unlock-border': inputBorderColor,
            } as React.CSSProperties}
          >
            <span
              className="settings-unlock-title"
              style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
            >
              {t('unlockMemberLimit')}

              <span
                className="settings-unlock-badge"
                style={{
                  '--badge-bg': isDark ? '#4b5563' : '#e5e7eb',
                  '--badge-color': subTextColor,
                } as React.CSSProperties}
              >
                {t('comingSoon')}
              </span>
            </span>
            <p className="settings-unlock-desc">
              🔒 {t('unlockMemberDetails')}
            </p>
          </div>
        </div>

        <div
          className="settings-section-title"
          style={{ '--section-title-color': sectionTitleColor } as React.CSSProperties}
        >
          {t('theme')}
        </div>
        <div
          className="settings-card"
          style={{
            '--card-bg': cardBgColor,
            '--card-border': borderColor,
          } as React.CSSProperties}
        >
          <div className="settings-theme-container">
            <div>
              <label
                className="settings-theme-label"
                style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
              >
                {t('mode')}
              </label>

              <div className="settings-theme-toggle-row">
                {/* Light */}
                <button
                  onClick={() => setThemeMode('light')}
                  className="settings-theme-toggle"
                  style={{
                    '--toggle-border': !isDark ? `2px solid ${mainTextColor}` : `1px solid ${borderColor}`,
                    '--toggle-bg': !isDark ? cardBgColor : (isDark ? '#374151' : '#f3f4f6'),
                    '--toggle-color': !isDark ? mainTextColor : '#9ca3af',
                    '--toggle-weight': !isDark ? '600' : '400',
                  } as React.CSSProperties}
                >
                  <img
                    src={sunIcon}
                    alt="Light"
                    className="settings-theme-icon"
                    style={{ filter: isDark ? 'invert(1)' : 'none' }}
                  />
                  {t('light')}
                </button>

                {/* Dark */}
                <button
                  onClick={() => setThemeMode('dark')}
                  className="settings-theme-toggle"
                  style={{
                    '--toggle-border': isDark ? `2px solid ${mainTextColor}` : `1px solid ${borderColor}`,
                    '--toggle-bg': isDark ? cardBgColor : (isDark ? '#374151' : '#f3f4f6'),
                    '--toggle-color': isDark ? mainTextColor : '#6b7280',
                    '--toggle-weight': isDark ? '600' : '400',
                  } as React.CSSProperties}
                >
                  <img
                    src={moonIcon}
                    alt="Dark"
                    className="settings-theme-icon"
                    style={{ filter: isDark ? 'invert(1)' : 'none' }}
                  />
                  {t('dark')}
                </button>
              </div>
            </div>

            <div
              className="settings-theme-divider"
              style={{ '--border-color': borderColor } as React.CSSProperties}
            >
              <label
                className="settings-theme-label"
                style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
              >
                {t('plColor')}
              </label>

              <div className="settings-theme-color-container">
                {/* Plus */}
                <div className="settings-theme-color-row">
                  <span
                    className="settings-theme-color-label"
                    style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
                  >
                    {t('plus')}
                  </span>

                  <div
                    className="settings-theme-color-switch"
                    style={{ '--switch-bg': isDark ? '#374151' : '#f3f4f6' } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={() => onPlusColorChange('blue')}
                      className="settings-theme-color-button"
                      style={{
                        '--btn-bg': plusColor === 'blue' ? cardBgColor : 'transparent',
                        '--btn-color': plusColor === 'blue'
                          ? (isDark ? '#60a5fa' : '#2563eb')
                          : subTextColor,
                      } as React.CSSProperties}
                    >
                      {t('blue')}
                    </button>

                    <button
                      type="button"
                      onClick={() => onPlusColorChange('red')}
                      className="settings-theme-color-button"
                      style={{
                        '--btn-bg': plusColor === 'red' ? cardBgColor : 'transparent',
                        '--btn-color': plusColor === 'red'
                          ? (isDark ? '#f87171' : '#dc2626')
                          : subTextColor,
                      } as React.CSSProperties}
                    >
                      {t('red')}
                    </button>
                  </div>
                </div>
                <div className="settings-theme-color-row">
                  <span
                    className="settings-theme-color-label"
                    style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
                  >
                    {t('minus')}
                  </span>

                  <div
                    className="settings-theme-color-switch"
                    style={{ '--switch-bg': isDark ? '#374151' : '#f3f4f6' } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={() => onMinusColorChange('blue')}
                      className="settings-theme-color-button"
                      style={{
                        '--btn-bg': minusColor === 'blue' ? cardBgColor : 'transparent',
                        '--btn-color': minusColor === 'blue'
                          ? (isDark ? '#60a5fa' : '#2563eb')
                          : subTextColor,
                      } as React.CSSProperties}
                    >
                      {t('blue')}
                    </button>

                    <button
                      type="button"
                      onClick={() => onMinusColorChange('red')}
                      className="settings-theme-color-button"
                      style={{
                        '--btn-bg': minusColor === 'red' ? cardBgColor : 'transparent',
                        '--btn-color': minusColor === 'red'
                          ? (isDark ? '#f87171' : '#dc2626')
                          : subTextColor,
                      } as React.CSSProperties}
                    >
                      {t('red')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="settings-section-title"
          style={{ '--section-title-color': sectionTitleColor } as React.CSSProperties}
        >
          {t('languageCurrency')}
        </div>
        <div
          className="settings-card settings-langcard"
          style={{
            '--card-bg': cardBgColor,
            '--card-border': borderColor,
          } as React.CSSProperties}
        >
          <div className="settings-langcur-container">
            {/* Language */}
            <div className="settings-langcur-column">
              <label
                className="settings-langcur-label"
                style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
              >
                {t('language')}
              </label>

              <select
                value={locale}
                onChange={(e) => onLocaleChange(e.target.value)}
                className="settings-input settings-langcur-select"
                style={{
                  '--input-bg': isDark ? '#374151' : '#ffffff',
                  '--input-border': inputBorderColor,
                  '--input-text': mainTextColor,
                } as React.CSSProperties}
              >
                <option value="ja-JP">日本語 (ja-JP)</option>
                <option value="en-US">English (en-US)</option>
                {/*
                <option value="zh-TW">繁體中文 (zh-TW)</option>
                <option value="ko-KR">한국어 (ko-KR)</option>
                */}
              </select>
            </div>
            <div className="settings-langcur-column">
              <label
                className="settings-langcur-label"
                style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
              >
                {t('currency')}
              </label>

              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="settings-input settings-langcur-select"
                style={{
                  '--input-bg': isDark ? '#374151' : '#ffffff',
                  '--input-border': inputBorderColor,
                  '--input-text': mainTextColor,
                } as React.CSSProperties}
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

        <div
          className="settings-section-title"
          style={{ '--section-title-color': sectionTitleColor } as React.CSSProperties}
        >
          {t('dataManagement')}
          {getStatusBadge(groupStatus.is_premium)}
        </div>
        <div
          className="settings-card"
          style={{
            '--card-bg': cardBgColor,
            '--card-border': borderColor,
          } as React.CSSProperties}
        >
          <div className="settings-dm-row">
            <div className="settings-dm-left">
              <div className="settings-dm-title-row">
                <span
                  className="settings-dm-title"
                  style={{ '--sub-text-color': subTextColor } as React.CSSProperties}
                >
                  {t('exportCsv')}
                </span>
              </div>

              <p className="settings-dm-desc">
                🔒 {t('exportCsvDetails')}
              </p>
            </div>

            <span
              className="settings-dm-badge"
              style={{
                '--badge-bg': isDark ? '#4b5563' : '#e5e7eb',
                '--badge-color': subTextColor,
              } as React.CSSProperties}
            >
              {t('comingSoon')}
            </span>
          </div>
        </div>

        <div
          className="settings-section-title"
          style={{ '--section-title-color': sectionTitleColor } as React.CSSProperties}
        >
          {t('reset')}
        </div>
        <div
          className="settings-reset-card"
          style={{
            '--card-bg': isDark ? '#7f1d1d' : '#fff5f5',
            '--card-border': '#fca5a5',
          } as React.CSSProperties}
        >
          <div className="settings-reset-row">
            <div className="settings-reset-left">
              <span
                className="settings-reset-title"
                style={{
                  '--reset-title-color': isDark ? '#fca5a5' : '#991b1b',
                } as React.CSSProperties}
              >
                {t('deleteGroupDetails')}
              </span>

              <p
                className="settings-reset-warning"
                style={{
                  '--reset-warning-color': isDark ? '#f87171' : '#ef4444',
                } as React.CSSProperties}
              >
                {t('deleteGroupWarning')}
              </p>
            </div>

            <button
              onClick={() => {
                const isConfirmed = window.confirm(t('confirmDeleteGroup'));
                if (isConfirmed) onDeleteGroup();
              }}
              className="settings-reset-button"
            >
              {t('deleteGroup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}