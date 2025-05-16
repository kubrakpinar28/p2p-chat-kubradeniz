import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('https://backend-lj62.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage("Giriş başarılı");
      localStorage.setItem("username", data.username);
      navigate("/chat");
    } else {
      setMessage(data.error || "Giriş başarısız");
    }
  };

  return (
    <div className="page-container">
      <div className="form-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
          
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit">Giriş Yap</button>
        </form>
        <p>{message}</p>
        <p style={{ marginTop: "10px" }}>
          Hesabın yok mu? <a href="/register">Kayıt Ol</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
