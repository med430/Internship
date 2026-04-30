"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Scores = {
  relevance: number;
  depth: number;
  clarity: number;
  confidence: number;
  overall: number;
};

type Turn = {
  question: string;
  answer: string;
  scores?: Scores;
  feedback?: string;
};

type StartResponse = {
  interviewId: string;
  question: string;
  audioBase64: string;
  audioMime: string;
  questionIndex: number;
  recruiterMode: string;
};

type AnswerResponse = {
  done: boolean;
  transcript: string;
  scores: Scores;
  feedback: string;
  nextQuestion?: string;
  audioBase64?: string;
  audioMime?: string;
  summary?: string;
  score?: number;
  questionIndex?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Home() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  const [useOffer, setUseOffer] = useState(false);
  const [offerId, setOfferId] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [recruiterMode, setRecruiterMode] = useState("TECHNICAL");
  const [questionCount, setQuestionCount] = useState(3);

  const [interviewId, setInterviewId] = useState("");
  const [question, setQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [questionAudio, setQuestionAudio] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalSummary, setFinalSummary] = useState("");
  const [finalFeedback, setFinalFeedback] = useState("");

  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("interview_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("interview_token", token);
  }, [token]);

  const hasToken = Boolean(token);
  const safeQuestionCount = useMemo(() => {
    if (!Number.isFinite(questionCount)) return 3;
    return Math.min(10, Math.max(1, questionCount));
  }, [questionCount]);

  const questionAudioSrc = useMemo(() => {
    if (!questionAudio) return "";
    return questionAudio;
  }, [questionAudio]);

  const setQuestionAudioFromResponse = (audioBase64?: string, audioMime?: string) => {
    if (!audioBase64 || !audioMime) {
      setQuestionAudio("");
      return;
    }
    setQuestionAudio(`data:${audioMime};base64,${audioBase64}`);
  };

  const requestJson = async <T,>(path: string, options: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || "Request failed";
      throw new Error(message);
    }
    return data as T;
  };

  const clearStatus = () => {
    setStatus("");
    setError("");
  };

  const handleRegister = async () => {
    clearStatus();
    setLoading(true);
    try {
      setStatus("Registering and logging in...");
      await requestJson("/auth/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, lastname, username, password }),
      });
      await handleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearStatus();
    setLoading(true);
    try {
      setStatus("Logging in...");
      const result = await requestJson<{ token: string }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setToken(result.token);
      setStatus("Token ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("interview_token");
  };

  const resetInterview = () => {
    setInterviewId("");
    setQuestion("");
    setQuestionIndex(null);
    setQuestionAudio("");
    setTurns([]);
    setFinalScore(null);
    setFinalSummary("");
    setFinalFeedback("");
  };

  const handleStartInterview = async () => {
    clearStatus();
    setLoading(true);
    try {
      if (!hasToken) throw new Error("Login required");

      if (useOffer && !offerId.trim()) throw new Error("Offer ID is required");
      if (!useOffer) {
        if (!company.trim() || !jobDescription.trim()) {
          throw new Error("Company and job description are required");
        }
      }

      setStatus("Starting interview...");

      const payload: Record<string, unknown> = {
        recruiterMode,
        questionCount: safeQuestionCount,
      };

      if (useOffer) {
        payload.offerId = offerId.trim();
      } else {
        payload.company = company.trim();
        payload.jobTitle = jobTitle.trim();
        payload.jobDescription = jobDescription.trim();
      }

      const result = await requestJson<StartResponse>("/interviews/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      resetInterview();
      setInterviewId(result.interviewId);
      setQuestion(result.question);
      setQuestionIndex(result.questionIndex);
      setQuestionAudioFromResponse(result.audioBase64, result.audioMime);
      setStatus("Interview live");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Start failed");
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleStartRecording = async () => {
    clearStatus();
    if (!interviewId) {
      setError("Start an interview first");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];
        await handleSubmitAnswer(blob);
        stopStream();
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone permission denied");
      stopStream();
    }
  };

  const handleStopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setRecording(false);
  };

  const handleSubmitAnswer = async (audioBlob: Blob) => {
    clearStatus();
    setLoading(true);
    try {
      setStatus("Scoring answer...");
      const formData = new FormData();
      const ext = audioBlob.type.includes("webm")
        ? "webm"
        : audioBlob.type.includes("ogg")
          ? "ogg"
          : "wav";
      formData.append("audio", audioBlob, `answer.${ext}`);

      const response = await fetch(`${API_BASE}/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data: AnswerResponse = await response.json();
      if (!response.ok) {
        throw new Error(
          Array.isArray((data as { message?: string[] }).message)
            ? (data as { message: string[] }).message.join(", ")
            : (data as { message?: string }).message || "Answer failed",
        );
      }

      setTurns((prev) => [
        ...prev,
        {
          question,
          answer: data.transcript,
          scores: data.scores,
          feedback: data.feedback,
        },
      ]);

      if (data.done) {
        setFinalScore(data.score ?? null);
        setFinalSummary(data.summary ?? "");
        setFinalFeedback(data.feedback ?? "");
        setQuestion("");
        setQuestionIndex(data.questionIndex ?? questionIndex);
        setQuestionAudio("");
        setStatus("Interview completed");
      } else {
        setQuestion(data.nextQuestion ?? "");
        setQuestionIndex(data.questionIndex ?? null);
        setQuestionAudioFromResponse(data.audioBase64, data.audioMime);
        setStatus("Next question ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Answer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <p className="eyebrow">Voice Interview Studio</p>
          <h1>Recruiter-mode interviews, scored in real time.</h1>
          <p className="subhead">Pick a mode, speak your answers, get a clean /100 score and feedback.</p>
        </div>
        <div className="status">
          <div className="chip">API: {API_BASE}</div>
          <div className={`chip ${hasToken ? "ok" : ""}`}>{hasToken ? "Token ready" : "No token"}</div>
        </div>
      </header>

      <main className="layout">
        <section className="card span-5" style={{ ["--delay" as any]: "40ms" }}>
          <h2>Access + Setup</h2>

          <div className="section">
            <h3>Auth</h3>
            <div className="grid">
              <label className="field">
                <span>Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                />
              </label>
              <label className="field">
                <span>First name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sam" />
              </label>
              <label className="field">
                <span>Last name</span>
                <input value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Taylor" />
              </label>
              <label className="field span-2">
                <span>Username</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="sam.taylor" />
              </label>
            </div>
            <div className="actions">
              <button className="btn primary" onClick={handleRegister} disabled={loading}>
                Register + Login
              </button>
              <button className="btn ghost" onClick={handleLogin} disabled={loading}>
                Login
              </button>
              <button className="btn ghost" onClick={handleLogout} disabled={!hasToken}>
                Clear token
              </button>
            </div>
          </div>

          <div className="section">
            <h3>Interview config</h3>
            <div className="toggle">
              <button className={useOffer ? "active" : ""} onClick={() => setUseOffer(true)} type="button">
                Use offer ID
              </button>
              <button className={!useOffer ? "active" : ""} onClick={() => setUseOffer(false)} type="button">
                Use company + job
              </button>
            </div>

            {useOffer ? (
              <label className="field">
                <span>Offer ID</span>
                <input value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="Offer UUID" />
              </label>
            ) : (
              <>
                <div className="grid">
                  <label className="field">
                    <span>Company</span>
                    <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
                  </label>
                  <label className="field">
                    <span>Job title</span>
                    <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Role (optional)" />
                  </label>
                  <label className="field span-2">
                    <span>Job description</span>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={4}
                      placeholder="Paste the description"
                    />
                  </label>
                </div>
              </>
            )}

            <div className="grid">
              <label className="field">
                <span>Recruiter mode</span>
                <select value={recruiterMode} onChange={(e) => setRecruiterMode(e.target.value)}>
                  <option value="EMPATHIC">Empathic</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="DIRECT">Direct</option>
                </select>
              </label>
              <label className="field">
                <span>Question count</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={safeQuestionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={handleStartInterview} disabled={loading || !hasToken}>
                Start interview
              </button>
              <button className="btn ghost" onClick={resetInterview} disabled={!interviewId && !turns.length}>
                Reset session
              </button>
            </div>
          </div>

          {(status || error) && <div className={`notice ${error ? "error" : ""}`}>{error || status}</div>}
        </section>

        <section className="card span-7" style={{ ["--delay" as any]: "120ms" }}>
          <h2>Live interview</h2>

          {!interviewId ? (
            <div className="empty">
              <p>Start an interview to hear the first question.</p>
            </div>
          ) : (
            <div className="session">
              <div className="question-block">
                <div>
                  <p className="eyebrow">Question {questionIndex ?? 0}</p>
                  <h3>{question || "Waiting for next question..."}</h3>
                </div>
                {questionAudioSrc && <audio className="audio" controls src={questionAudioSrc} />}
              </div>

              <div className="record-row">
                <button
                  className={`btn record ${recording ? "live" : ""}`}
                  onClick={recording ? handleStopRecording : handleStartRecording}
                  disabled={loading}
                >
                  {recording ? "Stop + submit answer" : "Record answer"}
                </button>
                <p className="hint">Mic input only. When you stop, your answer is scored automatically.</p>
              </div>

              {finalScore !== null && (
                <div className="final">
                  <div>
                    <p className="eyebrow">Final score</p>
                    <div className="score">{finalScore}/100</div>
                  </div>
                  <div>
                    <p className="eyebrow">Summary</p>
                    <p>{finalSummary}</p>
                    <p className="feedback">{finalFeedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="card span-12" style={{ ["--delay" as any]: "200ms" }}>
          <h2>Conversation</h2>
          {turns.length === 0 ? (
            <p className="muted">No answers yet. Record your first response.</p>
          ) : (
            <div className="turns">
              {turns.map((turn, index) => (
                <div className="turn" key={`${turn.question}-${index}`}>
                  <div className="turn-head">
                    <span>Q{index + 1}</span>
                    {turn.scores && (
                      <div className="score-row">
                        {Object.entries(turn.scores).map(([key, value]) => (
                          <div key={key} className="score-item">
                            <span>{key}</span>
                            <div className="bar">
                              <span style={{ width: `${value * 10}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="question">{turn.question}</p>
                  <p className="answer">{turn.answer}</p>
                  {turn.feedback && <p className="feedback">{turn.feedback}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
