export interface Group {
  id: string; // UUID
  created_at: string;
}

export interface Member {
  id: number;
  group_id: string;
  name: string;
}

export interface Transaction {
  id: number;
  group_id: string;
  payment_date: string;
  payer_id: number;
  target_member_id?: number | null;
  amount: number;
  place?: string;
  description: string | null;
  created_at: string;
}

// 各メンバーの過不足金額を保持するマップ型（Key: member_id, Value: 金額）
export interface Balances {
  [memberId: number]: number;
}

export const tipOptions: Record<string, number[]> = {
  "JPY": [300, 500],
  "USD": [3, 5],
  "EUR": [3, 5],
};
