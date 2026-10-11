import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { participantsAPI } from '../services/api';
import { useToast } from '../components/shared/Toast';
import { useConfirm } from '../components/shared/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import EmptyState from '../components/shared/EmptyState';
import { getRoleFromToken } from '../utils/auth';

function AddIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ViewIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function CloseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ClearIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

function getInitials(name) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2); }

/**
 * Generate a cryptographically strong temporary password using the Web Crypto
 * API. Falls back to a random alphanumeric string in non-secure contexts.
 */
function generateTempPassword(length = 16) {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : null;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    password = Array.from(values, (v) => CHARS[v % CHARS.length]).join('');
  } else {
    for (let i = 0; i < length; i++) {
      password += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }
  return password;
}

const colorVariants = {
  indigo: { bar: 'from-indigo-500 to-indigo-600', icon: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
  emerald: { bar: 'from-emerald-500 to-emerald-600', icon: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
  gray: { bar: 'from-gray-400 to-gray-500', icon: 'bg-gray-400', shadow: 'shadow-gray-500/30' },
};

function StatCard({ title, value, variant = 'indigo', loading, delay }) {
  const colors = colorVariants[variant] || colorVariants.indigo;
  return (
    <div className="animate-slide-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.bar}`} />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${colors.icon}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
        </div>
        <div className="font-bold text-2xl text-gray-800 dark:text-gray-100 leading-tight mt-3 mb-1">
          {loading ? <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-20" /> : value}
        </div>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">{title}</div>
      </div>
    </div>
  );
}

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

function ParticipantForm({ initial, onSubmit, onCancel, submitLabel, saving }) {
  const [form, setForm] = useState(initial || { full_name: '', email: '', dob: '', bio: '', is_active: true });
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="participant-full-name">Full Name</label>
        <input id="participant-full-name" type="text" value={form.full_name} onChange={handleChange('full_name')} autoComplete="name" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" placeholder="Enter full name" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="participant-email">Email</label>
        <input id="participant-email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" placeholder="Enter email" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="participant-dob">Date of Birth</label>
        <input id="participant-dob" type="date" value={form.dob} onChange={handleChange('dob')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="participant-bio">Bio</label>
        <textarea id="participant-bio" value={form.bio} onChange={handleChange('bio')} rows={3} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none" placeholder="Enter bio" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
        <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</p><p className="text-xs text-gray-400">Allow this participant to access the application</p></div>
      </label>
      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Cancel'}</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-sm disabled:opacity-50">{saving ? 'Saving...' : (submitLabel || 'Save')}</button>
      </div>
    </form>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" /></td>
      <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" /></td>
      <td className="p-3 text-right"><div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editParticipant, setEditParticipant] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const isAdmin = getRoleFromToken() === 'admin';

  const loadParticipants = useCallback(async () => {
    try { setError(null); const res = await participantsAPI.list(); setParticipants(res.data || []); } catch (e) { console.error(e); setError('Failed to load participants data. Please try again.'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  const filtered = participants.filter((p) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return p.full_name?.toLowerCase().includes(t) || p.email?.toLowerCase().includes(t);
  });

  const stats = [
    { title: 'Total Participants', value: participants.length, variant: 'indigo' },
    { title: 'Active', value: participants.filter((p) => p.is_active).length, variant: 'emerald' },
    { title: 'Inactive', value: participants.filter((p) => !p.is_active).length, variant: 'gray' },
  ];

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      // Generate a cryptographically random, one-time password and a
      // non-guessable national ID when the admin has not supplied them.
      // (Math.random() is not suitable for generating credentials.)
      const tempPassword = form.password || generateTempPassword();
      const nationalId = form.national_id?.trim() || `NID-${crypto.randomUUID()}`;
      await participantsAPI.create({
        full_name: form.full_name,
        email: form.email || undefined,
        dob: form.dob || undefined,
        bio: form.bio || undefined,
        national_id: nationalId,
        password: tempPassword,
      });
      toast({
        message: `Participant created. Temporary password: ${tempPassword}. Share it securely and require a change on first login.`,
        severity: 'success',
      });
      setCreateOpen(false);
      loadParticipants();
    } catch (e) {
      toast({ message: e?.response?.data?.detail || 'Failed to create participant', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!editParticipant) return;
    setSaving(true);
    try {
      await participantsAPI.update(editParticipant.id, {
        full_name: form.full_name,
        email: form.email || undefined,
        dob: form.dob || undefined,
        bio: form.bio || undefined,
        is_active: form.is_active,
      });
      toast({ message: 'Participant updated successfully', severity: 'success' });
      setEditOpen(false);
      setEditParticipant(null);
      loadParticipants();
    } catch (e) {
      toast({ message: e?.response?.data?.detail || 'Failed to update participant', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirm({
      title: 'Delete Participant',
      content: 'Are you sure you want to delete this participant? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'error',
    });
    if (!result) return;
    try {
      await participantsAPI.remove(id);
      toast({ message: 'Participant deleted successfully', severity: 'success' });
      loadParticipants();
    } catch (e) {
      toast({ message: e?.response?.data?.detail || 'Failed to delete participant', severity: 'error' });
    }
  };

  const openEdit = (p) => {
    setEditParticipant(p);
    setEditOpen(true);
  };

  const clearSearch = () => setSearchTerm('');

  return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <PageHeader
        title="Participants"
        subtitle="Manage registered participants in the CivicTruth platform"
        action={
          isAdmin ? (
            <button onClick={() => setCreateOpen(true)} className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center gap-2">
              <AddIcon /> Add Participant
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} variant={s.variant} loading={loading} delay={i * 0.1} />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-indigo-500 focus:border-2 outline-none transition-all"
              aria-label="Search participants"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Clear search">
                <ClearIcon />
              </button>
            )}
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-500">{filtered.length} results</span>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                {['Participant', 'Status', 'Role', 'National ID', 'Registered', 'Last Updated', 'Actions'].map((h) => (
                        <th key={h} className="font-semibold text-xs text-gray-400 py-3 px-4 text-left">{h}</th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="text-center">
                      <div className="py-12">
                         <EmptyState title="No participants found" description="Try adjusting your search or add a new participant" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                       <td className="py-3 px-4">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">{getInitials(c.full_name)}</div>
                         <div>
                           <p className="font-semibold text-sm">{c.full_name}</p>
                           {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                         </div>
                       </div>
                     </td>
                     <td className="py-3 px-3">
                       <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${c.is_active ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                         {c.is_active ? 'Active' : 'Inactive'}
                       </span>
                     </td>
                      <td className="py-3 px-3"><p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{c.role || 'participant'}</p></td>
                     <td className="py-3 px-3"><p className="text-xs font-mono text-gray-400">{c.national_id_hash?.slice(0, 16)}...</p></td>
                     <td className="py-3 px-3"><p className="text-sm text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</p></td>
                     <td className="py-3 px-3"><p className="text-sm text-gray-400">{c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'N/A'}</p></td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                         <Link to={`/participants/${c.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors no-underline">
                          <ViewIcon /> View
                        </Link>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" aria-label={`Edit ${c.full_name}`}>
                              <EditIcon /> Edit
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" aria-label={`Delete ${c.full_name}`}>
                              <TrashIcon /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Participant">
        <ParticipantForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Create Participant" saving={saving} />
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditParticipant(null); }} title="Edit Participant">
        {editParticipant && (
          <ParticipantForm
            initial={{
              full_name: editParticipant.full_name || '',
              email: editParticipant.email || '',
              dob: editParticipant.dob ? new Date(editParticipant.dob).toISOString().split('T')[0] : '',
              bio: editParticipant.bio || '',
              is_active: editParticipant.is_active ?? true,
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setEditOpen(false); setEditParticipant(null); }}
            submitLabel="Update Participant"
            saving={saving}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
