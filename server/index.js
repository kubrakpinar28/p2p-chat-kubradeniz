const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test endpoint
app.get("/", (req, res) => {
  res.send("Server ayakta!");
});

// Kullanıcı kayıt
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.run(query, [username, password], function (err) {
    if (err) {
      return res.status(400).json({ error: "Kullanıcı adı zaten var." });
    }
    res.status(201).json({ message: "Kayıt başarılı!", userId: this.lastID });
  });
});

// Giriş
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.get(query, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });
    if (!row) return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre" });
    res.json({ message: "Giriş başarılı", userId: row.id, username: row.username });
  });
});

// Kullanıcı listesi
app.get("/users", (req, res) => {
  db.all("SELECT username FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Kullanıcılar alınamadı." });
    res.json(rows);
  });
});

// Geçmiş mesajları getir
app.get("/messages", (req, res) => {
  const { user1, user2 } = req.query;
  const query = `
    SELECT * FROM messages 
    WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
    ORDER BY timestamp ASC
  `;
  db.all(query, [user1, user2, user2, user1], (err, rows) => {
    if (err) return res.status(500).json({ error: "Mesajlar alınamadı." });
    res.json(rows);
  });
});

// Mesaj gönder
app.post("/send", (req, res) => {
  const { from, to, text } = req.body;
  const timestamp = new Date().toISOString();

  const query = "INSERT INTO messages (sender, receiver, message, timestamp) VALUES (?, ?, ?, ?)";
  db.run(query, [from, to, text, timestamp], function (err) {
    if (err) return res.status(500).json({ error: "Mesaj kaydedilemedi." });

    // 🔥 Gerçek zamanlı gönder
    io.emit("new_message", { from, to, text, timestamp });

    res.status(200).json({
      message: "Mesaj gönderildi.",
      data: { from, to, text, timestamp }
    });
  });
});

// Socket bağlantısı
io.on("connection", (socket) => {
  console.log("Socket bağlı: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Socket ayrıldı: " + socket.id);
  });
});

// Sunucu başlat
server.listen(5000, () => {
  console.log("Sunucu çalışıyor: http://localhost:5000");
});