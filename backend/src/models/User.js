const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // Nível de acesso: 'viewer' | 'support' | 'admin'
  accessLevel: {
    type: String,
    enum: ['viewer', 'support', 'admin'],
    default: 'viewer'
  },
  // Permissões específicas
  permissions: {
    canMakePublicTalk: {
      type: Boolean,
      default: false
    },
    canMakeMeetingParts: {
      type: Boolean,
      default: false
    },
    canManageTerritories: {
      type: Boolean,
      default: false
    },
    canManageDesignations: {
      type: Boolean,
      default: false
    },
    canManagePublishers: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: false
    }
  },
  // Informações pessoais (opcionais)
  phone: {
    type: String,
    default: null
  },
  cellphone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  baptismDate: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  class: {
    type: String,
    enum: ['other_sheep', 'anointed'],
    default: 'other_sheep'
  },
  // Privilégios
  privileges: {
    type: [String],
    enum: ['publisher', 'pioneer', 'ministerial_servant', 'elder'],
    default: ['publisher']
  },
  // Dados da congregação
  congregation: {
    type: String,
    required: true
  },
  group: {
    type: String,
    default: null
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  photo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ congregation: 1 });
UserSchema.index({ group: 1 });

module.exports = mongoose.model('User', UserSchema);