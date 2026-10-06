import express from 'express';
import { getCollection, resetDatabase } from '../database/db.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const juniors = getCollection('juniors');
  const cases = getCollection('cases');
  const amounts = getCollection('amounts');
  const hearings = getCollection('hearings');

  // Computed metrics
  const totalJuniors = juniors.length;
  const activeJuniors = juniors.filter((j) => j.status === 'Active').length;
  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.caseStatus === 'Active' || c.caseStatus === 'New').length;
  const upcomingHearings = hearings.filter((h) => h.status === 'Upcoming' || h.status === 'Today').length;
  const totalAmountReceived = amounts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Junior-wise case load
  const juniorWiseCounts = juniors
    .map((j) => ({
      name: j.name.replace('Adv. ', ''),
      cases: j.assignedCases || 0,
      active: j.activeCases || 0
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      stats: {
        totalJuniors,
        activeJuniors,
        totalCases,
        activeCases,
        upcomingHearings,
        totalAmountReceived
      },
      juniorWiseCounts,
      upcomingHearingsList: hearings.filter((h) => h.status === 'Upcoming' || h.status === 'Today').slice(0, 6),
      recentCases: cases.slice(0, 5),
      recentAmounts: amounts.slice(0, 5)
    }
  });
});

// POST /api/dashboard/reset
router.post('/reset', (req, res) => {
  const freshData = resetDatabase();
  res.json({ success: true, message: 'Database reset to original legal chamber records', data: freshData });
});

export default router;
