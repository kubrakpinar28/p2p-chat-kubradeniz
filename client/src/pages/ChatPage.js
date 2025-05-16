import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import '../App.css';

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

  // ✅ Yeni bir kullanıcı seçilince eski mesajlar çekilsin
  useEffect(() => {
    if (!username || !receiver) return;

    // Geçmişi temizle (önce)
    setChatLog([]);

    fetch(`https://backend-lj62.onrender.com/messages?user1=${username}&user2=${receiver}`)
      .then((res) => res.json())
      .then((data) => setChatLog(data))
      .catch((err) => console.error("Geçmiş mesajlar alınamadı:", err));
  }, [receiver, username]);

  // ✅ Gerçek zamanlı gelen mesajlar
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

  // ✅ Kullanıcı listesi
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
    <div className="page-container">
      <div className="form-box">
        <h2>Merhaba, {username}</h2>

        <select value={receiver} onChange={(e) => setReceiver(e.target.value)}>
          <option value="">Kullanıcı seç</option>
          {userList.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>

        <div className="chat-box">
          {chatLog.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.from === username ? 'sent' : 'received'}`}
            >
              <strong>{msg.from} ➜ {msg.to}</strong>: {msg.text}
            </div>
          ))}
        </div>

        <input
          placeholder="Mesaj yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSend}>Gönder</button>
      </div>
    </div>
  );
}

export default ChatPage;
