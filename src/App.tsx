import { useState, useEffect, useRef } from 'react';
import { supabase } from './config/supabase';
import CreateGroup from './components/CreateGroup';
import SettingsView from './components/SettingsView';
import SupportView from './components/SupportView';
import HistoryView from './components/HistoryView';
import type { Member, Transaction } from './types';
import { BeatLoader } from 'react-spinners';
import linkIcon from './assets/link.svg';
import { messages, type Locale } from './config/i18n';

type TransactionWithTarget = Transaction & {
  target_member_id: string | number | null;
  payment_date?: string;
  place?: string;
};

type GroupStatus = {
  is_premium: boolean;
  premium_payer_id: string | number | null;
};

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => 
    localStorage.getItem('tsukemawari_theme') === 'dark' ? 'dark' : 'light'
  );
  
  const [currentView, setCurrentView] = useState<string>('main');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithTarget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [groupStatus, setGroupStatus] = useState<GroupStatus>({ is_premium: false, premium_payer_id: null });
  
  const [plusColor, setPlusColor] = useState<'blue' | 'red'>(() => 
    (localStorage.getItem('tsukemawari_plusColor') as 'blue' | 'red') || 'blue'
  );
  const [minusColor, setMinusColor] = useState<'red' | 'blue'>(() => 
    (localStorage.getItem('tsukemawari_minusColor') as 'red' | 'blue') || 'red'
  );
  const [supports, setSupports] = useState<{ member_id: string | number }[]>([]);
  const [locale, setLocale] = useState<Locale>(() => 
    (localStorage.getItem('tsukemawari_locale') as Locale) || 'ja-JP'
  );
  const [currency, setCurrency] = useState<string>(() => 
    localStorage.getItem('tsukemawari_currency') || 'JPY'
  );
  const [newMemberName, setNewMemberName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<any>(null);
  
  const t = (key: keyof typeof messages['ja-JP']) => {
    return messages[locale]?.[key] || messages['ja-JP'][key];
  };
  
  // 背景色の制御
  useEffect(() => {
    const color = themeMode === 'dark' ? '#111827' : '#f9fafb';
    document.documentElement.style.backgroundColor = color;//なんかこれやると変？
    document.body.style.backgroundColor = color;
    localStorage.setItem('tsukemawari_theme', themeMode);
  }, [themeMode]);

  // CurrentViewの制御
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
  
  // 背景色の制御
  useEffect(() => {
    if (currentView === 'create-group') {
      setThemeMode('light');
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      // 別の画面に遷移した際、ローカルストレージの保存値に基づき元のモードに戻す
      const savedTheme = localStorage.getItem('tsukemawari_theme') as 'light' | 'dark';
      if (savedTheme === 'dark') {
        setThemeMode('dark');
      }
    }
  }, [currentView]);

  // 変更時に保存する処理
  useEffect(() => {
    localStorage.setItem('tsukemawari_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('tsukemawari_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('tsukemawari_plusColor', plusColor);
  }, [plusColor]);

  useEffect(() => {
    localStorage.setItem('tsukemawari_minusColor', minusColor);
  }, [minusColor]);

  // 支援者の取得
  const fetchSupports = async (g : string): Promise<void> => {
    if (!g) return;

    const { data, error } = await supabase
      .from('supporters')
      .select('*')
      .eq('group_id', g);

    if (error) {
      console.error("支援者データの取得失敗:", error);
    } else {
      const uniqueIds = Array.from(new Set(data.map(item => item.member_id)));
      setSupports(uniqueIds.map(id => ({ member_id: id })) || []);
    }
  };
  
  const handleSaveTransaction = async (txData: { 
    id?: string | number; 
    payer_id: string | number; 
    amount: number; 
    description: string;
    place: string, 
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
            place: txData.place, 
            target_member_id: txData.target_member_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (txError) throw txError;
        
      } else {
        const { data: newTx, error: txError } = await supabase
          .from('transactions')
          .insert([{
            group_id: groupId,
            payer_id: txData.payer_id,
            amount: txData.amount,
            description: txData.description,
            payment_date: txData.payment_date, 
            place: txData.place, 
            target_member_id: txData.target_member_id,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (txError) throw txError;
        transactionId = newTx.id;
      }

      refreshTransactions();
      setIsFormOpen(false);
    } catch (error) {
      console.error(t('failedSaveDebug'), error);
      alert(t('failedSaveAlert'));
    }
  };

  const handleDeleteTransaction = async (id: string | number) => {
    if (!groupId) return;
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      refreshTransactions();
    } catch (error) {
      console.error(t('failedDeleteDebug'), error);
      alert(t('failedDeleteAlert'));
    }
  };

  const handleCopyTransaction = (tx: TransactionWithTarget) => {
    setIsFormOpen(true);
    const copiedTx: TransactionWithTarget = { ...tx, id: '', target_member_id: tx.target_member_id };
    setTimeout(() => formRef.current?.startEdit(copiedTx), 50);
  };

  // メンバー更新・追加のハンドラ関数を作成
  const handleUpdateMemberName = async (name: string) => {
    if (!currentMember) return;
    const { error } = await supabase.from('members')
      .update({ name }).eq('id', currentMember.id);
    if (!error) {
      // 成功したら members リストを再取得
      await fetchGroupData(groupId!); 
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !groupId) return;
    await supabase.from('members').insert([{ name: newMemberName, group_id: groupId }]);
    setNewMemberName('');
    fetchGroupData(groupId);
  };

  const handleDeleteMember = async (id: string | number) => {
    await supabase.from('members').delete().eq('id', id);
    fetchGroupData(groupId!);
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
    const { data: targetData, error } = await supabase.from('transactions')
    .select('*')
    .eq('group_id', groupId)
    .order('payment_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
    if (error) {
        console.error("データ取得エラー:", error);
        return;
    }

    const extendedTx: TransactionWithTarget[] = txData.map(tx => {
      const match = targetData ? targetData.find(t => String(t.id) === String(tx.id)) : null;
      return { ...tx, target_member_id: match ? match.target_member_id : null };
    });
    setTransactions(extendedTx);
  };

  const fetchGroupData = async (gId: string) => {
    setLoading(true);
    setIsNotFound(false);
    try {
      const { data: gData, error } = await supabase.from('groups').select('is_premium, premium_payer_id').eq('id', gId).maybeSingle();
      // データがない、またはエラーの場合はエラー状態へ
      if (error || !gData) {
        setLoading(false);
        setIsNotFound(true);
        return;
      }
      if (gData) setGroupStatus(gData);
      
      const { data: mData } = await supabase.from('members')
      .select('*').eq('group_id', gId);

      const { data: tData } = await supabase.from('transactions')
      .select('*, target_member_id')
      .eq('group_id', gId)
      .order('created_at', { ascending: false });
      
      const latestMembers = (mData as Member[]) ?? []; // null なら空配列にする
      setMembers(latestMembers);
      setTransactions((tData as TransactionWithTarget[]) || []);
      if (currentMember) {
        const latestMember = latestMembers.find(m => m.id === currentMember.id);
        if (latestMember) {
          setCurrentMember(latestMember);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (): Promise<void> => {
    if (!groupId) return;

    try {
      // 1. 関連データの削除（依存関係を考慮して実行）
      await supabase.from('transactions').delete().eq('group_id', groupId);
      await supabase.from('members').delete().eq('group_id', groupId);
      await supabase.from('supporters').delete().eq('group_id', groupId);
      
      // 2. グループ自体の削除
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      
      if (error) {
        throw error;
      }

      // 3. 完了後にルートディレクトリへ強制リロード
      window.location.href = window.location.origin;
    } catch (error) {
      console.error('グループ削除に失敗しました:', error);
      alert('削除中にエラーが発生しました。');
    }
  };

  // if (loading) return <div>読み込み中...</div>;
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100dvh',
      backgroundColor: themeMode === 'dark' ? '#111827' : '#f9fafb'
    }}>
      <BeatLoader 
        color={themeMode === 'dark' ? '#d1d5db' : '#374151'} 
        size={12} 
        margin={6}
      />
    </div>
  );

  if (isNotFound) return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
      <h2 style={{ color: themeMode === 'dark' ? '#f9fafb' : '#111827' }}>{(t('notExistUrl'))}</h2>
      <p style={{ color: themeMode === 'dark' ? '#d1d5db' : '#374151', marginBottom: '30px' }}>
        {(t('notExistGroup'))}
      </p>
      <button 
        onClick={() => { setIsNotFound(false); setCurrentView('create-group'); }}
        style={{ 
          padding: '12px 24px', 
          borderRadius: '8px', 
          cursor: 'pointer',
          backgroundColor: '#10b981',
          color: '#fff',
          border: 'none',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto'
        }}
      >
        <img 
          src={linkIcon} 
          alt="link icon" 
          style={{ width: '20px', height: '20px', filter: 'invert(1)' }} 
        />
        {t('getNewUrl')}
      </button>
    </div>
  );

  return (
    <div className={themeMode}>
      {currentView === 'main' && (
        <HistoryView 
          themeMode={themeMode}
          locale={locale}
          currency={currency}
          groupId={groupId}
          members={members}
          currentMember={currentMember}
          transactions={transactions}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          groupStatus={groupStatus}
          plusColor={plusColor}
          minusColor={minusColor}
          menuRef={menuRef}
          formRef={formRef}
          onNavigate={setCurrentView}
          onSelectMember={setCurrentMember}
          onCopyTransaction={handleCopyTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onSaveTransaction={handleSaveTransaction}
          t={(key) => messages[locale][key]}
        />
      )}
      {currentView === 'settings' && (
        <SettingsView 
          themeMode={themeMode} 
          setThemeMode={setThemeMode} 
          currentMember={currentMember}
          members={members}
          groupStatus={groupStatus}
          supports={supports}
          locale={locale}
          currency={currency}
          plusColor={plusColor}
          minusColor={minusColor}
          newMemberName={newMemberName}
          setNewMemberName={setNewMemberName}
          onBack={() => setCurrentView('main')} 
          onUpdateName={handleUpdateMemberName}
          onAddMember={handleAddMember}
          onDeleteMember={handleDeleteMember}
          onPlusColorChange={(c) => {
            setPlusColor(c);
            setMinusColor(c === 'blue' ? 'red' : 'blue');
          }}
          onMinusColorChange={(c) => {
            setMinusColor(c);
            setPlusColor(c === 'blue' ? 'red' : 'blue');
          }}
          onLocaleChange={(newLocale) => setLocale(newLocale as Locale)}
          onCurrencyChange={setCurrency}
          onDeleteGroup={handleDeleteGroup}
          t={(key) => messages[locale][key]}
        />
      )}
      {currentView === 'support' && (
        <SupportView
          groupId={groupId || ''} 
          memberId={currentMember?.id?.toString() || ''}
          themeMode={themeMode} 
          currency={currency}
          onBack={() => setCurrentView('main')} 
          onSupport={async () => {}} 
          refreshSupports={async () => {
            if (groupId) await fetchSupports(groupId);
          }}
          setView={setCurrentView}
          t={(key) => messages[locale][key]}
        />
      )}
      {(currentView === 'create-group') && (
          <CreateGroup 
            locale={locale}
            t={(key) => messages[locale][key]}
          />
      )}
    </div>
  );
}