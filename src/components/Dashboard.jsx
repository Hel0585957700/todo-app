import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserEvents } from '../services/eventsService';
import CreateEventModal from './CreateEventModal';

export default function Dashboard({ currentUser, onLogout, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserEvents();
    }
  }, [currentUser?.uid]);

  async function loadUserEvents() {
    try {
      const userEvents = await getUserEvents(currentUser.uid);
      setEvents(userEvents || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEventCreated(newEvent) {
    setEvents(prev => [newEvent, ...prev]);
    setCreateEventModalOpen(false);
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="card">
          <h2>טוען אירועים...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="card">
        {/* כותרת עם שלום משתמש וכפתור התנתקות */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2>שלום {currentUser.firstName || currentUser.email}! 👋</h2>
          <button 
            onClick={onLogout}
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            התנתק
          </button>
        </div>

        {/* כפתור יצירת אירוע חדש */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCreateEventModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '600',
            width: '100%',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(46, 204, 113, 0.3)'
          }}
        >
          <Plus size={20} />
          צור אירוע חדש
        </motion.button>

        {/* רשימת אירועים */}
        {events.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            background: 'rgba(246, 248, 251, 0.8)',
            borderRadius: '16px',
            border: '2px dashed rgba(67, 97, 238, 0.2)'
          }}>
            <Calendar size={48} style={{ color: '#4253f0', marginBottom: '16px' }} />
            <h3 style={{ color: '#666', marginBottom: '8px' }}>אין לך אירועים עדיין</h3>
            <p style={{ color: '#999', fontSize: '0.95rem' }}>
              צור את האירוע הראשון שלך כדי להתחיל לנהל משימות!
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ 
              marginBottom: '20px', 
              color: '#22223b',
              fontSize: '1.2rem'
            }}>
              האירועים שלי ({events.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="task-item"
                    onClick={() => onSelectEvent(event)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(67, 97, 238, 0.15)',
                      borderRadius: '18px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      minHeight: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #4253f0 0%, #36b6f2 100%)',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        {event.type === 'חתן' && '🤵'}
                        {event.type === 'כלה' && '👰'}
                        {event.type === 'בר מצווה' && '📜'}
                        {event.type === 'אחר' && '🎉'}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: 0, 
                          marginBottom: '4px',
                          color: '#22223b',
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          {event.name}
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          <span>📅 {event.type}</span>
                          {event.date && (
                            <span>🗓️ {new Date(event.date).toLocaleDateString('he-IL')}</span>
                          )}
                          <span>📝 {event.tasksCount || 0} משימות</span>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(67, 97, 238, 0.1)',
                        color: '#4253f0',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        לחץ לכניסה →
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* מודל יצירת אירוע */}
      <CreateEventModal
        open={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
        currentUser={currentUser}
      />
    </div>
  );
}