import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, UserPlus, LogOut, Menu, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContacts } from '@/hooks/useContacts';
import { useMessages } from '@/hooks/useMessages';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { ContactItem } from '@/components/ContactItem';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioMessage } from '@/components/AudioMessage';
import { LogoutDialog } from '@/components/LogoutDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Chat = () => {
  const { user, profile, signOut } = useAuth();
  const { contacts, addContact, removeContact, loading: contactsLoading } = useContacts();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [newContactUid, setNewContactUid] = useState('');
  const [addContactOpen, setAddContactOpen] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContactData = contacts.find(c => c.contact_user_id === selectedContact);
  const { messages, loading: messagesLoading } = useMessages(selectedContact);
  const { remaining, incrementCount, canSend } = useDailyLimit();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddContact = async () => {
    if (!newContactUid.trim()) return;
    const { error } = await addContact(newContactUid.trim());
    if (error) {
      toast.error(error);
    } else {
      toast.success('Contact added!');
      setNewContactUid('');
      setAddContactOpen(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    if (!user || !selectedContact || !canSend) return;

    const success = await incrementCount();
    if (!success) {
      toast.error('Daily limit reached');
      return;
    }

    const fileName = `${user.id}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('audio-messages')
      .upload(fileName, audioBlob);

    if (uploadError) {
      toast.error('Failed to upload audio');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio-messages')
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedContact,
        audio_url: publicUrl,
        duration_seconds: duration,
      });

    if (insertError) {
      toast.error('Failed to send message');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !profile) return null;

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border bg-card flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} color={profile.avatar_color} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{profile.name}</p>
              <p className="text-xs text-muted-foreground">UID: {profile.uid}</p>
            </div>
          </div>
        </div>

        <div className="p-3 flex gap-2">
          <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                <UserPlus className="w-4 h-4 mr-2" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input value={newContactUid} onChange={(e) => setNewContactUid(e.target.value)} placeholder="Enter user UID" className="input-warm" />
                <Button onClick={handleAddContact} className="w-full btn-honey">Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="relative group">
              <ContactItem
                name={contact.profile?.name || 'Unknown'}
                avatarColor={contact.profile?.avatar_color || '#888'}
                uid={contact.profile?.uid || ''}
                isActive={selectedContact === contact.contact_user_id}
                onClick={() => setSelectedContact(contact.contact_user_id)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeContact(contact.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="flex-1">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="ghost" onClick={() => setShowLogout(true)} className="text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          {!showSidebar && (
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {selectedContactData?.profile ? (
            <>
              <Avatar name={selectedContactData.profile.name} color={selectedContactData.profile.avatar_color} />
              <span className="font-semibold">{selectedContactData.profile.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select a contact to start messaging</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <AudioMessage
              key={msg.id}
              audioUrl={msg.audio_url}
              duration={msg.duration_seconds}
              createdAt={msg.created_at}
              isSent={msg.sender_id === user.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <AudioRecorder
            onSend={handleSendAudio}
            disabled={!selectedContact}
            remainingMessages={remaining}
          />
        </div>
      </div>

      <LogoutDialog open={showLogout} onOpenChange={setShowLogout} onConfirm={handleLogout} />
    </div>
  );
};

export default Chat;
