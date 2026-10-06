import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Search,
  RotateCcw,
  MessageSquare,
  Edit2,
  Trash2,
  Clock,
  Landmark,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddEditHearingModal } from '../components/modals/AddEditHearingModal';
import { WhatsAppModal } from '../components/modals/WhatsAppModal';
import { formatDate } from '../utils/formatters';

export const Hearings = () => {
  const { hearings, deleteHearing, juniors, settings } = useERP();

  // View mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('list');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [juniorFilter, setJuniorFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Calendar month state (October 2026)
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 9, 1)); // Oct 2026

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [hearingToEdit, setHearingToEdit] = useState(null);
  const [hearingToDelete, setHearingToDelete] = useState(null);
  const [selectedHearingForWhatsApp, setSelectedHearingForWhatsApp] = useState(null);

  const juniorOptions = juniors.map((j) => j.name);
  const courtOptions = settings?.caseSettings?.courts || [
    'Madras High Court',
    'District Court',
    'Sessions Court',
    'Magistrate Court',
    'Family Court'
  ];

  // Summary counts
  const upcomingCount = hearings.filter((h) => h.status === 'Upcoming').length;
  const todayCount = hearings.filter((h) => h.status === 'Today').length;
  const completedCount = hearings.filter((h) => h.status === 'Completed').length;
  const adjournedCount = hearings.filter((h) => h.status === 'Adjourned').length;

  // Filtered Hearings
  const filteredHearings = useMemo(() => {
    return hearings.filter((h) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        h.caseId.toLowerCase().includes(q) ||
        h.clientName.toLowerCase().includes(q) ||
        (h.notes && h.notes.toLowerCase().includes(q));

      const matchesJunior = !juniorFilter || h.junior === juniorFilter;
      const matchesCourt = !courtFilter || h.court === courtFilter;
      const matchesStatus = !statusFilter || h.status === statusFilter;
      const matchesDate = !dateFilter || (h.hearingDate && h.hearingDate.startsWith(dateFilter));

      return matchesSearch && matchesJunior && matchesCourt && matchesStatus && matchesDate;
    });
  }, [hearings, searchTerm, juniorFilter, courtFilter, statusFilter, dateFilter]);

  // Paginated
  const totalPages = Math.ceil(filteredHearings.length / pageSize);
  const paginatedHearings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHearings.slice(start, start + pageSize);
  }, [filteredHearings, currentPage, pageSize]);

  const handleReset = () => {
    setSearchTerm('');
    setJuniorFilter('');
    setCourtFilter('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setHearingToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (h) => {
    setHearingToEdit(h);
    setIsAddEditOpen(true);
  };

  // Calendar generation helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Hearing Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Court schedule, bench listings, and WhatsApp reminders</p>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Calendar Toggle */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleAdd}>
            Add Hearing
          </Button>
        </div>
      </div>

      {/* Top Summary Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Upcoming</span>
          <span className="text-2xl font-black text-navy-900 mt-1 block">{upcomingCount}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Today's Listed</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{todayCount}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">{completedCount}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Adjourned</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{adjournedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Case ID / Client..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <select
            value={juniorFilter}
            onChange={(e) => {
              setJuniorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 focus:bg-white text-xs text-slate-800 px-2.5 py-2 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Juniors</option>
            {juniorOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <select
            value={courtFilter}
            onChange={(e) => {
              setCourtFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 focus:bg-white text-xs text-slate-800 px-2.5 py-2 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Courts</option>
            {courtOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 focus:bg-white text-xs text-slate-800 px-2.5 py-2 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Today">Today</option>
            <option value="Completed">Completed</option>
            <option value="Adjourned">Adjourned</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 focus:bg-white text-xs text-slate-800 px-2 py-2 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          />
        </div>

        {(searchTerm || juniorFilter || courtFilter || statusFilter || dateFilter) && (
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset} className="self-end md:self-auto">
            Reset
          </Button>
        )}
      </div>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
          {filteredHearings.length === 0 ? (
            <EmptyState
              title="No hearings found"
              description="No court appearances match your selected filter criteria."
              actionText="Schedule New Hearing"
              actionIcon={Plus}
              onAction={handleAdd}
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="w-full text-left text-xs min-w-[820px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Case ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Junior</th>
                      <th className="py-3 px-4">Court / Hall</th>
                      <th className="py-3 px-4">Hearing Date</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Hearing Stage</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">WhatsApp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedHearings.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-navy-900 whitespace-nowrap">{h.caseId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{h.clientName}</td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[120px]">{h.junior}</td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">
                          <span className="block font-medium">{h.court}</span>
                          {h.courtHall && <span className="text-[10px] text-slate-400">{h.courtHall}</span>}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{formatDate(h.hearingDate)}</td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{h.time}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium">{h.hearingType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={h.status}>{h.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedHearingForWhatsApp(h)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors border border-emerald-200 touch-target"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(h)}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors touch-target"
                              title="Edit Hearing"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setHearingToDelete(h)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-red-50 transition-colors touch-target"
                              title="Delete Hearing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredHearings.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* VIEW 2: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-card p-3.5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-navy-900">
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors touch-target"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date(2026, 9, 1))}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors touch-target"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors touch-target"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="table-responsive">
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 min-w-[560px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-slate-50 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-500 uppercase">
                  {day}
                </div>
              ))}

              {daysArray.map((dayNum, idx) => {
                if (!dayNum) {
                  return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[90px] sm:min-h-[100px] p-1.5 sm:p-2" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayHearings = hearings.filter((h) => h.hearingDate === dateStr);
                const isToday = dayNum === 5 && month === 9 && year === 2026;

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`bg-white min-h-[95px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                      isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayHearings.length > 0 && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full">
                          {dayHearings.length}
                        </span>
                      )}
                    </div>

                    {/* Hearing Badges in Date Cell */}
                    <div className="space-y-1 my-1 overflow-y-auto max-h-20">
                      {dayHearings.map((dh) => (
                        <div
                          key={dh.id}
                          onClick={() => setSelectedHearingForWhatsApp(dh)}
                          className="text-[9px] sm:text-[10px] p-1 rounded bg-navy-900 text-white font-medium cursor-pointer hover:bg-navy-800 truncate shadow-2xs"
                          title={`${dh.caseId} – ${dh.clientName} (${dh.time})`}
                        >
                          <span className="font-bold text-blue-300">{dh.caseId}</span> {dh.clientName}
                        </div>
                      ))}
                    </div>

                    <div />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditHearingModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        hearingToEdit={hearingToEdit}
      />

      <WhatsAppModal
        isOpen={!!selectedHearingForWhatsApp}
        onClose={() => setSelectedHearingForWhatsApp(null)}
        hearing={selectedHearingForWhatsApp}
      />

      <ConfirmDialog
        isOpen={!!hearingToDelete}
        onClose={() => setHearingToDelete(null)}
        onConfirm={() => hearingToDelete && deleteHearing(hearingToDelete.id)}
        title="Delete Hearing Record"
        message={`Are you sure you want to delete hearing scheduled for ${hearingToDelete?.caseId}?`}
      />
    </div>
  );
};
