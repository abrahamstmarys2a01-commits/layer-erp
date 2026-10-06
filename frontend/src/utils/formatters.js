/**
 * Format numbers into Indian Rupee format (e.g. ₹12,84,500)
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format date string into "DD MMM YYYY" (e.g., "08 Oct 2026")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Generate unique Case ID, Junior ID, Payment ID, Hearing ID
 */
export const generateId = (prefix, list) => {
  const currentMax = list.reduce((max, item) => {
    const id = item.id || item.caseId || item.juniorId || '';
    const match = id.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num > max ? num : max;
    }
    return max;
  }, 1000);
  return `${prefix}-${currentMax + 1}`;
};
