import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../context/ERPContext';
import {
  Briefcase,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  CreditCard,
  User
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddEditCaseModal } from '../components/modals/AddEditCaseModal';
import { ClientHistoryModal } from '../components/modals/ClientHistoryModal';
import { formatDate } from '../utils/formatters';

export const Cases = () => {
  const { cases, juniors, deleteCase, settings } = useERP();
  const navigate = useNavigate();

  // Multi-Filter Bar State
  const [searchTerm, setSearchTerm] = useState('');
  const [juniorFilter, setJuniorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [hearingDateFilter, setHearingDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);

  const juniorOptions = juniors.map((j) => j.name);
  const caseTypeOptions = settings?.caseSettings?.caseTypes || [
    'Civil',
    'Criminal',
    'Family',
    'Property',
    'Corporate',
    'Labour',
    'Consumer',
    'Other'
  ];
  const courtOptions = settings?.caseSettings?.courts || [
    'Madras High Court',
    'District Court',
    'Sessions Court',
    'Magistrate Court',
    'Family Court',
    'NCLT Chennai Bench',
    'Labour Court'
  ];

  // Filtering Logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.id.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        (c.clientMobile && c.clientMobile.includes(searchTerm)) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(q));

      const matchesJunior = !juniorFilter || (c.assignedJunior && c.assignedJunior === juniorFilter);
      const matchesStatus = !statusFilter || c.caseStatus === statusFilter;
      const matchesType = !typeFilter || c.caseType === typeFilter;
      const matchesCourt = !courtFilter || c.court === courtFilter;
      const matchesDate = !hearingDateFilter || (c.nextHearingDate && c.nextHearingDate.startsWith(hearingDateFilter));

      return matchesSearch && matchesJunior && matchesStatus && matchesType && matchesCourt && matchesDate;
    });
  }, [cases, searchTerm, juniorFilter, statusFilter, typeFilter, courtFilter, hearingDateFilter]);

  // Paginated cases
  const totalPages = Math.ceil(filteredCases.length / pageSize);
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const handleReset = () => {
    setSearchTerm('');
    setJuniorFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setCourtFilter('');
    setHearingDateFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setCaseToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (c) => {
    setCaseToEdit(c);
    setIsAddEditOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header & New Case Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">Case Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage litigation files, court assignments, and status</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAdd} className="w-full sm:w-auto justify-center">
          Add Case
        </Button>
      </div>

      {/* Advanced Filter Bar (Responsive Grid) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-900 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Search & Multi-Filters</span>
          </div>
          {(searchTerm || juniorFilter || statusFilter || typeFilter || courtFilter || hearingDateFilter) && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Case ID / Client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none min-h-[42px]"
            />
          </div>

          {/* Junior Filter */}
          <select
            value={juniorFilter}
            onChange={(e) => {
              setJuniorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="">All Juniors</option>
            {juniorOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="">All Case Statuses</option>
            <option value="New">New</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="">All Case Types</option>
            {caseTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Court Filter */}
          <select
            value={courtFilter}
            onChange={(e) => {
              setCourtFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="">All Courts</option>
            {courtOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Hearing Date Filter */}
          <input
            type="date"
            placeholder="Hearing Date"
            value={hearingDateFilter}
            onChange={(e) => {
              setHearingDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer min-h-[42px]"
          />
        </div>
      </div>

      {/* Case Table (Responsive Table Container) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {filteredCases.length === 0 ? (
          <EmptyState
            title="No cases found"
            description="No legal cases match your selected filter criteria."
            actionText="Create New Case"
            actionIcon={Plus}
            onAction={handleAdd}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Case Type</th>
                    <th className="py-3 px-4">Court</th>
                    <th className="py-3 px-4">Assigned Junior</th>
                    <th className="py-3 px-4">Next Hearing</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-navy-900 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          {c.id}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <span className="font-semibold text-slate-800 block">{c.clientName}</span>
                            <span className="text-[11px] text-slate-400 block">{c.clientMobile}</span>
                          </div>
                          <button
                            onClick={() => setSelectedClientForHistory(c)}
                            className="p-1 rounded-md text-slate-400 hover:text-navy-900 hover:bg-slate-100"
                            title="View Client History"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={c.caseType}>{c.caseType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">{c.court}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[130px]">
                        {c.assignedJunior || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(c.nextHearingDate)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={c.amountStatus}>{c.amountStatus || 'Pending'}</Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge status={c.caseStatus}>{c.caseStatus}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/cases/${c.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 cursor-pointer touch-target inline-flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer touch-target inline-flex items-center justify-center"
                            title="Edit Case"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCaseToDelete(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer touch-target inline-flex items-center justify-center"
                            title="Delete Case"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Case Modal */}
      {isAddEditOpen && (
        <AddEditCaseModal
          isOpen={isAddEditOpen}
          onClose={() => {
            setIsAddEditOpen(false);
            setCaseToEdit(null);
          }}
          caseData={caseToEdit}
        />
      )}

      {/* Client 360 History Modal */}
      {selectedClientForHistory && (
        <ClientHistoryModal
          isOpen={!!selectedClientForHistory}
          onClose={() => setSelectedClientForHistory(null)}
          clientName={selectedClientForHistory.clientName}
          clientMobile={selectedClientForHistory.clientMobile}
        />
      )}

      {/* Delete Confirmation */}
      {caseToDelete && (
        <ConfirmDialog
          isOpen={!!caseToDelete}
          onClose={() => setCaseToDelete(null)}
          onConfirm={() => {
            deleteCase(caseToDelete.id);
            setCaseToDelete(null);
          }}
          title="Delete Case"
          message={`Are you sure you want to delete case "${caseToDelete.id} - ${caseToDelete.clientName}"? This action cannot be undone.`}
          confirmText="Delete Case"
          variant="danger"
        />
      )}
    </div>
  );
};
