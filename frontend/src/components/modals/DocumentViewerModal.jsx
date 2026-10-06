import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ShieldCheck,
  Landmark,
  Scale,
  Calendar,
  User,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const DocumentViewerModal = ({ isOpen, onClose, document: doc, caseData }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !doc) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simulated download
    const element = document.createElement('a');
    const file = new Blob([`Layer ERP Legal Case Record\n\nCase ID: ${caseData?.id || 'CASE-1024'}\nDocument: ${doc.title}\nCategory: ${doc.category}\nDate: ${doc.uploadDate}\n\nCertified True Copy - Layer ERP Legal Chambers`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.title || 'Legal_Document.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const previewType = doc.previewType || (doc.title?.toLowerCase().includes('fir') ? 'fir' : doc.title?.toLowerCase().includes('agreement') ? 'agreement' : doc.title?.toLowerCase().includes('aadhaar') ? 'aadhaar' : doc.title?.toLowerCase().includes('court') ? 'court_order' : 'custom');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'} overflow-hidden`}>
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Viewer Modal Dialog */}
      <div
        className={`relative bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col transition-all duration-200 z-10 ${
          isFullscreen ? 'w-screen h-screen rounded-none border-none' : 'w-full max-w-5xl h-[90vh]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
              PDF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{doc.title}</h3>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {doc.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Case: <span className="text-blue-400 font-semibold">{caseData?.id || 'CASE-1024'}</span> ({caseData?.clientName}) &bull; Size: {doc.fileSize || '2.4 MB'}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Document"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas View */}
        <div className="flex-1 bg-slate-950 overflow-auto p-4 sm:p-8 flex items-center justify-center">
          <div
            className="bg-white text-slate-900 shadow-2xl rounded-sm transition-transform origin-top w-full max-w-3xl min-h-[850px] p-8 sm:p-14 relative selection:bg-navy-900 selection:text-white"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Watermark Seal in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <Scale className="w-96 h-96 text-navy-900" />
            </div>

            {/* --- TEMPLATE 1: FIR.pdf --- */}
            {previewType === 'fir' && (
              <div className="space-y-6 text-xs text-slate-800 font-serif">
                {/* Government Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <div className="flex justify-center mb-1">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-slate-900" />
                    </div>
                  </div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    TAMIL NADU POLICE DEPARTMENT
                  </h2>
                  <h3 className="text-sm font-semibold uppercase">FIRST INFORMATION REPORT (F.I.R.)</h3>
                  <p className="text-[10px] text-slate-600 font-sans">(Under Section 154 Cr.P.C.)</p>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-3 font-sans text-xs border border-slate-300 p-3 bg-slate-50/50 rounded">
                  <div>
                    <span className="text-slate-500 font-semibold block">District / City:</span>
                    <span className="font-bold text-slate-900">Greater Chennai Police</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Police Station:</span>
                    <span className="font-bold text-slate-900">E-1 Mylapore Police Station</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">FIR Number & Year:</span>
                    <span className="font-bold text-rose-700 font-mono">Crime No. 412 / 2025</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Date & Time of FIR:</span>
                    <span className="font-semibold text-slate-800">14-Aug-2025 at 11:30 hrs</span>
                  </div>
                </div>

                {/* Acts & Sections */}
                <div className="border border-slate-300 p-3 bg-white space-y-1 font-sans">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Acts & Applicable Sections:</span>
                  <p className="text-xs font-semibold text-navy-900">
                    1. Indian Penal Code (IPC) - Sections 420 (Cheating), 406 (Criminal Breach of Trust), 120-B.
                  </p>
                </div>

                {/* Complainant & Accused */}
                <div className="grid grid-cols-2 gap-4 font-sans border border-slate-300 p-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Complainant / Informant:</span>
                    <p className="font-bold text-slate-900 text-sm">{caseData?.clientName || 'Arun Kumar'}</p>
                    <p className="text-slate-600 text-[11px]">S/o M. Sundararajan, Aged 42 years</p>
                    <p className="text-slate-600 text-[11px]">Residing at Anna Nagar, Chennai - 600040</p>
                    <p className="text-slate-600 text-[11px]">Phone: +91 {caseData?.clientMobile || '9876543210'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Accused Details:</span>
                    <p className="font-bold text-slate-900 text-sm">{caseData?.opposingParty || 'Apex Commercial Properties Ltd.'}</p>
                    <p className="text-slate-600 text-[11px]">Managing Director & Operating Officers</p>
                    <p className="text-slate-600 text-[11px]">Mount Road Complex, Chennai - 600002</p>
                  </div>
                </div>

                {/* Brief statement */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans border-b border-slate-200 pb-1">
                    Brief Statement of Complaint:
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-serif">
                    The complainant {caseData?.clientName || 'Arun Kumar'} appeared at the police station and submitted a written petition stating that the accused entered into a commercial contract and subsequently committed unauthorized alienation, breach of registered terms, and withheld funds amounting to commercial misappropriation. Upon preliminary enquiry, case is registered and submitted for court verification.
                  </p>
                </div>

                {/* Official Stamp & Signatures */}
                <div className="pt-8 flex items-end justify-between font-sans text-xs">
                  <div className="border-2 border-dashed border-blue-600/60 p-2 text-center rounded w-36 rotate-2 text-blue-900">
                    <p className="text-[9px] font-bold uppercase">POLICE STATION SEAL</p>
                    <p className="text-[8px]">Certified True Copy</p>
                    <p className="text-[8px]">14-08-2025</p>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-slate-800 mx-auto"></div>
                    <p className="font-bold text-slate-900">Inspector of Police</p>
                    <p className="text-[10px] text-slate-500">Law & Order, Mylapore PS</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEMPLATE 2: Agreement.pdf --- */}
            {previewType === 'agreement' && (
              <div className="space-y-6 text-xs text-slate-800 font-serif">
                {/* Stamp Paper Header */}
                <div className="border-4 border-double border-amber-700/80 p-4 text-center bg-amber-50/40 rounded space-y-1 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-900 uppercase">
                    <span>INDIA NON JUDICIAL</span>
                    <span>GOVERNMENT OF TAMIL NADU</span>
                    <span>Rs. 100</span>
                  </div>
                  <h2 className="text-lg font-black tracking-widest text-amber-950 uppercase pt-2">
                    COMMERCIAL LEASE & TENANCY AGREEMENT
                  </h2>
                  <p className="text-[10px] text-amber-800">Stamp Duty Paid Vide Challan No. TN-CH-2021-998124</p>
                </div>

                {/* Parties */}
                <div className="space-y-3 leading-relaxed">
                  <p>
                    This <strong>COMMERCIAL LEASE AGREEMENT</strong> is made and executed on this <strong>12th day of March, 2021</strong> at Chennai, Tamil Nadu by and between:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans space-y-1">
                    <p>
                      <strong>LESSOR:</strong> <strong>{caseData?.clientName || 'Arun Kumar'}</strong>, Indian Inhabitant, residing at Chennai (hereinafter referred to as the <em>"FIRST PARTY"</em>).
                    </p>
                    <p className="text-center font-bold text-xs text-slate-400">— AND —</p>
                    <p>
                      <strong>LESSEE:</strong> <strong>{caseData?.opposingParty || 'Apex Commercial Properties Ltd.'}</strong>, having registered office at Chennai (hereinafter referred to as the <em>"SECOND PARTY"</em>).
                    </p>
                  </div>
                </div>

                {/* Key Clauses */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-xs border-b border-slate-200 pb-1 font-sans">
                    Terms & Conditions of Tenancy:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                    <li>
                      <strong>Demised Premises:</strong> The Lessor hereby leases the commercial property situated at Prime Mount Road, Chennai comprising 4,500 sq.ft for commercial office usage only.
                    </li>
                    <li>
                      <strong>Tenure:</strong> The lease shall be valid for an initial term of 5 (Five) years commencing from April 01, 2021.
                    </li>
                    <li>
                      <strong>Monthly Rent:</strong> The Lessee agrees to pay a monthly rent of ₹1,85,000/- subject to an escalation of 5% every 12 months.
                    </li>
                    <li>
                      <strong>Restriction on Sub-Lease (Clause 14):</strong> The Lessee shall strictly not sublet, assign, or part with the possession of the demised premises to any third party without express written consent.
                    </li>
                  </ol>
                </div>

                {/* Signatures & Execution */}
                <div className="pt-8 grid grid-cols-2 gap-8 font-sans">
                  <div className="text-center space-y-1">
                    <div className="w-40 border-b border-slate-800 mx-auto pt-6"></div>
                    <p className="font-bold text-slate-900">{caseData?.clientName || 'Arun Kumar'}</p>
                    <p className="text-[10px] text-slate-500">LESSOR (First Party)</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-40 border-b border-slate-800 mx-auto pt-6"></div>
                    <p className="font-bold text-slate-900">Authorized Signatory</p>
                    <p className="text-[10px] text-slate-500">LESSEE (Second Party)</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEMPLATE 3: Aadhaar.pdf --- */}
            {previewType === 'aadhaar' && (
              <div className="space-y-6 text-xs text-slate-800 font-sans">
                {/* Aadhaar Header */}
                <div className="border-b-4 border-red-600 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center font-bold text-amber-800">
                      UIDAI
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        UNIQUE IDENTIFICATION AUTHORITY OF INDIA
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold">Government of India &bull; भारत सरकार</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      VERIFIED KYC
                    </span>
                  </div>
                </div>

                {/* Aadhaar Card View */}
                <div className="border-2 border-slate-300 rounded-xl p-6 bg-gradient-to-r from-amber-50/20 via-white to-orange-50/20 shadow-inner space-y-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Photo */}
                    <div className="w-28 h-32 bg-slate-200 border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <User className="w-12 h-12 text-slate-400 mb-1" />
                      <span className="text-[9px] font-bold uppercase">Photograph</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Name / பெயர்:</span>
                        <p className="text-base font-bold text-slate-900">{caseData?.clientName || 'Arun Kumar'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">DOB / பிறந்த தேதி:</span>
                          <p className="font-semibold text-slate-800">15/06/1982</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender / பாலினம்:</span>
                          <p className="font-semibold text-slate-800">Male / ஆண்</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Address / முகவரி:</span>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          No. 14, 2nd Cross Street, Anna Nagar West, Chennai, Tamil Nadu - 600040
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Masked Aadhaar Number Bar */}
                  <div className="border-t-2 border-red-600 pt-3 text-center">
                    <p className="text-xl font-mono font-black tracking-widest text-slate-900">
                      XXXX &bull; XXXX &bull; 4892
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      ஆதார் - சாமானியனின் உரிமை &bull; Aadhaar - Proof of Identity
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Document e-verified on legal register records on {formatDate(doc.uploadDate)}.</span>
                </div>
              </div>
            )}

            {/* --- TEMPLATE 4: Court_Order.pdf --- */}
            {previewType === 'court_order' && (
              <div className="space-y-6 text-xs text-slate-800 font-serif">
                {/* Court Emblem */}
                <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                  <div className="flex justify-center mb-1">
                    <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-navy-900" />
                    </div>
                  </div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 font-sans">
                    IN THE HIGH COURT OF JUDICATURE AT MADRAS
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 font-sans">(Special Original Jurisdiction)</p>
                  <p className="text-sm font-bold text-rose-800 font-mono pt-1">
                    WRIT PETITION No. 4812 OF 2025
                  </p>
                </div>

                {/* Coram */}
                <div className="font-sans text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-center font-semibold text-slate-800">
                  BEFORE THE HON'BLE MR. JUSTICE V. SIVAKUMAR & HON'BLE MR. JUSTICE R. SUBRAMANIAN
                </div>

                {/* Cause Title */}
                <div className="grid grid-cols-2 gap-4 font-sans text-xs border border-slate-300 p-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">PETITIONER:</span>
                    <p className="font-bold text-slate-900">{caseData?.clientName || 'Arun Kumar'}</p>
                    <p className="text-[11px] text-slate-500">Rep. by Counsel {caseData?.assignedJunior || 'Adv. Priya Sharma'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">RESPONDENTS:</span>
                    <p className="font-bold text-slate-900">{caseData?.opposingParty || 'Apex Commercial Properties Ltd.'}</p>
                    <p className="text-[11px] text-slate-500">Rep. by Counsel {caseData?.opposingAdvocate || 'Adv. R. Sankaran'}</p>
                  </div>
                </div>

                {/* Order Operative Paragraphs */}
                <div className="space-y-3 leading-relaxed">
                  <h4 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900">
                    AD-INTERIM ORDER:
                  </h4>
                  <p>
                    Heard the Learned Counsel appearing for the Petitioner and the Learned Counsel for the Respondents.
                  </p>
                  <p>
                    Upon perusing the affidavit, lease agreements, and prima facie evidence adduced, this Hon’ble Court is pleased to pass the following directions:
                  </p>
                  <div className="p-3 bg-slate-50 border-l-4 border-navy-900 font-sans text-xs space-y-1.5 font-medium text-slate-900">
                    <p>
                      <strong>1. STATUS QUO:</strong> Both parties are directed to strictly maintain <em>Status Quo</em> regarding possession of the demised commercial premises until the next date of hearing.
                    </p>
                    <p>
                      <strong>2. INJUNCTION:</strong> The Respondents are restrained from creating any further third-party encumbrance or alienating tenancy rights.
                    </p>
                    <p>
                      <strong>3. LISTING:</strong> Post the matter for filing Counter Affidavit and final hearing on <strong>08-Oct-2026</strong>.
                    </p>
                  </div>
                </div>

                {/* Seal & Registrar Signature */}
                <div className="pt-8 flex items-end justify-between font-sans text-xs">
                  <div className="border-2 border-dashed border-red-600/70 p-2 text-center rounded w-36 -rotate-3 text-red-900">
                    <p className="text-[9px] font-bold uppercase">HIGH COURT SEAL</p>
                    <p className="text-[8px] font-bold">CERTIFIED COPY</p>
                    <p className="text-[8px]">Issued on 20-09-2025</p>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-36 border-b border-slate-800 mx-auto"></div>
                    <p className="font-bold text-slate-900">Assistant Registrar (Judicial)</p>
                    <p className="text-[10px] text-slate-500">High Court, Madras</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TEMPLATE 5: Custom / Uploaded File --- */}
            {previewType === 'custom' && (
              <div className="space-y-6 text-xs text-slate-800 font-sans">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    LEGAL CASE DOCUMENT RECORD
                  </h2>
                  <p className="text-xs text-slate-500">{doc.category || 'Uploaded Record'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">File Title:</span>
                      <span className="font-bold text-slate-900">{doc.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Category:</span>
                      <span className="font-bold text-blue-700">{doc.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Upload Date:</span>
                      <span className="font-medium text-slate-800">{formatDate(doc.uploadDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Uploaded By:</span>
                      <span className="font-medium text-slate-800">{doc.uploadedBy || 'Admin'}</span>
                    </div>
                  </div>

                  {doc.description && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 font-semibold block mb-0.5">Remarks / Brief:</span>
                      <p className="text-slate-700 leading-relaxed">{doc.description}</p>
                    </div>
                  )}
                </div>

                <div className="p-8 text-center bg-slate-100 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">{doc.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Document verified and attached to Case {caseData?.id || 'CASE-1024'}.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Original File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Viewing: <strong className="text-slate-200">{doc.title}</strong></span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Legal Vault Encryption
          </span>
        </div>
      </div>
    </div>
  );
};
