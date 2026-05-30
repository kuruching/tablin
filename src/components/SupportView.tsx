import React from 'react';
import { supabase } from '../config/supabase';
import backIcon from '../assets/back.svg';
import { type TranslationKey } from '../config/i18n';
import { tipOptions } from '../types/index';
import { formatTip } from "../utils/format";

export type SupportViewProps = {
  groupId: string;
  memberId: string;
  themeMode: 'light' | 'dark';
  currency: string;
  onBack: () => void;
  onSupport: (groupId: string, memberId: string, amount: number) => Promise<void>;
  refreshSupports: () => Promise<void>;
  setView: (view: string) => void;
  t: (key: TranslationKey) => string;
};

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

  const viewBgColor = isDark ? '#111827' : '#f9fafb';
  const cardBgColor = isDark ? '#1f2937' : '#ffffff';
  const mainTextColor = isDark ? '#f9fafb' : '#111827';
  const subTextColor = isDark ? '#d1d5db' : '#4b5563';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const accentColor = '#10b981';

  const cardStyle: React.CSSProperties = { 
    background: cardBgColor, 
    borderRadius: '12px', 
    padding: '24px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
    border: `1px solid ${borderColor}`,
    textAlign: 'center'
  };

  const handleSupport = async (event: React.MouseEvent, amount: number) => {
    event.stopPropagation();
    try {
      if (!groupId || !memberId) throw new Error("PK不明");

      const { error } = await supabase.from('supporters')
      .insert([
        { 
          group_id: groupId, 
          member_id: memberId, 
          amount: amount,
          created_at: new Date().toISOString()
        }
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
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: viewBgColor, minHeight: '100dvh', boxSizing: 'border-box', position: 'relative', paddingTop: '56px' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', backgroundColor: cardBgColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '576px', margin: '0 auto', position: 'relative' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '6px 4px', cursor: 'pointer', position: 'absolute', left: 0 }} title={t('back')}>
            <img src={backIcon} alt={t('back')} style={{ width: '20px', height: '20px', filter: isDark ? 'invert(1)' : 'none' }} />
          </button>
          <div style={{ margin: '0 auto', fontSize: '16px', fontWeight: 'bold', color: mainTextColor }}>{t('support')}</div>
        </div>
      </header>

      <div style={{ padding: '12px', marginTop: '24px' }}>
        <div style={cardStyle}>
          <p style={{ color: subTextColor, fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            {t('messageSupport1')}<br />{t('messageSupport2')}<br />{t('messageSupport3')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '24px' }}>
            {/*
            <button onClick={(e) => handleSupport(e, 300)} style={{ padding: '14px 20px', borderRadius: '8px', border: 'none', backgroundColor: accentColor, color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>¥300</button>
            <button onClick={(e) => handleSupport(e, 500)} style={{ padding: '14px 20px', borderRadius: '8px', border: 'none', backgroundColor: accentColor, color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>¥500</button>
            */}
            {tipOptions[currency].map((amount) => (
              <button
                key={amount}
                onClick={(e) => handleSupport(e, amount)}
                style={{
                  padding: "14px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: accentColor,
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {formatTip(amount, currency)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}