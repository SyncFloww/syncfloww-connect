export const getAuthErrorMessage = (error: { message: string }): string => {
  const msg = error.message?.toLowerCase() || '';

  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('login failed')) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (msg.includes('email not confirmed') || msg.includes('not verified')) {
    return "Please verify your email address before logging in.";
  }
  if (msg.includes('user not found') || msg.includes('account not found')) {
    return "No account found with this email address.";
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return "Unable to connect. Please check your internet connection.";
  }

  return error.message || 'Something went wrong. Please try again.';
};

export const getSuccessMessage = (action: string): { title: string; description: string } => {
  switch (action) {
    case "login":
      return { title: "Welcome back!", description: "You have successfully logged in." };
    case "signup":
      return { title: "Account created", description: "Please check your email to verify your account." };
    case "reset_password":
      return { title: "Password reset", description: "Password reset link has been sent to your email." };
    default:
      return { title: "Success", description: "Operation completed successfully." };
  }
};
