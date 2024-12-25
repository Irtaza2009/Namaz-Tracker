import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Namaz Tracker</h1>
        <p className="tagline">Track your prayers and stay consistent.</p>
      </header>

      <section className="home-description">
        <h2>About the Project</h2>
        <p>
          Namaz Tracker is an application to help you log and monitor your daily
          prayers. You can track the prayers you performed, log missed prayers
          (Qaza), and stay on top of your spiritual goals.
        </p>
      </section>

      <section className="home-links">
        <h2>Quick Links</h2>
        <div className="link-buttons">
          <a href="/login" className="btn">
            Login
          </a>
          <a href="/signup" className="btn">
            Register
          </a>
          <a href="/dashboard" className="btn">
            Dashboard
          </a>
        </div>
      </section>
      {/*
      <section className="home-apis">
        <h2>APIs Used</h2>
        <ul>
          <li>
            <strong>Login API:</strong> Handles user authentication.
          </li>
          <li>
            <strong>Signup API:</strong> Creates a new user account.
          </li>
          <li>
            <strong>Prayer Log API:</strong> Fetches and updates prayer logs.
          </li>
          <li>
            <strong>Qaza Log API:</strong> Manages and updates missed prayers.
          </li>
        </ul>
      </section>
*/}

      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} Namaz Tracker.{" "}
          <a
            href="https://github.com/Irtaza2009/Namaz-Tracker/"
            className="footer-link"
          >
            Open Source
          </a>{" "}
          Project.
        </p>
      </footer>
    </div>
  );
};

export default Home;
