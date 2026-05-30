import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './config/supabase';
import CreateGroup from './components/CreateGroup';
import MemberSelector from './components/MemberSelector';
import TransactionForm from './components/TransactionForm';

import type { Member, Transaction } from './types';

import titleLogo from './assets/title_logo.png';
import copyIcon from './assets/copy.svg';
import editIcon from './assets/pencil.svg';
import deleteIcon from './assets/trash.svg';

// 多言語・多通貨対応の設定辞書
const MENU_TEXTS = {
  'ja-JP': { newGroup: '新規グループ', support: '応援する', settings: '設定' },
  'en-US': { newGroup: 'Create new group', support: 'Support', settings: 'Settings' }
};

type TransactionWithTarget = Transaction & {
  target_member_id: string | number | null;
  payment_date?: string; 
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>('main');
  const [locale, setLocale] = useState<string>('ja-JP');
  const [currency, setCurrency] = useState<string>('JPY');

  const [groupId, setGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithTarget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const formRef = useRef<{ startEdit: (tx: TransactionWithTarget) => void } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const t = MENU_TEXTS[locale as keyof typeof MENU_TEXTS] || MENU_TEXTS['ja-JP'];
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
  };

  useEffect(() => {
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.backgroundColor = '#f9fafb';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#f9fafb';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('g');
    if (g) {
      setGroupId(g);
      fetchGroupData(g);
    } else {
      setCurrentView('create-group');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTransaction = async (txData: { 
    id?: string | number; 
    payer_id: string | number; 
    amount: number; 
    description: string;
    target_member_id: string | number | null;
    payment_date: string; 
   }) => {
    if (!groupId) return;
    try {
      let transactionId = txData.id;
      if (transactionId) {
        const { error: txError } = await supabase
          .from('transactions')
          .update({
            payer_id: txData.payer_id,
            amount: txData.amount,
            description: txData.description,
            payment_date: txData.payment_date, 
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (txError) throw txError;
        await supabase.from('transaction_targets').delete().eq('transaction_id', transactionId);
      } else {
        const { data: newTx, error: txError } = await supabase
          .from('transactions')
          .insert([{
            group_id: groupId,
            payer_id: txData.payer_id,
            amount: txData.amount,
            description: txData.description,
            payment_date: txData.payment_date, 
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (txError) throw txError;
        transactionId = newTx.id;
      }

      if (transactionId && txData.target_member_id) {
        const { error: targetError } = await supabase
          .from('transaction_targets')
          .insert([{ transaction_id: transactionId, member_id: txData.target_member_id }]);
        if (targetError) throw targetError;
      }
      refreshTransactions();
      setIsFormOpen(false);
    } catch (error) {
      console.error('ツケの保存に失敗しました:', error);
      alert('保存に失敗しました。');
    }
  };

  const handleDeleteTransaction = async (id: string | number) => {
    if (!groupId) return;
    if (!window.confirm('この記録を完全に削除してもよろしいですか？')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      refreshTransactions();
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました。');
    }
  };

  const handleCopyTransaction = (tx: TransactionWithTarget) => {
    setIsFormOpen(true);
    const copiedTx: TransactionWithTarget = { ...tx, id: '' };
    setTimeout(() => formRef.current?.startEdit(copiedTx), 50);
  };

  const refreshTransactions = async () => {
    if (!groupId) return;
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('group_id', groupId)
      .order('payment_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (!txData) return;
    const { data: targetData } = await supabase.from('transaction_targets').select('transaction_id, member_id');

    const extendedTx: TransactionWithTarget[] = txData.map(tx => {
      const match = targetData ? targetData.find(t => String(t.transaction_id) === String(tx.id)) : null;
      return { ...tx, target_member_id: match ? match.member_id : null };
    });
    setTransactions(extendedTx);
  };

  const fetchGroupData = async (gId: string) => {
    try {
      const { data: membersData } = await supabase.from('members').select('*').eq('group_id', gId);
      if (membersData) setMembers(membersData as Member[]);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('group_id', gId)
        .order('payment_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      const { data: targetData } = await supabase.from('transaction_targets').select('transaction_id, member_id');

      if (txData) {
        const extendedTx: TransactionWithTarget[] = txData.map(tx => {
          const match = targetData ? targetData.find(t => String(t.transaction_id) === String(tx.id)) : null;
          return { ...tx, target_member_id: match ? match.member_id : null };
        });
        setTransactions(extendedTx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member: Member) => { setCurrentMember(member); };
  const getPayerName = (id: string | number) => {
    const member = members.find(m => String(m.id) === String(id));
    return member ? member.name : '不明';
  };
  const getTargetName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'null';
    const m = members.find(member => String(member.id) === String(id));
    return m ? m.name : '不明';
  };
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return '';
    const parts = dateString.substring(5, 10).split('-');
    return parts.length === 2 ? `${parts[0]}/${parts[1]}` : dateString.substring(5, 10);
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

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>読み込み中...</div>;

  const balance = calculateTotalBalance();

  const renderContent = () => {
    switch (currentView) {
      case 'create-group':
        return <CreateGroup />;
      case 'settings':
        return (
          <div style={{ padding: '16px', background: '#fff', borderRadius: '12px' }}>
            <h3>設定画面</h3>
            <p>ここに通貨や言語の変更UIを実装します。</p>
            <button onClick={() => setCurrentView('main')} style={{ padding: '8px 12px', cursor: 'pointer' }}>戻る</button>
          </div>
        );
      case 'support':
        return (
          <div style={{ padding: '16px', background: '#fff', borderRadius: '12px' }}>
            <h3>応援する</h3>
            <p>ここにアプリの応援・課金機能などのUIを実装します。</p>
            <button onClick={() => setCurrentView('main')} style={{ padding: '8px 12px', cursor: 'pointer' }}>戻る</button>
          </div>
        );
      case 'main':
      default:
        return (
          <>
            <MemberSelector 
              members={members} 
              currentMember={currentMember} 
              onSelectMember={handleSelectMember} 
              groupId={groupId} 
            />

            {currentMember && (
              <>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
                    現在の <strong>{currentMember.name}</strong> のツケは 
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: '700', color: balance < 0 ? '#ef4444' : balance > 0 ? '#1d4ed8' : '#111827', fontFamily: 'monospace', marginLeft: '6px' }}>
                    {balance > 0 ? `+${formatCurrency(balance)}` : formatCurrency(balance)}
                  </span>
                </div>

                <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '16px', marginBottom: '24px' }}>
                  {transactions.length === 0 ? (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0', margin: 0 }}>まだ履歴がありません。</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {transactions.map((tx) => {
                        const isCurrentPayer = String(tx.payer_id) === String(currentMember.id);
                        const isCurrentTarget = String(tx.target_member_id) === String(currentMember.id);
                        let amountColor = '#111827'; 
                        if (isCurrentPayer && !isCurrentTarget) amountColor = '#1d4ed8'; 
                        else if (!isCurrentPayer && isCurrentTarget) amountColor = '#ef4444'; 

                        return (
                          <div key={tx.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                  {formatDateOnly(tx.payment_date || tx.created_at)}
                                </span>
                                <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {tx.description}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600', color: amountColor, fontFamily: 'monospace' }}>
                                  {formatCurrency(tx.amount)}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                                  <span style={{ fontWeight: isCurrentPayer ? '700' : '400' }}>{getPayerName(tx.payer_id)}</span>
                                  {' ➔ '}
                                  <span style={{ fontWeight: isCurrentTarget ? '700' : '400' }}>{getTargetName(tx.target_member_id)}</span>
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', whiteSpace: 'nowrap' }}>
                                <button onClick={() => handleCopyTransaction(tx)} title="記録をコピー" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <img src={copyIcon} alt="コピー" style={{ width: '15px', height: '15px' }} />
                                </button>
                                <button onClick={() => { setIsFormOpen(true); setTimeout(() => formRef.current?.startEdit(tx), 50); }} title="記録を編集" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <img src={editIcon} alt="編集" style={{ width: '15px', height: '15px' }} />
                                </button>
                                <button onClick={() => handleDeleteTransaction(tx.id)} title="記録を削除" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.backgroundColor = '#fef2f2'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#fff'; }}>
                                  <img src={deleteIcon} alt="削除" style={{ width: '15px', height: '15px' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <button onClick={() => setIsFormOpen(true)} title="新しいツケを記録" style={{ position: 'fixed', bottom: '16px', right: '16px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#111827', color: '#ffffff', border: 'none', fontSize: '28px', fontWeight: '300', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', zIndex: 999, lineHeight: 1 }}>+</button>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100dvh', paddingBottom: '24px', boxSizing: 'border-box', position: 'relative', paddingTop: '56px' }}>
      
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1000, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '576px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', cursor: groupId ? 'pointer' : 'default' }} onClick={() => groupId && setCurrentView('main')}>
            <img src={titleLogo} alt="Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', padding: '0', margin: '0' }} />
          </div>

          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ background: 'none', border: 'none', fontSize: '22px', color: '#4b5563', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              title="メニュー"
            >
              ⋮
            </button>

            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '36px', right: 0, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: '160px', padding: '4px 0', zIndex: 1001 }}>
                {/* 💡 ここを変更しました：クリックした時にページ全体を http://localhost:5173/ へ遷移させます */}
                <button 
                  onClick={() => { setIsMenuOpen(false); window.location.href = window.location.origin + window.location.pathname; }}
                  style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#1f2937', cursor: 'pointer' }}
                >
                  {t.newGroup}
                </button>
                <button 
                  onClick={() => { setIsMenuOpen(false); setCurrentView('support'); }}
                  style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#1f2937', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}
                >
                  {t.support}
                </button>
                <button 
                  onClick={() => { setIsMenuOpen(false); setCurrentView('settings'); }}
                  style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#1f2937', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}
                >
                  {t.settings}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {renderContent()}

      {groupId && (
        <TransactionForm 
          ref={formRef}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          members={members}
          currentMember={currentMember}
          onSaveTransaction={handleSaveTransaction}
        />
      )}
    </div>
  );
}