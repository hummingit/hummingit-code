import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DAILY_LIMIT = 5;

export const useDailyLimit = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchCount = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_message_counts')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily count:', error);
    }
    setCount(data?.count || 0);
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const incrementCount = async () => {
    if (!user) return false;

    const { data: existing } = await supabase
      .from('daily_message_counts')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      if (existing.count >= DAILY_LIMIT) return false;

      const { error } = await supabase
        .from('daily_message_counts')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id);

      if (!error) {
        setCount(existing.count + 1);
        return true;
      }
    } else {
      const { error } = await supabase
        .from('daily_message_counts')
        .insert({ user_id: user.id, date: today, count: 1 });

      if (!error) {
        setCount(1);
        return true;
      }
    }
    return false;
  };

  return {
    count,
    remaining: DAILY_LIMIT - count,
    loading,
    canSend: count < DAILY_LIMIT,
    incrementCount,
  };
};
