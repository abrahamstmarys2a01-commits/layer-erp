import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useERP } from '../../context/ERPContext';
import {
  User,
  Phone,
  Mail,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building
} from 'lucide-react';
import { formatINR, formatDate } from '../../utils/formatters';

export const ClientHistoryModal = ({ isOpen, onClose, clientName, clientMobile }) => {
  const navigate = useNavigate();
  const { cases, amounts, hearings } = useERP();

  // Filter all records for this client
  const clientData = useMemo(() => {
    if (!clientName && !clientMobile) return null;

    const normalizedName = (clientName || '').trim().toLowerCase();
    const normalizedMobile = (clientMobile || '').trim();

    // Matching cases
    const clientCases = cases.filter((c) => {
      const matchName = normalizedName && c.clientName?.trim().toLowerCase() === normalizedName;
      const matchMobile = normalizedMobile && c.clientMobile?.trim() === normalizedMobile;
      return matchName || matchMobile;
    });

    const caseIds = clientCases.map((c) => c.id);

    // Matching payments across all client cases or matching client name
    const clientPayments = amounts.filter((a) => {
      return (
        caseIds.includes(a.caseId) ||
        (normalizedName && a.clientName?.trim().toLowerCase() === normalizedName)
      );
    });

    // Matching hearings across all client cases
    const clientHearings = hearings.filter((h) => {
      return (
        caseIds.includes(h.caseId) ||
        (normalizedName && h.clientName?.trim().toLowerCase() === normalizedName)
      );
    });

    // Financial aggregates
    const totalBilled = clientCases.reduce((acc, c) => acc + (Number(c.totalFee) || 0), 0);
    const totalPaid = clientPayments.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const balance = Math.max(0, totalBilled - totalPaid);
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

    const primaryCase = clientCases[0] || {};

    return {
      name: clientName || primaryCase.clientName || 'Unknown Client',
      mobile: clientMobile || primaryCase.clientMobile || '-',
      email: primaryCase.clientEmail || '-',
      cases: clientCases,
      payments: clientPayments,
      hearings: clientHearings,
      totalBilled,
      totalPaid,
      balance,
      collectionRate
    };
  }, [clientName, clientMobile, cases, amounts, hearings]);

  if (!clientData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Client 360° Profile & Lifetime History`}
      subtitle={`Complete case portfolio, total fees, payments ledger and hearing history for ${clientData.name}`}
      size="fullscreen"
      defaultFullscreen={true}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-6">
        {/* Client Identity & Lifetime KPI Summary Card */}
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-navy-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                {clientData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{clientData.name}</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Verified Chamber Client
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> +91 {clientData.mobile}
                  </span>
                  {clientData.email !== '-' && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" /> {clientData.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" /> {clientData.cases.length} Total Matters
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Fee Recovery Rate:</span>
              <span className="text-sm font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/60">
                {clientData.collectionRate}% Paid
              </span>
            </div>
          </div>

          {/* 4 Lifetime Financial Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Legal Matters
              </span>
              <span className="text-xl font-black text-white mt-1 block">
                {clientData.cases.length} <span className="text-xs font-normal text-slate-400">Cases</span>
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lifetime Billed
              </span>
              <span className="text-xl font-black text-white mt-1 block">
                {formatINR(clientData.totalBilled)}
              </span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {formatINR(clientData.totalPaid)}
              </span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <span className={`text-xl font-black mt-1 block ${clientData.balance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {formatINR(clientData.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: All Cases Roster for this Client */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Case Portfolio ({clientData.cases.length} Cases Filed)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">All civil, criminal, and corporate matters handled for this client</p>
            </div>
          </div>

          {clientData.cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No registered cases found for this client.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Case ID & Filing</th>
                    <th className="py-3 px-4">Court / Forum</th>
                    <th className="py-3 px-4">Case Type</th>
                    <th className="py-3 px-4">Assigned Junior</th>
                    <th className="py-3 px-4 text-right">Agreed Fee</th>
                    <th className="py-3 px-4 text-right">Paid Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4">Case Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientData.cases.map((c) => {
                    const cFee = Number(c.totalFee) || 0;
                    const cPaid = Number(c.paidAmount) || 0;
                    const cBal = Math.max(0, cFee - cPaid);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-navy-900 block">{c.id}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{c.caseNumber || 'Filing Pending'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{c.court}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[11px]">
                            {c.caseType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{c.assignedJunior || 'Senior Counsel'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">{formatINR(cFee)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">{formatINR(cPaid)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                          {cBal > 0 ? formatINR(cBal) : <span className="text-slate-400 font-normal">Nil</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={c.caseStatus}>{c.caseStatus}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/cases/${c.id}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Lifetime Payment Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Lifetime Payment Receipts & Transactions ({clientData.payments.length} Payments)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Complete chronological ledger of retainer receipts received from this client</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Received:</span>
              <span className="text-base font-black text-emerald-700">{formatINR(clientData.totalPaid)}</span>
            </div>
          </div>

          {clientData.payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No payment transactions recorded for this client yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Receipt ID</th>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction Ref / Cheque</th>
                    <th className="py-3 px-4">Received By</th>
                    <th className="py-3 px-4 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientData.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy-900">{p.id}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/cases/${p.caseId}`);
                          }}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          {p.caseId}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(p.paymentDate || p.date)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                          {p.paymentMethod || 'UPI / Bank'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{p.referenceNo || p.notes || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.receivedBy || 'Admin'}</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                        {formatINR(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Hearing Timeline for Client */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Court Listings & Hearing Schedule ({clientData.hearings.length} Hearings)
            </h4>
          </div>

          {clientData.hearings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No court hearings scheduled for this client.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clientData.hearings.map((h) => (
                <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 text-xs">{h.caseId} – {h.court}</span>
                        <Badge status={h.status}>{h.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{h.hearingType}</span> • Hearing Date: {formatDate(h.hearingDate)} at {h.time || '10:30 AM'}
                      </p>
                      {h.purpose && <p className="text-[11px] text-slate-400 mt-0.5 italic">"{h.purpose}"</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/cases/${h.caseId}`);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Close Client History
          </Button>
        </div>
      </div>
    </Modal>
  );
};
