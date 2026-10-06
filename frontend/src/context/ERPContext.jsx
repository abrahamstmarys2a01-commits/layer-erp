import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialJuniors } from '../data/mockJuniors';
import { initialCases } from '../data/mockCases';
import { initialAmounts } from '../data/mockAmounts';
import { initialHearings } from '../data/mockHearings';
import { initialSettings } from '../data/mockSettings';
import { generateId } from '../utils/formatters';
import { api } from '../services/api';

const ERPContext = createContext(null);

export const ERPProvider = ({ children }) => {
  // Load initial state
  const [juniors, setJuniors] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_juniors');
      return saved ? JSON.parse(saved) : initialJuniors;
    } catch {
      return initialJuniors;
    }
  });

  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_cases');
      return saved ? JSON.parse(saved) : initialCases;
    } catch {
      return initialCases;
    }
  });

  const [amounts, setAmounts] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_amounts');
      return saved ? JSON.parse(saved) : initialAmounts;
    } catch {
      return initialAmounts;
    }
  });

  const [hearings, setHearings] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_hearings');
      return saved ? JSON.parse(saved) : initialHearings;
    } catch {
      return initialHearings;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [toasts, setToasts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync data from backend API on initial mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [jRes, cRes, aRes, hRes, sRes] = await Promise.allSettled([
          api.getJuniors(),
          api.getCases(),
          api.getAmounts(),
          api.getHearings(),
          api.getSettings(),
        ]);

        if (jRes.status === 'fulfilled' && jRes.value?.data) {
          setJuniors(jRes.value.data);
          setIsBackendConnected(true);
        }
        if (cRes.status === 'fulfilled' && cRes.value?.data) {
          setCases(cRes.value.data);
        }
        if (aRes.status === 'fulfilled' && aRes.value?.data) {
          setAmounts(aRes.value.data);
        }
        if (hRes.status === 'fulfilled' && hRes.value?.data) {
          setHearings(hRes.value.data);
        }
        if (sRes.status === 'fulfilled' && sRes.value?.data) {
          setSettings(sRes.value.data);
        }
      } catch (err) {
        console.warn('Connected in standalone mode:', err.message);
      }
    };

    fetchBackendData();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('layer_erp_juniors', JSON.stringify(juniors));
  }, [juniors]);

  useEffect(() => {
    localStorage.setItem('layer_erp_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('layer_erp_amounts', JSON.stringify(amounts));
  }, [amounts]);

  useEffect(() => {
    localStorage.setItem('layer_erp_hearings', JSON.stringify(hearings));
  }, [hearings]);

  useEffect(() => {
    localStorage.setItem('layer_erp_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast System
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- JUNIOR ACTIONS ---
  const addJunior = async (juniorData) => {
    const newId = generateId('JUN', juniors);
    const newJunior = {
      ...juniorData,
      id: newId,
      assignedCases: 0,
      activeCases: 0,
      closedCases: 0,
      joinedDate: juniorData.joinedDate || new Date().toISOString().split('T')[0],
      status: juniorData.status || 'Active'
    };

    setJuniors((prev) => [newJunior, ...prev]);
    showToast('Junior added successfully.');

    // Async sync with backend
    try {
      await api.createJunior(newJunior);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }

    return newJunior;
  };

  const updateJunior = async (id, updatedData) => {
    setJuniors((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updatedData } : j))
    );
    showToast('Junior updated successfully.');

    try {
      await api.updateJunior(id, updatedData);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const deleteJunior = async (id) => {
    setJuniors((prev) => prev.filter((j) => j.id !== id));
    showToast('Junior deleted successfully.');

    try {
      await api.deleteJunior(id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const toggleJuniorStatus = async (id) => {
    setJuniors((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const newStatus = j.status === 'Active' ? 'Inactive' : 'Active';
          return { ...j, status: newStatus };
        }
        return j;
      })
    );
    showToast('Junior status updated.');

    try {
      await api.toggleJuniorStatus(id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  // --- CASE ACTIONS ---
  const addCase = async (caseData) => {
    const newId = caseData.id || generateId('CASE', cases);
    const totalFee = Number(caseData.totalFee || 50000);
    const paidAmount = Number(caseData.paidAmount || 0);
    const amountStatus =
      paidAmount >= totalFee
        ? 'Paid'
        : paidAmount > 0
        ? 'Partial'
        : 'Pending';

    const newCase = {
      ...caseData,
      id: newId,
      caseStatus: caseData.caseStatus || 'New',
      totalFee,
      paidAmount,
      amountStatus: caseData.amountStatus || amountStatus,
      filingDate: caseData.filingDate || new Date().toISOString().split('T')[0],
      documents: caseData.documents || [],
      notes: caseData.notes || []
    };

    setCases((prev) => [newCase, ...prev]);

    // Update Junior's assigned case count if assigned
    if (caseData.assignedJunior) {
      setJuniors((prev) =>
        prev.map((j) => {
          if (j.name === caseData.assignedJunior) {
            return {
              ...j,
              assignedCases: (j.assignedCases || 0) + 1,
              activeCases: (j.activeCases || 0) + 1
            };
          }
          return j;
        })
      );
    }

    // If next hearing date is provided, create initial hearing entry
    if (caseData.nextHearingDate && caseData.nextHearingDate !== '-') {
      const newHearingId = generateId('HRG', hearings);
      const newHearing = {
        id: newHearingId,
        caseId: newId,
        clientName: caseData.clientName,
        clientMobile: caseData.clientMobile,
        junior: caseData.assignedJunior,
        court: caseData.court,
        hearingDate: caseData.nextHearingDate,
        time: '10:30 AM',
        hearingType: 'First Hearing',
        status: 'Upcoming',
        courtHall: 'Court Hall No. 1',
        notes: `Initial listing for ${newId}`
      };
      setHearings((prev) => [newHearing, ...prev]);
    }

    showToast('Case created successfully.');

    try {
      await api.createCase(newCase);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }

    return newCase;
  };

  const updateCase = async (id, updatedData) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    showToast('Case updated successfully.');

    try {
      await api.updateCase(id, updatedData);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const deleteCase = async (id) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    showToast('Case deleted successfully.');

    try {
      await api.deleteCase(id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const addCaseNote = async (caseId, noteText, author = 'Admin') => {
    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      author,
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            notes: [newNote, ...(c.notes || [])]
          };
        }
        return c;
      })
    );
    showToast('Note added to case history.');

    try {
      await api.addCaseNote(caseId, { text: noteText, author });
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const addCaseDocument = async (caseId, docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docData.title || 'Document.pdf',
      category: docData.category || 'General Legal Document',
      fileType: docData.fileType || 'PDF',
      fileSize: docData.fileSize || '1.8 MB',
      uploadDate: docData.uploadDate || new Date().toISOString().split('T')[0],
      uploadedBy: docData.uploadedBy || 'Admin',
      description: docData.description || 'Uploaded case record document.',
      previewType: docData.previewType || 'custom',
      fileDataUrl: docData.fileDataUrl || null
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            documents: [newDoc, ...(c.documents || [])]
          };
        }
        return c;
      })
    );
    showToast('Document uploaded successfully.');

    try {
      await api.addCaseDocument(caseId, docData);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }

    return newDoc;
  };

  const deleteCaseDocument = async (caseId, docId) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            documents: (c.documents || []).filter((d) => d.id !== docId)
          };
        }
        return c;
      })
    );
    showToast('Document deleted.');

    try {
      await api.deleteCaseDocument(caseId, docId);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  // --- AMOUNT ACTIONS ---
  const addAmount = async (amountData) => {
    const newId = generateId('TXN', amounts);
    const amountVal = Number(amountData.amount || 0);

    const newAmount = {
      ...amountData,
      id: newId,
      amount: amountVal,
      paymentDate: amountData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMode: amountData.paymentMode || 'UPI',
      addedBy: amountData.addedBy || 'Admin',
      receiptNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`
    };

    setAmounts((prev) => [newAmount, ...prev]);

    // Also update Case paidAmount and amountStatus
    if (amountData.caseId) {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === amountData.caseId) {
            const updatedPaid = (c.paidAmount || 0) + amountVal;
            const updatedStatus =
              updatedPaid >= (c.totalFee || 50000)
                ? 'Paid'
                : updatedPaid > 0
                ? 'Partial'
                : 'Pending';
            return {
              ...c,
              paidAmount: updatedPaid,
              amountStatus: updatedStatus
            };
          }
          return c;
        })
      );
    }

    showToast('Amount entry added successfully.');

    try {
      await api.createAmount(newAmount);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }

    return newAmount;
  };

  const updateAmount = async (id, updatedData) => {
    setAmounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData } : a))
    );
    showToast('Amount entry updated successfully.');

    try {
      await api.updateAmount(id, updatedData);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const deleteAmount = async (id) => {
    setAmounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Amount entry deleted successfully.');

    try {
      await api.deleteAmount(id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  // --- HEARING ACTIONS ---
  const addHearing = async (hearingData) => {
    const newId = generateId('HRG', hearings);
    const newHearing = {
      ...hearingData,
      id: newId,
      status: hearingData.status || 'Upcoming',
      hearingDate: hearingData.hearingDate || new Date().toISOString().split('T')[0],
      time: hearingData.time || '10:30 AM'
    };

    setHearings((prev) => [newHearing, ...prev]);

    // Update case nextHearingDate if applicable
    if (hearingData.caseId && hearingData.hearingDate) {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === hearingData.caseId) {
            return {
              ...c,
              nextHearingDate: hearingData.hearingDate
            };
          }
          return c;
        })
      );
    }

    showToast('Hearing added successfully.');

    try {
      await api.createHearing(newHearing);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }

    return newHearing;
  };

  const updateHearing = async (id, updatedData) => {
    setHearings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updatedData } : h))
    );
    showToast('Hearing updated successfully.');

    try {
      await api.updateHearing(id, updatedData);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const deleteHearing = async (id) => {
    setHearings((prev) => prev.filter((h) => h.id !== id));
    showToast('Hearing deleted successfully.');

    try {
      await api.deleteHearing(id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  const sendWhatsAppReminder = async (hearing) => {
    showToast('WhatsApp reminder sent successfully.');

    try {
      await api.sendWhatsAppReminder(hearing.id);
    } catch (e) {
      console.warn('Backend sync:', e.message);
    }
  };

  // Reset to Mock
  const resetToMockData = async () => {
    setJuniors(initialJuniors);
    setCases(initialCases);
    setAmounts(initialAmounts);
    setHearings(initialHearings);
    setSettings(initialSettings);
    localStorage.removeItem('layer_erp_juniors');
    localStorage.removeItem('layer_erp_cases');
    localStorage.removeItem('layer_erp_amounts');
    localStorage.removeItem('layer_erp_hearings');
    localStorage.removeItem('layer_erp_settings');
    showToast('Reset to original legal practice records.');

    try {
      await api.resetData();
    } catch (e) {
      console.warn('Backend reset sync:', e.message);
    }
  };

  // Calculated Metrics
  const totalJuniorsCount = juniors.length;
  const activeJuniorsCount = juniors.filter((j) => j.status === 'Active').length;
  const totalCasesCount = cases.length;
  const activeCasesCount = cases.filter((c) => c.caseStatus === 'Active' || c.caseStatus === 'New').length;
  const upcomingHearingsCount = hearings.filter((h) => h.status === 'Upcoming' || h.status === 'Today').length;
  const totalAmountReceived = amounts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <ERPContext.Provider
      value={{
        juniors,
        cases,
        amounts,
        hearings,
        settings,
        setSettings,
        toasts,
        showToast,
        removeToast,
        isBackendConnected,
        // Actions
        addJunior,
        updateJunior,
        deleteJunior,
        toggleJuniorStatus,
        addCase,
        updateCase,
        deleteCase,
        addCaseNote,
        addCaseDocument,
        deleteCaseDocument,
        addAmount,
        updateAmount,
        deleteAmount,
        addHearing,
        updateHearing,
        deleteHearing,
        sendWhatsAppReminder,
        resetToMockData,
        // Computed Stats
        stats: {
          totalJuniors: totalJuniorsCount,
          activeJuniors: activeJuniorsCount,
          totalCases: totalCasesCount,
          activeCases: activeCasesCount,
          upcomingHearings: upcomingHearingsCount,
          totalAmountReceived
        }
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
