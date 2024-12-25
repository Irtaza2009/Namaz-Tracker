// for api: cors-handler.js

export default function handler(req, res) {
  const allowedOrigins = [
    "https://namaz-tracker.irtaza.xyz",
    "http://localhost:8081",
  ];

  const origin = req.headers.origin;

  // Check if the Origin matches one of the allowed domains
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // Dynamically set the allowed origin
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", ""); // Block others
  }

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Add your API logic here for other requests
  res.status(200).json({ message: "CORS headers set!" });
}
