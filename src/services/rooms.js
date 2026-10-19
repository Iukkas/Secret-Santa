import { supabase } from "../lib/supabase";

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function generateToken() {
  return crypto.randomUUID();
}

export async function createRoom({ name, passwordHash }) {
  const roomCode = generateCode();

  const ownerToken = generateToken();

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        name,
        room_code: roomCode,
        password_hash: passwordHash,
        owner_token: ownerToken,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getRoomByCode(roomCode) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", roomCode)
    .single();

  if (error) throw error;

  return data;
}
