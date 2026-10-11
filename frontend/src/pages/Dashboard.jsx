import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { participantsAPI, blockchainAPI } from '../services/api';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import EmptyState from '../components/shared/EmptyState';
import { StatusBadge, ScoreBar } from '../components/shared/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../components/shared/Skeletons';

function PeopleIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function StorageIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
}
function ShieldCheckIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11.5 14.5 16 9"/></svg>;
}
function FileTextIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function ActivityIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}

const colorVariants = {
  indigo: { bar: 'from-indigo-500 to-indigo-600', icon: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { bar: 'from-emerald-500 to-emerald-600', icon: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bar: 'from-blue-500 to-blue-600', icon: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  amber: { bar: 'from-amber-500 to-amber-600', icon: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  red: { bar: 'from-red-500 to-red-600', icon: 'bg-red-500', light: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
};

function StatCard({ title, value, icon, variant = 'indigo', loading }) {
  const colors = colorVariants[variant] || colorVariants.indigo;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.bar}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${colors.icon}`}>
          {icon}
        </div>
      </div>
      <div className="font-bold text-2xl text-gray-800 dark:text-gray-100 leading-tight mb-1">
        {loading ? <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-24" /> : value}
      </div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">{title}</div>
    </div>
  );
}

function ChainIntegrityCard({ status, loading, onRefresh }) {
  const isValid = status?.valid;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isValid ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {isValid ? <ShieldCheckIcon /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">Chain Integrity</h3>
            <p className="text-xs text-gray-400">{status ? `${status.blocks_checked} blocks verified` : 'Not checked yet'}</p>
          </div>
        </div>
        <button onClick={onRefresh} disabled={loading} className="p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all" aria-label="Refresh status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      ) : status ? (
        <div className="flex flex-col gap-4">
          <div className={`p-4 rounded-xl border ${isValid ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
            <p className="font-bold text-sm mb-1">{isValid ? 'Blockchain is Valid and Secure' : 'Blockchain Integrity Compromised'}</p>
            <p className="text-xs text-gray-400">{isValid ? 'All blocks are intact and verified' : 'Some blocks may have been tampered with'}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total Blocks</p>
              <p className="font-bold text-xl text-gray-800 dark:text-gray-100 leading-tight">{status.blocks_checked}</p>
            </div>
            <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</p>
              <StatusBadge status={isValid ? 'Valid' : 'Invalid'} variant="filled" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase">Integrity Score</p>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{isValid ? '100%' : '0%'}</p>
            </div>
            <ScoreBar value={isValid ? 100 : 0} variant={isValid ? 'success' : 'error'} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <p className="text-sm text-gray-400 max-w-[240px]">Click refresh to check blockchain integrity status</p>
          <button onClick={onRefresh} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            Check Now
          </button>
        </div>
      )}
    </div>
  );
}

function RecentActivityCard({ entries, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <ActivityIcon />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">Recent Blockchain Entries</h3>
          <p className="text-xs text-gray-400">{entries.length} total{entries.length > 10 && ' showing latest 10'}</p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[420px]">
        {loading ? (
          <SkeletonTable rows={5} columns={4} />
        ) : entries.length === 0 ? (
          <EmptyState title="No blocks yet" description="Create your first block to see it here" actionLabel="Go to Blockchain" actionPath="/blockchain" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                {['Participant', 'Type', 'Created', 'Action'].map((h) => (
                  <th key={h} className="font-semibold text-xs text-gray-400 py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">
                        {(entry.participant_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-tight">{entry.participant_name || entry.participant_id}</p>
                        <p className="text-[0.7rem] text-gray-400 font-mono">{entry.participant_id?.slice(0, 16)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold border border-gray-200 dark:border-gray-700">{entry.transaction_type}</span>
                  </td>
                  <td className="py-3 px-3"><p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></td>
                  <td className="py-3 px-3 text-right">
                    <Link to="/verify" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors no-underline">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ParticipantManagementCard({ participants, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <PeopleIcon />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">Registered Participants</h3>
          <p className="text-xs text-gray-400">{participants.length} total{participants.length > 10 && ' showing latest 10'}</p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[420px]">
        {loading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : participants.length === 0 ? (
          <table className="w-full">
            <tbody>
              <tr><td colSpan={3}><EmptyState title="No participants yet" description="Register participants to see them here" /></td></tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                {['Participant', 'Status', 'ID'].map((h) => (
                  <th key={h} className="font-semibold uppercase text-[0.7rem] text-gray-400 py-3 px-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">
                        {p.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-tight">{p.full_name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={p.is_active ? 'Active' : 'Inactive'} variant={p.is_active ? 'filled' : 'outlined'} /></td>
                  <td className="py-3 px-3"><p className="text-xs font-mono text-gray-400">{p.national_id_hash?.slice(0, 20)}...</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [pRes, bRes, eRes] = await Promise.all([
        participantsAPI.list(),
        blockchainAPI.verifyChain().catch(() => ({ data: null })),
        blockchainAPI.list().catch(() => ({ data: [] })),
      ]);
      setParticipants(pRes.data || []);
      setChainStatus(bRes.data);
      setEntries(eRes.data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load dashboard data. Please try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Admin Dashboard" subtitle="Monitor and manage the CivicTruth immutable blockchain system" breadcrumbs={[{ label: 'Dashboard' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><div className="h-[420px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse" /></div>
        <div className="lg:col-span-1"><div className="h-[420px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse" /></div>
      </div>
      <div className="mt-4"><div className="h-[420px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse" /></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor and manage the CivicTruth immutable blockchain system"
        breadcrumbs={[{ label: 'Dashboard' }]}
        action={
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? 'animate-spin' : ''}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { title: 'Registered Participants', value: participants.length, icon: <PeopleIcon />, variant: 'indigo' },
          { title: 'Chain Integrity', value: chainStatus?.valid ? 'Secure' : 'Compromised', icon: <ShieldCheckIcon />, variant: chainStatus?.valid ? 'emerald' : 'red' },
          { title: 'Total Documents', value: entries.length, icon: <FileTextIcon />, variant: 'blue' },
          { title: 'Active Participants', value: participants.filter(p => p.is_active).length, icon: <ActivityIcon />, variant: 'amber' },
        ].map((card, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              variant={card.variant}
              loading={loading}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivityCard entries={entries} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <ChainIntegrityCard status={chainStatus} loading={refreshing} onRefresh={handleRefresh} />
        </div>
      </div>

      <div className="mt-4">
        <ParticipantManagementCard participants={participants} loading={loading} />
      </div>
    </PageContainer>
  );
}
