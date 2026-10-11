import { useState, useEffect } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { participantsAPI, blockchainAPI } from '../services/api';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import EmptyState from '../components/shared/EmptyState';

function getInitials(name) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2); }

function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function PeopleIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="16" cy="7" r="4"/></svg>; }
function StorageIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>; }
function VerifyIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>; }
function ArrowBackIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function ViewIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }

export default function ParticipantDetail() {
  const { participantId } = useParams();
  const [participant, setParticipant] = useState(null);
  const [entries, setEntries] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, [participantId]);

  const loadData = async () => {
    try {
      setError(null);
      const [cRes, eRes, aRes] = await Promise.all([
        participantsAPI.list(),
        blockchainAPI.list(),
        blockchainAPI.verifyChain().catch(() => ({ data: null })),
      ]);
      const found = (cRes.data || []).find((p) => p.id === participantId);
      setParticipant(found);
      const participantEntries = (eRes.data || []).filter((e) => e.participant_id === participantId);
      setEntries(participantEntries);
      setChainStatus(aRes.data);
    } catch (e) { console.error(e); setError('Failed to load participant data.'); }
    setLoading(false);
  };

  if (!participantId) return <Navigate to="/" replace />;

  return (
    <PageContainer>
      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      <PageHeader
        title={loading ? <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-64" /> : participant?.full_name || 'Participant Detail'}
        subtitle={loading ? <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-80" /> : `${entries.length} transactions archived | Registered ${participant?.created_at ? new Date(participant.created_at).toLocaleDateString() : ''}`}
        action={
          <Link to="/participants" className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-semibold text-sm flex items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            <ArrowBackIcon /> Back to Participants
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-wrap">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-500 text-white text-2xl font-bold flex items-center justify-center">
                  {participant?.full_name ? getInitials(participant.full_name) : '?'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-800 ${participant?.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                  {participant?.is_active ? <VerifyIcon /> : <PeopleIcon />}
                </div>
              </div>
            </div>
            <div className="text-center mb-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{participant?.full_name}</h3>
              <p className="text-sm text-gray-400">{participant?.email || 'No email'}</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${participant?.is_active ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{participant?.is_active ? 'Active' : 'Inactive'}</span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-500">{participant?.role || 'participant'}</span>
              </div>
            </div>
            <hr className="mb-4 border-gray-200 dark:border-gray-700" />
            <div className="flex flex-col gap-3">
              <div className="flex justify-between"><span className="text-sm text-gray-400">National ID</span><span className="text-sm font-semibold font-mono text-gray-600 dark:text-gray-300">{participant?.national_id_hash?.slice(0, 16)}...</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">Registered</span><span className="text-sm font-semibold">{participant?.created_at ? new Date(participant.created_at).toLocaleDateString() : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">Transactions</span><span className="text-sm font-semibold">{entries.length}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">Chain Status</span><span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${chainStatus?.valid ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{chainStatus?.valid ? 'Valid' : 'Unknown'}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <StorageIcon />
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Transaction Archive</h3>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{entries.length} blocks</span>
            </div>

            {loading ? (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ) : entries.length === 0 ? (
              <EmptyState title="No transactions" description="This participant has no archived transactions yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      {['Type', 'Hash', 'Created', 'Actions'].map((h) => (
                        <th key={h} className="font-semibold uppercase text-[0.75rem] text-gray-400 py-3 px-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="py-3 px-3"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600">{entry.transaction_type}</span></td>
                         <td className="py-3 px-3"><p className="text-xs font-mono text-gray-400">{entry.block_hash?.slice(0, 24)}...</p></td>
                        <td className="py-3 px-3"><p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</p></td>
                        <td className="py-3 px-3 text-right">
                          <button className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" aria-label="Verify">
                            <VerifyIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}