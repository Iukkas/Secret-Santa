import { supabase } from "../lib/supabase";

function generateToken() {
  return crypto.randomUUID();
}

export async function addParticipant(roomId, name) {
  const inviteToken = generateToken();

  const { data, error } = await supabase
    .from("participants")
    .insert([
      {
        room_id: roomId,
        name,
        invite_token: inviteToken,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getParticipants(roomId) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at");

  if (error) throw error;

  return data;
}

export async function removeParticipant(participantId) {
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) throw error;
}
