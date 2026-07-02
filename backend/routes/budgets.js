const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Itinerary = require('../models/Itinerary');
const { protect } = require('../middleware/auth');

// @desc    Get budget details for a specific itinerary
// @route   GET /api/budgets/itinerary/:itineraryId
// @access  Private
router.get('/itinerary/:itineraryId', protect, async (req, res) => {
  try {
    let budget = await Budget.findOne({
      itinerary: req.params.itineraryId,
      user: req.user.id
    });

    if (!budget) {
      // Confirm itinerary belongs to user first
      const itinerary = await Itinerary.findOne({ _id: req.params.itineraryId, user: req.user.id });
      if (!itinerary) {
        return res.status(404).json({ success: false, message: 'Itinerary not found' });
      }

      // Create a default budget
      budget = await Budget.create({
        itinerary: req.params.itineraryId,
        user: req.user.id,
        limit: 1000,
        expenses: []
      });
    }

    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update budget limit or details
// @route   PUT /api/budgets/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { limit, expenses } = req.body;

    let budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (limit !== undefined) budget.limit = limit;
    if (expenses) budget.expenses = expenses;

    await budget.save();
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a manual expense to budget
// @route   POST /api/budgets/:id/expenses
// @access  Private
router.post('/:id/expenses', protect, async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide description and amount' });
    }

    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    budget.expenses.push({
      category: category || 'Other',
      description,
      amount,
      date: date || Date.now()
    });

    await budget.save();
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete an expense item from budget
// @route   DELETE /api/budgets/:id/expenses/:expenseId
// @access  Private
router.delete('/:id/expenses/:expenseId', protect, async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Filter out the selected expense
    budget.expenses = budget.expenses.filter(
      (expense) => expense._id.toString() !== req.params.expenseId
    );

    await budget.save();
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
