const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      },
      address: {
        type: String,
        trim: true,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    powerOutput: {
      type: Number,
      required: [true, 'Power output is required'],
      min: [0, 'Power output must be positive'],
      comment: 'Power output in kW'
    },
    connectorType: {
      type: String,
      required: [true, 'Connector type is required'],
      enum: ['CCS', 'CHAdeMO', 'Type 2', 'Type 1', 'GB/T', 'Tesla']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Index for geo queries
stationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
stationSchema.index({ status: 1 });
stationSchema.index({ connectorType: 1 });

module.exports = mongoose.model('Station', stationSchema);
