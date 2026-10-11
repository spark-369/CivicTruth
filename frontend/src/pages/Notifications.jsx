import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/shared/Toast';
import { useConfirm } from '../components/shared/ConfirmDialog';
import { notificationsAPI } from '../services/api';
import { getRoleFromToken } from '../utils/auth';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import EmptyState from '../components/shared/EmptyState';

function BellIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function SendIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function CheckIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function CloseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 id="modal-title" className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function NotificationForm({ initial, onSubmit, onCancel, submitLabel, saving }) {
  const [form, setForm] = useState(initial || { title: '', message: '' });
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</label>
        <input type="text" value={form.title} onChange={handleChange('title')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" placeholder="Notification title" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</label>
        <textarea value={form.message} onChange={handleChange('message')} rows={4} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" placeholder="Enter notification message" />
      </div>
      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Cancel'}</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-sm disabled:opacity-50">{saving ? 'Saving...' : (submitLabel || 'Save')}</button>
      </div>
    </form>
  );
}

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editNotification, setEditNotification] = useState(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const isAdmin = getRoleFromToken() === 'admin';

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const res = await notificationsAPI.list();
      setNotifications(res.data || []);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ message: 'Title and message are required', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      await notificationsAPI.create({ title: title.trim(), message: message.trim() });
      toast({ message: 'Notification sent successfully', severity: 'success' });
      setTitle('');
      setMessage('');
      loadNotifications();
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Failed to send notification', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!editNotification) return;
    setSaving(true);
    try {
      await notificationsAPI.update(editNotification.id, {
        title: form.title.trim(),
        message: form.message.trim(),
      });
      toast({ message: 'Notification updated successfully', severity: 'success' });
      setEditOpen(false);
      setEditNotification(null);
      loadNotifications();
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Failed to update notification', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirm({
      title: 'Delete Notification',
      content: 'Are you sure you want to delete this notification? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'error',
    });
    if (!result) return;
    try {
      await notificationsAPI.remove(id);
      toast({ message: 'Notification deleted successfully', severity: 'success' });
      loadNotifications();
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Failed to delete notification', severity: 'error' });
    }
  };

  const handleMarkRead = async (id, isRead) => {
    try {
      await notificationsAPI.markRead(id, isRead);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: isRead } : n));
    } catch {
      toast({ message: 'Failed to update notification', severity: 'error' });
    }
  };

  const openEdit = (n) => {
    setEditNotification(n);
    setEditOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <PageHeader title="Notifications" subtitle="View and manage system alerts" breadcrumbs={[{ label: 'Notifications' }]} />

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SendIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Send Alert</h3>
               <p className="text-xs text-gray-400">Broadcast a notification to all participants</p>
            </div>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
            </div>
            <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Enter notification message" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-sm disabled:opacity-50 flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SendIcon />}
                {saving ? 'Sending...' : 'Send Alert'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Alerts</h3>
          <p className="text-xs text-gray-400 mt-1">System notifications and alerts from administrators</p>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-4 sm:p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-4 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${n.is_read ? 'opacity-70' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.is_read ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                  {n.is_read ? <CheckIcon /> : <BellIcon />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{formatDate(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id, true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                      Mark Read
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" aria-label={`Edit ${n.title}`}>
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" aria-label={`Delete ${n.title}`}>
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditNotification(null); }} title="Edit Notification">
        {editNotification && (
          <NotificationForm
            initial={{
              title: editNotification.title || '',
              message: editNotification.message || '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setEditOpen(false); setEditNotification(null); }}
            submitLabel="Update Notification"
            saving={saving}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
