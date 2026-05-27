// Fields used to compute the "About me" completion percentage.
// Must match UpdateMeProfileDto / StudentProfile entity fields.
export const PROFILE_FIELDS = [
  "name",
  "lastname",
  "bio",
  "birthDate",
  "gender",
  "address",
  "city",
  "username",
  "phone",
] as const;

export const FIELD_LABELS: Record<(typeof PROFILE_FIELDS)[number], string> = {
  name: "First Name",
  lastname: "Last Name",
  bio: "Bio",
  birthDate: "Birth Date",
  gender: "Gender",
  address: "Address",
  city: "City",
  username: "Username",
  phone: "Phone",
};
