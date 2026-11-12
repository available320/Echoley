"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=Enter%20your%20email%20and%20password");
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 10) redirect("/login?error=Use%20a%20valid%20email%20and%20a%20password%20of%20at%20least%2010%20characters");
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  if (!data.session) redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account");
  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!email || !siteUrl) redirect("/login?error=Password%20reset%20is%20not%20configured");
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?next=/reset-password", siteUrl).toString(),
  });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/login?message=If%20an%20account%20exists%20for%20that%20email%2C%20a%20reset%20link%20has%20been%20sent");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmPassword") ?? "");
  if (password.length < 10 || password !== confirmation) {
    redirect("/reset-password?error=Passwords%20must%20match%20and%20contain%20at%20least%2010%20characters");
  }
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?error=Open%20the%20password%20reset%20link%20from%20your%20email");
  const { error } = await sb.auth.updateUser({ password });
  if (error) redirect("/reset-password?error=" + encodeURIComponent(error.message));
  redirect("/login?message=Password%20updated.%20You%20can%20now%20sign%20in");
}

export async function signOut() {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  redirect("/");
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) redirect("/dashboard?error=Enter%20a%20project%20name");
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await sb.from("projects").insert({ owner_id: user.id, name });
  if (error) redirect("/dashboard?error=" + encodeURIComponent(error.message));
  redirect("/dashboard?message=Project%20created");
}
