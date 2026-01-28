import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MFAVerify from './pages/MFAVerify';
import OAuthConsent from './pages/OAuthConsent';
import Welcome from './pages/Welcome';
import ForgotPassword from './pages/ForgotPassword';
import CreatePassword from './pages/CreatePassword';
import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, <span className="font-mono text-blue-400">{user.sub}</span></p>
      <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen text-white bg-gray-900 font-sans">
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-password" element={<CreatePassword />} />

              {/* Auth Routes */}
              <Route path="/mfa-verify" element={<MFAVerify />} />
              <Route
                path="/oauth/authorize"
                element={
                  <ProtectedRoute>
                    <OAuthConsent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
