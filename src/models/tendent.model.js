const mongoose = require('mongoose');

const tendentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin' // Admin who owns this salon
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial'],
    default: 'active'
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Plan' // We will create this model later
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  featureFlags: {
    type: Map,
    of: Boolean,
    default: {}
  },
  settings: {
    type: Object,
    default: {}
  },
  theme: {
    logo: { type: String, default: '' },
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#ffffff' },
    font: { type: String, default: 'Inter' }
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Tendent', tendentSchema);
