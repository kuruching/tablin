import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './config/supabase';
import CreateGroup from './components/CreateGroup';
import MemberSelector from './components/MemberSelector';
import TransactionForm from './components/TransactionForm';

import type { Member, Transaction } from './types';

type TransactionWithTarget = Transaction & {
  target_member_id: string | number | null;
};

export default function App() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithTarget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const formRef = useRef<{ startEdit: (tx: TransactionWithTarget) => void } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('g');
    if (g) {
      setGroupId(g);
      fetchGroupData(g);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSaveTransaction = async (txData: { 
    id?: string | number; 
    payer_id: string | number; 
    amount: number; 
    description: string;
    target_member_id: string | number | null;
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
          .insert([{
            transaction_id: transactionId,
            member_id: txData.target_member_id
          }]);

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
    const copiedTx: TransactionWithTarget = {
      ...tx,
      id: ''
    };
    setTimeout(() => formRef.current?.startEdit(copiedTx), 50);
  };

  const refreshTransactions = async () => {
    if (!groupId) return;
    
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (!txData) return;

    const { data: targetData } = await supabase
      .from('transaction_targets')
      .select('transaction_id, member_id');

    const extendedTx: TransactionWithTarget[] = txData.map(tx => {
      const match = targetData ? targetData.find(t => String(t.transaction_id) === String(tx.id)) : null;
      return {
        ...tx,
        target_member_id: match ? match.member_id : null
      };
    });

    setTransactions(extendedTx);
  };

  const fetchGroupData = async (gId: string) => {
    try {
      /* ✅ ここを gId から group_id に修正しました */
      const { data: membersData } = await supabase.from('members').select('*').eq('group_id', gId);
      if (membersData) setMembers(membersData as Member[]);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('group_id', gId)
        .order('created_at', { ascending: false });

      const { data: targetData } = await supabase.from('transaction_targets').select('transaction_id, member_id');

      if (txData) {
        const extendedTx: TransactionWithTarget[] = txData.map(tx => {
          const match = targetData ? targetData.find(t => String(t.transaction_id) === String(tx.id)) : null;
          return {
            ...tx,
            target_member_id: match ? match.member_id : null
          };
        });
        setTransactions(extendedTx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member: Member) => {
    setCurrentMember(member);
  };

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

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>読み込み中...</div>;
  if (!groupId) return <CreateGroup />;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100dvh', paddingBottom: '24px', boxSizing: 'border-box' }}>
      
      <MemberSelector 
        members={members} 
        currentMember={currentMember} 
        onSelectMember={handleSelectMember} 
        groupId={groupId} 
      />

      {currentMember && (
        <>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', color: '#1f2937', marginTop: 0, marginBottom: '16px', fontWeight: '600' }}>
              履歴一覧
            </h2>

            {transactions.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0', margin: 0 }}>まだ履歴がありません。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    style={{ 
                      borderBottom: '1px solid #f3f4f6', 
                      paddingBottom: '10px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {formatDateOnly(tx.created_at || tx.date)}
                        </span>
                        <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </div>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap' }}>
                        {tx.amount.toLocaleString()} 円
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          {getPayerName(tx.payer_id)} ➔ {getTargetName(tx.target_member_id)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleCopyTransaction(tx)}
                          style={{
                            background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                            borderRadius: '4px', padding: '4px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer'
                          }}
                        >
                          📋 コピー
                        </button>

                        <button
                          onClick={() => {
                            setIsFormOpen(true);
                            setTimeout(() => formRef.current?.startEdit(tx), 50);
                          }}
                          style={{
                            background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
                            borderRadius: '4px', padding: '4px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer'
                          }}
                        >
                          ✏️ 編集
                        </button>

                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          style={{
                            background: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb',
                            borderRadius: '4px', padding: '4px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.borderColor = '#fca5a5';
                            e.currentTarget.style.background = '#fef2f2';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = '#9ca3af';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          🗑️ 削除
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ 
            position: 'fixed', top: '12px', right: '12px', background: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #d1d5db', padding: '4px 8px', 
            borderRadius: '6px', fontSize: '11px', color: '#374151', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', zIndex: 1000 
          }}>
            ログイン: <strong>{currentMember.name}</strong>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            title="新しいツケを記録"
            style={{
              position: 'fixed', bottom: '16px', right: '16px', width: '56px', height: '56px',
              borderRadius: '50%', backgroundColor: '#111827', color: '#ffffff', border: 'none',
              fontSize: '28px', fontWeight: '300', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 999, lineHeight: 1
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
          onSaveTransaction={handleSaveTransaction}
        />
      )}
    </div>
  );
}