import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/shared/Toast';
import { useSettings } from '../components/shared/SettingsContext';
import { settingsAPI } from '../services/api';
import { getRoleFromToken } from '../utils/auth';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import EmptyState from '../components/shared/EmptyState';
import Dropdown from '../components/shared/Dropdown';

function NotificationsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function SecurityIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function PaletteIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>; }
function StorageIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34-9-3V5"/></svg>; }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function CloseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

function SettingSection({ icon: Icon, title, description, color, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10`, color: `${color}80` }}>
          <Icon />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{title}</h3>
          {description && <p className="text-xs text-gray-400 block mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
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

function SettingForm({ initial, onSubmit, onCancel, submitLabel, saving }) {
  const [form, setForm] = useState(initial || { key: '', value: '', value_type: 'string', description: '' });
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.key.trim()) {
      setError('Key is required');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key</label>
        <input type="text" value={form.key} onChange={handleChange('key')} disabled={!!initial || saving} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed" placeholder="e.g. site.name" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</label>
        <textarea value={form.value} onChange={handleChange('value')} rows={3} disabled={saving} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm resize-none disabled:opacity-50" placeholder="Enter value" />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</label>
        <Dropdown
          value={form.value_type}
          onChange={(val) => handleChange('value_type')({ target: { value: val } })}
          disabled={saving}
          options={[
            { value: 'string', label: 'String' },
            { value: 'int', label: 'Integer' },
            { value: 'bool', label: 'Boolean' },
            { value: 'json', label: 'JSON' },
          ]}
        />
      </div>
      <div>
        <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
        <input type="text" value={form.description} onChange={handleChange('description')} disabled={saving} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm disabled:opacity-50" placeholder="Optional description" />
      </div>
      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Cancel'}</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-sm disabled:opacity-50">{saving ? 'Saving...' : (submitLabel || 'Save')}</button>
      </div>
    </form>
  );
}

export default function Settings() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [settings, setSettings] = useState([]);
   const [draftSettings, setDraftSettings] = useState({});
   const [editOpen, setEditOpen] = useState(false);
   const [editSetting, setEditSetting] = useState(null);
   const { toast } = useToast();
   const { refresh } = useSettings();
   const isAdmin = getRoleFromToken() === 'admin';

  const loadSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await settingsAPI.list();
      const data = res.data || [];
      setSettings(data);
      setDraftSettings(data.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {}));
    } catch {
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => { loadSettings(); }, [loadSettings]);

   const saveSetting = async (key, value, valueType = 'string') => {
    setSaving(true);
    try {
      const existing = settings.find(s => s.key === key);
      if (existing) {
        await settingsAPI.update(existing.id, { value, value_type: valueType });
      } else {
        toast({ message: 'Setting not found', severity: 'error' });
        return false;
      }
      toast({ message: 'Setting saved successfully', severity: 'success' });
      return true;
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Failed to save setting', severity: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!editSetting) return;
    setSaving(true);
    try {
      await settingsAPI.update(editSetting.id, form);
      toast({ message: 'Setting updated successfully', severity: 'success' });
      setEditOpen(false);
      setEditSetting(null);
      loadSettings();
      refresh();
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Failed to update setting', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

   const openEdit = (s) => {
     setEditSetting(s);
     setEditOpen(true);
   };

   return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <PageHeader
        title="Settings"
        subtitle="Manage application configuration and preferences"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">System Settings</h3>
            <p className="text-xs text-gray-400 mt-1">Manage configuration keys and values</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  {['Key', 'Value', 'Type', 'Actions'].map((h) => (
                    <th key={h} className="font-semibold text-xs text-gray-400 py-3 px-4 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" /></td><td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" /></td><td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" /></td><td className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12" /></td><td className="p-3 text-right"><div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" /></td></tr>
                  ))
                ) : settings.length === 0 ? (
                  <tr><td colSpan={4}><EmptyState title="No settings found" description="Add a new setting to get started" /></td></tr>
                ) : (
                  settings.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-3"><p className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">{s.key}</p></td>
                      <td className="py-3 px-3"><p className="text-sm text-gray-500 truncate max-w-[200px]">{s.value || ''}</p></td>
<td className="py-3 px-3"><span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500">{s.value_type}</span></td>
                       <td className="py-3 px-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                            <EditIcon /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SettingSection icon={NotificationsIcon} title="Notifications" description="Control how and when you receive notifications" color="indigo">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={draftSettings['enable.notifications'] !== 'false'} onChange={(e) => setDraftSettings(prev => ({ ...prev, 'enable.notifications': e.target.checked ? 'true' : 'false' }))} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
              <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Notifications</p><p className="text-xs text-gray-400">Show in-app notifications</p></div>
            </label>
<hr className="my-1 border-gray-200 dark:border-gray-700" />
            <div>
               <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Support Email</label>
              <input type="email" value={draftSettings['support.email'] || 'support@civictruth.io'} onChange={(e) => setDraftSettings(prev => ({ ...prev, 'support.email': e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
              <p className="text-xs text-gray-400 mt-1">Used for system notifications and support</p>
            </div>
            <div className="flex justify-end">
<button onClick={async () => { 
                 const ok1 = await saveSetting('enable.notifications', draftSettings['enable.notifications']); 
                 const ok2 = await saveSetting('support.email', draftSettings['support.email']); 
                 if (ok1 && ok2) { loadSettings(); refresh(); } 
               }} disabled={saving} className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all text-sm disabled:opacity-50">Save</button>
            </div>
          </SettingSection>

          <SettingSection icon={PaletteIcon} title="Appearance" description="Customize the look and feel of the application" color="pink">
              <div>
                 <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</label>
                 <Dropdown
                   value={draftSettings['app.theme'] || 'light'}
                   onChange={(val) => setDraftSettings(prev => ({ ...prev, 'app.theme': val }))}
                   options={[
                     { value: 'light', label: 'Light' },
                     { value: 'dark', label: 'Dark' },
                     { value: 'system', label: 'System Default' },
                   ]}
                 />
               </div>
            <div className="flex justify-end">
              <button onClick={async () => { const ok = await saveSetting('app.theme', draftSettings['app.theme']); if (ok) { loadSettings(); refresh(); } }} disabled={saving} className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 shadow-md shadow-pink-500/30 hover:shadow-lg hover:shadow-pink-500/40 transition-all text-sm disabled:opacity-50">Save</button>
            </div>
          </SettingSection>
        </div>

        <div>
          <SettingSection icon={SecurityIcon} title="Security" description="Enhance account protection and access control" color="red">
            <div>
               <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Timeout (minutes)</label>
              <input type="number" value={draftSettings['session.timeout'] || 30} onChange={(e) => setDraftSettings(prev => ({ ...prev, 'session.timeout': e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
              <p className="text-xs text-gray-400 mt-1">Auto-lock after inactivity</p>
            </div>
            <div className="flex justify-end">
<button onClick={async () => { 
                 const timeoutOk = await saveSetting('session.timeout', draftSettings['session.timeout']); 
                 if (timeoutOk) { loadSettings(); refresh(); }
               }} disabled={saving} className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 transition-all text-sm disabled:opacity-50">Save</button>
            </div>
          </SettingSection>

          <SettingSection icon={StorageIcon} title="System" description="System-wide configuration and limits" color="amber">
            <div>
               <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Rate Limit (req/min)</label>
              <input type="number" value={draftSettings['api.rate.limit'] || 100} onChange={(e) => setDraftSettings(prev => ({ ...prev, 'api.rate.limit': e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
              <p className="text-xs text-gray-400 mt-1">Maximum API requests per minute</p>
            </div>
            <div>
               <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Site Name</label>
              <input type="text" value={draftSettings['site.name'] || 'CivicTruth'} onChange={(e) => setDraftSettings(prev => ({ ...prev, 'site.name': e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm" />
            </div>
            <div className="flex justify-end">
              <button onClick={async () => { const ok = await saveSetting('api.rate.limit', draftSettings['api.rate.limit']); const ok2 = await saveSetting('site.name', draftSettings['site.name']); if (ok && ok2) { loadSettings(); refresh(); } }} disabled={saving} className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 transition-all text-sm disabled:opacity-50">Save</button>
            </div>
          </SettingSection>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditSetting(null); }} title="Edit Setting">
        {editSetting && (
          <SettingForm
            initial={{
              key: editSetting.key,
              value: editSetting.value || '',
              value_type: editSetting.value_type || 'string',
              description: editSetting.description || '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setEditOpen(false); setEditSetting(null); }}
            submitLabel="Update Setting"
            saving={saving}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
