import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProgressGrid.css";

const shades = ["#f5f5f5", "#e4c889", "#d3ae67", "#c79c32"]; // Define shades for 0, 1-2, 3-4, 5 prayers

const ProgressGrid = ({ refreshTrigger }) => {
  const [prayerSummary, setPrayerSummary] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    // This effect will run whenever refreshTrigger changes, forcing a re-render
    console.log("ProgressGrid re-rendered due to prayer log update.");
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchPrayerSummary = async () => {
      try {
        const response = await axios.get(
          "https://namaz-api.irtaza.xyz/prayer-summary",
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
  }, [refreshTrigger]);

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
    <div className="progress-container">
      <h2>Progress</h2>
      <h3>(Last 30 days)</h3>
      <div className="progress-grid">
        {error ? <p>{error}</p> : generateGrid()}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div
            className="legend-box"
            style={{ backgroundColor: shades[0] }}
          ></div>
          <span>No prayers</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-box"
            style={{ backgroundColor: shades[1] }}
          ></div>
          <span>1-2 prayers</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-box"
            style={{ backgroundColor: shades[2] }}
          ></div>
          <span>3-4 prayers</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-box"
            style={{ backgroundColor: shades[3] }}
          ></div>
          <span>5 prayers</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressGrid;
