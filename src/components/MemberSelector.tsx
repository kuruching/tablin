import { useEffect } from 'react';
import type { Member } from '../types';
import type { TranslationKey } from '../config/i18n';
import './MemberSelector.css';

interface MemberSelectorProps {
  members: Member[];
  currentMember: Member | null;
  onSelectMember: (member: Member) => void;
  groupId: string;
  premiumPayerId: string | number | null;
  t: (key: TranslationKey) => string;
}

export default function MemberSelector({
  members,
  currentMember,
  onSelectMember,
  groupId,
  //premiumPayerId,
  t
}: MemberSelectorProps) {
  const storageKey = `tsukemawari_user_${groupId}`;

  useEffect(() => {
    if (currentMember) return;

    const cachedMemberId = localStorage.getItem(storageKey);
    if (cachedMemberId && members.length > 0) {
      const found = members.find(m => String(m.id) === String(cachedMemberId));
      if (found) {
        onSelectMember(found);
      }
    }
  }, [members, currentMember, storageKey, onSelectMember]);

  if (currentMember) {
    return null;
  }

  if (!members || members.length === 0) {
    return (
      <div className="ms-loading">
        <p className="ms-loading-text">{t('loadingMembers')}</p>
      </div>
    );
  }

  const handleSelect = (member: Member) => {
    localStorage.setItem(storageKey, String(member.id));
    onSelectMember(member);
  };

  return (
    <div className="ms-overlay">
      <div className="ms-box">
        <h2 className="ms-title">{t('selectWho')}</h2>

        <p className="ms-desc">
          {t('selectYourName')}
        </p>

        <div className="ms-grid">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelect(member)}
              className="ms-member-btn"
            >
              {member.name}
            </button>
          ))}
        </div>

        <p className="ms-note">
          {t('autoSelectNextTime')}
          <br />
          {t('clearCacheToChange')}
        </p>
      </div>
    </div>
  );
}
