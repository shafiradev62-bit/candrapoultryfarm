import { supabase } from "@/integrations/supabase/client";

const USER_ID = "default"; // You can change this to actual user ID later

export interface SyncData {
  dailyReports: any[];
  warehouseEntries: any[];
  salesEntries: any[];
  operationalEntries: any[];
  financeEntries: any[];
  feedFormulas: any[];
}

// Push data to Supabase
export async function pushToSupabase(dataType: string, data: any[]) {
  try {
    console.log(`📤 Pushing ${dataType} to Supabase...`);
    
    const { data: existing, error: fetchError } = await supabase
      .from('app_data')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('data_type', dataType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('app_data')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('app_data')
        .insert({ user_id: USER_ID, data_type: dataType, data });

      if (insertError) throw insertError;
    }

    console.log(`✅ ${dataType} pushed successfully`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error pushing ${dataType}:`, error);
    return { success: false, error };
  }
}

// Pull data from Supabase
export async function pullFromSupabase(dataType: string) {
  try {
    console.log(`📥 Pulling ${dataType} from Supabase...`);
    
    const { data, error } = await supabase
      .from('app_data')
      .select('data, updated_at')
      .eq('user_id', USER_ID)
      .eq('data_type', dataType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return { success: true, data: [], updated_at: null };
      }
      throw error;
    }

    console.log(`✅ ${dataType} pulled successfully`);
    return { success: true, data: data.data || [], updated_at: data.updated_at };
  } catch (error) {
    console.error(`❌ Error pulling ${dataType}:`, error);
    return { success: false, error, data: [] };
  }
}

// Push all data to Supabase
export async function pushAllToSupabase(syncData: SyncData) {
  const results = await Promise.all([
    pushToSupabase('daily_reports', syncData.dailyReports),
    pushToSupabase('warehouse', syncData.warehouseEntries),
    pushToSupabase('sales', syncData.salesEntries),
    pushToSupabase('operational', syncData.operationalEntries),
    pushToSupabase('finance', syncData.financeEntries),
    pushToSupabase('feed_formulas', syncData.feedFormulas),
  ]);

  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ All data synced to Supabase' : '⚠️ Some data failed to sync');
  
  return { success: allSuccess, results };
}

// Pull all data from Supabase
export async function pullAllFromSupabase(): Promise<SyncData | null> {
  try {
    const [dailyReports, warehouse, sales, operational, finance, feedFormulas] = await Promise.all([
      pullFromSupabase('daily_reports'),
      pullFromSupabase('warehouse'),
      pullFromSupabase('sales'),
      pullFromSupabase('operational'),
      pullFromSupabase('finance'),
      pullFromSupabase('feed_formulas'),
    ]);

    return {
      dailyReports: dailyReports.data || [],
      warehouseEntries: warehouse.data || [],
      salesEntries: sales.data || [],
      operationalEntries: operational.data || [],
      financeEntries: finance.data || [],
      feedFormulas: feedFormulas.data || [],
    };
  } catch (error) {
    console.error('❌ Error pulling all data:', error);
    return null;
  }
}

// Check if Supabase has newer data
export async function checkSupabaseUpdates(localTimestamp: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('updated_at')
      .eq('user_id', USER_ID)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return false;

    const supabaseTime = new Date(data.updated_at).getTime();
    const localTime = new Date(localTimestamp).getTime();

    return supabaseTime > localTime;
  } catch (error) {
    console.error('Error checking updates:', error);
    return false;
  }
}

// Log sync activity
export async function logSync(action: string, dataType: string, message: string) {
  try {
    await supabase
      .from('sync_log')
      .insert({
        user_id: USER_ID,
        action,
        data_type: dataType,
        message,
      });
  } catch (error) {
    console.error('Error logging sync:', error);
  }
}
