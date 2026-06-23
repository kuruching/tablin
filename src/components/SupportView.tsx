import React from 'react';
import { supabase } from '../config/supabase';
import backIcon from '../assets/back.svg';
import { type TranslationKey } from '../config/i18n';
import { formatTip } from '../utils/format';

import './SupportView.css';

export type SupportViewProps = {
  groupId: string;
  memberId: string;
  themeMode: 'light' | 'dark';
  currency: string;
  onBack: () => void;
  onSupport: (
    groupId: string,
    memberId: string,
    amount: number
  ) => Promise<void>;
  refreshSupports: () => Promise<void>;
  setView: (view: string) => void;
  t: (key: TranslationKey) => string;
};

const supportPlans = [
  {
    amount: 300,
    url: 'https://buy.stripe.com/fZubJ13fX7bfewW2a20x200',
  },
  {
    amount: 500,
    url: 'https://buy.stripe.com/8x23cvaIpdzD4Wm6qi0x201',
  },
];

export default function SupportView({
  groupId,
  memberId,
  themeMode,
  currency,
  onBack,
  onSupport,
  refreshSupports,
  setView,
  t,
}: SupportViewProps) {
  const isDark = themeMode === 'dark';

  const handleSupport = async (
    event: React.MouseEvent,
    amount: number
  ) => {
    event.stopPropagation();

    try {
      if (!groupId || !memberId) {
        throw new Error('PK不明');
      }

      const { error } = await supabase
        .from('supporters')
        .insert([
          {
            group_id: groupId,
            member_id: memberId,
            amount,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      await onSupport(groupId, memberId, amount);

      alert(t('alertSupport'));

      await refreshSupports();

      setView('main');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`support-view ${themeMode}`}>
      <header className="support-header">
        <div className="support-header-inner">

          <button
            onClick={onBack}
            className="support-back-button"
            title={t('back')}
          >
            <img
              src={backIcon}
              alt={t('back')}
              className={isDark ? 'icon-dark' : ''}
            />
          </button>

          <div className="support-title">
            {t('support')}
          </div>

        </div>
      </header>

      <div className="support-content">
        <div className="support-card">

          <p className="support-message">
            {t('messageSupport1')}
            <br />
            {t('messageSupport2')}
            <br />
            {t('messageSupport3')}
          </p>

          <div className="support-buttons">
            {supportPlans.map((plan) => (
              <a
                key={plan.amount}
                href={plan.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) =>
                  handleSupport(e, plan.amount)
                }
                className="support-button"
              >
                {formatTip(
                  plan.amount,
                  currency
                )}
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}