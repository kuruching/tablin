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
    //console.log("id[" + id + "]");
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

  const actionButtonStyle = { 
    background: 'none', 
    border: 'none', 
    padding: '4px 6px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  };

  const sortedTx = [...transactions].sort((a, b) => {
    const dateA = new Date(a.payment_date || a.created_at || 0).getTime();
    const dateB = new Date(b.payment_date || b.created_at || 0).getTime();
    return dateB - dateA; // 降順
  });

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', backgroundColor: viewBgColor, minHeight: '100dvh', paddingBottom: '24px', boxSizing: 'border-box', position: 'relative', paddingTop: '56px', transition: 'background-color 0.2s ease' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', backgroundColor: cardBgColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1000, boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '576px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/*<img src={titleLogo} alt="Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block', padding: '6px 0 4px 0', margin: 0, filter: isDark ? 'grayscale(1) invert(1)' : 'none', transition: 'filter 0.2s ease' }}/>*/}
            <img src={locale === 'ja-JP' ? titleLogoJa : titleLogoEn} alt="Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block', padding: '6px 0 4px 0', margin: 0 }}/>
          </div>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '22px', color: subTextColor, cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} title={t('menu')}>⋮</button>
            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '36px', right: 0, backgroundColor: cardBgColor, border: `1px solid ${borderColor}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: '200px', padding: '4px 0', zIndex: 1010 }}>
                <button onClick={() => { setIsMenuOpen(false); onNavigate('create-group'); }} style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '14px', color: mainTextColor, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><img src={linkIcon} style={menuIconStyle} alt="" />{t('getNewUrl')}</button>
                <button onClick={() => { setIsMenuOpen(false); onNavigate('support'); }} style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '14px', color: mainTextColor, cursor: 'pointer', borderTop: `1px solid ${itemBorderColor}`, display: 'flex', alignItems: 'center' }}><img src={heartIcon} style={menuIconStyle} alt="" />{t('support')}</button>
                <button onClick={() => { setIsMenuOpen(false); onNavigate('settings'); }} style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '14px', color: mainTextColor, cursor: 'pointer', borderTop: `1px solid ${itemBorderColor}`, display: 'flex', alignItems: 'center' }}><img src={gearIcon} style={menuIconStyle} alt="" />{t('setting')}</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <MemberSelector members={members} currentMember={currentMember} onSelectMember={onSelectMember} groupId={groupId || ''} premiumPayerId={groupStatus.premium_payer_id} />
      {currentMember && (
        <>
          <div style={{ background: cardBgColor, borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '8px', textAlign: 'center', border: isDark ? `1px solid ${borderColor}` : 'none', transition: 'background-color 0.2s ease' }}>
            <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '500' }}><strong>{currentMember.name}</strong>{t('hasTab1')}</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: balance > 0 ? (plusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#60a5fa' : '#1d4ed8')) : (minusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#60a5fa' : '#1d4ed8')), fontFamily: 'monospace', marginLeft: '6px' }}>{balance > 0 ? `+${formatCurrency(balance, currency, locale)}` : formatCurrency(balance, currency, locale)}</span>
            <span style={{ fontSize: '14px', color: subTextColor, fontWeight: '500' }}>{t('hasTab2')}</span>
          </div>
          <div style={{ background: cardBgColor, borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '16px', marginBottom: '24px', border: isDark ? `1px solid ${borderColor}` : 'none', transition: 'background-color 0.2s ease' }}>
            {transactions.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0', margin: 0 }}>{t('hasNotTab')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedTx.map((tx) => {
                  const isCurrentPayer = String(tx.payer_id) === String(currentMember.id);
                  const isCurrentTarget = String(tx.target_member_id) === String(currentMember.id);
                  let amountColor = mainTextColor;
                  if (isCurrentPayer && !isCurrentTarget) amountColor = plusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#60a5fa' : '#1d4ed8');
                  else if (!isCurrentPayer && isCurrentTarget) amountColor = minusColor === 'red' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#60a5fa' : '#1d4ed8');
                  return (
                    <div key={tx.id} style={{ borderBottom: `1px solid ${itemBorderColor}`, paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{formatDate(tx.payment_date || tx.created_at?.split('T')[0], locale)}</span>
                          {tx.place && <span style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{tx.place}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', color: mainTextColor, fontFamily: 'monospace', backgroundColor: badgeBgColor, padding: '2px 6px', borderRadius: '4px' }}>
                            <span style={{ fontWeight: isCurrentPayer ? '700' : '400' }}>{getPayerName(tx.payer_id)}</span>
                            {' ➔ '}
                            <span style={{ fontWeight: isCurrentTarget ? '700' : '400' }}>{getTargetName(tx.target_member_id)}</span>
                          </span>
                          <button onClick={() => onCopyTransaction(tx)} title={t('copy')} style={actionButtonStyle}><img src={copyIcon} alt={t('copy')} style={iconStyle} /></button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ fontWeight: '500', color: mainTextColor, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '12px', textAlign: 'left'}}>{tx.description}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: amountColor, fontFamily: 'monospace' }}>{formatCurrency(tx.amount, currency, locale)}</span>
                          <button onClick={() => { setIsFormOpen(true); setTimeout(() => formRef.current?.startEdit(tx), 50); }} title={t('edit')}  style={actionButtonStyle}><img src={editIcon} alt={t('edit')} style={iconStyle} /></button>
                          <button onClick={() => onDeleteTransaction(tx.id)} title={t('remove')} style={actionButtonStyle}><img src={deleteIcon} alt={t('remove')} style={iconStyle} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button onClick={() => setIsFormOpen(true)} title={t('add')} style={{ position: 'fixed', bottom: '16px', right: '16px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isDark ? '#3bf82f6' : '#111827', color: isDark ? '#000000' : '#ffffff', border: 'none', fontSize: '28px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', zIndex: 999, lineHeight: 1 }}>+</button>
        </>
      )}
      {groupId && <TransactionForm 
      ref={formRef} 
      isOpen={isFormOpen} 
      onClose={() => setIsFormOpen(false)} 
      members={members} 
      currentMember={currentMember} 
      currency={currency}
      locale={locale}
      t={t}
      onSaveTransaction={onSaveTransaction} />}
    </div>
  );
}