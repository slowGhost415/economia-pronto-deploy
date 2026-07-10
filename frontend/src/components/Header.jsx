import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout, onRequireAuth }) => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const hasAppNav = user && ['/inicio', '/analise', '/dados', '/financeiro', '/simulador', '/educacao', '/sobre'].includes(location.pathname);

    const navLinks = [
        { to: '/inicio', label: 'Início' },
        { to: '/analise', label: 'Análises' },
        { to: '/dados', label: 'Indicadores' },
        { to: '/simulador', label: 'Simulador' },
        { to: '/financeiro', label: 'Investimentos' },
        { to: '/analise#graficos', label: 'Gráficos' },
        { to: '/educacao', label: 'Educação' },
        { to: '/sobre', label: 'Sobre' },
    ];

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.hash]);

    useEffect(() => {
        if (!menuOpen) return;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    const isActiveLink = (to) => {
        const [path, hash = ''] = to.split('#');
        const targetHash = hash ? `#${hash}` : '';
        if (targetHash) return location.pathname === path && location.hash === targetHash;
        return location.pathname === path && !location.hash;
    };

    const initials = user?.nome
        ? user.nome.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
        : '';

    return (
        <header className="ec-header">
            <div className="ec-header-inner">
                <Link to={user ? '/inicio' : '/'} className="ec-brand" aria-label="Economic, ir para o início">
                    <div className="ec-brand-icon">
                        <span aria-hidden="true">Ec</span>
                    </div>
                    <div className="ec-brand-text">
                        <strong>Economic</strong>
                        <span>Análise econômica</span>
                    </div>
                </Link>

                {hasAppNav && (
                    <nav className="ec-main-nav" aria-label="Navegação principal">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`ec-nav-link${isActiveLink(to) ? ' active' : ''}`}
                                aria-current={isActiveLink(to) ? 'page' : undefined}
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
                                <div className="ec-user-avatar" aria-hidden="true">{initials}</div>
                                <span>{user.demo ? 'Demo' : user.nome.split(' ')[0]}</span>
                            </div>
                            <button type="button" className="ec-btn-header" onClick={onLogout}>Sair</button>
                        </>
                    ) : (
                        <button type="button" className="ec-btn-header" onClick={onRequireAuth}>Entrar</button>
                    )}

                    {hasAppNav && (
                        <button
                            type="button"
                            className="ec-hamburger"
                            onClick={() => setMenuOpen(v => !v)}
                            aria-label="Abrir menu de navegação"
                            aria-expanded={menuOpen}
                            aria-controls="ec-mobile-nav"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}
                </div>
            </div>

            {hasAppNav && (
                <nav
                    id="ec-mobile-nav"
                    className={`ec-mobile-nav${menuOpen ? ' open' : ''}`}
                    aria-label="Navegação principal no celular"
                    hidden={!menuOpen}
                >
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`ec-nav-link${isActiveLink(to) ? ' active' : ''}`}
                            aria-current={isActiveLink(to) ? 'page' : undefined}
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Header;
