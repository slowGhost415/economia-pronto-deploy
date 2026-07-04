import { useNavigate } from 'react-router-dom';

const AuthModal = ({ visible, onClose }) => {
  const navigate = useNavigate();

  if (!visible) return null;

  const ir = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Você precisa estar logado</h3>
        <p>Para acessar essa funcionalidade, faça login ou cadastre-se.</p>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancelar</button>
          <button className="primary-btn" onClick={ir}>Ir para login</button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
