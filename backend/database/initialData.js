export const initialData = {
  users: [
    {
      id: 'usr-1',
      username: 'admin',
      password: 'admin123',
      name: 'Senior Adv. R. Jayaraman',
      role: 'Admin / Managing Partner',
      email: 'admin@layererp.legal',
      mobile: '9840011223',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
    }
  ],
  juniors: [],
  cases: [],
  amounts: [],
  hearings: [],
  settings: {
    profile: {
      adminName: 'Senior Adv. R. Jayaraman',
      role: 'Managing Partner',
      email: 'admin@layererp.legal',
      mobile: '9840011223',
      barCouncilNo: 'MS/1084/1998',
      officeAddress: 'No. 42, Law Chambers, High Court Complex, Chennai - 600104',
      profileImage: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30m',
      requirePassChange: false,
      ipWhitelist: false
    },
    notifications: {
      whatsAppAlerts: true,
      emailNotifications: true,
      hearingMorningReminder: true,
      feeReceiptAutoSend: true
    },
    system: {
      chamberName: 'Jayaraman & Associates',
      currency: 'INR (₹)',
      dateFormat: 'DD/MM/YYYY',
      theme: 'Light Modern'
    }
  }
};
