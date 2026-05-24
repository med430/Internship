export declare class Interview {
    readonly id: string;
    readonly studentId: string;
    readonly offerId: string;
    score: number;
    feedback: string;
    summary?: string | undefined;
    constructor(id: string, studentId: string, offerId: string, score: number, feedback: string, summary?: string | undefined);
}
