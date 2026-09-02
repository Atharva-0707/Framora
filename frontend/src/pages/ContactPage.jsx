import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Camera, Send, MapPin } from 'lucide-react';

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'atharva.sri2412@gmail.com',
    href: 'mailto:hello@framora.art',
    description: 'For general inquiries, creator features, and feedback.',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/framora',
    href: 'https://github.com',
    description: 'Report issues, view source, or contribute.',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'www.linkedin.com/in/atharva-srivastava-83073429a',
    href: 'https://linkedin.com',
    description: 'Connect professionally with the developer.',
  },
];

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  React.useEffect(() => {
    document.title = 'Contact — Framora';
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open mailto as a fallback
    const { name, email, message } = formData;
    const subject = encodeURIComponent(`Framora Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.open(`mailto:hello@framora.art?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Hero */}
      <section style={{
        padding: 'clamp(60px, 8vw, 88px) 24px 60px',
        maxWidth: '720px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(231, 184, 106, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          padding: '5px 14px', borderRadius: '20px', marginBottom: '20px',
        }}>
          <Camera size={12} color="var(--accent)" />
          <span className="eyebrow" style={{ fontSize: '11px' }}>Get in Touch</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 6vw, 52px)', fontWeight: '900',
          letterSpacing: '-0.04em', lineHeight: '1.1',
          color: 'var(--text-main)', marginBottom: '14px',
        }}>
          Say hello.
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7',
          maxWidth: '480px', margin: '0 auto',
        }}>
          Have feedback, a feature idea, or just want to connect? Reach out — responses are usually within 24 hours.
        </p>
      </section>

      {/* Contact Methods + Form */}
      <section style={{
        padding: '0 24px 80px',
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        alignItems: 'start',
      }}>

        {/* Left — contact methods */}
        <div>
          <h2 style={{
            fontSize: '15px', fontWeight: '700',
            color: 'var(--text-soft)', marginBottom: '24px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Direct Channels
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
            {CONTACT_METHODS.map(({ icon: Icon, label, value, href, description }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '18px 20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'border-color var(--ease-smooth), transform var(--ease-smooth)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-mid)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} color="var(--accent)" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>{value}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: '1.5' }}>{description}</p>
                </div>
              </a>
            ))}
          </div>

          <div style={{
            padding: '20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={14} color="var(--accent)" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-soft)' }}>Building from India 🇮🇳</p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '4px' }}>IST (UTC+5:30) — usually online afternoons and evenings</p>
          </div>
        </div>

        {/* Right — message form */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'var(--success-dim)',
                border: '1px solid rgba(93, 173, 121, 0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Send size={22} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                Message opened!
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                Your email client opened with the message pre-filled. Send it to reach us directly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn btn-secondary"
                style={{ marginTop: '20px' }}
              >
                Write another message
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                Send a message
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                Opens your email client with the message pre-filled.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="contact-name" className="input-label">Your Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Tyler Durden"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="input-label">Your Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="input-label">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field"
                    style={{ minHeight: '140px' }}
                    required
                  />
                </div>
                <button
                  id="contact-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px', fontSize: '14px' }}
                >
                  <Send size={15} />
                  Open in Email Client
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        textAlign: 'center',
        padding: '60px 24px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '16px' }}>
          Want to explore the platform first?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/about" className="btn btn-ghost" style={{ fontSize: '14px' }}>
            About Framora
          </Link>
          <Link to="/" className="btn btn-secondary" style={{ fontSize: '14px' }}>
            Browse Feed
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
