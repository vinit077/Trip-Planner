const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Flight', 'Lodging', 'Food', 'Activities', 'Transport', 'Shopping', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    required: [true, 'Please add an expense description']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an expense amount']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const BudgetSchema = new mongoose.Schema({
  itinerary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  limit: {
    type: Number,
    default: 0
  },
  expenses: [ExpenseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', BudgetSchema);
