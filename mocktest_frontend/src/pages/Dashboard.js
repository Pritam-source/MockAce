import './Dashboard.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const cardColors = [
  "#bae0fd", "#ffe0b2", "#ded6fa", "#a6e8cf", "#f8cadd", "#e3fadb", "#ffeeb8", "#bae0fd"
];

function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/exams/packages/')
      .then(response => {
        setPackages(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setPackages([]);
      });

    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/users/me/', {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handlePackageClick = (pkgId) => {
    navigate(`/package/${pkgId}`);
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-topbar-row">
        <DashboardHorizontalStrip user={user} />
        <button className="dashboard-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="dashboard-cardgrid">
        {loading ? (
          <div style={{ fontSize: 18, color: "#555", gridColumn: "1/-1" }}>Loading...</div>
        ) : packages.length === 0 ? (
          <div style={{ fontSize: 18, color: "#e53935", gridColumn: "1/-1" }}>No packages found.</div>
        ) : (
          packages.map((item, i) => (
            <div
              key={item.id}
              className="dashboard-package-card"
              data-color={i % cardColors.length}
              style={{
                borderColor: cardColors[i % cardColors.length],
              }}
              onClick={() => handlePackageClick(item.id)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") handlePackageClick(item.id); }}
            >
              <div className="card-info-row">
                <div className="card-main-content">
                  <div className="card-title">{item.name}</div>
                  <div className="card-desc">
                    {(item.description || '').replace(/\\n/g, '\n')}
                  </div>
                </div>
                <div className="card-right">
                  <span className="card-price">₹{item.price}</span>
                  <button
                    className="dashboard-view-btn"
                    tabIndex={-1}
                    onClick={e => { e.stopPropagation(); handlePackageClick(item.id); }}
                  >View</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Top horizontal dashboard card/strip
function DashboardHorizontalStrip({ user }) {
  return (
    <div className="dashboard-horizontal-strip">
      <div className="dashboard-horizontal-title">Dashboard</div>
      <div className="dashboard-horizontal-desc">
        Welcome! Here are the available test packages.
      </div>
      {user && (
        <div className="dashboard-horizontal-username">
          {user.first_name
            ? `${user.first_name} ${user.last_name}`.trim()
            : user.username}
        </div>
      )}
      <div className="dashboard-horizontal-icon">
        <span role="img" aria-label="books" style={{ fontSize: 24, color: "#267cfb" }}>📚</span>
      </div>
    </div>
  );
}

export default Dashboard;
