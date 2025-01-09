export const hashedRouter = true;

export const baseCASURI = `http://localhost:3000/account/${hashedRouter ? "#/" : ""}`;
export const accountVerificationCodeExpiresAt = 1000 * 60 * 10; // 10 minutes
export const canResendVerificationCodeAt = 1000 * 60;