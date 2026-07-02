import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar, Star, Compass, AlertCircle, Plus, MapPin } from 'lucide-react';

const Destinations = () => {
  const { API_URL, apiCall, token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Search query from homepage redirect
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal for planning a trip
  const [planningDest, setPlanningDest] = useState(null);
  const [planTitle, setPlanTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  const categories = ['All', 'Adventure', 'Beach', 'Cultural', 'City', 'Nature'];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch(`${API_URL}/destinations`);
        const data = await res.json();
        if (data.success) {
          setDestinations(data.destinations);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [API_URL]);

  // Filter & Search Logic
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'All' || dest.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleStartPlan = (dest) => {
    if (!token) {
      navigate('/auth');
      return;
    }
    setPlanningDest(dest);
    setPlanTitle(`Trip to ${dest.name}`);
    setModalError('');
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!planTitle || !startDate || !endDate) {
      setModalError('Please fill out all fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setModalError('End date must be after start date');
      return;
    }

    setPlanLoading(true);

    try {
      const res = await apiCall('/itineraries', {
        method: 'POST',
        body: JSON.stringify({
          destinationId: planningDest._id,
          title: planTitle,
          startDate,
          endDate
        })
      });

      const data = await res.json();
      setPlanLoading(false);

      if (data.success) {
        // Successfully created itinerary and budget, redirect to itinerary builder
        navigate(`/planner/${data.itinerary._id}`);
      } else {
        setModalError(data.message || 'Failed to create plan');
      }
    } catch (err) {
      console.error(err);
      setPlanLoading(false);
      setModalError('Server connection failed');
    }
  };

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '60px' }}>
      {/* Title Header */}
      <header style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#f8fafc' }}>
          Explore the <span style={{ color: '#10b981' }}>World</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find your next travel inspiration and start customizing your itinerary.</p>
      </header>

      {/* Controls: Search and Categories */}
      <section style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px'
      }}>
        {/* Search */}
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
          padding: '4px 12px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              padding: '10px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Categories Horizontal */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          maxWidth: '100%'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderRadius: '20px',
                backgroundColor: selectedCategory === cat ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat ? '#042f2e' : '#f8fafc',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Destinations Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#10b981', padding: '60px' }}>Loading destinations...</div>
      ) : filteredDestinations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-secondary)'
        }} className="glass-panel">
          <Compass size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No Destinations Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try adjusting your search filters or queries.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {filteredDestinations.map((dest) => (
            <article key={dest._id} className="glass-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '420px'
            }}>
              <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
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
                  padding: '4px 8px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#fbbf24'
                }}>
                  <Star size={12} fill="#fbbf24" />
                  <span>4.9</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                  color: '#042f2e',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {dest.category}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '6px' }}>{dest.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {dest.description}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                    <MapPin size={12} />
                    <span>{dest.location}</span>
                  </div>
                  <button
                    onClick={() => handleStartPlan(dest)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                    <span>Plan Trip</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Plan Trip Modal Overlay */}
      {planningDest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 11, 19, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 2000
        }}>
          <div className="glass-panel fade-in" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '30px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '6px' }}>
              Plan trip to {planningDest.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Set your dates and title to create a new itinerary.
            </p>

            {modalError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#f87171',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlan}>
              <div className="form-group">
                <label className="form-label">Trip Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. Summer Vacation"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setPlanningDest(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={planLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {planLoading ? 'Creating...' : 'Let\'s Go'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
