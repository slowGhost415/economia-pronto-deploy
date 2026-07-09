import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { getProfile, login, signup } from './services/authService';
import AuthPanel from './components/AuthPanel';
import Inicio from './pages/Inicio';
import Analise from './pages/Analise';
import Dados from './pages/Dados';
import Financeiro from './pages/Financeiro';
import Simulador from './pages/Simulador';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUser(profile);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const doSignup = async (dto) => {
    try {
      const result = await signup(dto);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      setNotification({ type: 'success', message: 'Cadastro concluído!' });
      navigate('/inicio');
    } catch (error) {
      setNotification({ type: 'error', message: error?.response?.data?.error || error?.message || 'Erro no cadastro' });
    }
  };

  const doLogin = async (dto) => {
    try {
      const result = await login(dto);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      setNotification({ type: 'success', message: 'Login realizado!' });
      navigate('/inicio');
    } catch (error) {
      setNotification({ type: 'error', message: error?.response?.data?.error || error?.message || 'Erro no login' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotification({ type: 'success', message: 'Logout realizado' });
    navigate('/');
  };

  const requireAuth = () => {
    if (!user) setShowAuthModal(true);
  };

  return (
    <div className="app-container">
      <Header user={user} onLogout={logout} onRequireAuth={requireAuth} />
      {notification && (
        <div
          className={`toast ${notification.type}`}
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        >
          {notification.message}
        </div>
      )}

      <Routes>
        <Route path="/" element={<AuthPanel onLogin={doLogin} onSignup={doSignup} loading={loading} />} />

        <Route path="/inicio" element={<ProtectedRoute user={user} loading={loading}><Inicio user={user} /></ProtectedRoute>} />
        <Route path="/analise" element={<ProtectedRoute user={user} loading={loading}><Analise user={user} /></ProtectedRoute>} />
        <Route path="/dados" element={<ProtectedRoute user={user} loading={loading}><Dados user={user} /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute user={user} loading={loading}><Financeiro user={user} /></ProtectedRoute>} />
        <Route path="/simulador" element={<ProtectedRoute user={user} loading={loading}><Simulador user={user} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <Footer />
    </div>
  );
}

export default App;
