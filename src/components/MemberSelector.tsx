import { useEffect } from 'react';
import type { Member } from '../types';

interface MemberSelectorProps {
  members: Member[];
  currentMember: Member | null;
  onSelectMember: (member: Member) => void;
  groupId: string;
  premiumPayerId: string | number | null;
}

export default function MemberSelector({ members, currentMember, onSelectMember, groupId }: MemberSelectorProps) {
  const storageKey = `tsukemawari_user_${groupId}`;

  useEffect(() => {
    if (currentMember) return;

    const cachedMemberId = localStorage.getItem(storageKey);
    // idの型が文字列(UUID)か数値(number)かに関わらず確実に比較できるよう、型変換をしてチェックします
    if (cachedMemberId && members.length > 0) {
      const found = members.find(m => String(m.id) === String(cachedMemberId));
      if (found) {
        onSelectMember(found);
      }
    }
  }, [members, currentMember, storageKey, onSelectMember]);

  // ログイン済みなら何も表示しない
  if (currentMember) {
    return null;
  }

  // ータの読み込み待ち対策
  // もしSupabaseからの通信がまだ終わっておらず、メンバーが0人のときは「読み込み中」を表示して待つ
  if (!members || members.length === 0) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#666' }}>メンバーデータを読み込んでいます...</p>
      </div>
    );
  }

  const handleSelect = (member: Member) => {
    localStorage.setItem(storageKey, String(member.id));
    onSelectMember(member);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(255,255,255,0.98)', 
      zIndex: 9999, 
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '10px', fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>あなたは誰ですか？</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
          このブラウザでアプリを利用するあなたの名前を選択してください。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelect(member)}
              style={{
                padding: '20px 10px', background: '#fff', border: '2px solid #0070f3', borderRadius: '8px',
                color: '#0070f3', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,70,243,0.1)', transition: 'all 0.2s',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#0070f3';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#0070f3';
              }}
            >
              {member.name}
            </button>
          ))}
        </div>

        <p style={{ color: '#666', fontSize: '10px', marginTop: '30px', marginBottom: '30px' }}>
          次回以降は自動的にこのメンバーとして開きます。
          <br />変更したい場合はキャッシュを削除してください。
        </p>
      </div>
    </div>
  );
}