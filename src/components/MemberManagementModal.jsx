import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Plus, X, Check } from 'lucide-react';
import { addMemberToEvent, removeMemberFromEvent } from '../services/eventsService';
import { getUserData, findUserByEmail } from '../services/userService';

export default function MemberManagementModal({ open, onClose, event, currentUser }) {
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // טעינת פרטי החברים הנוכחיים
  useEffect(() => {
    if (open && event?.members) {
      loadMembersData();
    }
  }, [open, event]);

  async function loadMembersData() {
    try {
      const membersData = await Promise.all(
        event.members.map(async (memberId) => {
          const userData = await getUserData(memberId);
          return {
            id: memberId,
            firstName: userData?.firstName || 'משתמש לא ידוע',
            email: userData?.email || '',
            isOwner: memberId === event.ownerId
          };
        })
      );
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    }
  }

  async function handleAddMember() {
    if (!newMemberEmail.trim()) {
      setError('אנא הזן כתובת מייל');
      return;
    }

    const email = newMemberEmail.trim().toLowerCase();
    
    // בדוק אם המייל כבר קיים באירוע
    const existingMember = members.find(member => 
      member.email.toLowerCase() === email
    );
    
    if (existingMember) {
      setError('המשתמש כבר משתתף באירוע');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // חפש משתמש לפי מייל
      const foundUser = await findUserByEmail(email);
      
      if (!foundUser) {
        setError(`לא נמצא משתמש עם המייל: ${email}`);
        return;
      }

      // הוסף את המשתמש לאירוע
      const success = await addMemberToEvent(event.id, foundUser.uid);
      
      if (success) {
        // הוסף למערך המשתתפים המקומי
        const newMember = {
          id: foundUser.uid,
          firstName: foundUser.firstName || 'משתמש',
          email: foundUser.email,
          isOwner: false
        };
        
        setMembers(prev => [...prev, newMember]);
        setNewMemberEmail('');
        setError('');
        
        alert(`✅ ${foundUser.firstName} נוסף לאירוע בהצלחה!`);
      } else {
        setError('שגיאה בהוספת המשתמש לאירוע');
      }
      
    } catch (error) {
      console.error('Error adding member:', error);
      setError('שגיאה בחיפוש או הוספת המשתמש');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(memberId) {
    if (memberId === event.ownerId) {
      alert('לא ניתן להסיר את בעל האירוע');
      return;
    }

    if (memberId === currentUser.uid) {
      const confirm = window.confirm('האם אתה בטוח שברצונך לעזוב את האירוע?');
      if (!confirm) return;
    } else {
      const confirm = window.confirm('האם אתה בטוח שברצונך להסיר את החבר מהאירוע?');
      if (!confirm) return;
    }

    try {
      const success = await removeMemberFromEvent(event.id, memberId);
      if (success) {
        setMembers(prev => prev.filter(member => member.id !== memberId));
        if (memberId === currentUser.uid) {
          onClose();
          // כאן נצטרך לחזור לדשבורד
        }
      } else {
        alert('שגיאה בהסרת החבר');
      }
    } catch (error) {
      alert('שגיאה: ' + error.message);
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
              <Users size={24} style={{ marginBottom: '4px' }} />
              ניהול משתתפים - {event.name}
            </h3>

            {/* הוספת חבר חדש */}
            <div style={{ marginBottom: '24px' }}>
              <label className="reminder-label">
                <Mail size={16} style={{ marginLeft: '6px' }} />
                הוסף משתתף חדש
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="modal-input"
                  placeholder="כתובת מייל של המשתתף"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  style={{ margin: 0, flex: 1 }}
                  disabled={loading}
                />
                <button
                  onClick={handleAddMember}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: 0
                  }}
                >
                  {loading ? '...' : <Plus size={16} />}
                </button>
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.85rem', margin: '8px 0 0 0' }}>{error}</p>}
              
              <div style={{ 
                background: 'rgba(54, 182, 242, 0.1)',
                border: '1px solid rgba(54, 182, 242, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '12px',
                fontSize: '0.85rem',
                color: '#1e40af'
              }}>
                💡 <strong>טיפ:</strong> הזן את כתובת המייל של משתמש שכבר נרשם למערכת
              </div>
            </div>

            {/* רשימת משתתפים נוכחיים */}
            <div>
              <h4 style={{ marginBottom: '16px', color: '#22223b' }}>
                משתתפים נוכחיים ({members.length})
              </h4>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(246, 248, 251, 0.8)',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      border: '1px solid rgba(67, 97, 238, 0.1)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {member.firstName}
                        {member.isOwner && (
                          <span style={{
                            background: 'linear-gradient(135deg, #4253f0 0%, #36b6f2 100%)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            marginRight: '8px'
                          }}>
                            בעלים
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {member.email}
                      </div>
                    </div>

                    {!member.isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        style={{
                          background: 'rgba(244, 67, 54, 0.1)',
                          color: '#f44336',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        title={member.id === currentUser.uid ? 'עזוב אירוע' : 'הסר משתתף'}
                      >
                        {member.id === currentUser.uid ? 'עזוב' : <X size={14} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* כפתור סגירה */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                className="modal-btn modal-btn-cancel"
                onClick={onClose}
                style={{ margin: 0 }}
              >
                סגור
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}