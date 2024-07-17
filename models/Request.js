const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    date: Date,
    driverId: String,
    driverName: String,
    cabNumber: String,
    passengerName: String,
    pickupLocation: String,
    dropoffLocation: String,
    pickupTime: String,
    dropoffTime: String,
    notes: String,
});

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
