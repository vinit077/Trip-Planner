const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

// @desc    Get logged in user's itineraries
// @route   GET /api/itineraries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id })
      .populate('destination')
      .sort('-createdAt');
    res.json({ success: true, count: itineraries.length, itineraries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single itinerary details
// @route   GET /api/itineraries/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ _id: req.params.id, user: req.user.id })
      .populate('destination');
      
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create an itinerary
// @route   POST /api/itineraries
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { destinationId, title, startDate, endDate } = req.body;

    if (!destinationId || !title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // Verify destination exists
    const dest = await Destination.findById(destinationId);
    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    const dayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1);

    // Initialize daily plans
    const dailyPlans = [];
    for (let i = 1; i <= dayCount; i++) {
      dailyPlans.push({
        dayNumber: i,
        activities: []
      });
    }

    // Create itinerary
    const itinerary = await Itinerary.create({
      user: req.user.id,
      destination: destinationId,
      title,
      startDate,
      endDate,
      dailyPlans
    });

    // Auto-create associated budget
    await Budget.create({
      itinerary: itinerary._id,
      user: req.user.id,
      limit: 1000, // Default start limit
      expenses: []
    });

    res.status(201).json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update itinerary daily plans
// @route   PUT /api/itineraries/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, startDate, endDate, dailyPlans } = req.body;

    let itinerary = await Itinerary.findOne({ _id: req.params.id, user: req.user.id });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // Update fields if provided
    if (title) itinerary.title = title;
    if (startDate) itinerary.startDate = startDate;
    if (endDate) itinerary.endDate = endDate;
    if (dailyPlans) itinerary.dailyPlans = dailyPlans;

    // Recalculate daily plans if dates changed
    if (startDate || endDate) {
      const start = new Date(itinerary.startDate);
      const end = new Date(itinerary.endDate);
      const timeDiff = end - start;
      const newDayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1);

      const currentPlans = itinerary.dailyPlans;
      const updatedPlans = [];

      for (let i = 1; i <= newDayCount; i++) {
        // Keep existing plans if available, else create empty day
        const existingDay = currentPlans.find(plan => plan.dayNumber === i);
        updatedPlans.push({
          dayNumber: i,
          activities: existingDay ? existingDay.activities : []
        });
      }
      itinerary.dailyPlans = updatedPlans;
    }

    await itinerary.save();

    // After updating the dailyPlans, let's sync activity costs to the Budget as "Activities" expenses
    // Find associated budget
    const budget = await Budget.findOne({ itinerary: itinerary._id });
    if (budget) {
      // Filter out auto-synced activity expenses, and replace them with current ones
      // Let's identify them by starting with "Activity: "
      const userExpenses = budget.expenses.filter(exp => !exp.description.startsWith('[Timeline] '));
      
      const timelineExpenses = [];
      itinerary.dailyPlans.forEach(day => {
        day.activities.forEach(act => {
          if (act.cost && act.cost > 0) {
            timelineExpenses.push({
              category: 'Activities',
              description: `[Timeline] Day ${day.dayNumber}: ${act.activity}`,
              amount: act.cost,
              date: new Date(itinerary.startDate.getTime() + (day.dayNumber - 1) * 24 * 60 * 60 * 1000)
            });
          }
        });
      });

      budget.expenses = [...userExpenses, ...timelineExpenses];
      await budget.save();
    }

    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // Delete associated budget
    await Budget.findOneAndDelete({ itinerary: req.params.id });

    res.json({ success: true, message: 'Itinerary and associated budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
