import './Register.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Register({ onShowLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document.getElementById('fa-cdn')) {
      const link = document.createElement('link');
      link.id = 'fa-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register/`, form);;
      setSuccess('Registration successful! You can now login.');
      setForm({ username: '', email: '', password: '' });
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        let msg = '';
        if (typeof data === "string") msg = data;
        else if (typeof data === "object") msg = Object.values(data).join(" ");
        setError(msg || "Registration failed. Try a different username or password.");
      } else {
        setError("Registration failed. Try a different username or password.");
      }
    }
  };

  return (
    <div className="register-root">
      <div className="register-flex">
        {/* LEFT SIDE - REGISTER FORM */}
        <div className="register-form-card">
          <div className="register-title">Create your account</div>
          <div className="register-subtext">
            Already have an account?{' '}
            <a
              href="#"
              className="register-link"
              onClick={e => {
                e.preventDefault();
                if (onShowLogin) onShowLogin();
              }}
            >
              Login
            </a>
          </div>
          <div className="register-instructions">
            <strong>Instructions:</strong>
            <ul>
              <li>Username must be unique.</li>
              <li>Password should be at least 8 characters.</li>
              <li>Email is optional, but required for password reset.</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="register-input"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (optional)"
              className="register-input"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="register-input"
            />
            <button type="submit" className="register-btn">
              Register
            </button>
          </form>
          {success && <div className="register-success">{success}</div>}
          {error && <div className="register-error">{error}</div>}
        </div>
        {/* RIGHT SIDE - INFO PANEL */}
        <div className="register-info-panel">
          <div className="register-info-letter" style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "11px",
            padding: "30px 38px",
            boxShadow: "0 8px 38px #0952aa22",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "1.0rem",
            lineHeight: 1.7
          }}>
            <p>
            
  Dear friend,
</p>
<p>
  This online mock test platform is made especially for you, with questions inspired by what various organisations have actually asked in their exams over the past years. Every exam has its own unique style and pattern, so we’ve carefully designed each mock test to match those exact formats—giving you the closest possible experience to the real thing.
</p>
<p>
  Nowadays, clearing the cutoff often means scoring above 80%, and to actually get selected, you usually need to reach 90% or more. Practicing with real exam-type questions like these can really boost your confidence and help you achieve those high scores.
</p>
<p>
  So keep practicing, aim high, and give yourself the best shot at selection. Wishing you all the best on your journey!
</p>
<p>
  — Mock Drill
</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
