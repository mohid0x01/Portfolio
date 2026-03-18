import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { encryptMessage, decryptMessage, isEncrypted } from "@/lib/ghostCrypto";

export function useGhostAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
}

export type GhostMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  is_deleted: boolean;
  self_destruct_at: string | null;
  reply_to: string | null;
  reactions: Record<string, string[]>;
  created_at: string;
  sender_codename?: string;
  sender_color?: string;
  read_by?: string[]; // user_ids who have read this message
};

export type GhostMember = {
  id: string;
  room_id: string;
  user_id: string;
  codename: string;
  avatar_color: string;
  role: string;
  is_online: boolean;
  last_seen: string | null;
};

export type GhostRoom = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  channel_emoji?: string | null;
};

export function useGhostChat(roomId: string | null, userId: string | null, inviteCode?: string | null) {
  const [messages, setMessages] = useState<GhostMessage[]>([]);
  const [members, setMembers] = useState<GhostMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [readReceipts, setReadReceipts] = useState<Record<string, string[]>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchReadReceipts = useCallback(async () => {
    if (!roomId) return;
    // Get all read receipts for messages in this room
    const { data: roomMessages } = await supabase
      .from("ghost_messages")
      .select("id")
      .eq("room_id", roomId)
      .limit(200);

    if (!roomMessages || roomMessages.length === 0) return;

    const messageIds = roomMessages.map(m => m.id);
    const { data: receipts } = await supabase
      .from("ghost_read_receipts")
      .select("message_id, user_id")
      .in("message_id", messageIds);

    if (receipts) {
      const map: Record<string, string[]> = {};
      receipts.forEach(r => {
        if (!map[r.message_id]) map[r.message_id] = [];
        if (!map[r.message_id].includes(r.user_id)) {
          map[r.message_id].push(r.user_id);
        }
      });
      setReadReceipts(map);
    }
  }, [roomId]);

  const readReceiptsRef = useRef<Record<string, string[]>>({});
  readReceiptsRef.current = readReceipts;

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    const { data } = await supabase
      .from("ghost_messages")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) {
      const { data: membersData } = await supabase
        .from("ghost_members")
        .select("user_id, codename, avatar_color")
        .eq("room_id", roomId);

      const memberMap = new Map(
        (membersData || []).map((m) => [m.user_id, m])
      );

      const currentReceipts = readReceiptsRef.current;
      const decrypted = await Promise.all(
        data.map(async (msg) => {
          let displayContent = msg.content;
          const encrypted = msg.encrypted_content || (msg.content && inviteCode && isEncrypted(msg.content) ? msg.content : null);
          if (encrypted && inviteCode && msg.message_type === "text") {
            const plain = await decryptMessage(encrypted, inviteCode);
            if (plain !== null) displayContent = plain;
          }
          return {
            ...msg,
            content: displayContent,
            reactions: (msg.reactions as Record<string, string[]>) || {},
            sender_codename: memberMap.get(msg.sender_id)?.codename || "GHOST",
            sender_color: memberMap.get(msg.sender_id)?.avatar_color || "#6610F2",
            read_by: currentReceipts[msg.id] || [],
          };
        })
      );

      setMessages(decrypted);
    }
  }, [roomId, inviteCode]);

  const fetchMembers = useCallback(async () => {
    if (!roomId) return;
    const { data } = await supabase
      .from("ghost_members")
      .select("*")
      .eq("room_id", roomId);
    if (data) setMembers(data);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    setLoading(true);
    Promise.all([fetchMessages(), fetchMembers(), fetchReadReceipts()]).then(() => setLoading(false));

    const msgChannel = supabase
      .channel(`ghost_messages_${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ghost_messages", filter: `room_id=eq.${roomId}` },
        () => fetchMessages()
      )
      .subscribe();

    const memberChannel = supabase
      .channel(`ghost_members_${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ghost_members", filter: `room_id=eq.${roomId}` },
        () => fetchMembers()
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`ghost_typing_${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ghost_typing", filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from("ghost_typing")
            .select("user_id, is_typing")
            .eq("room_id", roomId)
            .eq("is_typing", true);
          if (data) {
            const { data: memberData } = await supabase
              .from("ghost_members")
              .select("user_id, codename")
              .eq("room_id", roomId)
              .in("user_id", data.map((t) => t.user_id));
            setTypingUsers(
              (memberData || [])
                .filter((m) => m.user_id !== userId)
                .map((m) => m.codename)
            );
          }
        }
      )
      .subscribe();

    const receiptChannel = supabase
      .channel(`ghost_receipts_${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ghost_read_receipts" },
        () => fetchReadReceipts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(memberChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(receiptChannel);
    };
  }, [roomId, userId, fetchMessages, fetchMembers, fetchReadReceipts]);

  const sendMessage = async (
    content: string,
    opts?: { selfDestruct?: number; replyTo?: string }
  ) => {
    if (!roomId || !userId || !content.trim()) return;
    const self_destruct_at = opts?.selfDestruct
      ? new Date(Date.now() + opts.selfDestruct * 1000).toISOString()
      : null;

    let storedContent = content.trim();
    let encryptedContent: string | null = null;
    if (inviteCode) {
      encryptedContent = await encryptMessage(content.trim(), inviteCode);
      storedContent = "[E2E ENCRYPTED]";
    }

    await supabase.from("ghost_messages").insert({
      room_id: roomId,
      sender_id: userId,
      content: storedContent,
      encrypted_content: encryptedContent,
      message_type: "text",
      self_destruct_at,
      reply_to: opts?.replyTo || null,
    });
    await setTyping(false);
  };

  const sendFile = async (file: File) => {
    if (!roomId || !userId) return;
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { data: uploadData, error } = await supabase.storage
      .from("ghost-chat-files")
      .upload(path, file);
    if (error || !uploadData) return;
    const { data: urlData } = supabase.storage
      .from("ghost-chat-files")
      .getPublicUrl(uploadData.path);

    const isImage = file.type.startsWith("image/");
    await supabase.from("ghost_messages").insert({
      room_id: roomId,
      sender_id: userId,
      content: file.name,
      message_type: isImage ? "image" : "file",
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });
  };

  const deleteMessage = async (messageId: string) => {
    await supabase
      .from("ghost_messages")
      .update({ is_deleted: true })
      .eq("id", messageId);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!userId) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const reactions = { ...msg.reactions };
    if (!reactions[emoji]) reactions[emoji] = [];
    if (reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter((id) => id !== userId);
      if (!reactions[emoji].length) delete reactions[emoji];
    } else {
      reactions[emoji].push(userId);
    }
    await supabase
      .from("ghost_messages")
      .update({ reactions })
      .eq("id", messageId);
  };

  const setTyping = async (isTyping: boolean) => {
    if (!roomId || !userId) return;
    await supabase.from("ghost_typing").upsert(
      { room_id: roomId, user_id: userId, is_typing: isTyping },
      { onConflict: "room_id,user_id" }
    );
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
    }
  };

  const markOnline = async (online: boolean) => {
    if (!roomId || !userId) return;
    await supabase
      .from("ghost_members")
      .update({ is_online: online, last_seen: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", userId);
  };

  const markAsRead = async (messageId: string) => {
    if (!userId) return;
    // Don't re-insert if already read
    if (readReceipts[messageId]?.includes(userId)) return;
    await supabase.from("ghost_read_receipts").insert({
      message_id: messageId,
      user_id: userId,
    });
  };

  const markAllAsRead = async () => {
    if (!userId || messages.length === 0) return;
    const unreadMessages = messages.filter(
      m => !m.is_deleted && m.sender_id !== userId && !readReceipts[m.id]?.includes(userId)
    );
    if (unreadMessages.length === 0) return;
    
    const inserts = unreadMessages.map(m => ({
      message_id: m.id,
      user_id: userId,
    }));
    await supabase.from("ghost_read_receipts").insert(inserts);
  };

  return {
    messages,
    members,
    typingUsers,
    loading,
    readReceipts,
    sendMessage,
    sendFile,
    deleteMessage,
    addReaction,
    setTyping,
    markOnline,
    markAsRead,
    markAllAsRead,
    refetch: fetchMessages,
  };
}

export function useGhostRooms(userId: string | null) {
  const [rooms, setRooms] = useState<GhostRoom[]>([]);
  const [myMemberships, setMyMemberships] = useState<Record<string, GhostMember>>({});

  const fetchRooms = useCallback(async () => {
    if (!userId) return;
    const { data: memberships } = await supabase
      .from("ghost_members")
      .select("*, ghost_rooms(*)")
      .eq("user_id", userId);

    if (memberships) {
      const map: Record<string, GhostMember> = {};
      const roomList: GhostRoom[] = [];
      memberships.forEach((m: any) => {
        if (m.ghost_rooms) {
          roomList.push(m.ghost_rooms);
          map[m.room_id] = m;
        }
      });
      setRooms(roomList);
      setMyMemberships(map);
    }
  }, [userId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (name: string, description: string, codename: string) => {
    if (!userId) return null;
    const { data: room, error } = await supabase
      .from("ghost_rooms")
      .insert({ name, description, created_by: userId })
      .select()
      .single();
    if (error || !room) return null;

    await supabase.from("ghost_members").insert({
      room_id: room.id,
      user_id: userId,
      codename,
      role: "commander",
      avatar_color: "#6610F2",
    });
    await supabase.from("ghost_messages").insert({
      room_id: room.id,
      sender_id: userId,
      content: `CHANNEL ESTABLISHED — ${name} is now LIVE. Welcome, ${codename}.`,
      message_type: "system",
    });
    await fetchRooms();
    return room;
  };

  const joinRoom = async (inviteCode: string, codename: string) => {
    if (!userId) return null;
    let { data: room } = await supabase
      .from("ghost_rooms")
      .select("*")
      .ilike("invite_code", inviteCode.trim())
      .eq("is_active", true)
      .single();
    if (!room) return null;

    const { data: existing } = await supabase
      .from("ghost_members")
      .select("id")
      .eq("room_id", room.id)
      .eq("user_id", userId)
      .single();
    if (existing) return room;

    const colors = ["#6610F2", "#20C997", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    await supabase.from("ghost_members").insert({
      room_id: room.id,
      user_id: userId,
      codename,
      role: "agent",
      avatar_color: color,
    });
    await supabase.from("ghost_messages").insert({
      room_id: room.id,
      sender_id: userId,
      content: `AGENT ${codename} HAS JOINED THE CHANNEL.`,
      message_type: "system",
    });
    await fetchRooms();
    return room;
  };

  const leaveRoom = async (roomId: string) => {
    if (!userId) return;
    // Send leave message first
    const member = myMemberships[roomId];
    if (member) {
      await supabase.from("ghost_messages").insert({
        room_id: roomId,
        sender_id: userId,
        content: `AGENT ${member.codename} HAS LEFT THE CHANNEL.`,
        message_type: "system",
      });
    }
    await supabase
      .from("ghost_members")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);
    await fetchRooms();
  };

  const updateRoomEmoji = async (roomId: string, emoji: string) => {
    await supabase
      .from("ghost_rooms")
      .update({ channel_emoji: emoji } as any)
      .eq("id", roomId);
    await fetchRooms();
  };

  return { rooms, myMemberships, fetchRooms, createRoom, joinRoom, leaveRoom, updateRoomEmoji };
}
