const mongoose = require("mongoose");

const prayerlogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prayerLog: {
    fajr: [{ type: String }], // Array of ISO date strings
    dhuhr: [{ type: String }],
    asr: [{ type: String }],
    maghrib: [{ type: String }],
    isha: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  qazaLog: {
    Fajr: { type: Number, default: 0 },
    Dhuhr: { type: Number, default: 0 },
    Asr: { type: Number, default: 0 },
    Maghrib: { type: Number, default: 0 },
    Isha: { type: Number, default: 0 },
  },
});

const PrayerLog = mongoose.model("PrayerLog", prayerlogSchema);
module.exports = PrayerLog;
