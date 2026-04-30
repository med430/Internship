import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RecruiterMode } from '../../../Domain/enums/recruiter-mode.enum'

export type InterviewScores = {
    relevance: number
    depth: number
    clarity: number
    confidence: number
    overall: number
}

export type InterviewEvaluation = {
    scores: InterviewScores
    feedback: string
    nextQuestion: string | null
}

export type InterviewSummary = {
    summary: string
    feedback: string
}

export type InterviewContext = {
    company: string
    jobTitle?: string
    jobDescription: string
}

@Injectable()
export class InterviewAiService {
    private readonly groqApiKey: string
    private readonly groqWhisperModel: string
    private readonly groqChatModel: string
    private readonly elevenLabsApiKey: string
    private readonly elevenLabsModel: string
    private readonly elevenVoiceIds: Record<RecruiterMode, string>

    private readonly groqBaseUrl = 'https://api.groq.com/openai/v1'

    constructor(private readonly config: ConfigService) {
        const groqKey = this.config.get<string>('GROQ_API_KEY')
        const elevenKey = this.config.get<string>('ELEVEN_LABS_API_KEY')

        if (!groqKey) throw new Error('GROQ_API_KEY is required')
        if (!elevenKey) throw new Error('ELEVEN_LABS_API_KEY is required')

        this.groqApiKey = groqKey
        this.elevenLabsApiKey = elevenKey

        this.groqWhisperModel = this.config.get<string>('GROQ_WHISPER_MODEL') || 'whisper-large-v3'
        this.groqChatModel = this.config.get<string>('GROQ_LLM_MODEL') || 'llama-3.1-70b-versatile'
        this.elevenLabsModel = this.config.get<string>('ELEVEN_LABS_TTS_MODEL') || 'eleven_multilingual_v2'

        this.elevenVoiceIds = {
            [RecruiterMode.EMPATHIC]: this.config.get<string>('ELEVEN_LABS_VOICE_EMPATHIC') || '21m00Tcm4TlvDq8ikWAM',
            [RecruiterMode.TECHNICAL]: this.config.get<string>('ELEVEN_LABS_VOICE_TECHNICAL') || 'pNInz6obpgDQGcFmaJgB',
            [RecruiterMode.DIRECT]: this.config.get<string>('ELEVEN_LABS_VOICE_DIRECT') || 'ErXwobaYiN019PkySvjV',
        }
    }

    async transcribeAudio(file: Express.Multer.File): Promise<string> {
        if (!file || !file.buffer) {
            throw new Error('Audio file is required')
        }

        const form = new FormData()
        const blob = new Blob([new Uint8Array(file.buffer)], {
            type: file.mimetype || 'application/octet-stream',
        })
        form.append('file', blob, file.originalname || 'audio')
        form.append('model', this.groqWhisperModel)

        const response = await fetch(`${this.groqBaseUrl}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.groqApiKey}`,
            },
            body: form,
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
            const message = payload?.error?.message || 'Groq transcription failed'
            throw new Error(message)
        }

        const text = String(payload?.text || '').trim()
        if (!text) throw new Error('Empty transcription')

        return text
    }

    async generateQuestion(
        context: InterviewContext,
        mode: RecruiterMode,
        askedQuestions: string[],
        questionIndex: number,
        maxQuestions: number,
    ): Promise<string> {
        const system = [
            'You are a recruiter conducting a job interview.',
            'Ask exactly one concise question at a time.',
            'Do not add greetings or extra text.',
            'Avoid repeating previous questions.',
            'Match the interviewer personality:',
            '- EMPATHIC: warm, supportive, collaborative',
            '- TECHNICAL: deep technical probing',
            '- DIRECT: blunt, time-efficient, outcome-focused',
        ].join(' ')

        const user = [
            `Company: ${context.company}`,
            `Role: ${context.jobTitle || 'Candidate role'}`,
            `Job description: ${context.jobDescription}`,
            `Interviewer mode: ${mode}`,
            `Question ${questionIndex} of ${maxQuestions}.`,
            `Already asked: ${askedQuestions.length ? askedQuestions.join(' | ') : 'none'}`,
        ].join('\n')

        const content = await this.groqChat([
            { role: 'system', content: system },
            { role: 'user', content: user },
        ])

        const question = content.trim()
        if (!question) throw new Error('Failed to generate question')

        return question
    }

    async evaluateAnswer(
        context: InterviewContext,
        mode: RecruiterMode,
        question: string,
        answer: string,
        questionIndex: number,
        maxQuestions: number,
        history: Array<{ question: string; answer: string }>,
    ): Promise<InterviewEvaluation> {
        const system = [
            'You are an interview evaluator.',
            'Return JSON only, no extra text.',
            'Scores must be integers 0-10.',
            'Keys: scores {relevance, depth, clarity, confidence, overall}, feedback, nextQuestion.',
            'Set nextQuestion to null if this should be the final question.',
            'Use interviewer mode to shape the next question only.',
        ].join(' ')

        const user = [
            `Company: ${context.company}`,
            `Role: ${context.jobTitle || 'Candidate role'}`,
            `Job description: ${context.jobDescription}`,
            `Interviewer mode: ${mode}`,
            `Question ${questionIndex} of ${maxQuestions}.`,
            `Question: ${question}`,
            `Answer: ${answer}`,
            `Previous Q/A: ${history.length ? JSON.stringify(history) : '[]'}`,
        ].join('\n')

        const content = await this.groqChat(
            [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            true,
        )

        const parsed = this.parseJson(content)
        if (!parsed?.scores || typeof parsed.feedback !== 'string') {
            throw new Error('Invalid evaluation response')
        }

        return {
            scores: {
                relevance: Number(parsed.scores.relevance),
                depth: Number(parsed.scores.depth),
                clarity: Number(parsed.scores.clarity),
                confidence: Number(parsed.scores.confidence),
                overall: Number(parsed.scores.overall),
            },
            feedback: String(parsed.feedback || '').trim(),
            nextQuestion: parsed.nextQuestion ? String(parsed.nextQuestion).trim() : null,
        }
    }

    async summarizeInterview(
        context: InterviewContext,
        turns: Array<{ question: string; answer: string; scores: InterviewScores }>,
    ): Promise<InterviewSummary> {
        const system = [
            'You are an interview summarizer.',
            'Return JSON only with keys: summary, feedback.',
            'summary: 2-3 sentences.',
            'feedback: 2-3 sentences with actionable guidance.',
        ].join(' ')

        const user = [
            `Company: ${context.company}`,
            `Role: ${context.jobTitle || 'Candidate role'}`,
            `Job description: ${context.jobDescription}`,
            `Turns: ${JSON.stringify(turns)}`,
        ].join('\n')

        const content = await this.groqChat(
            [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            true,
        )

        const parsed = this.parseJson(content)
        if (!parsed?.summary || !parsed?.feedback) {
            throw new Error('Invalid summary response')
        }

        return {
            summary: String(parsed.summary).trim(),
            feedback: String(parsed.feedback).trim(),
        }
    }

    async textToSpeech(text: string, mode: RecruiterMode): Promise<{ audioBase64: string; audioMime: string }> {
        const voiceId = this.elevenVoiceIds[mode]
        if (!voiceId) throw new Error('Invalid voice configuration')

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                Accept: 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.elevenLabsApiKey,
            },
            body: JSON.stringify({
                text,
                model_id: this.elevenLabsModel,
                voice_settings: {
                    stability: mode === RecruiterMode.DIRECT ? 0.35 : 0.5,
                    similarity_boost: mode === RecruiterMode.TECHNICAL ? 0.75 : 0.6,
                },
            }),
        })

        if (!response.ok) {
            const payload = await response.text().catch(() => '')
            throw new Error(payload || 'ElevenLabs TTS failed')
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        return {
            audioBase64: buffer.toString('base64'),
            audioMime: 'audio/mpeg',
        }
    }

    private async groqChat(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        jsonResponse = false,
    ): Promise<string> {
        const response = await fetch(`${this.groqBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.groqChatModel,
                temperature: 0.3,
                messages,
                response_format: jsonResponse ? { type: 'json_object' } : undefined,
            }),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
            const message = payload?.error?.message || 'Groq chat failed'
            throw new Error(message)
        }

        const content = payload?.choices?.[0]?.message?.content
        if (!content) throw new Error('Empty Groq response')

        return content
    }

    private parseJson(content: string): any {
        return JSON.parse(content)
    }
}
