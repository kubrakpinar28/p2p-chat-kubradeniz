import React, { useEffect, useState } from "react";

function ChatPage() {
  const [username] = useState(localStorage.getItem("username"));
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const handleSend = async () => {
    if (!receiver || !message.trim()) return;

    try {
      const response = await fetch('https://backend-lj62.onrender.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: username,
          receiver: receiver,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatLog((prev) => [...prev, {
          from: username,
          to: receiver,
          text: message,
        }]);
        setMessage("");
      } else {
        alert(data.error || "Mesaj gönderilemedi.");
      }
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      alert("Sunucu hatası: Mesaj gönderilemedi.");
    }
  };

  useEffect(() => {
    if (!username) {
      window.location.href = "/";
    }
  }, [username]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Merhaba, {username}</h2>

      <input
        placeholder="Mesaj atmak istediğin kullanıcı"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      /><br /><br />

      <div style={{ border: "1px solid #ccc", height: "200px", padding: "10px", overflowY: "auto" }}>
        {chatLog.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from} ➜ {msg.to}</strong>: {msg.text}
          </div>
        ))}
      </div><br />

      <input
        placeholder="Mesaj yaz..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Gönder</button>
    </div>
  );
}

export default ChatPage;