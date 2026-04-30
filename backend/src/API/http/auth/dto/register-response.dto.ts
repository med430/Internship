export class RegisterResponseDTO {
  constructor(
      public id: string,
      public email: string,
      public username: string,
      public name: string,
      public lastname: string,
      public role: string
  ) {}
}