import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DollarSign, Plus, Trash2, ArrowLeft, Calendar, PiggyBank, Receipt, AlertTriangle } from 'lucide-react';

const BudgetCalculator = () => {
  const { id } = useParams(); // itineraryId
  const navigate = useNavigate();
  const { apiCall } = useContext(AuthContext);

  const [itineraries, setItineraries] = useState([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState(id || '');
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // Edit limit state
  const [limitInput, setLimitInput] = useState('');
  const [isEditingLimit, setIsEditingLimit] = useState(false);

  // New Expense form state
  const [newExpense, setNewExpense] = useState({
    category: 'Other',
    description: '',
    amount: ''
  });

  // Fetch all user itineraries for the dropdown selector
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await apiCall('/itineraries');
        const data = await res.json();
        if (data.success) {
          setItineraries(data.itineraries);
          if (data.itineraries.length > 0) {
            if (!selectedItineraryId) {
              setSelectedItineraryId(data.itineraries[0]._id);
            }
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  // Fetch budget for the selected itinerary
  useEffect(() => {
    if (!selectedItineraryId) return;

    const fetchBudget = async () => {
      setBudgetLoading(true);
      try {
        const res = await apiCall(`/budgets/itinerary/${selectedItineraryId}`);
        const data = await res.json();
        if (data.success) {
          setBudget(data.budget);
          setLimitInput(data.budget.limit.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBudgetLoading(false);
        setLoading(false);
      }
    };

    fetchBudget();
  }, [selectedItineraryId]);

  const handleItineraryChange = (e) => {
    setSelectedItineraryId(e.target.value);
    navigate(`/budget/${e.target.value}`);
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    if (!budget) return;
    const limitVal = Number(limitInput);
    if (isNaN(limitVal) || limitVal < 0) return;

    try {
      const res = await apiCall(`/budgets/${budget._id}`, {
        method: 'PUT',
        body: JSON.stringify({ limit: limitVal })
      });
      const data = await res.json();
      if (data.success) {
        setBudget(data.budget);
        setIsEditingLimit(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description.trim() || !newExpense.amount) return;

    try {
      const res = await apiCall(`/budgets/${budget._id}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          category: newExpense.category,
          description: newExpense.description,
          amount: Number(newExpense.amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setBudget(data.budget);
        setNewExpense({
          category: 'Other',
          description: '',
          amount: ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await apiCall(`/budgets/${budget._id}/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBudget(data.budget);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#10b981' }}>
        Loading budgets...
      </div>
    );
  }

  // Calculations
  const totalSpent = budget
    ? budget.expenses.reduce((total, exp) => total + exp.amount, 0)
    : 0;

  const limit = budget ? budget.limit : 0;
  const percentSpent = limit > 0 ? Math.min(100, Math.round((totalSpent / limit) * 100)) : 0;
  const isOverBudget = totalSpent > limit;

  // Progress Bar color code
  let progressColor = '#10b981'; // Green
  if (percentSpent > 90) {
    progressColor = '#ef4444'; // Red
  } else if (percentSpent > 70) {
    progressColor = '#f59e0b'; // Orange
  }

  // Selected trip info
  const selectedItinerary = itineraries.find(it => it._id === selectedItineraryId);

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header & Trip Selection */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#f8fafc' }}>
              Travel <span style={{ color: '#10b981' }}>Expenses</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track food, lodging, travel, and schedule costs.</p>
          </div>
        </div>

        {/* Dropdown Selector */}
        {itineraries.length > 0 && (
          <div className="glass-panel" style={{ padding: '4px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '8px' }}>Select Trip:</span>
            <select
              value={selectedItineraryId}
              onChange={handleItineraryChange}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#10b981',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              {itineraries.map(it => (
                <option key={it._id} value={it._id} style={{ backgroundColor: '#0f131c', color: '#f8fafc' }}>
                  {it.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {itineraries.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <PiggyBank size={48} style={{ color: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />
          <h3>No Trip Budgets Available</h3>
          <p style={{ margin: '8px 0 24px', fontSize: '0.9rem' }}>Please create a trip from the destinations page first.</p>
          <Link to="/destinations" className="btn btn-primary">Go to Destinations</Link>
        </div>
      ) : budgetLoading ? (
        <div style={{ textAlign: 'center', color: '#10b981', padding: '60px' }}>Loading trip budget limits...</div>
      ) : (
        <>
          {/* Top Panel: Financial Statistics Gauge */}
          <section className="glass-panel" style={{ padding: '30px', borderRadius: '16px', marginBottom: '40px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Estimated Limit
                </span>
                {isEditingLimit ? (
                  <form onSubmit={handleUpdateLimit} style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      style={{ padding: '6px 12px', width: '120px', fontSize: '1.2rem' }}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px' }}>Save</button>
                    <button type="button" onClick={() => setIsEditingLimit(false)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Cancel</button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                    <h2 style={{ fontSize: '2.2rem', color: '#f8fafc' }}>${limit}</h2>
                    <button
                      onClick={() => setIsEditingLimit(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        textDecoration: 'underline'
                      }}
                    >
                      Change Limit
                    </button>
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Amount Spent / Synced
                </span>
                <h2 style={{ fontSize: '2.2rem', color: isOverBudget ? '#ef4444' : '#f8fafc', marginTop: '8px' }}>
                  ${totalSpent}
                </h2>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Budget Consumed
                </span>
                <h2 style={{ fontSize: '2.2rem', color: progressColor, marginTop: '8px' }}>
                  {percentSpent}%
                </h2>
              </div>
            </div>

            {/* Progress Gauge */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${percentSpent}%`,
                backgroundColor: progressColor,
                transition: 'width 0.4s ease-out',
                borderRadius: '5px'
              }} />
            </div>

            {isOverBudget && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                color: '#ef4444',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.15)'
              }}>
                <AlertTriangle size={16} />
                <span>Voyager, you have exceeded your estimated trip budget limits!</span>
              </div>
            )}
          </section>

          {/* Two Column Layout: Add Expense vs Logs List */}
          <div style={{ display: 'flex', gap: '30px' }} className="budget-layout">
            {/* Left: Log Expense Panel */}
            <aside style={{ flex: 2 }} className="expense-adder">
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt size={18} style={{ color: '#10b981' }} />
                  Log Travel Expense
                </h3>

                <form onSubmit={handleAddExpense}>
                  <div className="form-group">
                    <label className="form-label">Expense Category</label>
                    <select
                      className="form-input"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      style={{ backgroundColor: '#0f131c' }}
                    >
                      <option value="Flight">Flight (Transportation)</option>
                      <option value="Lodging">Lodging (Hotel/Airbnb)</option>
                      <option value="Food">Food & Dining</option>
                      <option value="Activities">Activities</option>
                      <option value="Transport">Local Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dinner at Tokyo Skytree"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="1"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={16} />
                    <span>Log Expense</span>
                  </button>
                </form>
              </div>
            </aside>

            {/* Right: Expenses List Panel */}
            <main style={{ flex: 3 }} className="expenses-log">
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', minHeight: '380px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '20px' }}>Logged Expenses</h3>

                {!budget || budget.expenses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Receipt size={32} style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.06)' }} />
                    <p style={{ fontSize: '0.85rem' }}>No expenses logged yet. Activities with costs added in the planner timeline will automatically sync here!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {budget.expenses.map((exp) => {
                      const isTimeline = exp.description.startsWith('[Timeline] ');
                      const displayDesc = isTimeline
                        ? exp.description.replace('[Timeline] ', '')
                        : exp.description;

                      return (
                        <div
                          key={exp._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(15,19,28,0.4)',
                            border: '1px solid rgba(255,255,255,0.04)'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontWeight: 600,
                              backgroundColor: isTimeline ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: isTimeline ? '#3b82f6' : '#10b981'
                            }}>
                              {exp.category}
                            </div>
                            <div>
                              <h4 style={{
                                fontSize: '0.95rem',
                                color: '#f8fafc',
                                fontWeight: 500,
                                fontStyle: isTimeline ? 'italic' : 'normal'
                              }}>
                                {displayDesc}
                              </h4>
                              {isTimeline && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Synced from planner timeline
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
                              ${exp.amount}
                            </span>
                            {!isTimeline ? (
                              <button
                                onClick={() => handleDeleteExpense(exp._id)}
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
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              // Place spacer to match trash alignment
                              <div style={{ width: '15px' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .budget-layout {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BudgetCalculator;
