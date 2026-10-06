import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const UploadDocumentModal = ({ isOpen, onClose, caseId }) => {
  const { addCaseDocument } = useERP();

  const [formData, setFormData] = useState({
    title: 'FIR.pdf',
    category: 'Police Complaint & FIR',
    fileSize: '2.1 MB',
    description: '',
    uploadDate: new Date().toISOString().split('T')[0],
    uploadedBy: 'Admin'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const categoryPresets = [
    { label: 'Police Complaint & FIR (FIR.pdf)', title: 'FIR.pdf', category: 'Police Complaint & FIR', previewType: 'fir' },
    { label: 'Agreement / Contract (Agreement.pdf)', title: 'Agreement.pdf', category: 'Commercial Contract / Lease', previewType: 'agreement' },
    { label: 'Identity Proof (Aadhaar.pdf)', title: 'Aadhaar.pdf', category: 'Identity Proof', previewType: 'aadhaar' },
    { label: 'Court Order (Court_Order.pdf)', title: 'Court_Order.pdf', category: 'Court Order / Injunction', previewType: 'court_order' },
    { label: 'Petition / Plaint', title: 'Plaint_Petition.pdf', category: 'Petition / Plaint', previewType: 'custom' },
    { label: 'Vakalatnama', title: 'Vakalatnama.pdf', category: 'Vakalatnama', previewType: 'custom' },
    { label: 'Other Document', title: 'Document.pdf', category: 'General Legal Document', previewType: 'custom' }
  ];

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      previewType: preset.previewType
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFormData((prev) => ({
        ...prev,
        title: file.name,
        fileSize: `${sizeInMb} MB`,
        previewType: file.name.toLowerCase().includes('fir') ? 'fir' : file.name.toLowerCase().includes('agreement') ? 'agreement' : file.name.toLowerCase().includes('aadhaar') ? 'aadhaar' : file.name.toLowerCase().includes('court') ? 'court_order' : 'custom'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Document title is required.');
      return;
    }

    addCaseDocument(caseId, {
      ...formData,
      fileType: formData.title.endsWith('.pdf') ? 'PDF' : formData.title.endsWith('.docx') ? 'DOCX' : 'IMG'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Case Document"
      subtitle={`Attach legal records, FIRs, deeds, or court orders to ${caseId}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick presets buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Quick Document Templates
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categoryPresets.slice(0, 4).map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  formData.title === p.title
                    ? 'bg-navy-900 text-white border-navy-900 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📄 {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* File Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Upload File (PDF / Images / Docs)
          </label>
          <label className="border-2 border-dashed border-slate-300 hover:border-navy-600 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition-colors">
            <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-xs font-bold text-navy-900">
              {selectedFile ? selectedFile.name : 'Click to select or drag & drop document'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports FIR.pdf, Agreement.pdf, Aadhaar.pdf, Court_Order.pdf (Max 25 MB)
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Document Title"
            required
            placeholder="e.g. FIR.pdf"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Document Category"
            required
            placeholder="e.g. Police Complaint & FIR"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date of Document / Upload"
            type="date"
            value={formData.uploadDate}
            onChange={(e) => setFormData({ ...formData, uploadDate: e.target.value })}
          />
          <Input
            label="Uploaded By"
            value={formData.uploadedBy}
            onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Remarks & Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Certified true copy obtained from Registry..."
            className="w-full rounded-lg border border-slate-300 focus:ring-navy-600 focus:border-navy-600 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
