import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useERP } from '../../context/ERPContext';
import {
  Calendar,
  Clock,
  Landmark,
  User,
  Phone,
  FileText,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const AddEditHearingModal = ({ isOpen, onClose, hearingToEdit, initialCaseId }) => {
  const { cases, juniors, addHearing, updateHearing, settings } = useERP();

  const [formData, setFormData] = useState({
    caseId: '',
    clientName: '',
    clientMobile: '',
    junior: '',
    court: 'Madras High Court',
    hearingDate: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    hearingType: 'Arguments',
    status: 'Upcoming',
    courtHall: 'Court Hall No. 4',
    notes: '',
    nextHearingDate: ''
  });

  const [errors, setErrors] = useState({});

  const caseOptions = cases.map((c) => ({
    value: c.id,
    label: `${c.id} – ${c.clientName} (${c.court})`
  }));

  const juniorOptions = juniors.map((j) => ({
    value: j.name,
    label: j.name
  }));

  const hearingTypeOptions = (settings?.caseSettings?.hearingTypes || [
    'First Hearing',
    'Arguments',
    'Evidence',
    'Cross Examination',
    'Final Hearing',
    'Order',
    'Other'
  ]).map((t) => ({ value: t, label: t }));

  useEffect(() => {
    if (hearingToEdit) {
      setFormData({
        caseId: hearingToEdit.caseId || '',
        clientName: hearingToEdit.clientName || '',
        clientMobile: hearingToEdit.clientMobile || '',
        junior: hearingToEdit.junior || '',
        court: hearingToEdit.court || 'Madras High Court',
        hearingDate: hearingToEdit.hearingDate || new Date().toISOString().split('T')[0],
        time: hearingToEdit.time || '10:30 AM',
        hearingType: hearingToEdit.hearingType || 'Arguments',
        status: hearingToEdit.status || 'Upcoming',
        courtHall: hearingToEdit.courtHall || 'Court Hall No. 4',
        notes: hearingToEdit.notes || '',
        nextHearingDate: hearingToEdit.nextHearingDate !== '-' ? (hearingToEdit.nextHearingDate || '') : ''
      });
    } else {
      const selectedCase = initialCaseId
        ? cases.find((c) => c.id === initialCaseId)
        : cases[0];

      setFormData({
        caseId: selectedCase ? selectedCase.id : '',
        clientName: selectedCase ? selectedCase.clientName : '',
        clientMobile: selectedCase ? selectedCase.clientMobile : '9876543210',
        junior: selectedCase?.assignedJunior || (juniorOptions[0]?.value || ''),
        court: selectedCase?.court || 'Madras High Court',
        hearingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:30 AM',
        hearingType: 'Arguments',
        status: 'Upcoming',
        courtHall: 'Court Hall No. 4',
        notes: '',
        nextHearingDate: ''
      });
    }
    setErrors({});
  }, [hearingToEdit, initialCaseId, isOpen, cases]);

  const handleCaseChange = (e) => {
    const cid = e.target.value;
    const foundCase = cases.find((c) => c.id === cid);
    if (foundCase) {
      setFormData({
        ...formData,
        caseId: cid,
        clientName: foundCase.clientName,
        clientMobile: foundCase.clientMobile || '',
        junior: foundCase.assignedJunior || formData.junior,
        court: foundCase.court || formData.court
      });
    } else {
      setFormData({ ...formData, caseId: cid });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.caseId) errs.caseId = 'Case ID is required';
    if (!formData.clientName.trim()) errs.clientName = 'Client name is required';
    if (!formData.hearingDate) errs.hearingDate = 'Hearing date is required';
    if (!formData.time.trim()) errs.time = 'Time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (hearingToEdit) {
      updateHearing(hearingToEdit.id, formData);
    } else {
      addHearing(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hearingToEdit ? 'Edit Hearing Schedule' : 'Schedule Court Hearing Entry'}
      subtitle="Register listing date, court hall, advocate appearance, and agenda"
      size="fullscreen"
      defaultFullscreen={true}
    >
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-6">
        {/* Section 1: Case Reference & Client Details */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              1. Case Reference & Client Profile
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              error={errors.clientName}
            />

            <Input
              label="Client Mobile (for WhatsApp Reminder)"
              placeholder="9876543210"
              value={formData.clientMobile}
              onChange={(e) => setFormData({ ...formData, clientMobile: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Select
              label="Assigned Junior Advocate"
              value={formData.junior}
              onChange={(e) => setFormData({ ...formData, junior: e.target.value })}
              options={juniorOptions}
            />

            <Input
              label="Court / Tribunal / Forum"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Hearing Date, Time & Bench Details */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Calendar className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              2. Listing Date, Time & Court Hall
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Hearing Date"
              type="date"
              required
              value={formData.hearingDate}
              onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
              error={errors.hearingDate}
            />

            <Input
              label="Hearing Time"
              required
              placeholder="10:30 AM"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              error={errors.time}
            />

            <Select
              label="Hearing Stage / Agenda"
              value={formData.hearingType}
              onChange={(e) => setFormData({ ...formData, hearingType: e.target.value })}
              options={hearingTypeOptions}
            />

            <Select
              label="Hearing Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={['Upcoming', 'Today', 'Completed', 'Adjourned', 'Cancelled']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Court Hall / Bench Reference"
              placeholder="e.g. Court Hall No. 4 (Chief Justice Bench)"
              value={formData.courtHall}
              onChange={(e) => setFormData({ ...formData, courtHall: e.target.value })}
            />

            <Input
              label="Next Adjourned Date (if any)"
              type="date"
              value={formData.nextHearingDate}
              onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Brief Instructions & Counsel Notes */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              3. Hearing Brief, Prayer & Counsel Instructions
            </h4>
          </div>

          <div>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Present rejoinder affidavit, argue commercial lease clause 14, and seek interim injunction..."
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
            {hearingToEdit ? 'Save Changes' : 'Schedule Court Hearing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
