const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

// ===== DATABASE =====
mongoose.connect("mongodb://127.0.0.1:27017/vibetraDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: "vibetraSecretKey",
    resave: false,
    saveUninitialized: false
}));

// ===== MODEL =====
const bookingSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String
});

const Booking = mongoose.model("Booking", bookingSchema);

// ===== BOOK SLOT =====
app.post("/book", async (req, res) => {
    const { name, date, time } = req.body;

    const existing = await Booking.findOne({ date, time });

    if (existing) {
        return res.json({ success: false });
    }

    const newBooking = new Booking({ name, date, time });
    await newBooking.save();

    res.json({ success: true });
});

// ===== ADMIN LOGIN =====
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (username === "vibetra7" && password === "saran7") {
        req.session.admin = true;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ===== ADMIN LOGOUT =====
app.get("/admin-logout", (req, res) => {
    req.session.destroy();
    res.redirect("/admin-login.html");
});

// ===== GET BOOKINGS =====
app.get("/bookings", async (req, res) => {
    if (!req.session.admin) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const bookings = await Booking.find().sort({ date: 1 });
    res.json(bookings);
});

// ===== DELETE BOOKING =====
app.delete("/delete-booking/:id", async (req, res) => {
    if (!req.session.admin) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});

// ===== START SERVER =====
app.listen(5000, () => {
    console.log("Server running on port 5000");
});