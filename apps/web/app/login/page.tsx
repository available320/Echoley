import Link from "next/link";
import { signIn, signUp, requestPasswordReset } from "@/app/auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const p = await searchParams;
  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/">echo<span>ley</span>™</Link><Link className="navlinks" href="/">Back to home</Link></nav>
    <section className="form panel">
      <div className="eyebrow">Welcome to the studio</div>
      <h1 style={{fontFamily:"Space Grotesk",fontSize:34}}>Sign in or create an account</h1>
      <p className="muted">Your projects and clips stay connected across your devices.</p>
      {p.error && <div className="notice" role="alert">{p.error}</div>}
      {p.message && <div className="notice" role="status">{p.message}</div>}
      <form action={signIn}>
        <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="button" style={{width:"100%"}}>Sign in</button>
      </form>
      <div style={{height:1,background:"var(--line)",margin:"24px 0"}} />
      <form action={requestPasswordReset}>
        <div className="field"><label htmlFor="reset-email">Forgot your password? Enter your email</label><input id="reset-email" name="email" type="email" autoComplete="email" required /></div>
        <button className="button secondary" style={{width:"100%"}}>Send password reset link</button>
      </form>
      <div style={{height:1,background:"var(--line)",margin:"24px 0"}} />
      <form action={signUp}>
        <div className="field"><label htmlFor="new-email">Create account — email</label><input id="new-email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="new-password">Create password (10+ characters)</label><input id="new-password" name="password" type="password" minLength={10} autoComplete="new-password" required /></div>
        <button className="button secondary" style={{width:"100%"}}>Create account</button>
      </form>
      <p className="muted" style={{fontSize:12}}>Account confirmation and password reset email delivery depend on the connected Supabase project configuration.</p>
    </section>
  </main>;
}
