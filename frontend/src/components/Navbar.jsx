import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Calendar, DollarSign, User, LogOut, LogIn, Plane, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: '16px',
      left: '16px',
      right: '16px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: '#f8fafc',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        letterSpacing: '0.05em'
      }} onClick={() => setMobileMenuOpen(false)}>
        <Plane style={{ color: '#10b981', transform: 'rotate(-45deg)' }} size={24} />
        <span>Wanderlust</span>
      </Link>

      {/* Desktop Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-links">
        <Link to="/destinations" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.95rem',
          color: isActive('/destinations') ? '#10b981' : '#94a3b8',
          transition: 'var(--transition-smooth)'
        }}>
          <Compass size={18} />
          Explore
        </Link>
        <Link to="/planner" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.95rem',
          color: isActive('/planner') ? '#10b981' : '#94a3b8',
          transition: 'var(--transition-smooth)'
        }}>
          <Calendar size={18} />
          Planner
        </Link>
        <Link to="/budget" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.95rem',
          color: isActive('/budget') ? '#10b981' : '#94a3b8',
          transition: 'var(--transition-smooth)'
        }}>
          <DollarSign size={18} />
          Budget
        </Link>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.95rem',
          color: isActive('/dashboard') ? '#10b981' : '#94a3b8',
          transition: 'var(--transition-smooth)'
        }}>
          <User size={18} />
          Dashboard
        </Link>
      </div>

      {/* Right Side Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-auth">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{
              color: '#f8fafc',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={{ padding: '8px 20px', textDecoration: 'none' }}>
            <LogIn size={16} />
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <button style={{
        display: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#f8fafc'
      }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle">
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '80px',
          left: '0',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          gap: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 999
        }}>
          <Link to="/destinations" style={{ textDecoration: 'none', color: '#f8fafc' }} onClick={() => setMobileMenuOpen(false)}>Explore</Link>
          <Link to="/planner" style={{ textDecoration: 'none', color: '#f8fafc' }} onClick={() => setMobileMenuOpen(false)}>Planner</Link>
          <Link to="/budget" style={{ textDecoration: 'none', color: '#f8fafc' }} onClick={() => setMobileMenuOpen(false)}>Budget</Link>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#f8fafc' }} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          <hr style={{ border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      )}

      {/* Media query stylesheet inject */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links, .desktop-auth {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
