import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout, onRequireAuth }) => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isDashboard = user && ['/inicio', '/analise', '/dados', '/financeiro', '/simulador'].includes(location.pathname);

    const navLinks = [
        { to: '/inicio', label: 'Início' },
        { to: '/analise', label: 'Análise' },
        { to: '/dados', label: 'Dados' },
        { to: '/financeiro', label: 'Financeiro' },
        { to: '/simulador', label: 'Simulador' },
    ];

    const initials = user?.nome
        ? user.nome.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
        : '';

    return (
        <header className="ec-header">
            <div className="ec-header-inner">
                <Link to={user ? '/inicio' : '/'} className="ec-brand">
                    <div className="ec-brand-icon">
                        <span style={{ fontSize: '1.1rem' }}>&#128200;</span>
                    </div>
                    <div className="ec-brand-text">
                        <h1>Cariri Econômico</h1>
                        <span>Análise macroeconômica</span>
                    </div>
                </Link>

                {isDashboard && (
                    <nav className="ec-main-nav">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`ec-nav-link${location.pathname === to ? ' active' : ''}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                )}

                <div className="ec-header-actions">
                    {user ? (
                        <>
                            <div className="ec-user-chip">
                                <div className="ec-user-avatar">{initials}</div>
                                <span>{user.nome.split(' ')[0]}</span>
                            </div>
                            <button className="ec-btn-header" onClick={onLogout}>Sair</button>
                        </>
                    ) : (
                        <button className="ec-btn-header" onClick={onRequireAuth}>Entrar</button>
                    )}

                    {isDashboard && (
                        <button
                            className="ec-hamburger"
                            onClick={() => setMenuOpen(v => !v)}
                            aria-label="Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}
                </div>
            </div>

            {isDashboard && (
                <div className={`ec-mobile-nav${menuOpen ? ' open' : ''}`}>
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`ec-nav-link${location.pathname === to ? ' active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
