const { validationResult } = require('express-validator');
const Station = require('../models/Station');

// @desc    Get all stations with filters
// @route   GET /api/stations
// @access  Private
exports.getStations = async (req, res, next) => {
  try {
    const { status, connectorType, minPower, maxPower, page = 1, limit = 100 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (connectorType) filter.connectorType = connectorType;
    if (minPower || maxPower) {
      filter.powerOutput = {};
      if (minPower) filter.powerOutput.$gte = Number(minPower);
      if (maxPower) filter.powerOutput.$lte = Number(maxPower);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Station.countDocuments(filter);
    const stations = await Station.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: stations.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: stations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Private
exports.getStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id).populate('createdBy', 'name email');
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found.' });
    }
    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

// @desc    Create station
// @route   POST /api/stations
// @access  Private
exports.createStation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const station = await Station.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private
exports.updateStation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    let station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found.' });
    }

    station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found.' });
    }

    await station.deleteOne();
    res.json({ success: true, message: 'Station deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
