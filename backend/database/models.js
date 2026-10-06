import mongoose from 'mongoose';

// Flexible Mongoose Schema for Layer ERP Collections
const createCollectionSchema = () => {
  return new mongoose.Schema({
    id: { type: String, required: true, unique: true }
  }, { 
    strict: false, 
    timestamps: true,
    versionKey: false
  });
};

export const UserModel = mongoose.models.User || mongoose.model('User', createCollectionSchema(), 'users');
export const JuniorModel = mongoose.models.Junior || mongoose.model('Junior', createCollectionSchema(), 'juniors');
export const CaseModel = mongoose.models.Case || mongoose.model('Case', createCollectionSchema(), 'cases');
export const AmountModel = mongoose.models.Amount || mongoose.model('Amount', createCollectionSchema(), 'amounts');
export const HearingModel = mongoose.models.Hearing || mongoose.model('Hearing', createCollectionSchema(), 'hearings');
export const SettingModel = mongoose.models.Setting || mongoose.model('Setting', createCollectionSchema(), 'settings');
