export declare class ProfileResponseDTO {
    id: string;
    email: string;
    username: string;
    name: string;
    lastname: string;
    role: string;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
    constructor(id: string, email: string, username: string, name: string, lastname: string, role: string, phone?: string | undefined, avatarUrl?: string | undefined);
}
