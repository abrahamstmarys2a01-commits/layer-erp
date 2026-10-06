export const initialSettings = {
  profile: {
    adminName: 'Senior Adv. R. Jayaraman',
    email: 'admin@layererp.legal',
    mobile: '9840011223',
    role: 'Principal Advocate & Managing Partner',
    barCouncilNo: 'TN/0412/1998',
    officeAddress: 'Chambers 401, Apex Legal Towers, Parry’s, Chennai - 600001',
    profileImage: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: '30 Minutes',
    ipRestriction: false,
    auditLog: true
  },
  caseSettings: {
    caseTypes: ['Civil', 'Criminal', 'Family', 'Property', 'Corporate', 'Labour', 'Consumer', 'Other'],
    caseStatuses: ['New', 'Active', 'Pending', 'Closed'],
    courts: [
      'Madras High Court',
      'District Court',
      'Sessions Court',
      'Magistrate Court',
      'Family Court',
      'NCLT Chennai Bench',
      'Labour Court'
    ],
    hearingTypes: ['First Hearing', 'Arguments', 'Evidence', 'Cross Examination', 'Final Hearing', 'Order', 'Other']
  },
  notifications: {
    hearingReminderWhatsapp: true,
    twoDaysBefore: true,
    oneDayBefore: true,
    onHearingMorning: true,
    paymentReceiptSms: true,
    juniorAssignmentAlert: true
  },
  system: {
    theme: 'Dark Navy / Light Modern',
    currency: 'INR (₹)',
    dateFormat: 'DD MMM YYYY',
    fiscalYearStart: '01 April'
  }
};
