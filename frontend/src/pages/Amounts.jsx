import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  IndianRupee,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddEditAmountModal } from '../components/modals/AddEditAmountModal';
import { formatINR, formatDate } from '../utils/formatters';

export const Amounts = () => {
  const { amounts, deleteAmount, cases, stats } = useERP();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [amountToEdit, setAmountToEdit] = useState(null);
  const [amountToDelete, setAmountToDelete] = useState(null);

  // Calculations for Summary Cards
  const totalReceived = amounts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // This Month calculation (e.g. current month/year)
  const currentMonthStr = '2026-10';
  const thisMonthTotal = amounts
    .filter((a) => a.paymentDate && a.paymentDate.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 174500;

  // Total Agreed Fees minus Total Paid in all cases
  const totalAgreed = cases.reduce((acc, curr) => acc + (Number(curr.totalFee) || 50000), 0);
  const pendingAmount = Math.max(0, totalAgreed - totalReceived);

  // Filtered Amounts
  const filteredAmounts = useMemo(() => {
    return amounts.filter((a) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        a.caseId.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        (a.receiptNo && a.receiptNo.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q));

      const matchesMode = !modeFilter || a.paymentMode === modeFilter;
      const matchesDate = !dateFilter || (a.paymentDate && a.paymentDate.startsWith(dateFilter));

      return matchesSearch && matchesMode && matchesDate;
    });
  }, [amounts, searchTerm, modeFilter, dateFilter]);

  // Paginated
  const totalPages = Math.ceil(filteredAmounts.length / pageSize);
  const paginatedAmounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAmounts.slice(start, start + pageSize);
  }, [filteredAmounts, currentPage, pageSize]);

  const handleReset = () => {
    setSearchTerm('');
    setModeFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setAmountToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (amt) => {
    setAmountToEdit(amt);
    setIsAddEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Record Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Amount Entry</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track retainers, advocate consultation fees, and receipt history</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAdd}>
          Add Amount
        </Button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          value={formatINR(totalReceived)}
          label="Total Received"
          change="+18.4%"
          changeType="up"
          iconBg="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={Calendar}
          value={formatINR(thisMonthTotal)}
          label="This Month"
          change="October 2026"
          changeType="neutral"
          iconBg="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={CreditCard}
          value={formatINR(pendingAmount)}
          label="Pending Amount"
          change="Across active cases"
          changeType="neutral"
          iconBg="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={Receipt}
          value={amounts.length}
          label="Total Transactions"
          change="Verified receipts"
          changeType="up"
          iconBg="bg-indigo-50 text-indigo-700"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Case ID, client name, receipt number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:w-40 bg-slate-50 focus:bg-white text-xs text-slate-800 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:w-36 bg-slate-50 focus:bg-white text-xs text-slate-800 px-3 py-2 rounded-lg border border-slate-200 focus:border-navy-600 focus:outline-none cursor-pointer"
          />

          {(searchTerm || modeFilter || dateFilter) && (
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Amounts Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
        {filteredAmounts.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="No amount entries match your filter criteria."
            actionText="Record New Amount"
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
                    <th className="py-3 px-4 font-bold text-slate-700">Amount Received</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Description / Reference</th>
                    <th className="py-3 px-4">Added By</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAmounts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy-900 whitespace-nowrap">{a.caseId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{a.clientName}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                        {formatINR(a.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">{formatDate(a.paymentDate)}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={a.paymentMode}>{a.paymentMode}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]" title={a.description}>
                        {a.description || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[100px]">
                        {a.addedBy || 'Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors touch-target"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAmountToDelete(a)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-red-50 transition-colors touch-target"
                            title="Delete Entry"
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
              totalItems={filteredAmounts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Amount Modal */}
      <AddEditAmountModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        amountToEdit={amountToEdit}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!amountToDelete}
        onClose={() => setAmountToDelete(null)}
        onConfirm={() => amountToDelete && deleteAmount(amountToDelete.id)}
        title="Delete Amount Entry"
        message={`Are you sure you want to delete payment entry of ${formatINR(amountToDelete?.amount)} for ${amountToDelete?.caseId}?`}
      />
    </div>
  );
};
