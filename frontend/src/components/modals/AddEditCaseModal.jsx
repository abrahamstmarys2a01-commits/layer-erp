import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useERP } from '../../context/ERPContext';
import {
  User,
  Landmark,
  Shield,
  IndianRupee,
  FileText,
  Calendar,
  Briefcase,
  Scale,
  UploadCloud,
  FileUp,
  Trash2,
  Paperclip,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

import { formatINR, formatDate } from '../../utils/formatters';

export const AddEditCaseModal = ({ isOpen, onClose, caseToEdit }) => {
  const { juniors, cases, amounts, addCase, updateCase, settings } = useERP();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    clientEmail: '',
    caseNumber: '',
    caseType: 'Civil',
    court: 'Madras High Court',
    assignedJunior: '',
    caseStatus: 'Active',
    totalFee: '50000',
    paidAmount: '0',
    nextHearingDate: '',
    description: '',
    opposingParty: '',
    opposingAdvocate: ''
  });

  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});

  const standardDocPresets = [
    { title: 'FIR.pdf', category: 'Police Complaint & FIR', fileSize: '2.4 MB', previewType: 'fir' },
    { title: 'Agreement.pdf', category: 'Commercial Contract / Lease', fileSize: '1.8 MB', previewType: 'agreement' },
    { title: 'Aadhaar.pdf', category: 'Identity Proof', fileSize: '850 KB', previewType: 'aadhaar' },
    { title: 'Court_Order.pdf', category: 'Court Order / Injunction', fileSize: '1.2 MB', previewType: 'court_order' }
  ];

  const juniorOptions = [
    { value: 'Senior Adv. R. Jayaraman (Direct)', label: 'Senior Adv. R. Jayaraman (Direct Handling)' },
    ...juniors.map((j) => ({
      value: j.name,
      label: `${j.name} (${j.status})`
    }))
  ];

  const caseTypeOptions = (settings?.caseSettings?.caseTypes || [
    'Civil',
    'Criminal',
    'Family',
    'Property',
    'Corporate',
    'Labour',
    'Consumer',
    'Other'
  ]).map((t) => ({ value: t, label: t }));

  const courtOptions = (settings?.caseSettings?.courts || [
    'Madras High Court',
    'District Court',
    'Sessions Court',
    'Magistrate Court',
    'Family Court',
    'NCLT Chennai Bench',
    'Labour Court'
  ]).map((c) => ({ value: c, label: c }));

  const caseStatusOptions = (settings?.caseSettings?.caseStatuses || [
    'New',
    'Active',
    'Pending',
    'Closed'
  ]).map((s) => ({ value: s, label: s }));

  useEffect(() => {
    if (caseToEdit) {
      setFormData({
        clientName: caseToEdit.clientName || '',
        clientMobile: caseToEdit.clientMobile || '',
        clientEmail: caseToEdit.clientEmail || '',
        caseNumber: caseToEdit.caseNumber || '',
        caseType: caseToEdit.caseType || 'Civil',
        court: caseToEdit.court || 'Madras High Court',
        assignedJunior: caseToEdit.assignedJunior || '',
        caseStatus: caseToEdit.caseStatus || 'Active',
        totalFee: caseToEdit.totalFee?.toString() || '50000',
        paidAmount: caseToEdit.paidAmount?.toString() || '0',
        nextHearingDate: caseToEdit.nextHearingDate !== '-' ? (caseToEdit.nextHearingDate || '') : '',
        description: caseToEdit.description || '',
        opposingParty: caseToEdit.opposingParty || '',
        opposingAdvocate: caseToEdit.opposingAdvocate || ''
      });
      setDocuments(caseToEdit.documents ? [...caseToEdit.documents] : []);
    } else {
      setFormData({
        clientName: '',
        clientMobile: '',
        clientEmail: '',
        caseNumber: '',
        caseType: 'Civil',
        court: 'Madras High Court',
        assignedJunior: juniorOptions.length > 0 ? juniorOptions[0].value : '',
        caseStatus: 'Active',
        totalFee: '50000',
        paidAmount: '0',
        nextHearingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        opposingParty: '',
        opposingAdvocate: ''
      });
      setDocuments([]);
    }
    setErrors({});
  }, [caseToEdit, isOpen]);

  // Toggle Standard Template Document
  const handleToggleDocPreset = (preset) => {
    const exists = documents.some((d) => d.title.toLowerCase() === preset.title.toLowerCase());
    if (exists) {
      setDocuments((prev) => prev.filter((d) => d.title.toLowerCase() !== preset.title.toLowerCase()));
    } else {
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: preset.title,
        category: preset.category,
        fileSize: preset.fileSize,
        fileType: 'PDF',
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Admin',
        previewType: preset.previewType
      };
      setDocuments((prev) => [...prev, newDoc]);
    }
  };

  // Custom File Upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs = files.map((file) => {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
      
      let pType = 'custom';
      const n = file.name.toLowerCase();
      if (n.includes('fir')) pType = 'fir';
      else if (n.includes('agreement') || n.includes('contract')) pType = 'agreement';
      else if (n.includes('aadhaar') || n.includes('aadhar')) pType = 'aadhaar';
      else if (n.includes('court') || n.includes('order')) pType = 'court_order';

      return {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: file.name,
        category: pType === 'fir' ? 'Police Complaint & FIR' : pType === 'agreement' ? 'Commercial Contract / Lease' : pType === 'aadhaar' ? 'Identity Proof' : pType === 'court_order' ? 'Court Order / Injunction' : 'General Legal Record',
        fileSize: `${sizeInMb} MB`,
        fileType: isPdf ? 'PDF' : isDoc ? 'DOCX' : 'IMG',
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Admin',
        previewType: pType
      };
    });

    setDocuments((prev) => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDoc = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Auto-detect existing client history
  const existingClientInfo = React.useMemo(() => {
    const name = formData.clientName.trim().toLowerCase();
    const mobile = formData.clientMobile.trim();
    if (!name && !mobile) return null;

    const matchedCases = cases.filter(
      (c) =>
        (!caseToEdit || c.id !== caseToEdit.id) &&
        ((name && name.length > 2 && c.clientName?.trim().toLowerCase() === name) ||
         (mobile && mobile.length >= 8 && c.clientMobile?.trim() === mobile))
    );

    if (matchedCases.length === 0) return null;

    const matchedIds = matchedCases.map((c) => c.id);
    const matchedPayments = amounts.filter(
      (a) => matchedIds.includes(a.caseId) || (name && a.clientName?.trim().toLowerCase() === name)
    );

    const totalBilled = matchedCases.reduce((acc, c) => acc + (Number(c.totalFee) || 0), 0);
    const totalPaid = matchedPayments.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const balance = Math.max(0, totalBilled - totalPaid);

    const firstMatch = matchedCases[0];

    return {
      name: firstMatch.clientName,
      mobile: firstMatch.clientMobile,
      email: firstMatch.clientEmail,
      caseCount: matchedCases.length,
      cases: matchedCases,
      totalBilled,
      totalPaid,
      balance
    };
  }, [formData.clientName, formData.clientMobile, cases, amounts, caseToEdit]);

  const handleAutofillClient = () => {
    if (!existingClientInfo) return;
    setFormData((prev) => ({
      ...prev,
      clientName: existingClientInfo.name || prev.clientName,
      clientMobile: existingClientInfo.mobile || prev.clientMobile,
      clientEmail: existingClientInfo.email || prev.clientEmail
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.clientName.trim()) errs.clientName = 'Client name is required';
    if (!formData.clientMobile.trim()) errs.clientMobile = 'Client mobile is required';
    if (!formData.court) errs.court = 'Court is required';
    if (!formData.assignedJunior) errs.assignedJunior = 'Please assign a junior advocate';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      documents,
      totalFee: Number(formData.totalFee) || 0,
      paidAmount: Number(formData.paidAmount) || 0
    };

    if (caseToEdit) {
      updateCase(caseToEdit.id, payload);
    } else {
      addCase(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseToEdit ? `Edit Case – ${caseToEdit.id}` : 'Create New Legal Case'}
      subtitle="Complete litigation details, filing numbers, court assignment, legal fees and statement of facts"
      size="fullscreen"
      defaultFullscreen={true}
    >
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-6">
        {/* Section 1: Client Information */}
        <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                1. Client Information & Contact
              </h4>
            </div>
            {existingClientInfo && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3 h-3" /> Existing Chamber Client ({existingClientInfo.caseCount} Cases)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Client Full Name"
              required
              placeholder="e.g. Arun Kumar"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              error={errors.clientName}
            />

            <Input
              label="Client Mobile (WhatsApp Alerts)"
              required
              placeholder="e.g. 9876543210"
              value={formData.clientMobile}
              onChange={(e) => setFormData({ ...formData, clientMobile: e.target.value })}
              error={errors.clientMobile}
            />

            <Input
              label="Client Email Address"
              type="email"
              placeholder="e.g. client@example.com"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>

          {/* Smart Existing Client Detection Card */}
          {existingClientInfo && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-xl border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-navy-900 flex items-center gap-2">
                  <span>👤 Client History Found: <span className="text-blue-800">{existingClientInfo.name}</span></span>
                  <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded text-slate-700 shadow-2xs border border-slate-200">
                    {existingClientInfo.caseCount} Existing Case{existingClientInfo.caseCount > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Lifetime Billed: <span className="font-bold text-slate-900">{formatINR(existingClientInfo.totalBilled)}</span> • 
                  Total Paid: <span className="font-bold text-emerald-700">{formatINR(existingClientInfo.totalPaid)}</span> • 
                  Pending Due: <span className="font-bold text-amber-700">{formatINR(existingClientInfo.balance)}</span>
                </p>
              </div>

              {(!formData.clientMobile || !formData.clientEmail) && (
                <button
                  type="button"
                  onClick={handleAutofillClient}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer whitespace-nowrap transition-colors touch-target"
                >
                  ⚡ Autofill Contact Info
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Court, Case Type & Bench Assignment */}
        <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Landmark className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              2. Court Details & Litigation Assignment
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Select
              label="Court / Forum"
              required
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              options={courtOptions}
              error={errors.court}
            />

            <Input
              label="Court Filing / Case Number"
              placeholder="e.g. WP/4812/2025"
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
            />

            <Select
              label="Case Type / Category"
              required
              value={formData.caseType}
              onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
              options={caseTypeOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <Select
              label="Assigned Junior Advocate"
              required
              value={formData.assignedJunior}
              onChange={(e) => setFormData({ ...formData, assignedJunior: e.target.value })}
              options={juniorOptions}
              error={errors.assignedJunior}
            />

            <Select
              label="Case Stage / Status"
              value={formData.caseStatus}
              onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value })}
              options={caseStatusOptions}
            />

            <Input
              label="Next Listed Hearing Date"
              type="date"
              value={formData.nextHearingDate}
              onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Financials & Opposing Party */}
        <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              3. Agreed Legal Fees & Opposing Counsel
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Total Agreed Fee (₹)"
              type="number"
              min="0"
              placeholder="50000"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
            />

            <Input
              label="Initial Retainer Received (₹)"
              type="number"
              min="0"
              placeholder="0"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
            />

            <Input
              label="Opposing Party Name"
              placeholder="e.g. Apex Commercial Ltd."
              value={formData.opposingParty}
              onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
            />

            <Input
              label="Opposing Advocate / Counsel"
              placeholder="e.g. Adv. R. Sankaran"
              value={formData.opposingAdvocate}
              onChange={(e) => setFormData({ ...formData, opposingAdvocate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 4: Statement of Facts & Summary */}
        <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              4. Statement of Facts & Case Brief
            </h4>
          </div>

          <div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter brief facts, prayer sought, urgent injunction notes, or client instructions..."
              className="w-full rounded-xl border border-slate-300 focus:ring-navy-600 focus:border-navy-600 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 5: Case-Related Documents Upload */}
        <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                5. Case-Related Documents (FIR, Agreement, Aadhaar, Court Order)
              </h4>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-900 self-start sm:self-auto">
              {documents.length} {documents.length === 1 ? 'Document' : 'Documents'} Attached
            </span>
          </div>

          {/* Quick Standard Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick One-Click Legal Templates (Click to Attach / Toggle)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {standardDocPresets.map((preset) => {
                const isAttached = documents.some((d) => d.title.toLowerCase() === preset.title.toLowerCase());
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleToggleDocPreset(preset)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all touch-target ${
                      isAttached
                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm ring-1 ring-navy-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                        <span>📄</span>
                        <span className="truncate">{preset.title}</span>
                      </div>
                      <span className={`text-[10px] block truncate mt-0.5 ${isAttached ? 'text-slate-300' : 'text-slate-400'}`}>
                        {preset.category}
                      </span>
                    </div>
                    {isAttached ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600 shrink-0 bg-blue-50 px-1.5 py-0.5 rounded">
                        + Add
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Upload Custom Files (.pdf, .docx, .jpg, .png)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-navy-600 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-slate-50/80 transition-colors"
            >
              <UploadCloud className="w-7 h-7 text-blue-600 mb-1.5" />
              <p className="text-xs font-bold text-navy-900">
                Click to browse and upload case files
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports FIR, Petitions, Contracts, Vakalatnama, Bail Orders (Max 25MB each)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
          </div>

          {/* Attached Documents List */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                Attached Case Records ({documents.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-navy-900 block truncate">{doc.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2 touch-target"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sticky bottom-0 bg-white py-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="px-8">
            {caseToEdit ? 'Save Changes' : 'Create Legal Case'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
