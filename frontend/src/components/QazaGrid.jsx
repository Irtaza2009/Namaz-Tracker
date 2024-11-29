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
      } catch (err) {
        console.error("Failed to fetch Qaza log.");
      }
    };

    fetchQazaLog();
  }, []);

  return (
    <div className="qaza-log-container">
      <h2>Missed Prayers (Qaza)</h2>
      <div className="qaza-log-grid">
        {prayers.map((prayer) => (
          <div key={prayer} className="qaza-log-card">
            <h3>{prayer}</h3>
            <p>{qazaLog[prayer] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QazaGrid;
