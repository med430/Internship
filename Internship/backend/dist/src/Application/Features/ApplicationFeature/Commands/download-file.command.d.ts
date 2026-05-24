export declare class DownloadApplicationFileCommand {
    readonly applicationId: string;
    readonly userId: string;
    readonly type: 'cv' | 'coverLetter';
    constructor(applicationId: string, userId: string, type: 'cv' | 'coverLetter');
}
