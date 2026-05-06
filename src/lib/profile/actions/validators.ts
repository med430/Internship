export function validateAvatarFile(file: File | null): string | null {
  if (!file || file.size === 0) {
    return "No file provided";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "File size must be less than 5MB";
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed";
  }

  return null;
}

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return "Password must contain both letters and numbers";
  }

  return null;
}
