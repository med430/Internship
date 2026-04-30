'use client';

import { useEffect, useRef, useState } from 'react';

type RecruiterMode = 'SUPPORTIVE' | 'TECHNICAL' | 'CHALLENGING';

type StartInterviewResponse = {
  interviewId: string;
  questionIndex: number;
  questionText: string;
  audioBase64?: string;
};

type AnswerInterviewResponse = {
  interviewId: string;
  questionIndex: number;
  questionText?: string;
  audioBase64?: string;
  done: boolean;
  score?: number;
  summary?: string;
  transcript?: string;
};

type Message = {
  id: string;
  role: 'recruiter' | 'candidate';
  text: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

function base64ToBlob(base64: string, type = 'audio/mpeg') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type });
}

export default function Page() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [token, setToken] = useState('');
  const [mode, setMode] = useState<RecruiterMode>('TECHNICAL');
  const [interviewId, setInterviewId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  // Silently grab token if it exists from previous sessions
  useEffect(() => {
    const savedToken = window.localStorage.getItem('interview_token');
    if (savedToken) setToken(savedToken);
  }, []);

  async function playAudio(audioBase64?: string) {
    if (!audioBase64 || !audioPlayerRef.current) return;
    const audioUrl = URL.createObjectURL(base64ToBlob(audioBase64));
    audioPlayerRef.current.src = audioUrl;
    await audioPlayerRef.current.play();
  }

  async function startInterview() {
    setError('');
    setIsBusy(true);

    try {
      // Hardcoded defaults so your backend doesn't crash without the form
      const payload = {
        company: 'Tech Corp',
        jobTitle: 'Software Engineer',
        jobDescription: 'General interview.',
        recruiterMode: mode,
        questionCount: 3,
      };

      const res = await fetch(`${API_BASE_URL}/interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed to start.');

      const data = (await res.json()) as StartInterviewResponse;
      setInterviewId(data.interviewId);
      setMessages([{ id: Date.now().toString(), role: 'recruiter', text: data.questionText }]);
      await playAudio(data.audioBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting interview');
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await submitAnswer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mic access denied');
    }
  }

  async function submitAnswer(audioBlob: Blob) {
    setIsBusy(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.webm');

      const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/answer`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed to submit.');

      const data = (await res.json()) as AnswerInterviewResponse;
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-user', role: 'candidate', text: data.transcript || '(Inaudible)' },
      ]);

      if (data.done) {
        setMessages((prev) => [
          ...prev,
          { id: 'done', role: 'recruiter', text: `Interview complete. Score: ${data.score}/100. ${data.summary}` },
        ]);
        setInterviewId('');
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + '-bot', role: 'recruiter', text: data.questionText || '' },
        ]);
        await playAudio(data.audioBase64);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting answer');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="container">
      <audio ref={audioPlayerRef} hidden />

      <header className="header">
        <h1>Voice Interview</h1>
        {!interviewId && (
          <div className="setup-controls">
            <select value={mode} onChange={(e) => setMode(e.target.value as RecruiterMode)}>
              <option value="SUPPORTIVE">Amina (Supportive)</option>
              <option value="TECHNICAL">Marcus (Technical)</option>
              <option value="CHALLENGING">Victor (Challenging)</option>
            </select>
            <button onClick={startInterview} disabled={isBusy} className="btn-primary">
              {isBusy ? 'Loading...' : 'Start Interview'}
            </button>
          </div>
        )}
      </header>

      {error && <div className="error">{error}</div>}

      <div className="chat-box">
        {messages.length === 0 ? (
          <p className="placeholder">Start an interview to begin.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <strong>{msg.role === 'recruiter' ? 'Recruiter' : 'You'}</strong>
              <p>{msg.text}</p>
            </div>
          ))
        )}
      </div>

      {interviewId && (
        <div className="action-bar">
          <button
            onClick={toggleRecording}
            disabled={isBusy}
            className={`btn-record ${isRecording ? 'recording' : ''}`}
          >
            {isBusy ? 'Processing...' : isRecording ? '⏹ Stop & Submit' : '🎤 Hold to Record / Click to Start'}
          </button>
        </div>
      )}
    </main>
  );
}