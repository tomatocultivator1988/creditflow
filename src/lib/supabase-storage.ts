import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_STORAGE_URL!;
const supabaseKey = process.env.SUPABASE_STORAGE_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseKey);

export function getProfilePicUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/profile-pics/${path}`;
}
