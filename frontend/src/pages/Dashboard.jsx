import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Compass, DollarSign, Trash2, ArrowRight, User, Plane, MapPin } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, apiCall } = useContext(AuthContext);

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await apiCall('/itineraries');
        const data = await res.json();
        if (data.success) {
          setItineraries(data.itineraries);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const handleDeleteTrip = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to cancel this trip itinerary? This deletes the schedule and budget.')) {
      return;
    }

    try {
      const res = await apiCall(`/itineraries/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setItineraries(itineraries.filter(it => it._id !== id));
      } else {
        alert(data.message || 'Failed to delete trip');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#10b981' }}>
        Loading your traveler profile...
      </div>
    );
  }

  // Split trips into upcoming and past based on current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = itineraries.filter(it => new Date(it.endDate) >= today);
  const pastTrips = itineraries.filter(it => new Date(it.endDate) < today);

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Profile Info Header */}
      <section className="glass-panel" style={{
        padding: '30px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '40px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '2px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981'
        }}>
          <User size={36} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#f8fafc' }}>{user?.name || 'Traveler'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '2px' }}>{user?.email}</p>
        </div>
      </section>

      {/* Trips Lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        
        {/* Section 1: Upcoming Trips */}
        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plane size={20} style={{ color: '#10b981' }} />
            Upcoming Journeys
          </h2>

          {upcomingTrips.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <Compass size={36} style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.05)' }} />
              <h3>No Upcoming Journeys</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '6px', marginBottom: '20px' }}>
                You haven't scheduled any new trips yet.
              </p>
              <Link to="/destinations" className="btn btn-primary">
                Discover Destinations
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '30px'
            }}>
              {upcomingTrips.map((it) => (
                <div key={it._id} className="glass-card" style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '380px'
                }}>
                  <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={it.destination.imageUrl}
                      alt={it.destination.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={(e) => handleDeleteTrip(it._id, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.85)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{it.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                        <MapPin size={12} style={{ color: '#10b981' }} />
                        <span>{it.destination.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                        <Calendar size={12} />
                        <span>{new Date(it.startDate).toLocaleDateString()} - {new Date(it.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <Link to={`/planner/${it._id}`} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px', justifyContent: 'center' }}>
                        Edit Plan
                      </Link>
                      <Link to={`/budget/${it._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px', justifyContent: 'center' }}>
                        View Budget
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Past Trips */}
        {pastTrips.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} />
              Past Adventures
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '30px',
              opacity: 0.75
            }}>
              {pastTrips.map((it) => (
                <div key={it._id} className="glass-card" style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '380px'
                }}>
                  <div style={{ height: '160px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={it.destination.imageUrl}
                      alt={it.destination.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }}
                    />
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{it.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                        <MapPin size={12} />
                        <span>{it.destination.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                        <Calendar size={12} />
                        <span>{new Date(it.startDate).toLocaleDateString()} - {new Date(it.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <Link to={`/planner/${it._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px', justifyContent: 'center' }}>
                        View Schedule
                      </Link>
                      <Link to={`/budget/${it._id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px', justifyContent: 'center' }}>
                        View Costs
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
