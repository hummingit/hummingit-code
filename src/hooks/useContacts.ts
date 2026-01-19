import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  created_at: string;
  profile?: {
    name: string;
    uid: string;
    avatar_color: string;
  };
}

export const useContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for each contact
    const contactsWithProfiles = await Promise.all(
      (data || []).map(async (contact) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, uid, avatar_color')
          .eq('user_id', contact.contact_user_id)
          .maybeSingle();
        return { ...contact, profile: profile || undefined };
      })
    );

    setContacts(contactsWithProfiles);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (uid: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('uid', uid)
      .maybeSingle();

    if (profileError || !profileData) {
      return { error: 'User not found' };
    }

    if (profileData.user_id === user.id) {
      return { error: 'You cannot add yourself' };
    }

    const existingContact = contacts.find(c => c.contact_user_id === profileData.user_id);
    if (existingContact) {
      return { error: 'Contact already exists' };
    }

    const { error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, contact_user_id: profileData.user_id });

    if (error) {
      return { error: 'Failed to add contact' };
    }

    await fetchContacts();
    return { error: null };
  };

  const removeContact = async (contactId: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      return { error: 'Failed to remove contact' };
    }

    await fetchContacts();
    return { error: null };
  };

  return { contacts, loading, addContact, removeContact, refetch: fetchContacts };
};
