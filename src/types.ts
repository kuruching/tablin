export interface Member {
  id: string;
  name: string;
}

export interface Transaction {
  id: string | number;
  group_id: string;
  payer_id: string | number;
  amount: number;
  description: string;
  created_at: string;
  updated_at?: string;
}