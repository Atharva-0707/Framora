import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Heart, Compass, Search, Bookmark, Users, Sparkles, HelpCircle, Mail } from 'lucide-react';

const NAV_EXPLORE = [
  { label: 'Photography Feed', to: '/' },
  { label: 'Search & Tags', to: '/search' },
  { label: 'Saved Bookmarks', to: '/bookmarks' },
];

const NAV_COMMUNITY = [
  { label: 'Join Community', to: '/register' },
  { label: 'Photographer Sign In', to: '/login' },
  { label: 'About the Platform', to: '/about' },
];

const NAV_PLATFORM = [
  { label: 'Editorial Story', to: '/about' },
  { label: 'Contact Developer', to: '/contact' },
  { label: 'Explore Genres', to: '/search' },
];

const TECH_BADGES = ['React 18', 'Node.js', 'Express', 'MongoDB', 'Cloudinary', 'Vite', 'JWT'];

export const SiteFooter = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-grid">

          {/* Col 1 — Brand */}
          <div>
            <div className="footer-brand-mark">
              <div className="footer-brand-icon">
                <Camera size={18} color="var(--accent)" strokeWidth={2} />
              </div>
              <span className="footer-brand-name">Framora</span>
            </div>
            <p className="footer-tagline">"Every frame has a story."</p>
            <p className="footer-description">
              A modern editorial photography platform built for creators who care about craft. Document your shots, gear specs, and stories behind every capture.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <Link to="/about" className="footer-social-link" title="About Framora" aria-label="About Framora">
                <Sparkles size={15} />
              </Link>
              <Link to="/contact" className="footer-social-link" title="Contact Us" aria-label="Contact Developer">
                <Mail size={15} />
              </Link>
              <Link to="/search" className="footer-social-link" title="Discover Photos" aria-label="Discover Photos">
                <Search size={15} />
              </Link>
            </div>
          </div>

          {/* Col 2 — Explore */}
          <div>
            <p className="footer-col-heading">Explore</p>
            <nav className="footer-links" aria-label="Explore navigation">
              {NAV_EXPLORE.map((item) => (
                <Link key={item.label} to={item.to} className="footer-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Community */}
          <div>
            <p className="footer-col-heading">Community</p>
            <nav className="footer-links" aria-label="Community navigation">
              {NAV_COMMUNITY.map((item) => (
                <Link key={item.label} to={item.to} className="footer-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 4 — Platform */}
          <div>
            <p className="footer-col-heading">Platform</p>
            <nav className="footer-links" aria-label="Platform navigation">
              {NAV_PLATFORM.map((item) => (
                <Link key={item.label} to={item.to} className="footer-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Tech stack */}
            <div style={{ marginTop: '24px' }}>
              <p className="footer-col-heading" style={{ marginBottom: '8px' }}>Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {TECH_BADGES.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: '10.5px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--text-dim)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="site-footer-bottom">
          <span>
            © {new Date().getFullYear()} Framora · Every frame has a story.
          </span>
          <div className="footer-bottom-links">
            <Link to="/about" className="footer-bottom-link">About</Link>
            <Link to="/contact" className="footer-bottom-link">Contact</Link>
            <Link to="/search" className="footer-bottom-link">Discover</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
