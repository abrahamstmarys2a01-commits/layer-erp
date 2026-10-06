import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useERP } from '../../context/ERPContext';
import { User, Phone, Mail, Award, MapPin, ShieldCheck, Briefcase, Calendar } from 'lucide-react';

export const AddEditJuniorModal = ({ isOpen, onClose, juniorToEdit }) => {
  const { addJunior, updateJunior } = useERP();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    specialization: 'Civil & Property Law',
    barCouncilNo: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (juniorToEdit) {
      setFormData({
        name: juniorToEdit.name || '',
        mobile: juniorToEdit.mobile || '',
        email: juniorToEdit.email || '',
        address: juniorToEdit.address || '',
        specialization: juniorToEdit.specialization || 'Civil & Property Law',
        barCouncilNo: juniorToEdit.barCouncilNo || '',
        status: juniorToEdit.status || 'Active',
        joinedDate: juniorToEdit.joinedDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        email: '',
        address: '',
        specialization: 'Civil & Property Law',
        barCouncilNo: '',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [juniorToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Junior advocate name is required';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (juniorToEdit) {
      updateJunior(juniorToEdit.id, formData);
    } else {
      addJunior(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={juniorToEdit ? `Edit Junior Advocate – ${juniorToEdit.name}` : 'Add New Junior Advocate'}
      subtitle="Register advocate credentials, contact information, bar council details, and chamber assignment"
      size="fullscreen"
      defaultFullscreen={true}
    >
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-6">
        {/* Section 1: Personal & Contact Information */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <User className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Advocate Identity & Contact Details
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Junior Advocate Full Name"
              required
              placeholder="e.g. Adv. Priya Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Mobile Number (Primary)"
              required
              placeholder="e.g. 9876543210"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              error={errors.mobile}
            />

            <Input
              label="Official Email Address"
              type="email"
              required
              placeholder="e.g. priya.sharma@layererp.legal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
          </div>
        </div>

        {/* Section 2: Bar Council & Specialization */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Award className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Bar Enrollment & Practice Specialization
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Bar Council Enrollment No."
              placeholder="e.g. TN/1420/2020"
              value={formData.barCouncilNo}
              onChange={(e) => setFormData({ ...formData, barCouncilNo: e.target.value })}
            />

            <Select
              label="Primary Practice Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              options={[
                'Civil & Property Law',
                'Criminal & Bail Matters',
                'Corporate & Commercial',
                'Family & Matrimonial',
                'Labour & Service Law',
                'Consumer Protection',
                'Arbitration & Contracts'
              ]}
            />

            <Input
              label="Joined Chamber Date"
              type="date"
              value={formData.joinedDate}
              onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Chamber & Residence Address */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Chamber & Residence Address
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Office / Chamber / Residence Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter residential or chamber street address..."
              className="w-full rounded-lg border border-slate-300 focus:ring-navy-600 focus:border-navy-600 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 transition-colors"
            />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="px-8">
            {juniorToEdit ? 'Save Changes' : 'Save Junior Advocate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
