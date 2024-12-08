const PrayerLog = require("./Models/PrayerLog.js"); // Import the PrayerLog model

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
