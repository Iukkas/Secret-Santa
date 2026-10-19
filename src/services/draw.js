import { supabase } from "../lib/supabase";

export async function saveDrawResults(roomId, results) {
  const records = results.map(({ giverId, receiverId }) => ({
    room_id: roomId,
    giver_id: giverId,
    receiver_id: receiverId,
  }));

  const { error } = await supabase.from("draws").insert(records);

  if (error) {
    console.error("Erro Supabase:", error);
    alert(error.message);
    return;
  }


  await supabase
    .from("rooms")
    .update({
      is_drawn: true,
    })
    .eq("id", roomId);
}

export async function getMySecretFriend(participantId) {
  const { data, error } = await supabase
    .from("draws")
    .select(
      `
      receiver_id,
      receiver:participants!draws_receiver_id_fkey(
        id,
        name
      )
    `,
    )
    .eq("giver_id", participantId)
    .single();

  if (error) {
    console.error(error);
    alert(error.message);
    return null;
  }

  return data;
}
