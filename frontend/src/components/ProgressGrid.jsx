import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProgressGrid.css";

const shades = ["#f5f5f5", "#e4c889", "#d3ae67", "#c79c32"]; // Define shades for 0, 1-2, 3-4, 5 prayers

const ProgressGrid = () => {
  const [prayerSummary, setPrayerSummary] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrayerSummary = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/prayer-summary",
          {
            withCredentials: true,
          }
        );
        setPrayerSummary(response.data.prayerCounts);
      } catch (err) {
        setError("Failed to fetch prayer summary.");
      }
    };

    fetchPrayerSummary();
  }, []);

  const getShade = (count) => {
    if (count === 5) return shades[3];
    if (count >= 3) return shades[2];
    if (count >= 1) return shades[1];
    return shades[0];
  };

  const generateGrid = () => {
    const dates = Object.keys(prayerSummary);
    const maxDays = 30; // Show last 30 days
    const today = new Date();
    const grid = [];

    for (let i = maxDays - 1; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayString = day.toISOString().split("T")[0];
      const count = prayerSummary[dayString] || 0;

      grid.push(
        <div
          key={dayString}
          title={`${dayString}: ${count} prayers`}
          className="grid-box"
          style={{ backgroundColor: getShade(count) }}
        ></div>
      );
    }

    return grid;
  };

  return (
    <div className="progress-grid">
      {error ? <p>{error}</p> : generateGrid()}
    </div>
  );
};

export default ProgressGrid;
