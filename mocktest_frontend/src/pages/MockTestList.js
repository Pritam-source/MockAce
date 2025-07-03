import './MockTestList.css';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const pastelBorders = [
  "#2ecc71", "#e67e22", "#e74c3c", "#3498db", "#9b59b6", "#16a085", "#f1c40f", "#1abc9c"
];

function MockTestList() {
  const { packageId } = useParams();
  const [mockTests, setMockTests] = useState([]);
  const [packageName, setPackageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // 1. Fetch subscription status
    if (token && packageId) {
      axios.get(`http://127.0.0.1:8000/api/subscriptions/status/${packageId}/`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => {
        setIsSubscribed(res.data.subscribed);
      })
      .catch(() => setIsSubscribed(false));
    }

    // 2. Fetch all mock tests for this package
    axios.get('http://127.0.0.1:8000/api/exams/mock-tests/')
      .then(res => {
        const filtered = res.data.filter(mt => mt.exam_package === parseInt(packageId));
        setMockTests(filtered);
        setLoading(false);
        // Check result/attempt status for each mock test
        filtered.forEach(test => {
          axios.get(`http://127.0.0.1:8000/api/exams/result/${test.id}/`, {
            headers: { Authorization: `Token ${token}` }
          })
            .then(() => setSubmissionStatus(prev => ({ ...prev, [test.id]: true })))
            .catch(() => setSubmissionStatus(prev => ({ ...prev, [test.id]: false })));
        });
      });
    // 3. Fetch package name
    axios.get('http://127.0.0.1:8000/api/exams/packages/')
      .then(res => {
        const pkg = res.data.find(p => p.id === parseInt(packageId));
        setPackageName(pkg ? pkg.name : '');
      });
  }, [packageId, token]);

  // Lock/Unlock logic
  const getPadlockEmoji = (i) => {
    if (i < 2) return "🔓"; // Always unlocked
    return isSubscribed ? "🔓" : "🔒";
  };

  return (
    <div className="mocktestlist-root">
      <div className="mocktestlist-main">
        {/* Test Cards */}
        <div className="mocktestlist-stripgrid">
          {loading ? (
            <div className="mocktestlist-loading">Loading...</div>
          ) : mockTests.length === 0 ? (
            <div className="mocktestlist-loading" style={{color:'#e74c3c'}}>No mock tests found for this package.</div>
          ) : (
            mockTests.map((test, i) => (
              <div
                key={test.id}
                className="mocktestlist-strip"
                style={{
                  borderColor: pastelBorders[i % pastelBorders.length],
                  background: "#f9fefd",
                }}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (submissionStatus[test.id]) navigate(`/mocktest/${test.id}/review`);
                    else navigate(`/mocktest/${test.id}`);
                  }
                }}
              >
                <div className="mocktestlist-strip-title">
                  {test.title}
                </div>
                <div className="mocktestlist-strip-dur">Duration: {test.duration_minutes} min</div>
                {submissionStatus[test.id] === undefined ? (
                  <>
                    <button className="mocktestlist-btn mocktestlist-btn-disabled" disabled>
                      Checking...
                    </button>
                    <span className="padlock-emoji">{getPadlockEmoji(i)}</span>
                  </>
                ) : submissionStatus[test.id] ? (
                  <>
                    <button
                      className="mocktestlist-btn mocktestlist-btn-viewonly"
                      onClick={e => { e.stopPropagation(); navigate(`/mocktest/${test.id}/review`); }}
                    >
                      View Only
                    </button>
                    <span className="padlock-emoji">{getPadlockEmoji(i)}</span>
                  </>
                ) : (
                  <>
                    <button
                      className="mocktestlist-btn mocktestlist-btn-start"
                      onClick={e => { e.stopPropagation(); navigate(`/mocktest/${test.id}`); }}
                      disabled={i >= 2 && !isSubscribed}
                      style={i >= 2 && !isSubscribed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      Start Test
                    </button>
                    <span className="padlock-emoji">{getPadlockEmoji(i)}</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        {/* Info Panel at Bottom */}
        <div className="mocktestlist-bottom-panel">
          <div className="mocktestlist-bottom-title">{packageName}</div>
          <div className="mocktestlist-bottom-desc">
            All mock tests available for this package.
          </div>
          <Link to="/" className="mocktestlist-bottom-backbtn">
            ← Back to Packages
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MockTestList;
