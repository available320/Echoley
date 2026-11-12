"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  ["↗", "Viral moment scoring", "Find standout moments, rank suggestions and review why each clip was selected."],
  ["◎", "Speaker-tracking reframe", "Prepare 9:16, 1:1 and 16:9 compositions for different platforms."],
  ["≋", "Word-by-word captions", "Style and refine captions so every clip is clear, readable and on-brand."],
  ["▣", "One-click templates", "Start with creator-inspired layouts, split screens, zooms and progress bars."],
  ["⌗", "Timeline editor", "Planned editing tools for trimming, splitting, captions, music and overlays."],
  ["⇩", "Media library and export", "Planned asset organisation and downloadable clip exports."]
];

const templates = [
  ["Gameplay Split", "gameplay"], ["Satisfying Split", "satisfying"],
  ["Podcast Clean", "podcast"], ["Punch-In Pro", "punch"], ["Emoji Vibes", "emoji"],
  ["Footage First", "footage"], ["Story Card", "story"], ["Square Clean", "square"]
];

const faqs = [
  ["What can I paste into Echoley?", "You can upload a video file. Link-based imports will be enabled only for sources and workflows that are supported and authorized."],
  ["How are minutes counted?", "The planned pricing model counts one credit per minute of source video, rounded up. Billing and usage enforcement are not active yet."],
  ["Can I edit clips before exporting?", "The full timeline editor is still being built. The current workspace is an early project and clip-processing foundation."],
  ["What export quality will I get?", "The planned tiers show 720p on Free and 1080p on paid plans. Actual export availability depends on the completed processing pipeline."],
  ["Can I cancel or change plans?", "Subscriptions and the billing portal are not active yet. We will enable plan management after payment integration is tested."]
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <main className="landing">
      <header className="landing-nav">
        <Link className="landing-brand" href="/"><span className="brand-mark">✦</span> Echoley<span className="tm">™</span></Link>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#how">How it works</a><a href="#features">Features</a><a href="#templates">Templates</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
        </nav>
        <Link className="lime-button nav-cta" href="/login">Start free</Link>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="outline-pill">AI clipping for creators</span>
          <h1>Turn long videos<br/>into <em>clips people<br/>can’t scroll past.</em></h1>
          <p>Upload a video to your creator workspace. Echoley’s processing foundation is in place; AI highlights, editing and exports are being brought online.</p>
          <Link className="lime-button hero-start" href="/login">Open your creator workspace</Link>
          <small className="hero-note">Create an account, start a project and upload a source video. Automated processing is not active yet.</small>
        </div>
        <div className="phone-wrap" aria-label="Preview of a vertical video clip">
          <div className="phone-status"><i/> your video · 00:12 / 01:37</div>
          <div className="phone-screen">
            <div className="avatar-head"/><div className="avatar-body"/><strong>THIS</strong>
          </div>
          <div className="phone-controls"><span/><span/></div><div className="phone-progress"/>
        </div>
      </section>

      <section id="how" className="landing-section">
        <div className="section-kicker">How it works</div><h2>From link to finished clip in three steps</h2>
        <div className="steps-grid">
          <article className="dark-card"><b className="step-number">1</b><h3>Create a project and upload</h3><p>Start a project in your workspace and upload the original video file securely.</p></article>
          <article className="dark-card"><b className="step-number">2</b><h3>AI finds the best moments</h3><p>Once the background worker is deployed and configured, transcription and highlight analysis will surface moments to review.</p></article>
          <article className="dark-card"><b className="step-number">3</b><h3>Review and export</h3><p>Review suggested clips now; the full editing timeline and reliable exports are still in development.</p></article>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="section-kicker">Features</div><h2>Everything between long-form and viral</h2>
        <div className="feature-grid">{features.map(([icon,title,desc]) => <article className="dark-card feature-card" key={title}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>

      <section id="templates" className="landing-section">
        <div className="section-kicker">Templates</div><h2>Start from a look that already works</h2>
        <p className="section-intro">Planned creator-style starting points for layouts, captions, zooms and visual rhythm.</p>
        <div className="template-grid">{templates.map(([name,kind]) => <div className="template-item" key={name}><div className={"template-preview " + kind}><span/><i/><b/></div><span>{name}</span></div>)}</div>
      </section>

      <section className="landing-section testimonials">
        <div className="section-kicker">Creator stories</div><h2>Creators ship more, edit less</h2>
        <div className="steps-grid"><article className="dark-card quote-card"><p>Creator stories will appear here as soon as verified beta feedback is available.</p><small>Early access · Coming soon</small></article><article className="dark-card quote-card"><p>We’re building with creators and will publish real results, not made-up testimonials.</p><small>Product update · Coming soon</small></article><article className="dark-card quote-card"><p>Be among the first to try the studio and help shape the editing workflow.</p><small>Join the early-access list</small></article></div>
      </section>

      <section id="pricing" className="landing-section">
        <div className="section-kicker">Pricing</div><h2>Pay for minutes, not seats</h2>
        <p className="section-intro">Planned pricing preview. Checkout, subscriptions and usage metering are not enabled yet.</p>
        <div className="pricing-grid">
          <article className="dark-card price-card"><h3>Free</h3><div className="price">$0<span>/mo</span></div><ul><li>30 processing minutes / month</li><li>Videos up to 30 minutes</li><li>720p export target</li><li>Templates and caption styles</li></ul><Link className="outline-button" href="/login">Get started</Link></article>
          <article className="dark-card price-card featured-price"><h3>Pro</h3><div className="price">$19<span>/mo</span></div><ul><li>300 processing minutes / month</li><li>Videos up to 2 hours</li><li>1080p export target</li><li>Templates and caption styles</li></ul><span className="lime-button disabled-button">Planned plan</span></article>
          <article className="dark-card price-card"><h3>Business</h3><div className="price">$59<span>/mo</span></div><ul><li>1,500 processing minutes / month</li><li>Videos up to 4 hours</li><li>1080p export target</li><li>Templates and caption styles</li></ul><span className="outline-button disabled-button">Planned plan</span></article>
        </div>
      </section>

      <section id="faq" className="landing-section faq-section">
        <div className="section-kicker">FAQ</div><h2>Questions, answered</h2>
        <div className="faq-list">{faqs.map(([question,answer],i) => <div className="faq-item" key={question}><button aria-expanded={openFaq===i} onClick={() => setOpenFaq(openFaq===i?null:i)}><span>{question}</span><b>{openFaq===i?"−":"+"}</b></button>{openFaq===i && <p>{answer}</p>}</div>)}</div>
      </section>

      <footer className="landing-footer"><Link className="landing-brand" href="/"><span className="brand-mark">✦</span> Echoley<span className="tm">™</span></Link><span>© {new Date().getFullYear()} Echoley™ · Made for creators</span><div><Link href="/login">Sign in</Link><a href="#faq">Help</a></div></footer>
    </main>
  );
}
