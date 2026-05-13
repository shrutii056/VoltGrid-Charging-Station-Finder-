const express = require("express");
const { body } = require("express-validator");
const {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
} = require("../controllers/stationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const stationValidation = [
  body("name").trim().notEmpty().withMessage("Station name is required"),
  body("location.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("location.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("powerOutput")
    .isFloat({ min: 0 })
    .withMessage("Power output must be a positive number"),
  body("connectorType")
    .isIn(["CCS", "CHAdeMO", "Type 2", "Type 1", "GB/T", "Tesla"])
    .withMessage("Invalid connector type"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
];

// All routes are protected
router.use(protect);

router.route("/").get(getStations).post(stationValidation, createStation);
router
  .route("/:id")
  .get(getStation)
  .put(stationValidation, updateStation)
  .delete(deleteStation);

module.exports = router;
