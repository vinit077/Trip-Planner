import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, DollarSign, Trash2, Plus, ArrowLeft, Save, MapPin, Check } from 'lucide-react';

const ItineraryBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useContext(AuthContext);

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection state
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', ''
  
  // New Activity form state
  const [newActivity, setNewActivity] = useState({
    time: '',
    activity: '',
    notes: '',
    cost: ''
  });

  useEffect(() => {
    // If no ID is in url, redirect to dashboard or fetch first user itinerary
    if (!id) {
      const fetchFirstItinerary = async () => {
        try {
          const res = await apiCall('/itineraries');
          const data = await res.json();
          if (data.success && data.itineraries.length > 0) {
            navigate(`/planner/${data.itineraries[0]._id}`);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      };
      fetchFirstItinerary();
      return;
    }

    const fetchItinerary = async () => {
      try {
        const res = await apiCall(`/itineraries/${id}`);
        const data = await res.json();
        if (data.success) {
          setItinerary(data.itinerary);
        } else {
          setError(data.message || 'Itinerary not found');
        }
      } catch (err) {
        console.error(err);
        setError('Server connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id, navigate]);

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.activity.trim()) return;

    // Add activity to current selected day
    const updatedItinerary = { ...itinerary };
    const selectedDay = updatedItinerary.dailyPlans[selectedDayIndex];
    
    selectedDay.activities.push({
      time: newActivity.time,
      activity: newActivity.activity,
      notes: newActivity.notes,
      cost: Number(newActivity.cost) || 0
    });

    setItinerary(updatedItinerary);
    // Reset form
    setNewActivity({
      time: '',
      activity: '',
      notes: '',
      cost: ''
    });
  };

  const handleDeleteActivity = (activityIndex) => {
    const updatedItinerary = { ...itinerary };
    const selectedDay = updatedItinerary.dailyPlans[selectedDayIndex];
    
    selectedDay.activities = selectedDay.activities.filter(
      (_, index) => index !== activityIndex
    );
    
    setItinerary(updatedItinerary);
  };

  const handleSaveItinerary = async () => {
    setSaveStatus('saving');
    try {
      const res = await apiCall(`/itineraries/${itinerary._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          dailyPlans: itinerary.dailyPlans
        })
      });
      const data = await res.json();
      if (data.success) {
        setItinerary(data.itinerary);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
      } else {
        setSaveStatus('');
        alert(data.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('');
      alert('Network error saving changes');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#10b981' }}>
        Loading itinerary details...
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#ef4444' }}>{error || 'No Trip Found'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 24px' }}>
          It looks like you don't have any trips created yet.
        </p>
        <Link to="/destinations" className="btn btn-primary">
          Explore Destinations
        </Link>
      </div>
    );
  }

  const currentDay = itinerary.dailyPlans[selectedDayIndex];

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header Back & Action Buttons */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#f8fafc' }}>{itinerary.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
              <MapPin size={14} style={{ color: '#10b981' }} />
              <span>{itinerary.destination.location}</span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <Calendar size={14} />
              <span>{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/budget/${itinerary._id}`} className="btn btn-secondary">
            <DollarSign size={16} />
            <span>Trip Budget</span>
          </Link>
          <button
            onClick={handleSaveItinerary}
            className="btn btn-primary"
            disabled={saveStatus === 'saving'}
            style={{ gap: '8px' }}
          >
            {saveStatus === 'saving' ? (
              <span>Saving...</span>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={16} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Plans</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Two Column Workspace */}
      <div style={{ display: 'flex', gap: '30px' }} className="builder-layout">
        {/* Left Column: Days Navigation Sidebar */}
        <aside style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="days-sidebar">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
            Trip Duration
          </h3>
          {itinerary.dailyPlans.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIndex(idx)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: selectedDayIndex === idx ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: selectedDayIndex === idx ? '#10b981' : 'var(--text-secondary)',
                border: selectedDayIndex === idx ? '1px solid var(--primary-glow)' : '1px solid transparent',
                textAlign: 'left'
              }}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </aside>

        {/* Right Column: Day Timeline & Adder */}
        <main style={{ flex: 1 }} className="timeline-container">
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '20px' }}>
              Day {currentDay?.dayNumber} Itinerary
            </h2>

            {/* Timeline Cards */}
            {(!currentDay || currentDay.activities.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.06)' }} />
                <p style={{ fontSize: '0.9rem' }}>No activities logged for this day yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid rgba(255,255,255,0.04)', paddingLeft: '16px', marginLeft: '8px' }}>
                {currentDay.activities.map((act, actIdx) => (
                  <div key={actIdx} className="glass-panel" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(15,19,28,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap'
                      }}>
                        <Clock size={12} />
                        <span>{act.time || '--:--'}</span>
                      </div>
                      <div>
                        <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 500 }}>{act.activity}</h4>
                        {act.notes && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{act.notes}</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      {act.cost > 0 && (
                        <div style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                          <DollarSign size={14} />
                          <span>{act.cost}</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteActivity(actIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Activity Section */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: '#10b981' }} />
              Add Activity to Day {currentDay?.dayNumber}
            </h3>

            {itinerary.destination?.activities?.length > 0 && (
              <div style={{ marginBottom: '24px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Suggestions for {itinerary.destination.name} (Click to add description)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {itinerary.destination.activities.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setNewActivity(prev => ({ ...prev, activity: suggestion }))}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        cursor: 'pointer'
                      }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddActivity}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', marginBottom: '16px' }} className="add-act-inputs">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Activity Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Visit Senso-ji Shrine"
                    value={newActivity.activity}
                    onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '20px' }} className="add-act-inputs">
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Entrance is free, temple closes at 5pm"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    value={newActivity.cost}
                    onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </form>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .builder-layout {
            flex-direction: column !important;
          }
          .days-sidebar {
            width: 100% !important;
            flex-direction: row !important;
            overflow-x: auto;
            padding-bottom: 6px;
          }
          .days-sidebar button {
            width: auto !important;
            white-space: nowrap;
          }
          .add-act-inputs {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ItineraryBuilder;
