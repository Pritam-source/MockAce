import './TestPage.css';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TestPage.css';

const statusColor = {
  answered: "#4caf50",
  "not answered": "#e53935",
  review: "#8e24aa",
  "not visited": "#bdbdbd",
};

function TestPage({ token }) {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    axios.post(
      `${process.env.REACT_APP_API_URL}/api/exams/start-test/${mockTestId}/`,
      {},
      { headers: { Authorization: `Token ${token}` } }
    )
    .then((res) => {
      setTest(res.data);

      const initialStatus = {};
      res.data.questions.forEach((q) => { initialStatus[q.id] = "not visited"; });
      initialStatus[res.data.questions[0].id] = "not answered";
      setStatus(initialStatus);

      setAnswers({});
      setSecondsLeft(res.data.duration * 60);
      setLoading(false);
    })
    .catch(() => {
      setTest(null);
      setLoading(false);
    });

    return () => clearInterval(timerRef.current);
  }, [mockTestId, token]);

  useEffect(() => {
    if (loading || !test) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [loading, test]);

  if (loading) return <p style={{ fontFamily: "'Lucida Sans Unicode', Arial, sans-serif" }}>Loading...</p>;
  if (!test) return <p style={{ fontFamily: "'Lucida Sans Unicode', Arial, sans-serif" }}>Unable to load test or you do not have access.</p>;

  const questions = test.questions;
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const statusCounts = { answered: 0, "not answered": 0, review: 0, "not visited": 0 };
  Object.values(status).forEach((s) => (statusCounts[s]++));

  const handleOptionChange = (qid, value) => {
    setAnswers((old) => ({ ...old, [qid]: value }));
    setStatus((old) => ({ ...old, [qid]: "answered" }));
  };

  const gotoQuestion = (idx) => {
    setCurrent(idx);
    setStatus((old) => {
      const qid = questions[idx].id;
      if (old[qid] === "not visited") {
        return { ...old, [qid]: answers[qid] ? "answered" : "not answered" };
      }
      return old;
    });
  };

  const handleSaveNext = () => {
    const qid = questions[current].id;
    setStatus((old) => ({
      ...old,
      [qid]: answers[qid] ? "answered" : "not answered",
    }));
    if (current < questions.length - 1) {
      gotoQuestion(current + 1);
    }
  };

  const handleClear = () => {
    const qid = questions[current].id;
    setAnswers((old) => {
      const n = { ...old };
      delete n[qid];
      return n;
    });
    setStatus((old) => ({ ...old, [qid]: "not answered" }));
  };

  const handleMarkReview = () => {
    const qid = questions[current].id;
    setStatus((old) => ({ ...old, [qid]: "review" }));
    if (current < questions.length - 1) gotoQuestion(current + 1);
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit the test?")) return;

    const answersWithStringKeys = {};
    Object.keys(answers).forEach((qid) => {
      answersWithStringKeys[String(qid)] = answers[qid];
    });

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/exams/submit/${mockTestId}/`,
        { answers: answersWithStringKeys },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      navigate(`/score/${mockTestId}`);
    } catch (err) {
      alert("Error submitting test. Try again.");
    }
  };

  const q = questions[current];
  const qid = q.id;

  return (
    <div className="testpage-root">
      {/* Left: Q&A Card */}
      <div className="testpage-card">
        <h2 className="testpage-title">{test.mock_test}</h2>
        <div className="testpage-duration">
          <b>Duration:</b> {test.duration} minutes
        </div>
        <div>
          <div className="testpage-question-meta">
            Question {current + 1} of {questions.length}
          </div>
          <div className="testpage-question-text">{q.question_text}</div>
          <form className="testpage-form">
            {["A", "B", "C", "D"].map((opt) => (
              <div key={opt}>
                <label
                  className={
                    answers[qid] === opt
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name={`option_${qid}`}
                    value={opt}
                    checked={answers[qid] === opt}
                    onChange={() => handleOptionChange(qid, opt)}
                    style={{ marginRight: 7, accentColor: "#267cfb" }}
                  />
                  <b>{opt}.</b> {q[`option_${opt.toLowerCase()}`]}
                </label>
              </div>
            ))}
          </form>
        </div>
        <div className="testpage-btn-row">
          <button
            onClick={handleSaveNext}
            className="testpage-btn save-next"
            disabled={current === questions.length - 1}
          >
            Save & Next
          </button>
          <button
            onClick={handleClear}
            className="testpage-btn clear"
          >
            Clear Response
          </button>
          <button
            onClick={handleMarkReview}
            className="testpage-btn review"
          >
            Mark for Review & Next
          </button>
        </div>
      </div>

      {/* Right: Palette & Summary Card */}
      <div className="testpage-palette">
        <div className="testpage-timer">
          <b>Timer:</b>{" "}
          <span className="testpage-timer-value">{timer}</span>
        </div>
        <div className="testpage-summary">
          <b>Summary:</b>
          <ul className="testpage-summary-list">
            <li>
              <span className="dot-answered">●</span> Answered: {statusCounts.answered}
            </li>
            <li>
              <span className="dot-not-answered">●</span> Not Answered: {statusCounts["not answered"]}
            </li>
            <li>
              <span className="dot-review">●</span> Marked for Review: {statusCounts.review}
            </li>
            <li>
              <span className="dot-not-visited">●</span> Not Visited: {statusCounts["not visited"]}
            </li>
          </ul>
        </div>
        <div className="testpage-palette-grid">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              className={
                "testpage-palette-btn" +
                (idx === current ? " current" : "")
              }
              style={{ background: statusColor[status[q.id] || "not visited"] }}
              onClick={() => gotoQuestion(idx)}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="testpage-submit-btn"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default TestPage;
