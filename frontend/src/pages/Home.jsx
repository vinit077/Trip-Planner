import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Search, Star, Compass } from 'lucide-react';

const Home = () => {
  const { API_URL } = useContext(AuthContext);
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch(`${API_URL}/destinations`);
        const data = await res.json();
        if (data.success) {
          // Take first 3 featured destinations
          setDestinations(data.destinations.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      }
    };
    fetchDestinations();
  }, [API_URL]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/destinations');
    }
  };

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <header style={{
        textAlign: 'center',
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontFamily: 'var(--font-display)',
          lineHeight: '1.1',
          maxWidth: '800px',
          color: '#f8fafc'
        }}>
          Craft Your Next <span style={{ color: '#10b981' }}>Great Adventure</span>
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          Experience travel like never before with our bespoke itinerary builder and integrated budget calculators.
        </p>

        {/* Search Input Container */}
        <form onSubmit={handleSearchSubmit} className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '550px',
          padding: '6px 12px',
          borderRadius: '30px',
          marginTop: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Search size={20} style={{ color: 'var(--text-muted)', marginLeft: '8px' }} />
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              padding: '12px',
              fontSize: '1rem'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{
            borderRadius: '24px',
            padding: '10px 24px'
          }}>
            Explore
          </button>
        </form>

        <div style={{ marginTop: '12px' }}>
          <Link to="/dashboard" className="btn btn-secondary" style={{ gap: '10px' }}>
            <span>Start Planning My Trip</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Featured Destinations Grid */}
      <section style={{ marginTop: '60px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass style={{ color: '#10b981' }} size={24} />
              Featured Destinations
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Explore top-rated travel hot spots hand-picked for you.</p>
          </div>
          <Link to="/destinations" style={{
            color: '#10b981',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500
          }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {destinations.length > 0 ? (
            destinations.map((dest) => (
              <article key={dest._id} className="glass-card" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '420px'
              }}>
                <div style={{ height: '220px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(7, 11, 19, 0.75)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: '#fbbf24',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Star size={14} fill="#fbbf24" />
                    <span>4.9</span>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.9)',
                    color: '#042f2e',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {dest.category}
                  </div>
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '8px' }}>{dest.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {dest.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dest.location}</span>
                    <button
                      onClick={() => navigate('/destinations')}
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            // Seeder fallback skeleton cards
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="glass-card" style={{ height: '420px', animation: 'pulse 1.5s infinite' }}></div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
