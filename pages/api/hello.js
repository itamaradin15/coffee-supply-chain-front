export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://brioperu.com"); // Permitir solo este dominio
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end(); // Responder a pre-flight requests

    return;
  }

  res.status(200).json({ message: "Hello from Vercel API" });
}
