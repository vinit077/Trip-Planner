const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a destination name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location (e.g., Tokyo, Japan)']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  category: {
    type: String,
    enum: ['Adventure', 'Beach', 'Cultural', 'City', 'Nature', 'Other'],
    default: 'Other'
  },
  activities: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Destination', DestinationSchema);
