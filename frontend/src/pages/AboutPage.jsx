import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Image, Users, Bookmark, Upload, Code, Database, Zap, Shield } from 'lucide-react';

const FEATURES = [
  { icon: Image, label: 'Photograph Journals', description: 'Share the full story — the image, the gear, the settings, the moment.' },
  { icon: Users, label: 'Photographer Community', description: 'Follow creators you admire and build an audience around your craft.' },
  { icon: Bookmark, label: 'Curated Collections', description: 'Bookmark shots that inspire you. Build your visual library.' },
  { icon: Upload, label: 'EXIF + Gear Metadata', description: 'Attach your camera, lens, aperture and shutter speed to every post.' },
];

const TECH_STACK = [
  { name: 'React 18', category: 'Frontend', color: '#61DAFB' },
  { name: 'Vite', category: 'Build Tool', color: '#B875FC' },
  { name: 'Node.js', category: 'Runtime', color: '#68A063' },
  { name: 'Express', category: 'API Framework', color: '#8A8480' },
  { name: 'MongoDB', category: 'Database', color: '#4DB33D' },
  { name: 'Cloudinary', category: 'Media Storage', color: '#3448C5' },
  { name: 'Mongoose', category: 'ODM', color: '#800000' },
  { name: 'JWT', category: 'Auth', color: '#E7B86A' },
  { name: 'Axios', category: 'HTTP Client', color: '#5A29E4' },
  { name: 'Lucide React', category: 'Icons', color: '#F88C49' },
];

const PRINCIPLES = [
  { icon: Camera, label: 'Craft First', description: 'Framora treats photography as an art form, not a scroll-through experience.' },
  { icon: Code, label: 'Built with MERN stack', description: 'A production-style photography community platform designed for creators.' },
  { icon: Shield, label: 'Privacy Aware', description: 'Your data is yours. JWT auth with no third-party tracking.' },
  { icon: Zap, label: 'Fast by Default', description: 'Optimistic UI, skeleton loaders, and lazy loading throughout.' },
];

export const AboutPage = () => {
  React.useEffect(() => {
    document.title = 'About — Framora';
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Hero Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px 80px',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(231, 184, 106, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            padding: '5px 14px', borderRadius: '20px', marginBottom: '24px',
          }}>
            <Camera size={13} color="var(--accent)" />
            <span className="eyebrow" style={{ fontSize: '11px' }}>About Framora</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 64px)', fontWeight: '900',
            letterSpacing: '-0.04em', lineHeight: '1.1',
            color: 'var(--text-main)', marginBottom: '20px',
          }}>
            Every frame<br />
            <span style={{ color: 'var(--accent)' }}>has a story.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)',
            lineHeight: '1.7', maxWidth: '560px', margin: '0 auto 36px',
          }}>
            Framora is a photography community platform where photographers share not just beautiful images, but the craft, gear, settings, and stories that made them possible.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: '14px' }}>
              Browse the Feed
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '11px 24px', fontSize: '14px' }}>
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* What is Framora */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="eyebrow" style={{ marginBottom: '10px' }}>The Platform</p>
          <h2 className="section-heading">Built for photographers who care about craft</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {FEATURES.map(({ icon: Icon, label, description }) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 24px',
              transition: 'border-color var(--ease-smooth), transform var(--ease-smooth)',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-mid)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={20} color="var(--accent)" strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                {label}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Design Principles */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p className="eyebrow" style={{ marginBottom: '10px' }}>Principles</p>
            <h2 className="section-heading">How we think about the product</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
          }}>
            {PRINCIPLES.map(({ icon: Icon, label, description }) => (
              <div key={label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color="var(--accent)" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                    {label}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p className="eyebrow" style={{ marginBottom: '10px' }}>Technology</p>
          <h2 className="section-heading">The stack behind Framora</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '10px', maxWidth: '440px', margin: '10px auto 0' }}>
            A full MERN stack application with Cloudinary media storage, built production-style with real-world tooling.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {TECH_STACK.map(({ name, category, color }) => (
            <div key={name} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '90px',
              transition: 'border-color var(--ease-smooth), transform var(--ease-smooth)',
              cursor: 'default',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-mid)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: color,
                marginBottom: '2px',
              }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
                {name}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, var(--bg-main) 0%, #0C0E11 100%)',
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: '900',
          letterSpacing: '-0.03em', color: 'var(--text-main)',
          marginBottom: '14px',
        }}>
          Ready to share your frames?
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
          Join Framora and start documenting the stories behind your photographs.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '15px' }}>
            Create Free Account
          </Link>
          <Link to="/" className="btn btn-secondary" style={{ padding: '13px 28px', fontSize: '15px' }}>
            Explore Photos
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
