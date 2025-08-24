import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Star } from 'lucide-react';
import { createEvent } from '../services/eventsService';
import { getAvailableEventTypes } from '../services/defaultTasksService';

export default function CreateEventModal({ open, onClose, onEventCreated, currentUser }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    date: '',
    description: '',
    addDefaultTasks: true
  });
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState(['חתן', 'כלה', 'בר מצווה', 'אחר']);

  useEffect(() => {
    async function loadEventTypes() {
      try {
        const types = await getAvailableEventTypes();
        if (types.length > 0) {
          setEventTypes([...types, 'אחר']);
        }
      } catch (error) {
        console.error("Error loading event types:", error);
      }
    }
    loadEventTypes();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type) {
      alert('אנא מלא את השם ובחר סוג אירוע');
      return;
    }

    setLoading(true);
    
    try {
      const eventData = {
        name: formData.name.trim(),
        type: formData.type,
        date: formData.date || null,
        description: formData.description.trim() || null,
        addDefaultTasks: formData.addDefaultTasks,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        members: [currentUser.uid] // הבעלים הוא גם חבר באירוע
      };

      const newEvent = await createEvent(eventData);
      
      if (newEvent) {
        onEventCreated(newEvent);
        setFormData({
          name: '',
          type: '',
          date: '',
          description: '',
          addDefaultTasks: true
        });
      } else {
        alert('שגיאה ביצירת האירוע');
      }
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('שגיאה ביצירת האירוע: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.3 
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            {/* כפתור סגירה */}
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="סגור"
            >
              ✕
            </button>

            <h3 className="modal-title">
              <Star size={24} style={{ marginBottom: '4px' }} />
              צור אירוע חדש
            </h3>

            <form onSubmit={handleSubmit}>
              {/* שם האירוע */}
              <div style={{ marginBottom: '20px' }}>
                <label className="reminder-label">
                  <Calendar size={16} style={{ marginLeft: '6px' }} />
                  שם האירוע *
                </label>
                <input
                  className="modal-input"
                  name="name"
                  placeholder="לדוגמה: החתונה של דוד ושרה"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </div>

              {/* סוג האירוע */}
              <div style={{ marginBottom: '20px' }}>
                <label className="reminder-label">סוג האירוע *</label>
                <div className="status-group" style={{ justifyContent: 'flex-start' }}>
                  {eventTypes.map((type) => (
                    <label key={type} className="status-label">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                        className="status-radio"
                        required
                      />
                      <span className="status-text">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* תאריך האירוע */}
              <div style={{ marginBottom: '20px' }}>
                <label className="reminder-label">תאריך האירוע (אופציונלי)</label>
                <input
                  className="modal-datepicker"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              {/* תיאור */}
              <div style={{ marginBottom: '20px' }}>
                <label className="reminder-label">תיאור (אופציונלי)</label>
                <textarea
                  className="modal-input"
                  name="description"
                  placeholder="תיאור קצר על האירוע..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={200}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              {/* הוספת משימות ברירת מחדל */}
              {formData.type && formData.type !== 'אחר' && (
                <div style={{ marginBottom: '24px' }}>
                  <label className="status-label" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <input
                      type="checkbox"
                      name="addDefaultTasks"
                      checked={formData.addDefaultTasks}
                      onChange={handleChange}
                      className="status-radio"
                    />
                    <span className="status-text">
                      הוסף משימות ברירת מחדל עבור {formData.type}
                    </span>
                  </label>
                </div>
              )}

              {/* כפתורי פעולה */}
              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-save"
                  disabled={loading}
                >
                  {loading ? 'יוצר אירוע...' : 'צור אירוע'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}