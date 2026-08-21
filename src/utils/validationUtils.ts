export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

export function validateUsername(username: string): string | null {
  const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
  if (!username.trim()) return 'Username is required';
  if (!usernameRegex.test(username)) {
    return 'Username must be 3–30 chars: letters, numbers, . and _';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validateOTP(otp: string, length: number): string | null {
  if (!otp) return 'OTP is required';
  if (otp.length !== length || !/^\d+$/.test(otp)) {
    return `Enter a valid ${length}-digit OTP`;
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  if (!phone.trim()) return 'Phone number is required';
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Enter a valid phone number';
  }
  return null;
}
