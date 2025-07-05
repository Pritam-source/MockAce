import './ReviewPage.css';
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './ReviewPage.css'; // <-- import your css file

const optionLabel = (opt) => {
  switch (opt) {
    case "A": return "A";
    case "B": return "B";
    case "C": return "C";
    case "D": return "D";
    default: return opt;
  }
};

function ReviewPage({ token }) {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/exams/result/${mockTestId}/`, {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Unable to load review. Please make sure you have submitted the test.");
        setLoading(false);
        navigate("/");
      });
  }, [mockTestId, token, navigate]);

  if (loading) {
    return (
      <div className="reviewpage-root">
        <div className="reviewpage-loading-card"><p>Loading...</p></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="reviewpage-root">
      <div className="reviewpage-container">
        <div className="reviewpage-header">
          <div className="reviewpage-title">
            {report.test || "Mock Test Review"}
          </div>
          <div className="reviewpage-score">
            Score: <span className="reviewpage-score-value">{report.score}</span> / {report.total}
          </div>
        </div>

        {report.answers_report && report.answers_report.map((q, idx) => (
          <div key={idx} className="reviewpage-card">
            <div className="reviewpage-question">
              Q{idx + 1}. {q.question}
            </div>
            <div>
              {["A", "B", "C", "D"].map(opt => (
                <div
                  key={opt}
                  className={
                    "reviewpage-option"
                    + (q.selected === opt ? " selected" : "")
                    + (q.correct_option === opt ? " correct" : "")
                  }
                >
                  <input
                    type="radio"
                    checked={q.selected === opt}
                    disabled
                    readOnly
                    style={{ marginRight: 9 }}
                  />
                  <b>{optionLabel(opt)}.</b>
                  <span style={{ marginLeft: 7 }}>
                    {q[`option_${opt.toLowerCase()}`] || ""}
                  </span>
                  {q.correct_option === opt && (
                    <span className="reviewpage-correct-mark">
                      ✓ Correct Answer
                    </span>
                  )}
                  {q.selected === opt && q.correct_option !== opt && (
                    <span className="reviewpage-your-choice">
                      Your Choice
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="reviewpage-explanation">
              <b>Explanation:</b>
              <div>{q.explanation}</div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button onClick={() => navigate("/")} className="reviewpage-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;
