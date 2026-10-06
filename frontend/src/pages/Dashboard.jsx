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

  // Upcoming hearings
  const upcomingHearingsList = hearings
    .filter((h) => h.status === 'Upcoming' || h.status === 'Today')
    .slice(0, 6);

  // Recent cases
  const recentCasesList = cases.slice(0, 5);

  // Recent amount entries
  const recentAmountsList = amounts.slice(0, 5);
  const totalRecentAmount = recentAmountsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Overview of your legal practice</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/amounts')}
            icon={IndianRupee}
            className="flex-1 sm:flex-initial justify-center"
          >
            Record Payment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={Plus}
            className="flex-1 sm:flex-initial justify-center"
          >
            New Case
          </Button>
        </div>
      </div>

      {/* Top 6 Summary KPI Cards (Responsive Grid: 1 col on mobile -> 2 on sm -> 3 on md/lg -> 6 on xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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

      {/* Chart Section (Stacks on mobile/tablet, 2-col on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Chart 1: Cases Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Cases Overview</h3>
              <p className="text-[11px] text-slate-500">Breakdown of active, new and closed matters</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Current Session
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
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
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Amount Collection</h3>
              <p className="text-[11px] text-slate-500">Fee retainers and billing</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              INR (₹)
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
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

      {/* Row 2: Upcoming Hearings Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Upcoming Hearings</h3>
            <p className="text-[11px] text-slate-500">High Court & District court listed appearance calendar</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hearings')}
            className="self-start sm:self-auto"
          >
            View All Hearings
          </Button>
        </div>

        {/* Responsive Table with Touch Horizontal Scroll */}
        <div className="table-responsive -mx-4 sm:-mx-5 px-4 sm:px-5">
          <table className="w-full text-left text-xs min-w-[620px]">
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
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors border border-emerald-200 cursor-pointer touch-target"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Recent Cases (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Cases</h3>
              <p className="text-[11px] text-slate-500">Newly instituted petitions and active matters</p>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              All Cases <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="table-responsive -mx-4 sm:-mx-5 px-4 sm:px-5">
            <table className="w-full text-left text-xs min-w-[560px]">
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
                        className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 cursor-pointer touch-target inline-flex items-center justify-center"
                        title="View Case Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Amount Entries (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Collections</h3>
              <p className="text-[11px] text-slate-500">Latest fee retainers & receipts</p>
            </div>
            <button
              onClick={() => navigate('/amounts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              All Receipts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAmountsList.map((amt) => (
              <div
                key={amt.id}
                className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-navy-900">{amt.caseId}</span>
                    <Badge status={amt.paymentMode}>{amt.paymentMode}</Badge>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{amt.clientName}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(amt.paymentDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-600 block">
                    {formatINR(amt.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{amt.receiptNo}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Recent Total</span>
            <span className="text-sm font-extrabold text-navy-900">{formatINR(totalRecentAmount)}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal for Direct Notification */}
      {selectedHearingForWhatsApp && (
        <WhatsAppModal
          hearing={selectedHearingForWhatsApp}
          isOpen={!!selectedHearingForWhatsApp}
          onClose={() => setSelectedHearingForWhatsApp(null)}
        />
      )}
    </div>
  );
};
