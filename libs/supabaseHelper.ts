// libs/supabaseHelper.ts
import { supabase } from '@/libs/supabase';

export type PinRow = {
  month: string;
  clicks: number;
  acceptances: number;
  completions: number;
};

export async function getPinDashboardData(): Promise<PinRow[]> {
  const { data, error } = await supabase
    .from('pindashboard') // <— matches your new table name exactly
    .select('month, clicks, acceptances, completions');

  if (error) {
    console.log('Supabase error:', error);
    return [];
  }

  // sort months Jan→Dec (since `month` is stored as text)
  const rows = (data ?? []) as PinRow[];
  const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  rows.sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));

  return rows;
}
