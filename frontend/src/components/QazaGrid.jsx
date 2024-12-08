import React, { useEffect, useState } from "react";
import axios from "axios";
import "./QazaGrid.css";

const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const QazaGrid = () => {
  const [qazaLog, setQazaLog] = useState({});

  useEffect(() => {
    const fetchQazaLog = async () => {
      try {
        const response = await axios.get("http://localhost:3000/qaza-log", {
          withCredentials: true,
        });
        setQazaLog(response.data.qazaLog || {});
        console.log(response.data.qazaLog);
      } catch (err) {
        console.error("Failed to fetch Qaza log." + err);
      }
    };

    fetchQazaLog();
  }, []);

  // Handle Increment
  const handleIncrement = async (prayer) => {
    try {
      const updatedCount = (qazaLog[prayer] || 0) + 1;
      await axios.post(
        `http://localhost:3000/qaza-log/increment`,
        { prayer },
        { withCredentials: true }
      );
      setQazaLog((prev) => ({ ...prev, [prayer]: updatedCount }));
    } catch (err) {
      console.error(`Failed to increment ${prayer} count:`, err);
    }
  };

  // Handle Decrement
  const handleDecrement = async (prayer) => {
    try {
      const updatedCount = Math.max((qazaLog[prayer] || 0) - 1, 0);
      await axios.post(
        `http://localhost:3000/qaza-log/decrement`,
        { prayer },
        { withCredentials: true }
      );
      setQazaLog((prev) => ({ ...prev, [prayer]: updatedCount }));
    } catch (err) {
      console.error(`Failed to decrement ${prayer} count:`, err);
    }
  };

  return (
    <div className="qaza-log-container">
      <h2>Missed Prayers (Qaza)</h2>
      <div className="qaza-log-grid">
        {prayers.map((prayer) => (
          <div key={prayer} className="qaza-log-card">
            <h3>{prayer}</h3>
            <p>{qazaLog[prayer] || 0}</p>
            <div className="button-group">
              <button
                className="qaza-button increment"
                onClick={() => handleIncrement(prayer)}
              >
                +
              </button>
              <button
                className="qaza-button decrement"
                onClick={() => handleDecrement(prayer)}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QazaGrid;
