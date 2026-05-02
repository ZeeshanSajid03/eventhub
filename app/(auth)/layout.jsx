export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      {children}
    </div>
  );
}