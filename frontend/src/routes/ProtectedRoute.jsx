import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <main className="ec-container">
        <div className="ec-card">
          <span className="eyebrow">Sessao segura</span>
          <h2>Carregando sua area...</h2>
          <p>Estamos validando seu token antes de abrir os dados economicos.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
