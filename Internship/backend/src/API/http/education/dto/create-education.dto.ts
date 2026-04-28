export class CreateEducationDTO {
    school: string
    degree: string
    field: string
    startDate: Date
    endDate?: Date
    description?: string
}