import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { Member, Transaction } from '../types';
import { type TranslationKey } from '../config/i18n';

// place カラムを型定義に拡張
type TransactionWithTarget = Transaction & {
  target_member_id: string | number | null;
  payment_date?: string; 
  place?: string; 
};

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentMember: Member | null;
  currency: string;
  locale: string;
  t: (key: TranslationKey) => string;
  onSaveTransaction: (txData: {
    id?: string | number;
    payer_id: string | number;
    amount: number;
    description: string;
    place: string; 
    target_member_id: string | number | null;
    payment_date: string; 
  }) => void;
}

const TransactionForm = forwardRef<{ startEdit: (tx: TransactionWithTarget) => void }, TransactionFormProps>(
  ({ isOpen, onClose, members, currentMember, currency, t, onSaveTransaction }, ref) => {
    const [id, setId] = useState<string | number | undefined>(undefined);
    const [payerId, setPayerId] = useState<string | number>(0);
    const [targetMemberId, setTargetMemberId] = useState<string | number>(0);
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [place, setPlace] = useState<string>(''); 
    const [paymentDate, setPaymentDate] = useState<string>(''); 
    const [formMode, setFormMode] = useState<'create' | 'copy' | 'edit'>('create');

    useEffect(() => {
      if (isOpen && !id) {
        if (formMode !== 'copy') {
          setFormMode('create');
        }
        
        const today = new Date().toISOString().split('T')[0];
        setPaymentDate(today);

        if (!targetMemberId || targetMemberId === 0) {
          if (currentMember) {
            setPayerId(currentMember.id);
          }
          setTargetMemberId(0);
        }
      }
    }, [isOpen, id, currentMember, members, formMode]);

    useImperativeHandle(ref, () => ({
      startEdit(tx: TransactionWithTarget) {
        if (tx.id === '') {
          setFormMode('copy');
          setId(undefined);
        } else {
          setFormMode('edit');
          setId(tx.id || undefined);
        }

        setPayerId(tx.payer_id);
        setAmount(tx.amount.toString());
        setDescription(tx.description || '');
        setPlace(tx.place || '');
        setTargetMemberId(tx.target_member_id ?? 0);
        setPaymentDate(tx.payment_date || new Date().toISOString().split('T')[0]);
      }
    }));

    if (!isOpen) return null;

    const handleClose = () => {
      setId(undefined);
      setPayerId('');
      setAmount('');
      setDescription('');
      setPlace(''); 
      setTargetMemberId('');
      setPaymentDate('');
      setFormMode('create');
      onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSaveTransaction({
        id,
        payer_id: payerId,
        amount: Number(amount),
        description: description.trim(),
        place: place.trim(), 
        target_member_id: targetMemberId ? targetMemberId : null,
        payment_date: paymentDate
      });
      handleClose();
    };

    let formTitle = t('logTab');
    if (formMode === 'copy') {
      formTitle = t('duplicateTab');
    } else if (formMode === 'edit') {
      formTitle = t('editTab');
    }

    const inputStyle = {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '15px',
      boxSizing: 'border-box' as const,
      outline: 'none',
      backgroundColor: '#fff',
      color: '#111827'
    };

    const RequiredBadge = () => <span style={{ color: '#ef4444', marginLeft: '4px', fontWeight: 'bold' }}>*</span>;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        padding: '16px'
      }} onClick={handleClose}>
        <div style={{
          backgroundColor: '#ffffff', width: '100%', maxWidth: '450px',
          borderRadius: '16px',
          padding: '20px 16px 24px 16px', boxSizing: 'border-box',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* ヘッダー部分 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
              {formTitle}
            </h2>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 日付 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                {t('paymentDate')}<RequiredBadge />
              </label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={inputStyle} required />
            </div>

            {/* 支払った人 ➔ 対象者 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                  {t('paidBy')}<RequiredBadge />
                </label>
                <select value={payerId} onChange={(e) => setPayerId(e.target.value)} style={inputStyle} required>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ paddingBottom: '10px', color: '#9ca3af', fontSize: '14px', fontWeight: 'bold' }}>➔</div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                  {t('paidFor')}<RequiredBadge />
                </label>
                <select value={targetMemberId} onChange={(e) => setTargetMemberId(e.target.value)} style={inputStyle} required>
                  <option value="">{t('select')}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 場所 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                {t('location')}
              </label>
              <input type="text" placeholder={t('egLocation')} value={place} onChange={(e) => setPlace(e.target.value)} style={inputStyle} />
            </div>

            {/* 内容 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                {t('description')}<RequiredBadge />
              </label>
              <input type="text" placeholder={t('egDescription')} value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} required />
            </div>

            {/* 金額 */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', textAlign: 'left' }}>
                {t('amountLabel')}<RequiredBadge />
              </label>
              <input type="number" inputMode="decimal" 
              step={currency === 'JPY' ? '1' : '0.01'} 
              placeholder={currency === 'JPY' ? '金額を入力' : '0.00'} 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              style={inputStyle} required />
            </div>

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={handleClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {t('cancel')}
              </button>
              <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {t('save')}
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }
);

TransactionForm.displayName = 'TransactionForm';
export default TransactionForm;