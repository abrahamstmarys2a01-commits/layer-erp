import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useERP } from '../../context/ERPContext';
import { IndianRupee, Briefcase, Calendar, CreditCard, User, FileText, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const AddEditAmountModal = ({ isOpen, onClose, amountToEdit, initialCaseId }) => {
  const { cases, addAmount, updateAmount } = useERP();

  const [formData, setFormData] = useState({
    caseId: '',
    clientName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
    description: '',
    addedBy: 'Admin'
  });

  const [errors, setErrors] = useState({});

  const caseOptions = cases.map((c) => ({
    value: c.id,
    label: `${c.id} – ${c.clientName} (${c.caseType} • ${c.court})`
  }));

  const selectedCaseData = cases.find((c) => c.id === formData.caseId);

  useEffect(() => {
    if (amountToEdit) {
      setFormData({
        caseId: amountToEdit.caseId || '',
        clientName: amountToEdit.clientName || '',
        amount: amountToEdit.amount?.toString() || '',
        paymentDate: amountToEdit.paymentDate || new Date().toISOString().split('T')[0],
        paymentMode: amountToEdit.paymentMode || 'UPI',
        description: amountToEdit.description || '',
        addedBy: amountToEdit.addedBy || 'Admin'
      });
    } else {
      const selectedCase = initialCaseId
        ? cases.find((c) => c.id === initialCaseId)
        : cases[0];

      setFormData({
        caseId: selectedCase ? selectedCase.id : '',
        clientName: selectedCase ? selectedCase.clientName : '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        description: '',
        addedBy: 'Admin'
      });
    }
    setErrors({});
  }, [amountToEdit, initialCaseId, isOpen, cases]);

  const handleCaseChange = (e) => {
    const cid = e.target.value;
    const foundCase = cases.find((c) => c.id === cid);
    setFormData({
      ...formData,
      caseId: cid,
      clientName: foundCase ? foundCase.clientName : ''
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.caseId) errs.caseId = 'Case ID reference is required';
    if (!formData.clientName.trim()) errs.clientName = 'Client name is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Please enter a valid amount';
    }
    if (!formData.paymentDate) errs.paymentDate = 'Payment date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      amount: Number(formData.amount)
    };

    if (amountToEdit) {
      updateAmount(amountToEdit.id, payload);
    } else {
      addAmount(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={amountToEdit ? 'Edit Amount Entry' : 'Record Legal Fee / Amount Entry'}
      subtitle="Log retainer fee receipt, advocate consultation charges, and client installments"
      size="fullscreen"
      defaultFullscreen={true}
    >
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-6">
        {/* Section 1: Case Allocation & Client Details */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              1. Case Reference & Client Details
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Case Reference"
              required
              value={formData.caseId}
              onChange={handleCaseChange}
              options={caseOptions}
              error={errors.caseId}
              placeholder="Select Case"
            />

            <Input
              label="Client Full Name"
              required
              placeholder="Client Name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              error={errors.clientName}
            />
          </div>

          {/* Quick Case Balance Strip */}
          {selectedCaseData && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Court / Bench:</span>
                <span className="font-bold text-slate-800">{selectedCaseData.court}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Junior:</span>
                <span className="font-bold text-blue-700">{selectedCaseData.assignedJunior || 'Senior Counsel'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Agreed Fee:</span>
                <span className="font-bold text-navy-900">{formatINR(selectedCaseData.totalFee || 50000)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Already Paid:</span>
                <span className="font-bold text-emerald-700">{formatINR(selectedCaseData.paidAmount || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Transaction Details */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              2. Payment Amount & Payment Mode
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Amount Received (₹)"
              type="number"
              min="1"
              required
              placeholder="e.g. 25000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              error={errors.amount}
            />

            <Input
              label="Payment / Transaction Date"
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              error={errors.paymentDate}
            />

            <Select
              label="Payment Mode / Method"
              required
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              options={['UPI', 'Bank Transfer', 'Cash', 'Other']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Recorded By (Chamber Officer)"
              value={formData.addedBy}
              onChange={(e) => setFormData({ ...formData, addedBy: e.target.value })}
            />

            <Input
              label="Generated Receipt Series"
              value="Auto-generated with verified serial"
              readOnly
              className="bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Section 3: Description & Remarks */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              3. Payment Description & Purpose Remark
            </h4>
          </div>

          <div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Retainer advance for High Court writ appeal arguments and senior consultation..."
              className="w-full rounded-xl border border-slate-300 focus:ring-navy-600 focus:border-navy-600 p-4 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 leading-relaxed"
            />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="px-8">
            {amountToEdit ? 'Save Changes' : 'Save Amount Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
