import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/shared/Toast';
import { useConfirm } from '../components/shared/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import Dropdown from '../components/shared/Dropdown';
import { authAPI, participantsAPI } from '../services/api';
import { getRoleFromToken } from '../utils/auth';

function PersonIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function EmailIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function BadgeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M16 8l-4 4-4-4"/><rect x="3" y="12" width="18" height="8" rx="1"/></svg>; }
function CalendarIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function SecurityIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function HistoryIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function EditIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function XIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }

export default function Profile() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '', national_id_hash: '', email: '', phone: '',
    dob: '', gender: '', region: '', bio: '', created_at: '', last_login: '', role: '', is_active: true,
  });
  const [permissions, setPermissions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', dob: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [adminEditing, setAdminEditing] = useState(false);
  const [adminEditForm, setAdminEditForm] = useState({ full_name: '', email: '', dob: '', bio: '' });
  const [adminSaving, setAdminSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    setIsAdmin(getRoleFromToken() === 'admin');
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await authAPI.getMe();
      const data = res.data;
      setProfile({
        full_name: data.full_name || 'User',
        national_id_hash: data.national_id_hash || '',
        email: data.email || '',
        phone: data.phone || '+254 700 000 000',
        dob: data.dob || '',
        gender: data.gender || '',
        region: data.region || '',
        bio: data.bio || 'CivicTruth registered user.',
        created_at: data.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
        role: data.role || 'participant',
        is_active: data.is_active ?? true,
      });
      setPermissions([
        { name: 'View Blockchain', granted: true },
        { name: 'Run Verification', granted: true },
        { name: 'Admin Access', granted: data.role === 'admin' },
        { name: 'Blockchain Write', granted: data.role === 'admin' },
      ]);
      setActivity([
        { action: 'Login', timestamp: new Date().toISOString(), ip: '192.168.1.1', status: 'success' },
        { action: 'Block Created', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1', status: 'success' },
        { action: 'Verification Run', timestamp: new Date(Date.now() - 172800000).toISOString(), ip: '192.168.1.1', status: 'success' },
      ]);
    } catch (e) { console.error(e); setError('Failed to load profile data.'); }
    setLoading(false);
  }, []);

  const loadParticipants = useCallback(async () => {
    try { const res = await participantsAPI.list(); setParticipants(res.data || []); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isAdmin) loadParticipants();
  }, [isAdmin, loadParticipants]);

  const completionRate = Math.round((permissions.filter(p => p.granted).length / permissions.length) * 100);

  const startEdit = () => {
    setEditForm({ full_name: profile.full_name, email: profile.email, dob: profile.dob || '', bio: profile.bio || '' });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateMe(editForm);
      setProfile(prev => ({ ...prev, ...res.data }));
      toast({ message: 'Profile updated successfully', severity: 'success' });
      setEditing(false);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ message: typeof detail === 'string' ? detail : JSON.stringify(detail), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAdminParticipantChange = async (participantId) => {
    setSelectedParticipant(participantId);
    if (!participantId) { setAdminEditing(false); return; }
    try {
      const res = await participantsAPI.get(participantId);
      const data = res.data;
      setAdminEditForm({ full_name: data.full_name || '', email: data.email || '', dob: data.dob || '', bio: data.bio || '' });
    } catch (e) { console.error(e); }
  };

  const startAdminEdit = () => setAdminEditing(true);

  const cancelAdminEdit = () => { setAdminEditing(false); };

  const saveAdminEdit = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    setAdminSaving(true);
    try {
      const res = await participantsAPI.update(selectedParticipant, adminEditForm);
      toast({ message: 'Participant updated successfully', severity: 'success' });
      setAdminEditing(false);
      loadParticipants();
      if (selectedParticipant === profile.id) {
        setProfile(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ message: typeof detail === 'string' ? detail : JSON.stringify(detail), severity: 'error' });
    } finally {
      setAdminSaving(false);
    }
  };

  const confirmDeleteParticipant = async () => {
    if (!selectedParticipant) return;
    try {
      await participantsAPI.remove(selectedParticipant);
      toast({ message: 'Participant deleted successfully', severity: 'success' });
      setSelectedParticipant('');
      setAdminEditing(false);
      loadParticipants();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ message: typeof detail === 'string' ? detail : JSON.stringify(detail), severity: 'error' });
    }
  };

  const handleDeleteClick = () => {
    confirm({
      title: 'Delete Participant',
      content: 'Are you sure you want to delete this participant? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'error',
    }).then((result) => { if (result) confirmDeleteParticipant(); });
  };

  return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      <PageHeader title="My Profile" subtitle="View and manage your CivicTruth account settings" breadcrumbs={[{ label: 'Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 text-center">
              {loading ? (
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mx-auto mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              {loading ? <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-44 mx-auto mb-2" /> : <h3 className="font-bold text-gray-800 dark:text-gray-100">{profile.full_name}</h3>}
              {loading ? <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mt-1 animate-pulse" /> : <p className="text-sm text-gray-400">{profile.email}</p>}
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs border border-gray-200 dark:border-gray-600 text-gray-500">{profile.role || 'User'}</span>
                <span className="px-3 py-1 rounded-lg text-xs border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">{profile.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile Completion</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${completionRate}%` }} />
                  </div>
                  <span className="text-xs font-bold text-indigo-500 min-w-[36px] text-right">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                {['Overview', 'Account Info', 'Activity'].map((label, idx) => (
                  <button key={label} onClick={() => setTab(idx)} className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === idx ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {tab === 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">About Me</h3>
                    {!editing && (
                      <button onClick={startEdit} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <EditIcon /> Edit Profile
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <form onSubmit={saveEdit} className="flex flex-col gap-4">
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Birth</label>
                        <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</label>
                        <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" />
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button type="button" onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold hover:border-gray-300 transition-all">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-500 leading-relaxed">{profile.bio}</p>
                  )}
                  <hr className="my-5 border-gray-200 dark:border-gray-700" />
                  <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">Permissions</h3>
                  {permissions.map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <SecurityIcon className="text-gray-400" />
                        <span className="text-sm">{p.name}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${p.granted ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{p.granted ? 'Granted' : 'Denied'}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Account Information</h3>
                    {!editing && (
                      <button onClick={startEdit} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <EditIcon /> Edit Profile
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <form onSubmit={saveEdit} className="flex flex-col gap-4">
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Birth</label>
                        <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</label>
                        <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" />
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button type="button" onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold hover:border-gray-300 transition-all">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col">
                      {[
                        { icon: <PersonIcon />, primary: 'Full Name', secondary: profile.full_name },
                        { icon: <EmailIcon />, primary: 'Email', secondary: profile.email },
                        { icon: <BadgeIcon />, primary: 'National ID', secondary: profile.national_id_hash ? `${profile.national_id_hash.slice(0, 16)}...` : 'N/A' },
                        { icon: <CalendarIcon />, primary: 'Date of Birth', secondary: profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A' },
                        { icon: <HistoryIcon />, primary: 'Member Since', secondary: new Date(profile.created_at).toLocaleDateString() },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="text-gray-400">{item.icon}</div>
                          <div className="flex-1">
                            <span className="text-xs text-gray-400 block">{item.primary}</span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.secondary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {tab === 2 && (
                <div>
                  <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">Recent Activity</h3>
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">{a.action.charAt(0)}</div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">{a.action}</span>
                        <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UsersIcon />
            </div>
            <div>
               <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">Admin Participant Management</h3>
               <p className="text-xs text-gray-400 mt-0.5">View, edit, or delete participant records</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
               <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Participant</label>
               <Dropdown
                 value={selectedParticipant}
                 onChange={(val) => handleAdminParticipantChange(val)}
                 placeholder="Select a participant"
                 options={participants.map((p) => ({ value: p.id, label: `${p.full_name} (${p.email || p.id})` }))}
               />
            </div>
            {selectedParticipant && (
              <div className="flex flex-col gap-4">
                {adminEditing ? (
                  <form onSubmit={saveAdminEdit} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input type="text" value={adminEditForm.full_name} onChange={(e) => setAdminEditForm({ ...adminEditForm, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                      <input type="email" value={adminEditForm.email} onChange={(e) => setAdminEditForm({ ...adminEditForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Birth</label>
                      <input type="date" value={adminEditForm.dob} onChange={(e) => setAdminEditForm({ ...adminEditForm, dob: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</label>
                      <textarea value={adminEditForm.bio} onChange={(e) => setAdminEditForm({ ...adminEditForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={cancelAdminEdit} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold hover:border-gray-300 transition-all">Cancel</button>
                      <button type="submit" disabled={adminSaving} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {adminSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-3">
                       <button onClick={startAdminEdit} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2">
                         <EditIcon /> Edit Participant
                       </button>
                       <button onClick={handleDeleteClick} className="flex-1 py-2.5 rounded-xl font-semibold text-red-600 border-2 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                         <TrashIcon /> Delete Participant
                       </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
