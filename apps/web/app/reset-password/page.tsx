import Link from "next/link";
import { updatePassword } from "@/app/auth/actions";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/">echo<span>ley</span>™</Link></nav>
    <section className="form panel">
      <div className="eyebrow">Account recovery</div>
      <h1 style={{fontFamily:"Space Grotesk",fontSize:34}}>Choose a new password</h1>
      <p className="muted">Use at least 10 characters. You must open this page from your password-reset email.</p>
      {params.error && <div className="notice" role="alert">{params.error}</div>}
      <form action={updatePassword}>
        <div className="field"><label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required /></div>
        <div className="field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" minLength={10} autoComplete="new-password" required /></div>
        <button className="button" style={{width:"100%"}}>Update password</button>
      </form>
    </section>
  </main>;
}
