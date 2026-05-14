export const getPaddleUrl = (environment: "sandbox" | "production") => {
  return environment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"
}
