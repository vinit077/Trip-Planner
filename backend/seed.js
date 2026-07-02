const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('./models/Destination');

dotenv.config();

const destinations = [
  {
    name: 'Tokyo',
    location: 'Tokyo, Japan',
    description: 'A dazzling mixture of ultramodern skyscraper towers, flashing neon lights, and serene historic temples.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    category: 'City',
    activities: ['Visit Senso-ji Temple', 'Explore Shibuya Crossing', 'Sushi tasting in Tsukiji', 'Stroll through Shinjuku Gyoen National Garden']
  },
  {
    name: 'Paris',
    location: 'Paris, France',
    description: 'The global center for art, fashion, gastronomy, and historic 19th-century architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    category: 'Cultural',
    activities: ['Climb the Eiffel Tower', 'Tour the Louvre Museum', 'Walk down Champs-Élysées', 'Cruise along the Seine River']
  },
  {
    name: 'Bali',
    location: 'Bali, Indonesia',
    description: 'A lush tropical island famed for its forested volcanic mountains, iconic rice paddies, and stunning sandy beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    category: 'Beach',
    activities: ['Surf in Uluwatu', 'Visit Ubud Monkey Forest', 'Relax on Seminyak beach', 'Temple tour of Tanah Lot']
  },
  {
    name: 'Rome',
    location: 'Rome, Italy',
    description: 'A sprawling city with nearly 3,000 years of globally influential art, architecture, and ruins on display.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    category: 'Cultural',
    activities: ['Tour the Colosseum', 'Make a wish at Trevi Fountain', 'Explore the Vatican Museums', 'Enjoy authentic Carbonara in Trastevere']
  },
  {
    name: 'Reykjavik',
    location: 'Reykjavik, Iceland',
    description: 'The capital of Iceland, known for geothermal hot springs, volcanic landscapes, and viewing the Northern Lights.',
    imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=800&q=80',
    category: 'Nature',
    activities: ['Soak in the Blue Lagoon', 'Drive the Golden Circle', 'Hunt for the Northern Lights', 'Visit Gullfoss Waterfall']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trip-planner');
    
    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('Cleared existing destinations');
    
    // Insert new destinations
    await Destination.insertMany(destinations);
    console.log('Successfully seeded database with featured destinations!');
    
    process.exit();
  } catch (error) {
    console.error('Seeding database failed:', error.message);
    process.exit(1);
  }
};

seedDB();
