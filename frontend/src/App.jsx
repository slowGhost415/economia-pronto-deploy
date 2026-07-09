import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { getProfile, login, signup } from './services/authService';
import AuthPanel from './components/AuthPanel';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';

const Inicio = lazy(() => import('./pages/Inicio'));
const Analise = lazy(() => import('./pages/Analise'));
const Dados = lazy(() => import('./pages/Dados'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Simulador = lazy(() => import('./pages/Simulador'));
const Educacao = lazy(() => import('./pages/Educacao'));
const Sobre = lazy(() => import('./pages/Sobre'));

const DEMO_USER = {
  id: 'demo',
  nome: 'Visitante Demo',
  email: 'demo@economic.local',
  demo: true,
};

const RouteLoader = ({ title = 'Carregando módulo' }) => (
  <main className="ec-container">
    <div className="ec-card route-loader-card">
      <span className="eyebrow">Economic</span>
      <h2>{title}</h2>
      <p>Preparando indicadores e visualizações econômicas.</p>
    </div>
  </main>
);

const DemoRedirect = ({ onDemo }) => {
  useEffect(() => {
    onDemo('/inicio');
  }, [onDemo]);

  return <RouteLoader title="Abrindo demonstração" />;
};

function App() {
  const [user, setUser] = useState(() => (localStorage.getItem('demoMode') === '1' ? DEMO_USER : null));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (localStorage.getItem('demoMode') === '1') setUser(DEMO_USER);
      return;
    }

    localStorage.removeItem('demoMode');
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

  const enterDemo = useCallback((destino = '/inicio') => {
    localStorage.removeItem('token');
    localStorage.setItem('demoMode', '1');
    setUser(DEMO_USER);
    setLoading(false);
    setShowAuthModal(false);
    setNotification({ type: 'success', message: 'Demonstração aberta' });
    navigate(destino);
  }, [navigate]);

  const doSignup = async (dto) => {
    try {
      const result = await signup(dto);
      localStorage.removeItem('demoMode');
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
      localStorage.removeItem('demoMode');
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
    localStorage.removeItem('demoMode');
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

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<AuthPanel onLogin={doLogin} onSignup={doSignup} onDemo={() => enterDemo('/inicio')} loading={loading} />} />
          <Route path="/demo" element={<DemoRedirect onDemo={enterDemo} />} />

          <Route path="/inicio" element={<ProtectedRoute user={user} loading={loading}><Inicio user={user} /></ProtectedRoute>} />
          <Route path="/analise" element={<ProtectedRoute user={user} loading={loading}><Analise user={user} /></ProtectedRoute>} />
          <Route path="/dados" element={<ProtectedRoute user={user} loading={loading}><Dados user={user} /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute user={user} loading={loading}><Financeiro user={user} /></ProtectedRoute>} />
          <Route path="/simulador" element={<ProtectedRoute user={user} loading={loading}><Simulador user={user} /></ProtectedRoute>} />
          <Route path="/educacao" element={<ProtectedRoute user={user} loading={loading}><Educacao user={user} /></ProtectedRoute>} />
          <Route path="/sobre" element={<ProtectedRoute user={user} loading={loading}><Sobre user={user} /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <Footer />
    </div>
  );
}

export default App;
