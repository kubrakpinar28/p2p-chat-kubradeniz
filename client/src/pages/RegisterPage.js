import React, { useState } from 'react';
import './App.css'; // CSS dosyasını ekle

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backend-lj62.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Kayıt sırasında hata:", error);
      setMessage("Kayıt başarısız oldu.");
    }
  };

  return (
    <div className="page-container">
      <div className="form-box">
        <h2>Kayıt Ol</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Kayıt Ol</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default RegisterPage;
