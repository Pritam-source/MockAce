import './ScorePage.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ScorePage.css';

function ScorePage({ token }) {
  const { mockTestId } = useParams();
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/api/exams/result/${mockTestId}/`, {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => {
        setScore(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.response && err.response.status === 403)
          setError("You must complete and submit the test before viewing your score.");
        else if (err.response && err.response.status === 404)
          setError("Test result not found.");
        else
          setError("Unable to load score. Please try again later.");
      });
  }, [mockTestId, token, navigate]);

  if (loading) return (
    <div className="scorepage-root"><div className="scorepage-card"><p>Loading...</p></div></div>
  );

  if (error) return (
    <div className="scorepage-root">
      <div className="scorepage-card">
        <h2>Error</h2>
        <p className="scorepage-error">{error}</p>
        <button
          className="scorepage-btn-primary"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (!score) return null;

  const percent = ((score.score / score.total) * 100).toFixed(2);
  const isPassed = percent >= (score.pass_percent || 40);

  return (
    <div className="scorepage-root">
      <div className="scorepage-card">
        <div className="scorepage-title">
          {score.mock_test_name || "Mock Test"}
        </div>
        <div className="scorepage-scorelabel">Your Score</div>
        <div className={`scorepage-score ${isPassed ? "passed" : "failed"}`}>
          {score.score} <span className="scorepage-total">/ {score.total}</span>
        </div>
        <div className="scorepage-percent-row">
          {percent}% - {isPassed ? (
            <span className="scorepage-pass">Passed</span>
          ) : (
            <span className="scorepage-fail">Try Again</span>
          )}
        </div>
        <div className="scorepage-timetaken">
          Time Taken: <b>{score.time_taken || "--:--"}</b>
        </div>
        {score.section_scores && (
          <div className="scorepage-section-breakdown">
            <b>Section-wise Breakdown</b>
            <ul>
              {score.section_scores.map((sec, i) => (
                <li key={i}>
                  {sec.section_name}: <b>{sec.score}</b> / {sec.total}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="scorepage-btnrow">
          <button
            className="scorepage-btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
          <button
            className="scorepage-btn-success"
            onClick={() => navigate(`/mocktest/${mockTestId}/review`)}
          >
            Review Answers
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScorePage;
