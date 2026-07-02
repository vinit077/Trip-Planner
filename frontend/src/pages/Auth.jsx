import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Auth = () => {
  const { login, register, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Authentication failed');
      }
    } else {
      if (!formData.name) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      const result = await register(formData.name, formData.email, formData.password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#070b13'
    }} className="fade-in">
      {/* Left side: Premium Image Panel */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'none'
      }} className="image-panel">
        <img
          src="https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury travel lodge under starlit night"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(7,11,19,0.2) 0%, rgba(7,11,19,0.85) 100%)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '60px',
          right: '60px',
          maxWidth: '500px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--font-display)',
            color: '#f8fafc',
            marginBottom: '16px'
          }}>
            Your journey begins here.
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.6'
          }}>
            Save your favorite destinations, layout customized daily plans, and track trip expenses in a unified portal.
          </p>
        </div>
      </div>

      {/* Right side: Authentication Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px 30px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#f8fafc' }}>
              {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {isLogin ? 'Log in to manage your travels.' : 'Register to start building plans.'}
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#f87171',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <span>Loading Voyager...</span>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  <span>Log In</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            {isLogin ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'underline'
                  }}
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'underline'
                  }}
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .image-panel {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
