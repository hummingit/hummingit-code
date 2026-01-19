import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!profile || !name.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', profile.id);
    setLoading(false);
    if (error) {
      toast.error('Failed to update name');
    } else {
      toast.success('Name updated!');
      await refreshProfile();
    }
  };

  const handleRegenerateUID = async () => {
    if (!profile) return;
    const newUid = Math.random().toString(36).substring(2, 10);
    const { error } = await supabase
      .from('profiles')
      .update({ uid: newUid })
      .eq('id', profile.id);
    if (error) {
      toast.error('Failed to regenerate UID');
    } else {
      toast.success('UID regenerated!');
      await refreshProfile();
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} color={profile.avatar_color} size="lg" />
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-muted-foreground">UID: {profile.uid}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="input-warm" />
              <Button onClick={handleUpdateName} disabled={loading} className="btn-honey">Save</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your UID</Label>
            <div className="flex gap-2">
              <Input value={profile.uid} readOnly className="input-warm" />
              <Button onClick={handleRegenerateUID} variant="outline" className="rounded-xl">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Share this UID with others so they can add you</p>
          </div>

          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Button onClick={toggleTheme} variant="outline" className="rounded-xl">
              {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
              {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
