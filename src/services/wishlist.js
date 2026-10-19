import { supabase } from "../lib/supabase";

export async function addWishlistItem(participantId, item) {
  const { data, error } = await supabase
    .from("wishlists")
    .insert([
      {
        participant_id: participantId,
        item,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWishlist(participantId) {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("participant_id", participantId);

  if (error) throw error;

  return data;
}

export async function removeWishlistItem(itemId) {
  const { error } = await supabase.from("wishlists").delete().eq("id", itemId);

  if (error) throw error;
}
