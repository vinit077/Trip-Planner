const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  time: {
    type: String,
    default: ''
  },
  activity: {
    type: String,
    required: [true, 'Please add an activity description']
  },
  notes: {
    type: String,
    default: ''
  },
  cost: {
    type: Number,
    default: 0
  }
});

const DailyPlanSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  activities: [ActivitySchema]
});

const ItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a trip title']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  dailyPlans: [DailyPlanSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
