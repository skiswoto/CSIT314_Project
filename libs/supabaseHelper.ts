// libs/supabaseHelper.ts
import { supabase } from '@/libs/supabase';

export type PinRow = {
  month: string;
  clicks: number;
  acceptances: number;
  completions: number;
};

/**
 * Fetch dashboard data for ONE specific PIN user only.
 * profileId = Profiles.id
 */
export async function getPinDashboardData(profileId: string): Promise<PinRow[]> {
  if (!profileId) return [];

  const { data, error } = await supabase
    .from('pindashboard')
    .select('month, clicks, acceptances, completions')
    .eq('profile_id', profileId);     // ✅ REQUIRED FILTER

  if (error) {
    console.log('Supabase error:', error);
    return [];
  }

  const rows = (data ?? []) as PinRow[];

  // Sort by Jan → Dec
  const MONTH_ORDER = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  rows.sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));

  return rows;
}
