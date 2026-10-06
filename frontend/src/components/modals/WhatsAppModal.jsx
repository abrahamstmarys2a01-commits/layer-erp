import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MessageSquare, Phone, Calendar, Clock, Landmark, Send, Check, ExternalLink } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatDate } from '../../utils/formatters';

export const WhatsAppModal = ({ isOpen, onClose, hearing }) => {
  const { cases, showToast, sendWhatsAppReminder } = useERP();
  const [customMessage, setCustomMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  const matchingCase = hearing ? cases.find((c) => c.id === hearing.caseId) : null;
  const clientName = hearing?.clientName || matchingCase?.clientName || 'Client';
  const rawMobile = hearing?.clientMobile || matchingCase?.clientMobile || '';
  const caseId = hearing?.caseId || 'CASE';
  const court = hearing?.court || matchingCase?.court || 'High Court';
  const hearingDate = hearing?.hearingDate ? formatDate(hearing.hearingDate) : 'Upcoming Date';
  const hearingTime = hearing?.time || '10:30 AM';
  const courtHall = hearing?.courtHall || '';

  // Initialize phone and default message when modal opens with a hearing
  useEffect(() => {
    if (hearing) {
      const initialPhone = hearing.clientMobile || matchingCase?.clientMobile || '';
      setTargetPhone(initialPhone);

      const msg = `🏛️ *LEGAL HEARING REMINDER*\n\nDear *${clientName}*,\nThis is an official court appearance reminder regarding your case *${caseId}*.\n\n📅 *Date:* ${hearingDate}\n⏰ *Time:* ${hearingTime}\n📍 *Court:* ${court}${courtHall ? ` (${courtHall})` : ''}\n\nPlease ensure all relevant original documents are in order.\n\n_Chamber of Senior Advocate_`;
      setCustomMessage(msg);
    }
  }, [hearing, matchingCase, clientName, caseId, court, courtHall, hearingDate, hearingTime]);

  if (!hearing) return null;

  // Format phone number for WhatsApp wa.me link
  const formatForWhatsApp = (phoneStr) => {
    if (!phoneStr) return '';
    const cleaned = phoneStr.replace(/\D/g, '');
    // If 10 digits (Standard Indian mobile), prepend 91
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    // If 12 digits starting with 91
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned;
    }
    return cleaned;
  };

  const handleSend = () => {
    const formattedPhone = formatForWhatsApp(targetPhone);

    if (!formattedPhone || formattedPhone.length < 10) {
      showToast('Please enter a valid 10-digit client mobile number.', 'error');
      return;
    }

    // Build the official WhatsApp Web / App direct send URL
    const encodedText = encodeURIComponent(customMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;

    // Open WhatsApp in new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Notify user & sync backend
    showToast(`Opening WhatsApp to send reminder to ${clientName} (+${formattedPhone})`);
    sendWhatsAppReminder(hearing);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send WhatsApp Court Reminder"
      subtitle="Preview message and send directly to client's WhatsApp number"
      size="md"
    >
      <div className="space-y-4">
        {/* Hearing & Contact Info Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-medium block">Client Name:</span>
              <span className="font-bold text-navy-900 text-sm">{clientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Client Mobile:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-navy-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 font-medium block">Case Reference:</span>
              <span className="font-bold text-blue-600">{caseId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Court / Bench:</span>
              <span className="font-medium text-slate-700 truncate">{court}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 font-medium block">Hearing Date:</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> {hearingDate}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Hearing Time:</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> {hearingTime}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Preview / Edit Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              WhatsApp Message
            </label>
            <span className="text-[10px] text-slate-400">Editable before sending</span>
          </div>

          <div className="bg-[#EFEAE2] p-3.5 rounded-xl border border-emerald-200 shadow-inner">
            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-white p-3 rounded-lg rounded-tl-none shadow-xs text-xs text-slate-800 font-medium leading-relaxed border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              placeholder="Type WhatsApp reminder message..."
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <span>Sending to: <strong className="text-emerald-800">+91 {targetPhone || rawMobile || 'Client Mobile'}</strong></span>
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span>WhatsApp Direct</span>
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="md"
            icon={Send}
            onClick={handleSend}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm flex items-center gap-2"
          >
            Send to WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
};
