export class CreateCertificationDTO {
    name: string
    organization: string
    issueDate: Date
    expirationDate?: Date
    credentialId?: string
    credentialUrl?: string
}