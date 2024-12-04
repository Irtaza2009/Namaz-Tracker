const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const UserModel = require("./Models/User.js");
const PrayerLog = require("./Models/PrayerLog.js"); // Import the PrayerLog model

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Namaz Tracker Backend");
});

// Middleware to verify JWT
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
    return res.status(401).json("You are not authenticated");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json("You are not authenticated");
      } else {
        req.user = decoded;
        next();
      }
    });
  }
};

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign(
            { email: user.email, id: user._id }, // Include user ID in token payload
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          // Set the token in a cookie
          res.cookie("token", token, {
            httpOnly: true, // Makes the cookie inaccessible to JavaScript
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiry: 1 day
            sameSite: "None",
          });
          res.status(200).json({ message: "Successfully Logged In" });
        } else {
          res.status(401).json("Invalid Password");
        }
      });
    } else {
      res.status(404).json("Not Registered");
    }
  });
});

// User signup
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({
        name,
        email,
        password: hash,
      })
        .then((user) => res.json(user))
        .catch((error) => res.status(500).json(error));
    })
    .catch((error) => console.log(error.message));
});

// Get or create prayer log for a user
app.get("/prayer-log", authenticateUser, async (req, res) => {
  const userId = req.user.id; // Extract user ID from authenticated user
  try {
    let prayerLog = await PrayerLog.findOne({ userId });

    // If no prayer log exists, create a new one
    if (!prayerLog) {
      prayerLog = await PrayerLog.create({
        userId,
        prayerLog: {
          fajr: [],
          dhuhr: [],
          asr: [],
          maghrib: [],
          isha: [],
        },
        qazaLog: {
          fajr: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
      });
    }

    res.status(200).json({ prayerLog });
  } catch (err) {
    res.status(500).json({ message: "Error fetching or creating prayer log" });
  }
});

// Update prayer log for a user
app.put("/prayer-log/:prayer", authenticateUser, async (req, res) => {
  const userId = req.user.id; // Extract user ID
  const { prayer } = req.params; // e.g., "fajr", "dhuhr"
  const { date } = req.body; // Date to be added (ISO format)

  if (!["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(prayer)) {
    return res.status(400).json("Invalid prayer name");
  }

  try {
    const prayerLog = await PrayerLog.findOneAndUpdate(
      { userId },
      { $addToSet: { [`prayerLog.${prayer}`]: date } },
      { new: true, upsert: true }
    );
    res.status(200).json({ prayerLog });
  } catch (err) {
    res.status(500).json({ message: "Error updating prayer log" });
  }
});

app.get("/prayer-summary", authenticateUser, async (req, res) => {
  const userId = req.user.id; // Extract user ID
  try {
    const prayerLog = await PrayerLog.findOne({ userId });

    if (!prayerLog) {
      return res.status(404).json({ message: "No prayer log found" });
    }

    const prayerCounts = {};

    // Combine all prayer logs into a single array with prayer dates
    Object.values(prayerLog.prayerLog).forEach((prayerTimes) => {
      prayerTimes.forEach((date) => {
        prayerCounts[date] = (prayerCounts[date] || 0) + 1;
      });
    });

    res.status(200).json({ prayerCounts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching prayer summary" });
  }
});

app.get("/qaza-log", authenticateUser, async (req, res) => {
  const userId = req.user.id; // Extract user ID
  try {
    // Fetch the prayer log for the user
    const prayerLog = await PrayerLog.findOne({ userId });

    if (!prayerLog) {
      return res.status(404).json({ message: "Prayer log not found" });
    }

    // Extract Qaza log from prayer log
    const qazaLog = prayerLog.qazaLog;

    res.status(200).json({ qazaLog });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Qaza log" });
  }
});

// Function to increment Qaza counts daily

const incrementQazaCounts = async () => {
  try {
    // Get all prayer logs
    const prayerLogs = await PrayerLog.find({});

    const today = new Date().toISOString().split("T")[0];

    prayerLogs.forEach(async (log) => {
      const updatedQazaLog = { ...log.qazaLog };

      // Increment Qaza counts for prayers not logged for today
      ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach((prayer) => {
        if (!log.prayerLog[prayer]?.includes(today)) {
          updatedQazaLog[prayer.charAt(0).toUpperCase() + prayer.slice(1)] =
            (updatedQazaLog[prayer.charAt(0).toUpperCase() + prayer.slice(1)] ||
              0) + 1;
        }
      });

      // Update qazaLog
      log.qazaLog = updatedQazaLog;
      await log.save();
    });

    console.log("Qaza counts updated successfully!");
  } catch (error) {
    console.error("Error updating Qaza counts:", error);
  }
};

// Scheduled the function to run daily at 11:59 PM

cron.schedule("59 23 * * *", incrementQazaCounts);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
