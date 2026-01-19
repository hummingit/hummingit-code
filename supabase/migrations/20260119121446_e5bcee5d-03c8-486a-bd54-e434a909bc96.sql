-- Create storage bucket for audio messages
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-messages', 'audio-messages', true);

-- Storage policies
CREATE POLICY "Users can upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-messages' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio-messages');