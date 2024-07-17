const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    driverId: { type: String, required: true }, // Reference to the driver's userId
    passengerName: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    dropoffTime: { type: Date, required: true },
    notes: { type: String }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
