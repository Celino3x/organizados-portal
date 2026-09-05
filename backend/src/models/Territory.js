const mongoose = require('mongoose');

const TerritorySchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['residential', 'commercial', 'mixed', 'condominium'],
    default: 'residential'
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'completed'],
    default: 'available'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  visits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Territory', TerritorySchema);