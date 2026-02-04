-- Add UPDATE policy for conversations table
CREATE POLICY "Users can update own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);