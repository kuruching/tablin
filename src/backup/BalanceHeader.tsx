import React from 'react';
import type { Member } from '../types';
import MemberSelector from './MemberSelector';

interface BalanceHeaderProps {
  members: Member[];
  myMemberId: number | null;
  myBalance: number | null;
  onSelectMe: (id: number | null) => void;
}

export default function BalanceHeader({ members, myMemberId, myBalance, onSelectMe }: BalanceHeaderProps) {
  const myName = members.find(m => m.id === myMemberId)?.name;

  return (
    <header style={{ background: '#f5f5f7', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      {myMemberId === null || myBalance === null ? (
        <MemberSelector members={members} onSelect={onSelectMe} />
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h3>こんにちは、{myName} さん</h3>
          {myBalance > 0 ? (
            <h1 style={{ color: 'green', margin: '10px 0' }}>現在 ＋{Math.round(myBalance).toLocaleString()} 円（払いすぎ）</h1>
          ) : myBalance < 0 ? (
            <h1 style={{ color: 'red', margin: '10px 0' }}>現在 －{Math.abs(Math.round(myBalance)).toLocaleString()} 円（借金中）</h1>
          ) : (
            <h1 style={{ color: '#333', margin: '10px 0' }}>精算はきれいにピッタリです！</h1>
          )}
          <button 
            onClick={() => onSelectMe(null)} 
            style={{ fontSize: '12px', background: 'none', border: 'none', textDecoration: 'underline', color: '#666', cursor: 'pointer' }}
          >
            自分ではない、または変更する
          </button>
        </div>
      )}
    </header>
  );
}