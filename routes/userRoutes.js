const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Request = require('../models/Request');
// const bcrypt = require('bcrypt'); // Uncomment if using password hashing

// HOD dashboard route
router.get('/hod/dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'hod') {
        res.render('hodDashboard'); // Ensure this view exists
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});



router.post('/login', async (req, res) => {
    // Handle user login logic here
});

// Driver dashboard
router.get('/driver/dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'driver') {
        res.render('driverDashboard'); // Render driver dashboard view
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});


// Driver bookings
router.get('/driver/bookings', (req, res) => {
    if (req.session.user && req.session.user.role === 'driver') {
        const driverId = req.session.user.userId; // Assuming userId is the driver's ID
        Request.find({ driverId }) // Fetch bookings for the logged-in driver
            .then(bookings => {
                res.render('driverBookings', { bookings }); // Render driver bookings view
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error retrieving bookings');
            });
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});
// Route for HOD to access Driver Allocation page
router.get('/hod/DriverAllocate', (req, res) => {
    res.render('DriverAllocate'); // Ensure the view file exists
});
// POST /api/bookings
router.post('/bookings', async (req, res) => {
    try {
        const newRequest = new Request({
            date: req.body.date,
            driverId: req.body.driverId,
            driverName: req.body.driverName,
            cabNumber: req.body.cabNumber,
            passengerName: req.body.passengerName,
            pickupLocation: req.body.pickupLocation,
            dropoffLocation: req.body.dropoffLocation,
            pickupTime: req.body.pickupTime,
            dropoffTime: req.body.dropoffTime,
            notes: req.body.notes,
        });

        await newRequest.save();
        res.status(201).json({ message: 'Booking created successfully', newRequest });
    } catch (err) {
        res.status(500).json({ message: 'Error creating booking', error: err });
    }
});

router.get('/driver/view-requests', async (req, res) => {
    try {
        const requests = await Request.find(); // Make sure Request model is imported correctly
        res.render('driver', { requests });
    } catch (err) {
        console.error(err); // Log the error for better debugging
        res.status(500).send('Error retrieving requests');
    }
});


// List users
router.get('/list', async (req, res) => {
    try {
        const users = await User.find();

        // Count users for each role
        const adminCount = await User.countDocuments({ role: 'admin' });
        const hodCount = await User.countDocuments({ role: 'hod' });
        const driverCount = await User.countDocuments({ role: 'driver' });
        const employeeCount = await User.countDocuments({ role: 'employee' });

        res.render('userList', {
            users,
            adminCount,
            hodCount,
            driverCount,
            employeeCount
        });
    } catch (err) {
        res.status(500).send('Error retrieving users');
    }
});

// Search users
router.get('/search', async (req, res) => {
    const { query } = req.query;

    try {
        const users = await User.find({
            $or: [
                { userId: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        });

        // Count users for each role
        const adminCount = await User.countDocuments({ role: 'admin' });
        const hodCount = await User.countDocuments({ role: 'hod' });
        const driverCount = await User.countDocuments({ role: 'driver' });
        const employeeCount = await User.countDocuments({ role: 'employee' });

        res.render('userList', {
            users,
            adminCount,
            hodCount,
            driverCount,
            employeeCount
        });
    } catch (err) {
        res.status(500).send('Error retrieving users');
    }
});


// Admin login route
router.post('/admin-login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (user && user.password === password) {
            // Successful login logic
            return res.redirect('/api/users/admin/dashboard');
        } else {
            return res.status(403).send('Invalid admin credentials');
        }
    } catch (err) {
        return res.status(500).send('Server error');
    }
});



// User login route
router.post('/user-login', async (req, res) => {
    const { userName, userPassword } = req.body;

    try {
        const user = await User.findOne({ userId: userName });

        if (user && user.password === userPassword) {
            // Redirect based on user role
            const dashboardPath = {
                admin: '/api/users/admin/dashboard',
                hod: '/api/users/hod/dashboard',
                driver: '/api/users/driver/dashboard',
                employee: '/api/users/employee/dashboard'
            }[user.role] || '/api/users/employee/dashboard';

            return res.redirect(dashboardPath);
        } else {
            return res.status(403).send('Invalid user credentials');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});
// Logout route
router.get('/logout', (req, res) => {
    // Assuming you are using session or a similar method to track user login
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.redirect('/'); // Redirect to the home page after logout
    });
});


// Admin dashboard
router.get('/admin/dashboard', (req, res) => {
    res.render('adminDashboard');
});

// Driver dashboard
router.get('/driver/dashboard', (req, res) => {
    res.render('driverDashboard');
});

// Employee dashboard
router.get('/employee/dashboard', (req, res) => {
    res.render('employeeDashboard');
});

// List users
router.get('/list', async (req, res) => {
    try {
        const users = await User.find();
        res.render('userList', { users });
    } catch (err) {
        res.status(500).send('Error retrieving users');
    }
});

// Render add user form
router.get('/add-new', (req, res) => {
    res.render('createUser');
});

// Add a new user
router.post('/add', async (req, res) => {
    const { userId, name, role, department, password } = req.body;
    const user = new User({ userId, name, role, department, password });

    try {
        await user.save();
        res.redirect('/api/users/list');
    } catch (err) {
        res.status(400).json({ message: 'Error creating user', error: err });
    }
});

// Edit user route
router.get('/edit/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('editUser', { user });
    } catch (err) {
        res.status(500).send('Error retrieving user');
    }
});

// Update user
router.post('/edit/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, role, department, password } = req.body;

    try {
        await User.updateOne({ userId }, { name, role, department, password });
        res.redirect('/api/users/list');
    } catch (err) {
        res.status(400).json({ message: 'Error updating user', error: err });
    }
});

// Delete user
router.post('/delete/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        await User.deleteOne({ userId });
        res.redirect('/api/users/list');
    } catch (err) {
        res.status(400).json({ message: 'Error deleting user', error: err });
    }
});




module.exports = router;
