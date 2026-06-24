import MemberSelector from './MemberSelector';
import TransactionForm from './TransactionForm';
import type { Member, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { type TranslationKey } from '../config/i18n';

import titleLogoEn from '../assets/title_logo_en1.svg';
import titleLogoJa from '../assets/title_logo_ja1.svg';
import copyIcon from '../assets/copy.svg';
import editIcon from '../assets/pencil.svg';
import deleteIcon from '../assets/trash.svg';
import linkIcon from '../assets/link.svg';
import heartIcon from '../assets/heart.svg';
import gearIcon from '../assets/gear.svg';

import './HistoryView.css';

type TransactionWithTarget = Transaction & {
  target_member_id: string | number | null;
  payment_date?: string;
  place?: string;
};

type GroupStatus = {
  is_premium: boolean;
  premium_payer_id: string | number | null;
};

type HistoryViewProps = {
  themeMode: 'light' | 'dark';
  locale: string;
  currency: string;
  groupId: string | null;
  members: Member[];
  currentMember: Member | null;
  transactions: TransactionWithTarget[];
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  groupStatus: GroupStatus;
  plusColor: 'blue' | 'red';
  minusColor: 'blue' | 'red';
  menuRef: React.RefObject<HTMLDivElement | null>;
  formRef: React.RefObject<{ startEdit: (tx: TransactionWithTarget) => void } | null>;
  onNavigate: (view: string) => void;
  onSelectMember: (member: Member) => void;
  onCopyTransaction: (tx: TransactionWithTarget) => void;
  onDeleteTransaction: (id: string | number) => void;
  onSaveTransaction: (txData: any) => Promise<void>;
  t: (key: TranslationKey) => string;
};

export default function HistoryView({
  themeMode,
  locale,
  currency,
  groupId,
  members,
  currentMember,
  transactions,
  isFormOpen,
  setIsFormOpen,
  isMenuOpen,
  setIsMenuOpen,
  groupStatus,
  plusColor,
  minusColor,
  menuRef,
  formRef,
  onNavigate,
  onSelectMember,
  onCopyTransaction,
  onDeleteTransaction,
  onSaveTransaction,
  t,
}: HistoryViewProps) {

  const isDark = themeMode === 'dark';

  // CSS 変数に渡すための値
  const viewBgColor = isDark ? '#111827' : '#f9fafb';
  const cardBgColor = isDark ? '#1f2937' : '#ffffff';
  const mainTextColor = isDark ? '#f9fafb' : '#111827';
  const subTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const itemBorderColor = isDark ? '#374151' : '#f3f4f6';
  const badgeBgColor = isDark ? '#374151' : '#f3f4f6';

  const iconStyle = {
    width: '15px',
    height: '15px',
    opacity: isDark ? 1 : 0.7,
    filter: isDark ? 'invert(1) brightness(2)' : 'none',
    transition: 'filter 0.2s ease, opacity 0.2s ease'
  };

  const menuIconStyle = {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    filter: isDark ? 'invert(1) brightness(2)' : 'none'
  };

  const getPayerName = (id: string | number) => {
    const member = members.find(m => String(m.id) === String(id));
    return member ? member.name : 'Unknown';
  };

  const getTargetName = (id: string | number | null) => {
    if (id === null || id === undefined || String(id) === '0' || String(id) === '') return 'null';
    if (!members || members.length === 0) {
      return 'Loading...';
    }
    const m = members.find(member => String(member.id) === String(id));
    return m ? m.name : '不明';
  };

  const calculateTotalBalance = () => {
    if (!currentMember) return 0;
    return transactions.reduce((acc, tx) => {
      const isPayer = String(tx.payer_id) === String(currentMember.id);
      const isTarget = String(tx.target_member_id) === String(currentMember.id);
      if (isPayer && !isTarget) return acc + tx.amount;
      if (!isPayer && isTarget) return acc - tx.amount;
      return acc;
    }, 0);
  };

  const balance = calculateTotalBalance();

  const sortedTx = [...transactions].sort((a, b) => {
    const dateA = new Date(a.payment_date || a.created_at || 0).getTime();
    const dateB = new Date(b.payment_date || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div
      className="hv-container"
      style={{
        '--view-bg': viewBgColor,
        '--card-bg': cardBgColor,
        '--main-text': mainTextColor,
        '--sub-text': subTextColor,
        '--border-color': borderColor,
        '--item-border': itemBorderColor,
        '--badge-bg': badgeBgColor,
      } as React.CSSProperties}
    >
      <header className="hv-header">
        <div className="hv-header-inner">
          <div className="hv-logo-wrap">
            <img
              src={locale === 'ja-JP' ? titleLogoJa : titleLogoEn}
              alt="Logo"
              className="hv-logo"
            />
          </div>

          <div className="hv-menu-wrap" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hv-menu-btn"
              title={t('menu')}
            >
              ⋮
            </button>

            {isMenuOpen && (
              <div className="hv-menu-panel">
                <button
                  onClick={() => { setIsMenuOpen(false); onNavigate('create-group'); }}
                  className="hv-menu-item"
                >
                  <img src={linkIcon} style={menuIconStyle} alt="" />
                  {t('getNewUrl')}
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onNavigate('support'); }}
                  className="hv-menu-item hv-menu-divider"
                >
                  <img src={heartIcon} style={menuIconStyle} alt="" />
                  {t('support')}
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onNavigate('settings'); }}
                  className="hv-menu-item hv-menu-divider"
                >
                  <img src={gearIcon} style={menuIconStyle} alt="" />
                  {t('setting')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <MemberSelector
        members={members}
        currentMember={currentMember}
        onSelectMember={onSelectMember}
        groupId={groupId || ''}
        premiumPayerId={groupStatus.premium_payer_id}
        t={t}
      />
      
      {currentMember && (
        <>
          {/* 残高カード */}
          <div className="hv-balance-card">
            <span className="hv-balance-text">
              <strong>{currentMember.name}</strong>
              {t('hasTab1')}
            </span>

            <span
              className="hv-balance-amount"
              style={{
                color:
                  balance > 0
                    ? (plusColor === 'red'
                        ? (isDark ? '#f87171' : '#dc2626')
                        : (isDark ? '#60a5fa' : '#1d4ed8'))
                    : (minusColor === 'red'
                        ? (isDark ? '#f87171' : '#dc2626')
                        : (isDark ? '#60a5fa' : '#1d4ed8')),
              }}
            >
              {balance > 0
                ? `+${formatCurrency(balance, currency, locale)}`
                : formatCurrency(balance, currency, locale)}
            </span>

            <span className="hv-balance-text">{t('hasTab2')}</span>
          </div>

          {/* 取引履歴カード */}
          <div className="hv-history-card">
            {transactions.length === 0 ? (
              <p className="hv-no-history">{t('hasNotTab')}</p>
            ) : (
              <div className="hv-history-list">
                {sortedTx.map((tx) => {
                  const isCurrentPayer = String(tx.payer_id) === String(currentMember.id);
                  const isCurrentTarget = String(tx.target_member_id) === String(currentMember.id);

                  let amountColor = mainTextColor;
                  if (isCurrentPayer && !isCurrentTarget)
                    amountColor =
                      plusColor === 'red'
                        ? (isDark ? '#f87171' : '#dc2626')
                        : (isDark ? '#60a5fa' : '#1d4ed8');
                  else if (!isCurrentPayer && isCurrentTarget)
                    amountColor =
                      minusColor === 'red'
                        ? (isDark ? '#f87171' : '#dc2626')
                        : (isDark ? '#60a5fa' : '#1d4ed8');

                  return (
                    <div key={tx.id} className="hv-history-item">
                      <div className="hv-history-row">
                        <div className="hv-history-left">
                          <span className="hv-history-date">
                            {formatDate(tx.payment_date || tx.created_at?.split('T')[0], locale)}
                          </span>

                          {tx.place && (
                            <span className="hv-history-place">{tx.place}</span>
                          )}
                        </div>

                        <div className="hv-history-right">
                          <span className="hv-history-payer">
                            <span style={{ fontWeight: isCurrentPayer ? '700' : '400' }}>
                              {getPayerName(tx.payer_id)}
                            </span>
                            {' ➔ '}
                            <span style={{ fontWeight: isCurrentTarget ? '700' : '400' }}>
                              {getTargetName(tx.target_member_id)}
                            </span>
                          </span>

                          <button
                            onClick={() => onCopyTransaction(tx)}
                            title={t('copy')}
                            className="hv-icon-btn"
                          >
                            <img src={copyIcon} alt={t('copy')} style={iconStyle} />
                          </button>
                        </div>
                      </div>

                      <div className="hv-history-row">
                        <div className="hv-history-desc">{tx.description}</div>

                        <div className="hv-history-actions">
                          <span
                            className="hv-history-amount"
                            style={{ color: amountColor }}
                          >
                            {formatCurrency(tx.amount, currency, locale)}
                          </span>

                          <button
                            onClick={() => {
                              setIsFormOpen(true);
                              setTimeout(() => formRef.current?.startEdit(tx), 50);
                            }}
                            title={t('edit')}
                            className="hv-icon-btn"
                          >
                            <img src={editIcon} alt={t('edit')} style={iconStyle} />
                          </button>

                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title={t('remove')}
                            className="hv-icon-btn"
                          >
                            <img src={deleteIcon} alt={t('remove')} style={iconStyle} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 追加ボタン */}
          <button
            onClick={() => setIsFormOpen(true)}
            title={t('add')}
            className="hv-add-btn"
            style={{
              backgroundColor: isDark ? '#3bf82f6' : '#111827',
              color: isDark ? '#000000' : '#ffffff',
            }}
          >
            +
          </button>
        </>
      )}

      {groupId && (
        <TransactionForm
          ref={formRef}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          members={members}
          currentMember={currentMember}
          currency={currency}
          locale={locale}
          t={t}
          onSaveTransaction={onSaveTransaction}
        />
      )}
    </div>
  );
}
