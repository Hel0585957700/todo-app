import React, { useState } from 'react';
import { ArrowRight, Users, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import TasksList from './TasksList';
import FloatingMenu from './FloatingMenu';
import AddOrEditTaskModal from './AddOrEditTaskModal';
import { useEventTasks } from '../hooks/useEventTasks';

export default function EventView({ event, currentUser, onBackToDashboard }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // שימוש ב-custom hook לניהול משימות האירוע
  const {
    tasks,
    addTask,
    toggleTask,
    updateTask,
    setReminder,
    deleteTask,
    addDefaultTasks
  } = useEventTasks(event.id);

  // פתיחת מודל הוספת משימה
  function openAddTaskModal() {
    setEditTaskId(null);
    setModalOpen(true);
  }

  // פתיחת מודל עריכת משימה
  function openEditTaskModal(taskId) {
    setEditTaskId(taskId);
    setModalOpen(true);
  }

  // הוספת משימות דיפולטיביות
  async function handleAddDefaultTasks() {
    if (!event.type || event.type === 'אחר') {
      alert("לא ניתן להוסיף משימות ברירת מחדל לאירוע מסוג 'אחר'");
      return;
    }

    const confirm = window.confirm(
      `האם אתה בטוח שברצונך להוסיף את המשימות הדיפולטיביות עבור ${event.type}?`
    );
    
    if (!confirm) return;

    const success = await addDefaultTasks(event.type);
    
    if (success) {
      alert("המשימות הדיפולטיביות נוספו בהצלחה!");
    } else {
      alert("אירעה שגיאה בהוספת המשימות הדיפולטיביות");
    }
  }

  // טיפול בשמירת משימה מהמודל
  async function handleSaveTask(taskData) {
    if (editTaskId === null) {
      // הוספת משימה חדשה
      await addTask(taskData.text, taskData.category, taskData.priority);
    } else {
      // עריכת משימה קיימת
      const task = tasks.find(t => t.id === editTaskId);
      if (task) {
        const updates = {
          text: taskData.text,
          status: taskData.status || task.status,
          reminder: taskData.reminder || task.reminder,
          category: taskData.category || task.category,
          priority: taskData.priority || task.priority
        };
        
        await updateTask(editTaskId, updates);
      }
    }
    
    setModalOpen(false);
    setEditTaskId(null);
  }

  // קבלת המשימה הנוכחית לעריכה
  function getCurrentTask() {
    if (editTaskId === null) return null;
    return tasks.find(task => task.id === editTaskId) || null;
  }

  // חישוב סטטיסטיקות
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="app-container">
      <div className="card">
        {/* כותרת עם חזרה לדשבורד */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '24px',
          gap: '12px'
        }}>
          <button
            onClick={onBackToDashboard}
            style={{
              background: 'rgba(67, 97, 238, 0.1)',
              color: '#4253f0',
              border: '2px solid rgba(67, 97, 238, 0.2)',
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            <ArrowRight size={16} />
            חזור לדשבורד
          </button>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, marginBottom: '4px' }}>
              {event.name}
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                📅 {event.type}
              </span>
              {event.date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {new Date(event.date).toLocaleDateString('he-IL')}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} />
                {event.members?.length || 1} משתתפים
              </span>
            </div>
          </div>
        </div>

        {/* סטטיסטיקות התקדמות */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(66, 83, 240, 0.1) 0%, rgba(54, 182, 242, 0.1) 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(67, 97, 238, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, color: '#22223b' }}>התקדמות האירוע</h3>
            <span style={{ 
              background: progressPercentage === 100 ? '#27ae60' : '#4253f0',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              {progressPercentage}%
            </span>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: '100%',
                background: progressPercentage === 100 
                  ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                  : 'linear-gradient(135deg, #4253f0 0%, #36b6f2 100%)',
                borderRadius: '10px'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <span>✅ {completedTasks} הושלמו</span>
            <span>⏳ {inProgressTasks} בתהליך</span>
            <span>📝 {totalTasks} סה"כ משימות</span>
          </div>
        </div>

        {/* כפתור הוספת משימות ברירת מחדל */}
        {event.type && event.type !== 'אחר' && (
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={handleAddDefaultTasks}
              style={{ 
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                color: 'white',
                padding: '12px 20px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
              }}
            >
              <Plus size={16} />
              הוסף משימות ברירת מחדל עבור {event.type}
            </button>
          </div>
        )}

        {/* רשימת המשימות */}
        <TasksList
          tasks={tasks}
          onTaskClick={toggleTask}
          onSetReminder={setReminder}
          onEdit={openEditTaskModal}
          onDelete={deleteTask}
        />
      </div>

      {/* תפריט צף */}
      <FloatingMenu
        onAddUser={() => alert("הוספת משתתפים - בקרוב!")}
        onAddTask={openAddTaskModal}
        onChatAI={() => alert("דו שיח עם AI - בקרוב!")}
      />

      {/* מודל הוספת/עריכת משימה */}
      <AddOrEditTaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTaskId(null);
        }}
        onSave={handleSaveTask}
        initialTask={getCurrentTask()}
      />
    </div>
  );
}