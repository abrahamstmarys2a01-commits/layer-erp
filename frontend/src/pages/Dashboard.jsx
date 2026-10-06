import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Briefcase,
  Scale,
  Calendar,
  IndianRupee,
  Eye,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { useERP } from '../context/ERPContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WhatsAppModal } from '../components/modals/WhatsAppModal';
import { formatINR, formatDate } from '../utils/formatters';

// Monthly Case Overview Data
const caseOverviewData = [
  { month: 'May', New: 14, Active: 48, Closed: 8 },
  { month: 'Jun', New: 18, Active: 62, Closed: 12 },
  { month: 'Jul', New: 22, Active: 78, Closed: 15 },
  { month: 'Aug', New: 25, Active: 95, Closed: 19 },
  { month: 'Sep', New: 30, Active: 120, Closed: 24 },
  { month: 'Oct', New: 36, Active: 142, Closed: 28 },
];

// Monthly Amount Collection Data
const amountCollectionData = [
  { month: 'May', amount: 145000 },
  { month: 'Jun', amount: 180000 },
  { month: 'Jul', amount: 215000 },
  { month: 'Aug', amount: 260000 },
  { month: 'Sep', amount: 310000 },
  { month: 'Oct', amount: 174500 },
];

export const Dashboard = () => {
  const { stats, juniors, cases, amounts, hearings } = useERP();
  const navigate = useNavigate();

  const [selectedHearingForWhatsApp, setSelectedHearingForWhatsApp] = useState(null);

  // Junior-wise case data for horizontal bar chart
  const juniorWiseData = juniors.map((j) => ({
    name: j.name.replace('Adv. ', ''),
    cases: j.assignedCases || 0,
    active: j.activeCases || 0
  })).sort((a, b) => b.cases - a.cases).slice(0, 5);

  // Upcoming hearings (within next 7-14 days)
  const upcomingHearingsList = hearings
    .filter((h) => h.status === 'Upcoming' || h.status === 'Today')
    .slice(0, 6);

  // Recent cases
  const recentCasesList = cases.slice(0, 5);

  // Recent amount entries
  const recentAmountsList = amounts.slice(0, 5);
  const totalRecentAmount = recentAmountsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Overview of your legal practice</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/amounts')}
            icon={IndianRupee}
          >
            Record Payment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={Plus}
          >
            New Case
          </Button>
        </div>
      </div>

      {/* Top 6 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          value={stats.totalJuniors ?? 0}
          label="Total Juniors"
          change={`${stats.totalJuniors ?? 0} registered`}
          changeType="neutral"
          onClick={() => navigate('/juniors')}
        />
        <StatCard
          value={stats.activeJuniors ?? 0}
          label="Active Juniors"
          change={`${stats.activeJuniors ?? 0} active`}
          changeType="neutral"
          onClick={() => navigate('/juniors')}
        />
        <StatCard
          value={stats.totalCases ?? 0}
          label="Total Cases"
          change={`${stats.totalCases ?? 0} cases`}
          changeType="neutral"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          value={stats.activeCases ?? 0}
          label="Active Cases"
          change={`${stats.activeCases ?? 0} active`}
          changeType="neutral"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          value={stats.upcomingHearings ?? 0}
          label="Upcoming Hearings"
          change="Court calendar"
          changeType="neutral"
          onClick={() => navigate('/hearings')}
        />
        <StatCard
          value={formatINR(stats.totalAmountReceived ?? 0)}
          label="Total Received"
          change="Verified receipts"
          changeType="neutral"
          onClick={() => navigate('/amounts')}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Cases Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Cases Overview</h3>
              <p className="text-[11px] text-slate-500">Breakdown of active, new and closed matters</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Current Session
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b192c', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="New" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Active" fill="#0B192C" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Closed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Amount Collection (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Amount Collection</h3>
              <p className="text-[11px] text-slate-500">Fee retainers and billing</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              INR (₹)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={amountCollectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [formatINR(v), 'Collected']}
                  contentStyle={{ backgroundColor: '#0b192c', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#amountGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Upcoming Hearings (Full Width Clean Table) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Upcoming Hearings</h3>
            <p className="text-[11px] text-slate-500">High Court & District court listed appearance calendar</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hearings')}
          >
            View All Hearings
          </Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Junior</th>
                <th className="py-2.5 px-3">Court</th>
                <th className="py-2.5 px-3">Hearing Date</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingHearingsList.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-navy-900">{h.caseId}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{h.clientName}</td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">{h.junior}</td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-[140px]">{h.court}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{formatDate(h.hearingDate)}</td>
                  <td className="py-3 px-3 text-slate-600">{h.time}</td>
                  <td className="py-3 px-3">
                    <Badge status={h.status}>{h.status}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedHearingForWhatsApp(h)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors border border-emerald-200"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send</span>
                    </button>
                  </td>
                </tr>
              ))}
              {upcomingHearingsList.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No upcoming hearings scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Recent Cases & Recent Amount Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Cases (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Cases</h3>
              <p className="text-[11px] text-slate-500">Newly instituted petitions and active matters</p>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Cases <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Case Type</th>
                  <th className="py-2.5 px-3">Court</th>
                  <th className="py-2.5 px-3">Assigned Junior</th>
                  <th className="py-2.5 px-3">Next Hearing</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCasesList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-navy-900">{c.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{c.clientName}</td>
                    <td className="py-3 px-3">
                      <Badge status={c.caseType}>{c.caseType}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">{c.court}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">{c.assignedJunior}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(c.nextHearingDate)}</td>
                    <td className="py-3 px-3">
                      <Badge status={c.caseStatus}>{c.caseStatus}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="p-1 rounded-md text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        title="View Case Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {recentCasesList.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No cases recorded yet. Click &quot;New Case&quot; above to create your first case.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Amount Entries (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Amount Entries</h3>
              <p className="text-[11px] text-slate-500">
                Total in batch: <span className="font-bold text-emerald-700">{formatINR(totalRecentAmount)}</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/amounts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Receipts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Added By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAmountsList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-navy-900">{a.caseId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 truncate max-w-[100px]">{a.clientName}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-700">{formatINR(a.amount)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(a.paymentDate)}</td>
                    <td className="py-3 px-3">
                      <Badge status={a.paymentMode}>{a.paymentMode}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] truncate max-w-[90px]">{a.addedBy}</td>
                  </tr>
                ))}
                {recentAmountsList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No payment receipts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={!!selectedHearingForWhatsApp}
        onClose={() => setSelectedHearingForWhatsApp(null)}
        hearing={selectedHearingForWhatsApp}
      />
    </div>
  );
};
