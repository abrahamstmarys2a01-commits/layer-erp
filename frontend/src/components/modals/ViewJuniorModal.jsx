import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useERP } from '../../context/ERPContext';
import { Phone, Mail, MapPin, Briefcase, Calendar, ShieldCheck, Award } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const ViewJuniorModal = ({ isOpen, onClose, junior }) => {
  const { cases } = useERP();
  const navigate = useNavigate();

  if (!junior) return null;

  // Filter cases assigned to this junior
  const assignedCasesList = cases.filter(
    (c) => c.assignedJunior && c.assignedJunior.toLowerCase().includes(junior.name.toLowerCase().replace('adv. ', ''))
  );

  const activeCount = assignedCasesList.filter((c) => c.caseStatus === 'Active' || c.caseStatus === 'New').length;
  const closedCount = assignedCasesList.filter((c) => c.caseStatus === 'Closed').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Junior Advocate Profile"
      subtitle={`Profile details and workload record for ${junior.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {junior.name.replace('Adv. ', '').split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-navy-900">{junior.name}</h3>
                <Badge status={junior.status}>{junior.status}</Badge>
              </div>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">{junior.specialization || 'Advocate'}</p>
              <p className="text-[11px] text-slate-500">Bar No: {junior.barCouncilNo || 'TN/Pending'}</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 sm:text-right">
            <span>Joined Chamber:</span>
            <p className="font-bold text-slate-800">{formatDate(junior.joinedDate)}</p>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Phone className="w-3 h-3 text-slate-400" /> Phone
            </span>
            <p className="text-xs font-semibold text-slate-800">+91 {junior.mobile}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Mail className="w-3 h-3 text-slate-400" /> Email
            </span>
            <p className="text-xs font-semibold text-slate-800 truncate">{junior.email}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Address
            </span>
            <p className="text-xs font-medium text-slate-700 truncate">{junior.address || 'Chennai Chambers'}</p>
          </div>
        </div>

        {/* Case Stats Cards */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Case Allocation Summary</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <span className="text-2xl font-black text-blue-900 block">
                {assignedCasesList.length || junior.assignedCases || 0}
              </span>
              <span className="text-[11px] font-semibold text-blue-700">Total Assigned</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-2xl font-black text-emerald-900 block">
                {activeCount || junior.activeCases || 0}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">Active Cases</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-center">
              <span className="text-2xl font-black text-slate-800 block">
                {closedCount || junior.closedCases || 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">Disposed / Closed</span>
            </div>
          </div>
        </div>

        {/* Assigned Cases List */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Assigned Legal Cases</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {assignedCasesList.length > 0 ? (
              assignedCasesList.map((c) => (
                <div key={c.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{c.id}</span>
                      <span className="text-slate-700 font-medium">({c.clientName})</span>
                      <Badge status={c.caseType}>{c.caseType}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.court}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={c.caseStatus}>{c.caseStatus}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose();
                        navigate(`/cases/${c.id}`);
                      }}
                    >
                      View Case →
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No cases currently mapped to this junior.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
