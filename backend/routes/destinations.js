const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.json({ success: true, count: destinations.length, destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a destination
// @route   POST /api/destinations
// @access  Public (for development/administration)
router.post('/', async (req, res) => {
  try {
    const { name, description, location, imageUrl, category, activities } = req.body;

    if (!name || !description || !location || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, location, and imageUrl' });
    }

    const destination = await Destination.create({
      name,
      description,
      location,
      imageUrl,
      category,
      activities
    });

    res.status(201).json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
