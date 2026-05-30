import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import type { Member, Transaction, Balances } from '../types/index';

export function useTsukekomi(groupId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myMemberId, setMyMemberId] = useState<number | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const savedMyId = localStorage.getItem(`my_id_${groupId}`);
    if (savedMyId) setMyMemberId(Number(savedMyId));

    fetchData();

    // リアルタイム同期の購読
    const channel = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `group_id=eq.${groupId}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `group_id=eq.${groupId}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const fetchData = async () => {
    const { data: mData } = await supabase.from('members').select('*').eq('group_id', groupId);
    const { data: tData } = await supabase.from('transactions').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    
    if (mData) setMembers(mData as Member[]);
    if (tData) setTransactions(tData as Transaction[]);
  };

  const selectMe = (id: number | null) => {
    setMyMemberId(id);
    if (id === null) {
      localStorage.removeItem(`my_id_${groupId}`);
    } else {
      localStorage.setItem(`my_id_${groupId}`, String(id));
    }
  };

  // 全員の過不足金額（バランス）を計算
  const balances = useMemo<Balances>(() => {
    if (members.length === 0) return {};
    const currentBalances: Balances = {};
    members.forEach(m => { currentBalances[m.id] = 0; });

    let totalAmount = 0;
    transactions.forEach(t => {
      currentBalances[t.payer_id] += Number(t.amount);
      totalAmount += Number(t.amount);
    });

    const perPersonCost = totalAmount / members.length;
    members.forEach(m => {
      currentBalances[m.id] = currentBalances[m.id] - perPersonCost;
    });

    return currentBalances;
  }, [members, transactions]);

  const myBalance = myMemberId !== null ? (balances[myMemberId] || 0) : null;

  const addTransaction = async (payerId: number, amount: number, description: string) => {
    return await supabase.from('transactions').insert({
      group_id: groupId,
      payer_id: payerId,
      amount: amount,
      description: description || null
    });
  };

  return {
    members,
    transactions,
    myMemberId,
    balances,
    myBalance,
    selectMe,
    addTransaction,
    refresh: fetchData
  };
}