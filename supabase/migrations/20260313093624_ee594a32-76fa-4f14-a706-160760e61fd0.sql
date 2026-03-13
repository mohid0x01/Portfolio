
-- 1. SECURITY DEFINER helper to check room membership without recursion
CREATE OR REPLACE FUNCTION public.is_ghost_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ghost_members gm
    WHERE gm.room_id = _room_id
      AND gm.user_id = _user_id
  );
$$;

-- 2. Drop and recreate ghost_members SELECT policy (the recursive one)
DROP POLICY IF EXISTS "Members visible to room participants" ON public.ghost_members;
CREATE POLICY "Members visible to room participants"
ON public.ghost_members
FOR SELECT
TO authenticated
USING (
  public.is_ghost_room_member(room_id, auth.uid())
);

-- 3. Fix ghost_messages SELECT policy
DROP POLICY IF EXISTS "Messages visible to room members" ON public.ghost_messages;
CREATE POLICY "Messages visible to room members"
ON public.ghost_messages
FOR SELECT
TO authenticated
USING (
  public.is_ghost_room_member(room_id, auth.uid())
);

-- 4. Fix ghost_messages INSERT policy
DROP POLICY IF EXISTS "Room members can send messages" ON public.ghost_messages;
CREATE POLICY "Room members can send messages"
ON public.ghost_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_ghost_room_member(room_id, auth.uid())
);

-- 5. Fix ghost_typing SELECT policy
DROP POLICY IF EXISTS "Typing visible to room members" ON public.ghost_typing;
CREATE POLICY "Typing visible to room members"
ON public.ghost_typing
FOR SELECT
TO authenticated
USING (
  public.is_ghost_room_member(room_id, auth.uid())
);

-- 6. Ensure ghost_rooms is readable by all authenticated users (needed for joinRoom by invite_code)
DROP POLICY IF EXISTS "Rooms are viewable by members" ON public.ghost_rooms;
DROP POLICY IF EXISTS "Rooms are viewable by authenticated" ON public.ghost_rooms;
CREATE POLICY "Rooms are viewable by authenticated"
ON public.ghost_rooms
FOR SELECT
TO authenticated
USING (true);
