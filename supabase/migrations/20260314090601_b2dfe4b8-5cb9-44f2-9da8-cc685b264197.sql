
ALTER TABLE public.ghost_rooms ADD COLUMN IF NOT EXISTS channel_emoji TEXT DEFAULT '👻';

-- Enable realtime for read receipts
ALTER PUBLICATION supabase_realtime ADD TABLE public.ghost_read_receipts;

-- Allow members to delete their own membership (leave channel)
-- Already exists via "Users can leave rooms" policy

-- Add policy for members to view read receipts in their rooms
DROP POLICY IF EXISTS "Read receipts visible to self" ON public.ghost_read_receipts;
CREATE POLICY "Read receipts visible to room members"
  ON public.ghost_read_receipts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ghost_messages gm
      WHERE gm.id = ghost_read_receipts.message_id
      AND public.is_ghost_room_member(gm.room_id, auth.uid())
    )
  );
