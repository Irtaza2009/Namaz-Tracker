import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const Dashboard = () => {
  const [prayerLog, setPrayerLog] = useState({});
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch initial prayer log and Azaan times
  useEffect(() => {
    const fetchPrayerLog = async () => {
      try {
        const prayerLogResponse = await axios.get(
          "http://localhost:3000/prayer-log",
          {
            withCredentials: true, // Set only for this request (global setup causes CORS issues with other services i.e. LocationIQ and Aladhan)
          }
        );
        const today = new Date().toISOString().split("T")[0];
        const fetchedPrayerLog =
          prayerLogResponse.data.prayerLog.prayerLog || {};

        // Initialize state to automatically mark today's completed prayers
        const updatedPrayerLog = Object.fromEntries(
          prayers.map((prayer) => [
            prayer,
            fetchedPrayerLog[prayer.toLowerCase()]?.includes(today)
              ? [today]
              : [],
          ])
        );

        setPrayerLog(updatedPrayerLog);
      } catch (err) {
        setError("Failed to fetch prayer log.");
      }
    };

    fetchPrayerLog();
  }, []); // Runs once to fetch the prayer log

  useEffect(() => {
    const fetchLocationAndPrayerTimes = async () => {
      try {
        // Fetch user's location
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          // Use LocationIQ API to fetch city and country
          const geoResponse = await axios.get(
            "https://us1.locationiq.com/v1/reverse.php",
            {
              params: {
                key: "pk.93cfedfdddda99f1dc775e2454beb519", // Replace with your LocationIQ API key
                lat: latitude,
                lon: longitude,
                format: "json",
              },
            }
          );

          const { city, country, county } = geoResponse.data.address;

          // Fetch Azaan times
          const date = new Date();
          const todayMDY = `${date.getDate()}-${
            date.getMonth() + 1
          }-${date.getFullYear()}`;

          const prayerTimesResponse = await axios.get(
            `http://api.aladhan.com/v1/timingsByCity/${todayMDY}`,
            {
              params: {
                city: city ? city : county.split(" ")[0],
                country: country,
                method: 0, // Adjust as needed
              },
            }
          );

          const timings = prayerTimesResponse.data.data.timings;
          setPrayerTimes(timings);
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to fetch location or prayer times. Please try again.");
        setLoading(false);
      }
    };

    fetchLocationAndPrayerTimes();
  }, []); // Runs once to fetch location and prayer times

  // Handle checkbox toggle
  const handleCheck = async (prayer) => {
    const today = new Date().toISOString().split("T")[0];
    const isChecked = prayerLog[prayer]?.includes(today);

    try {
      const updatedLog = isChecked
        ? prayerLog[prayer].filter((date) => date !== today)
        : [...(prayerLog[prayer] || []), today];

      await axios.put(
        `http://localhost:3000/prayer-log/${prayer.toLowerCase()}`,
        {
          date: today,
        },
        {
          withCredentials: true, // Set only for this request
        }
      );

      setPrayerLog((prevLog) => ({
        ...prevLog,
        [prayer]: updatedLog,
      }));
    } catch (err) {
      setError("Failed to update prayer data. Please try again.");
    }
  };

  // Check if a prayer button should be disabled
  const isPrayerDisabled = (prayer) => {
    const currentTime = new Date();

    if (prayer === "Asr") {
      // Enable Asr if Zuhr time has passed
      const zuhrTime = new Date();
      const zuhrTimeString = prayerTimes["Dhuhr"];
      if (zuhrTimeString) {
        const [zuhrHours, zuhrMinutes] = zuhrTimeString.split(":");
        zuhrTime.setHours(zuhrHours, zuhrMinutes, 0, 0);
        if (currentTime >= zuhrTime) {
          return false; // Enable Asr
        }
      }
    }

    if (prayer === "Isha") {
      // Enable Isha if Maghrib time has passed
      const maghribTime = new Date();
      const maghribTimeString = prayerTimes["Maghrib"];
      if (maghribTimeString) {
        const [maghribHours, maghribMinutes] = maghribTimeString.split(":");
        maghribTime.setHours(maghribHours, maghribMinutes, 0, 0);
        if (currentTime >= maghribTime) {
          return false; // Enable Isha
        }
      }
    }

    // Default behavior for other prayers
    const prayerTime = new Date();
    const prayerTimeString = prayerTimes[prayer];
    if (prayerTimeString) {
      const [hours, minutes] = prayerTimeString.split(":");
      prayerTime.setHours(hours, minutes, 0, 0);
      return currentTime < prayerTime; // Disable if current time is before Azaan time
    }

    return false; // Enable if no Azaan time is available
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-container">
      <h2>NAMAZ TRACKER</h2>
      <div className="prayer-boxes">
        {prayers.map((prayer) => {
          const today = new Date().toISOString().split("T")[0];
          const isChecked = prayerLog[prayer]?.includes(today);
          const disabled = isPrayerDisabled(prayer);

          return (
            <div
              key={prayer}
              className={`prayer-box ${isChecked ? "completed" : ""} ${
                disabled ? "disabled" : ""
              }`}
              onClick={() => !disabled && handleCheck(prayer)}
            >
              <h3>
                {prayer} - {prayerTimes[prayer] || "N/A"}
              </h3>
              <div className="checkbox">{isChecked ? "✔" : "✗"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
