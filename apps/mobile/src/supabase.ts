import {createClient} from "@supabase/supabase-js";
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)console.warn("Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the Expo environment.");
export const supabase=createClient(url??"https://invalid.supabase.co",key??"missing-publishable-key");
