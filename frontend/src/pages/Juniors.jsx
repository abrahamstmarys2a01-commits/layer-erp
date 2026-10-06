import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddEditJuniorModal } from '../components/modals/AddEditJuniorModal';
import { ViewJuniorModal } from '../components/modals/ViewJuniorModal';
import { formatDate } from '../utils/formatters';

export const Juniors = () => {
  const { juniors, deleteJunior, toggleJuniorStatus } = useERP();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [juniorToEdit, setJuniorToEdit] = useState(null);
  const [selectedJuniorForView, setSelectedJuniorForView] = useState(null);
  const [juniorToDelete, setJuniorToDelete] = useState(null);

  // Filtered Juniors
  const filteredJuniors = useMemo(() => {
    return juniors.filter((j) => {
      const matchesSearch =
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.mobile.includes(searchTerm) ||
        j.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.specialization && j.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || j.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [juniors, searchTerm, statusFilter]);

  // Paginated Juniors
  const totalPages = Math.ceil(filteredJuniors.length / pageSize);
  const paginatedJuniors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJuniors.slice(start, start + pageSize);
  }, [filteredJuniors, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setJuniorToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (junior) => {
    setJuniorToEdit(junior);
    setIsAddEditOpen(true);
  };

  const activeCount = juniors.filter((j) => j.status === 'Active').length;
  const inactiveCount = juniors.filter((j) => j.status === 'Inactive').length;

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Juniors</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage junior advocates and assigned cases.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAdd}>
          Add Junior
        </Button>
      </div>

      {/* Top Quick Status Pill Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total Juniors</span>
              <span className="text-xl font-bold text-navy-900">{juniors.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Active Advocates</span>
              <span className="text-xl font-bold text-emerald-800">{activeCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Inactive / Paused</span>
              <span className="text-xl font-bold text-slate-700">{inactiveCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search junior name, mobile, email, specialization..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-navy-600 focus:ring-1 focus:ring-navy-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:w-40 bg-slate-50 focus:bg-white text-xs text-slate-800 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchTerm || statusFilter) && (
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleResetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Juniors Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
        {filteredJuniors.length === 0 ? (
          <EmptyState
            title="No juniors found"
            description="No junior advocates match your current search or filter criteria."
            actionText="Add New Junior"
            actionIcon={Plus}
            onAction={handleAdd}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Junior Advocate</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Assigned Cases</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedJuniors.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 font-bold flex items-center justify-center shrink-0">
                            {j.name.replace('Adv. ', '')[0]}
                          </div>
                          <div>
                            <span className="font-bold text-navy-900 block">{j.name}</span>
                            <span className="text-[11px] text-slate-400">{j.specialization || 'Advocate'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">+91 {j.mobile}</td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">{j.email}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs">
                          <Briefcase className="w-3 h-3" />
                          {j.assignedCases || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={j.status}>{j.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(j.joinedDate)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedJuniorForView(j)}
                            className="p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors touch-target"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(j)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors touch-target"
                            title="Edit Junior"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleJuniorStatus(j.id)}
                            className={`p-2 rounded-lg transition-colors touch-target ${
                              j.status === 'Active'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={j.status === 'Active' ? 'Deactivate Junior' : 'Activate Junior'}
                          >
                            {j.status === 'Active' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setJuniorToDelete(j)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-red-50 transition-colors touch-target"
                            title="Delete Junior"
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
              totalItems={filteredJuniors.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Junior Modal */}
      <AddEditJuniorModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        juniorToEdit={juniorToEdit}
      />

      {/* View Junior Profile Modal */}
      <ViewJuniorModal
        isOpen={!!selectedJuniorForView}
        onClose={() => setSelectedJuniorForView(null)}
        junior={selectedJuniorForView}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!juniorToDelete}
        onClose={() => setJuniorToDelete(null)}
        onConfirm={() => juniorToDelete && deleteJunior(juniorToDelete.id)}
        title="Delete Junior Advocate"
        message={`Are you sure you want to remove ${juniorToDelete?.name} from your practice roster?`}
      />
    </div>
  );
};
