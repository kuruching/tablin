import React from 'react';
import type { Transaction, Member } from '../types';

interface HistoryTableProps {
  transactions: Transaction[];
  members: Member[];
}

export default function HistoryTable({ transactions, members }: HistoryTableProps) {
  // メンバーIDから名前を瞬時に検索するヘルパー関数
  const getMemberName = (id: string | number) => {
    const member = members.find(m => String(m.id) === String(id));
    return member ? member.name : '不明なメンバー';
  };

  // 日付の表記を読みやすく整形する関数（例: 2026/05/21 12:34）
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', background: '#fafafa', borderRadius: '8px', border: '1px dashed #eee', marginTop: '20px' }}>
        まだ支払いの記録がありません。上のフォームから最初のツケを記録してみましょう！
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px', fontFamily: 'sans-serif' }}>
      <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px', marginBottom: '16px', color: '#333' }}>
        📜 これまでの履歴
      </h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f6f8fa', borderBottom: '2px solid #e1e4e8' }}>
              <th style={{ padding: '12px 8px', color: '#555' }}>日付</th>
              <th style={{ padding: '12px 8px', color: '#555' }}>支払った人</th>
              <th style={{ padding: '12px 8px', color: '#555' }}>内容</th>
              <th style={{ padding: '12px 8px', color: '#555', textAlign: 'right' }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #e1e4e8', transition: 'background 0.1s' }}>
                <td style={{ padding: '12px 8px', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {formatDate(tx.created_at)}
                </td>
                <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#333' }}>
                  {getMemberName(tx.payer_id)}
                </td>
                <td style={{ padding: '12px 8px', color: '#333' }}>
                  {tx.description}
                </td>
                <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#0070f3', textAlign: 'right' }}>
                  {Number(tx.amount).toLocaleString()} 円
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}