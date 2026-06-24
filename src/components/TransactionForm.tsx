import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { Member, Transaction } from '../types';
import { type TranslationKey } from '../config/i18n';

import './TransactionForm.css';

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
    if (formMode === 'copy') formTitle = t('duplicateTab');
    else if (formMode === 'edit') formTitle = t('editTab');

    const RequiredBadge = () => <span className="tf-required">*</span>;

    return (
      <div className="tf-overlay" onClick={handleClose}>
        <div className="tf-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* ヘッダー部分 */}
          <div className="tf-header">
            <h2 className="tf-title">{formTitle}</h2>
            <button onClick={handleClose} className="tf-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="tf-form">
            
            {/* 日付 */}
            <div>
              <label className="tf-label">
                {t('paymentDate')}<RequiredBadge />
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="tf-input"
                required
              />
            </div>

            {/* 支払った人 ➔ 対象者 */}
            <div className="tf-row">
              <div className="tf-col">
                <label className="tf-label">
                  {t('paidBy')}<RequiredBadge />
                </label>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  className="tf-input"
                  required
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="tf-arrow">➔</div>

              <div className="tf-col">
                <label className="tf-label">
                  {t('paidFor')}<RequiredBadge />
                </label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="tf-input"
                  required
                >
                  <option value="">{t('select')}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 場所 */}
            <div>
              <label className="tf-label">{t('location')}</label>
              <input
                type="text"
                placeholder={t('egLocation')}
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="tf-input"
              />
            </div>

            {/* 内容 */}
            <div>
              <label className="tf-label">
                {t('description')}<RequiredBadge />
              </label>
              <input
                type="text"
                placeholder={t('egDescription')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="tf-input"
                required
              />
            </div>

            {/* 金額 */}
            <div>
              <label className="tf-label">
                {t('amountLabel')}<RequiredBadge />
              </label>
              <input
                type="number"
                inputMode="decimal"
                step={currency === 'JPY' ? '1' : '0.01'}
                placeholder={currency === 'JPY' ? '金額を入力' : '0.00'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tf-input"
                required
              />
            </div>

            {/* アクションボタン */}
            <div className="tf-actions">
              <button type="button" onClick={handleClose} className="tf-btn-cancel">
                {t('cancel')}
              </button>
              <button type="submit" className="tf-btn-save">
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
