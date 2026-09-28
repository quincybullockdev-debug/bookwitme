// static confirmation page — no state, no logic, just a message
export default function SignupSuccessPage() {
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">You're all set!</h1>
      <p className="mb-4">
        Check your email to verify your account before logging in.
      </p>
      <a href="/login" className="text-blue-600 underline">
        Go to login
      </a>
    </div>
  );
}
