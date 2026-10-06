import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useERP } from '../context/ERPContext';
import {
  ArrowLeft,
  Briefcase,
  User,
  Calendar,
  IndianRupee,
  Plus,
  Scale,
  Landmark,
  Phone,
  Mail,
  FileText,
  Clock,
  Shield,
  MessageSquare,
  Edit2,
  Upload,
  Eye,
  Download,
  Trash2,
  FolderOpen,
  Maximize2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddEditAmountModal } from '../components/modals/AddEditAmountModal';
import { AddEditHearingModal } from '../components/modals/AddEditHearingModal';
import { AddEditCaseModal } from '../components/modals/AddEditCaseModal';
import { WhatsAppModal } from '../components/modals/WhatsAppModal';
import { DocumentViewerModal } from '../components/modals/DocumentViewerModal';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';
import { ClientHistoryModal } from '../components/modals/ClientHistoryModal';
import { formatINR, formatDate } from '../utils/formatters';

export const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases, amounts, hearings, addCaseNote, deleteCaseDocument } = useERP();

  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, hearings, payments, clientHistory, notes
  const [newNoteText, setNewNoteText] = useState('');

  // Modals
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [isEditCaseOpen, setIsEditCaseOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isClientHistoryModalOpen, setIsClientHistoryModalOpen] = useState(false);
  const [selectedHearingForWhatsApp, setSelectedHearingForWhatsApp] = useState(null);
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);

  // Find case
  const currentCase = cases.find((c) => c.id === id) || cases[0];

  if (!currentCase) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-navy-900">Case Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">The case you requested does not exist or has been removed.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </div>
    );
  }

  // Linked payments, hearings & documents
  const casePayments = amounts.filter((a) => a.caseId === currentCase.id);
  const caseHearings = hearings.filter((h) => h.caseId === currentCase.id);
  const caseDocuments = currentCase.documents || [];

  // Financial calculations for current case
  const totalFee = currentCase.totalFee || 65000;
  const totalPaid = casePayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), currentCase.paidAmount || 0);
  const balance = Math.max(0, totalFee - totalPaid);

  // Client's complete lifetime history across all cases
  const clientNameNormalized = currentCase.clientName?.trim().toLowerCase();
  const clientCases = cases.filter(
    (c) =>
      (clientNameNormalized && c.clientName?.trim().toLowerCase() === clientNameNormalized) ||
      (currentCase.clientMobile && c.clientMobile === currentCase.clientMobile)
  );
  const clientCaseIds = clientCases.map((c) => c.id);
  const clientPayments = amounts.filter(
    (a) =>
      clientCaseIds.includes(a.caseId) ||
      (clientNameNormalized && a.clientName?.trim().toLowerCase() === clientNameNormalized)
  );
  const clientTotalBilled = clientCases.reduce((acc, c) => acc + (Number(c.totalFee) || 0), 0);
  const clientTotalPaid = clientPayments.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const clientBalance = Math.max(0, clientTotalBilled - clientTotalPaid);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addCaseNote(currentCase.id, newNoteText, 'Adv. Jayaraman (Admin)');
    setNewNoteText('');
  };

  const handleDownloadDoc = (doc) => {
    const element = document.createElement('a');
    const file = new Blob([`Layer ERP Legal Case Record\n\nCase ID: ${currentCase.id}\nDocument: ${doc.title}\nCategory: ${doc.category}\nDate: ${doc.uploadDate}\n\nCertified True Copy - Layer ERP Legal Chambers`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.title || 'Legal_Document.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to Cases"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-navy-900 tracking-tight">{currentCase.id}</h2>
              <Badge status={currentCase.caseStatus}>{currentCase.caseStatus}</Badge>
              <Badge status={currentCase.caseType}>{currentCase.caseType}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: <span className="font-bold text-slate-800">{currentCase.clientName}</span> | Filing No:{' '}
              <span className="font-medium text-slate-700">{currentCase.caseNumber || 'WP/Pending/2026'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" icon={User} onClick={() => setIsClientHistoryModalOpen(true)}>
            Client 360° History
          </Button>
          <Button variant="outline" size="sm" icon={Edit2} onClick={() => setIsEditCaseOpen(true)}>
            Edit Case
          </Button>
          <Button variant="outline" size="sm" icon={Upload} onClick={() => setIsUploadDocOpen(true)}>
            Upload Doc
          </Button>
          <Button variant="outline" size="sm" icon={Calendar} onClick={() => setIsHearingModalOpen(true)}>
            Schedule Hearing
          </Button>
          <Button variant="primary" size="sm" icon={IndianRupee} onClick={() => setIsAmountModalOpen(true)}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Case Status</span>
          <span className="text-base font-bold text-navy-900 mt-1 block">{currentCase.caseStatus}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Junior</span>
          <span className="text-xs font-bold text-blue-700 mt-1 block truncate">
            {currentCase.assignedJunior || 'Unassigned'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Hearing</span>
          <span className="text-xs font-bold text-slate-800 mt-1 block">
            {formatDate(currentCase.nextHearingDate)}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Agreed Fee</span>
          <span className="text-sm font-bold text-navy-900 mt-1 block">{formatINR(totalFee)}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Amount Paid</span>
          <span className="text-sm font-black text-emerald-700 mt-1 block">{formatINR(totalPaid)}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Balance Due</span>
          <span className={`text-sm font-black mt-1 block ${balance > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
            {formatINR(balance)}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="flex items-center border-b border-slate-200 bg-slate-50/50 px-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Brief' },
            { id: 'clientHistory', label: `Client 360° History (${clientCases.length} Cases)` },
            { id: 'documents', label: `Documents (${caseDocuments.length})` },
            { id: 'hearings', label: `Hearings (${caseHearings.length})` },
            { id: 'payments', label: `Payments (${casePayments.length})` },
            { id: 'notes', label: `Case Notes (${currentCase.notes?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-navy-900 text-navy-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client & Contact Information */}
                <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Client Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Client Full Name</span>
                      <span className="font-bold text-slate-800 text-sm">{currentCase.clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Mobile Number</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {currentCase.clientMobile || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Email Address</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentCase.clientEmail || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Filing Date</span>
                      <span className="font-semibold text-slate-700">{formatDate(currentCase.filingDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Court & Forum Details */}
                <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Court & Litigation Bench
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Court / Forum</span>
                      <span className="font-bold text-slate-800">{currentCase.court}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Filing / Case Number</span>
                      <span className="font-bold text-blue-700">{currentCase.caseNumber || 'WP/Pending/2026'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned Junior Advocate</span>
                      <span className="font-semibold text-slate-800">{currentCase.assignedJunior || 'Senior Counsel'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Next Scheduled Listing</span>
                      <span className="font-semibold text-slate-800">{formatDate(currentCase.nextHearingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opposing Party Information */}
              <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600" />
                  Opposing Party & Legal Representation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Opposing Party Name / Corporate</span>
                    <span className="font-bold text-slate-800">{currentCase.opposingParty || 'Respondents in Appeal'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Opposing Counsel / Advocate</span>
                    <span className="font-semibold text-slate-700">{currentCase.opposingAdvocate || 'Counsel on record'}</span>
                  </div>
                </div>
              </div>

              {/* Case Brief / Description */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Case Summary & Statement of Facts
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentCase.description || 'No detailed case brief entered yet.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT 360° HISTORY */}
          {activeTab === 'clientHistory' && (
            <div className="space-y-6">
              {/* Client Profile Header Banner */}
              <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white p-6 rounded-2xl border border-navy-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-xl border border-white/20">
                      {currentCase.clientName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{currentCase.clientName}</h3>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {clientCases.length} Matters on File
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                        <span>📞 +91 {currentCase.clientMobile || '-'}</span>
                        {currentCase.clientEmail && <span>✉️ {currentCase.clientEmail}</span>}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsClientHistoryModalOpen(true)}
                  >
                    Open Full-Screen Profile
                  </Button>
                </div>

                {/* 4 Financial KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/10">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Matters</span>
                    <span className="text-lg font-black text-white mt-0.5 block">{clientCases.length} Cases</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifetime Billed</span>
                    <span className="text-lg font-black text-white mt-0.5 block">{formatINR(clientTotalBilled)}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">Total Amount Paid</span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5 block">{formatINR(clientTotalPaid)}</span>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">Outstanding Balance</span>
                    <span className={`text-lg font-black mt-0.5 block ${clientBalance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {formatINR(clientBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* All Cases of this Client */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    All Cases Filed by {currentCase.clientName} ({clientCases.length})
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-3 px-4">Case ID</th>
                        <th className="py-3 px-4">Court</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Assigned Junior</th>
                        <th className="py-3 px-4 text-right">Agreed Fee</th>
                        <th className="py-3 px-4 text-right">Paid Amount</th>
                        <th className="py-3 px-4 text-right">Balance</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientCases.map((c) => {
                        const isCurrent = c.id === currentCase.id;
                        const cBal = Math.max(0, (Number(c.totalFee) || 0) - (Number(c.paidAmount) || 0));
                        return (
                          <tr key={c.id} className={isCurrent ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'}>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-navy-900">{c.id}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal">{c.caseNumber || 'WP/2026'}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700">{c.court}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold">
                                {c.caseType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{c.assignedJunior || 'Senior Counsel'}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-800">{formatINR(c.totalFee)}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-emerald-700">{formatINR(c.paidAmount)}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                              {cBal > 0 ? formatINR(cBal) : <span className="text-slate-400 font-normal">Nil</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge status={c.caseStatus}>{c.caseStatus}</Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {!isCurrent ? (
                                <button
                                  onClick={() => navigate(`/cases/${c.id}`)}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View Case →
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">Viewing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* All Payments for this Client */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Lifetime Payments Ledger ({clientPayments.length} Transactions)
                  </h4>
                  <span className="text-xs font-bold text-emerald-700">
                    Total Paid: {formatINR(clientTotalPaid)}
                  </span>
                </div>

                {clientPayments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No payment receipts found for this client.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-3 px-4">Receipt</th>
                          <th className="py-3 px-4">Case ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Payment Method</th>
                          <th className="py-3 px-4">Reference</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clientPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-bold text-navy-900">{p.id}</td>
                            <td className="py-3.5 px-4 font-medium text-blue-600">{p.caseId}</td>
                            <td className="py-3.5 px-4 text-slate-600">{formatDate(p.paymentDate || p.date)}</td>
                            <td className="py-3.5 px-4 text-slate-700">{p.paymentMethod || 'Bank Transfer'}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{p.referenceNo || p.notes || '-'}</td>
                            <td className="py-3.5 px-4 text-right font-black text-emerald-700">{formatINR(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Case Documents & Evidence Vault</h4>
                  <p className="text-xs text-slate-500">
                    Uploaded FIRs, Agreements, Aadhaar ID proofs, and Court Orders. Click to view in full-screen modal.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Upload}
                  onClick={() => setIsUploadDocOpen(true)}
                >
                  Upload Document
                </Button>
              </div>

              {caseDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              📄 PDF
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-sm font-bold text-navy-900 truncate">{doc.title}</h5>
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block mt-0.5">
                                {doc.category}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {doc.fileSize || '2.4 MB'}
                          </span>
                        </div>

                        {doc.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {doc.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Uploaded: <strong className="text-slate-600 font-medium">{formatDate(doc.uploadDate)}</strong></span>
                          <span>By: <strong className="text-slate-600 font-medium">{doc.uploadedBy || 'Admin'}</strong></span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedDocForView(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          title="Open full-screen popup"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-blue-300" />
                          <span>View Full-Screen</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDownloadDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-red-50 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-navy-900">No documents attached yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Upload FIR.pdf, Agreement.pdf, Aadhaar.pdf, or Court_Order.pdf to store with this case.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-4"
                    icon={Upload}
                    onClick={() => setIsUploadDocOpen(true)}
                  >
                    Upload First Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HEARINGS */}
          {activeTab === 'hearings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Case Hearing Timeline</h4>
                  <p className="text-xs text-slate-500">Record of all listed appearances and court orders</p>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setIsHearingModalOpen(true)}>
                  Schedule Hearing
                </Button>
              </div>

              {caseHearings.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {caseHearings.map((h) => (
                    <div key={h.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900">{formatDate(h.hearingDate)}</span>
                          <span className="text-slate-400">at {h.time}</span>
                          <Badge status={h.hearingType}>{h.hearingType}</Badge>
                          <Badge status={h.status}>{h.status}</Badge>
                        </div>
                        <p className="text-slate-600 mt-1 font-medium">{h.court} – {h.courtHall || 'Court Hall 4'}</p>
                        {h.notes && <p className="text-[11px] text-slate-400 mt-0.5">{h.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedHearingForWhatsApp(h)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No hearing sessions recorded for this case yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Fee Retainers & Transactions</h4>
                  <p className="text-xs text-slate-500">
                    Paid: <span className="font-bold text-emerald-700">{formatINR(totalPaid)}</span> /{' '}
                    Total: <span className="font-bold text-navy-900">{formatINR(totalFee)}</span>
                  </p>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setIsAmountModalOpen(true)}>
                  Record Payment
                </Button>
              </div>

              {casePayments.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {casePayments.map((p) => (
                    <div key={p.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-700 text-sm">{formatINR(p.amount)}</span>
                          <Badge status={p.paymentMode}>{p.paymentMode}</Badge>
                          <span className="text-slate-400">({p.receiptNo || p.id})</span>
                        </div>
                        <p className="text-slate-600 mt-1">{p.description || 'Legal counsel appearance fee'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 block">{formatDate(p.paymentDate)}</span>
                        <span className="text-[11px] text-slate-400">By {p.addedBy || 'Admin'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No payment transactions logged for this case.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CASE NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-navy-900">Internal Counsel Notes & Hearing Log</h4>
                <p className="text-xs text-slate-500">Chamber observations, research findings and client communications</p>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <textarea
                  rows={2}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Write an internal legal note, citations, witness notes..."
                  className="w-full rounded-lg border border-slate-300 focus:ring-navy-600 focus:border-navy-600 p-3 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
                    Add Note
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                {currentCase.notes && currentCase.notes.length > 0 ? (
                  currentCase.notes.map((note) => (
                    <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-navy-900">{note.author || 'Advocate'}</span>
                        <span className="text-slate-400">{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No notes recorded yet. Add your first counsel note above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEditAmountModal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        initialCaseId={currentCase.id}
      />

      <AddEditHearingModal
        isOpen={isHearingModalOpen}
        onClose={() => setIsHearingModalOpen(false)}
        initialCaseId={currentCase.id}
      />

      <AddEditCaseModal
        isOpen={isEditCaseOpen}
        onClose={() => setIsEditCaseOpen(false)}
        caseToEdit={currentCase}
      />

      <WhatsAppModal
        isOpen={!!selectedHearingForWhatsApp}
        onClose={() => setSelectedHearingForWhatsApp(null)}
        hearing={selectedHearingForWhatsApp}
      />

      {/* Full Screen Document Viewer Popup Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocForView}
        onClose={() => setSelectedDocForView(null)}
        document={selectedDocForView}
        caseData={currentCase}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        caseId={currentCase.id}
      />

      {/* Delete Document Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => docToDelete && deleteCaseDocument(currentCase.id, docToDelete.id)}
        title="Delete Case Document"
        message={`Are you sure you want to remove ${docToDelete?.title} from this case?`}
      />

      {/* Client 360° History Full Screen Modal */}
      <ClientHistoryModal
        isOpen={isClientHistoryModalOpen}
        onClose={() => setIsClientHistoryModalOpen(false)}
        clientName={currentCase.clientName}
        clientMobile={currentCase.clientMobile}
      />
    </div>
  );
};
