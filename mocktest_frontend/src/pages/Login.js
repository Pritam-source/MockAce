import './Login.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typewriter from 'typewriter-effect';

function Login({ setToken, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        username,
        password,
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-root">
      <div className="login-flex">
        {/* LEFT PANEL */}
        <div className="login-left-panel">
          <div className="login-brand">
  <span role="img" aria-label="brain" style={{ marginRight: 12, fontSize: '2.1rem' }}>🧠</span>
  Mock Drill
  <span className="beta-badge">Beta</span>
</div>
          <div className="code-typewriter">
            <Typewriter
              options={{
                strings: [
  "Hi there! Practice with real exam-style questions picked from previous years’ papers.",
  "Sign up now to discover more about our platform and instantly access 2 free full Mock Tests.",
  "Boost your chances of selection by practicing with real, exam-focused questions in every Mock Test."
],
                autoStart: true,
                loop: true,
                delay: 18,
                deleteSpeed: 1,
                pauseFor: 1900,
                cursor: '|',
              }}
            />
          </div>
        </div>
        {/* RIGHT PANEL */}
        <div className="login-right-panel">
          <div className="login-form-card">
            <div className="login-title">Sign in</div>
            <div className="login-subtext">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="login-link"
                onClick={e => {
                  e.preventDefault();
                  if (onShowRegister) onShowRegister();
                }}
              >
                Sign up
              </a>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Email"
                required
                className="login-input"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="login-input"
              />
              <div className="login-remember">
                <input type="checkbox" id="keep-logged-in" className="login-checkbox" />
                <label htmlFor="keep-logged-in" className="login-checkbox-label">Keep me logged in</label>
              </div>
              <button type="submit" className="login-btn">
                Log in now
              </button>
            </form>
            <div className="login-forgot">
              <a href="#" className="login-forgot-link">Forgot password</a>
            </div>
            {error && <div className="login-error">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
