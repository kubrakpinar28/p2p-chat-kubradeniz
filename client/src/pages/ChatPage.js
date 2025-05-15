import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Socket bağlantısı sadece bir kez kurulmalı!
const socket = io("https://backend-lj62.onrender.com");

function ChatPage() {
  const [username] = useState(localStorage.getItem("username"));
  const [userList, setUserList] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  // ✅ Mesaj gönderme
  const handleSend = async () => {
    if (!receiver || !message.trim()) return;

    try {
      const response = await fetch("https://backend-lj62.onrender.com/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: username, to: receiver, text: message }),
      });

      if (!response.ok) throw new Error("Mesaj gönderilemedi");
      setMessage("");
    } catch (err) {
      console.error("Gönderim hatası:", err);
    }
  };

  // ✅ Gerçek zamanlı mesaj alma
  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      if (
        (msg.from === username && msg.to === receiver) ||
        (msg.from === receiver && msg.to === username)
      ) {
        setChatLog((prev) => [...prev, msg]);
      }
    };

    socket.on("new_message", handleIncomingMessage);
    return () => socket.off("new_message", handleIncomingMessage);
  }, [receiver, username]);

  // ✅ Mesaj geçmişi çekme
  useEffect(() => {
    if (!username || !receiver) return;

    fetch(https://backend-lj62.onrender.com/messages?user1=${username}&user2=${receiver})
      .then((res) => res.json())
      .then((data) => setChatLog(data))
      .catch((err) => console.error("Geçmiş mesajlar alınamadı:", err));
  }, [receiver, username]);

  // ✅ Kullanıcı listesini çek
  useEffect(() => {
    if (!username) {
      window.location.href = "/";
      return;
    }

    fetch("https://backend-lj62.onrender.com/users")
      .then((res) => res.json())
      .then((data) => setUserList(data.filter((u) => u.username !== username)))
      .catch((err) => console.error("Kullanıcılar alınamadı:", err));
  }, [username]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Merhaba, {username}</h2>

      <select value={receiver} onChange={(e) => setReceiver(e.target.value)}>
        <option value="">Kullanıcı seç</option>
        {userList.map((user) => (
          <option key={user.username} value={user.username}>
            {user.username}
          </option>
        ))}
      </select>

      <div style={{ border: "1px solid #ccc", height: "200px", padding: "10px", overflowY: "auto", marginTop: "10px" }}>
        {chatLog.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from} ➜ {msg.to}</strong>: {msg.text}
          </div>
        ))}
      </div>

      <input
        style={{ marginTop: "10px", width: "70%" }}
        placeholder="Mesaj yaz..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Gönder</button>
    </div>
  );
}

export default ChatPage;