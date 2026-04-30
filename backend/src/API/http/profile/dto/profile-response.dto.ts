// dto/profile-response.dto.ts
export class ProfileResponseDTO {
    constructor(
        public id: string,
        public email: string,
        public username: string,
        public name: string,
        public lastname: string,
        public role: string,
        public phone?: string,
        public avatarUrl?: string,
    ) {}
}