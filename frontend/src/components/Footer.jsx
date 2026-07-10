import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    const links = [
        { to: '/demo', label: 'Demonstração' },
        { to: '/inicio', label: 'Início' },
        { to: '/analise', label: 'Análises' },
        { to: '/dados', label: 'Indicadores' },
        { to: '/simulador', label: 'Simulador' },
        { to: '/financeiro', label: 'Investimentos' },
        { to: '/sobre', label: 'Sobre' },
    ];

    const fontes = [
        'Banco Central do Brasil / SGS',
        'Base local de preços',
        'Séries econômicas oficiais',
        'Novas fontes em integração'
    ];

    return (
        <footer id="sobre-site" className="ec-footer">
            <div className="ec-footer-inner">
                <section className="ec-footer-brand" aria-labelledby="footer-brand-title">
                    <div className="ec-brand-icon ec-footer-icon">
                        <span aria-hidden="true">Ec</span>
                    </div>
                    <div>
                        <h2 id="footer-brand-title">Economic</h2>
                        <p>
                            Plataforma de análise econômica para acompanhar juros, inflação,
                            preços essenciais, simulações financeiras e educação econômica.
                        </p>
                    </div>
                </section>

                <nav className="ec-footer-links" aria-label="Links principais">
                    <h3>Navegação</h3>
                    {links.map((link) => (
                        <Link key={link.to} to={link.to}>{link.label}</Link>
                    ))}
                </nav>

                <section className="ec-footer-sources" aria-labelledby="footer-sources-title">
                    <h3 id="footer-sources-title">Fontes de dados</h3>
                    {fontes.map((fonte) => (
                        <span key={fonte}>{fonte}</span>
                    ))}
                </section>

                <section className="ec-footer-contact" aria-labelledby="footer-contact-title">
                    <h3 id="footer-contact-title">Transparência</h3>
                    <p>Os dados são apresentados com contexto, fonte e data sempre que disponíveis.</p>
                    <p className="ec-footer-note">
                        Dados e interpretações têm caráter informativo e não constituem recomendação
                        financeira, fiscal ou de investimento.
                    </p>
                </section>
            </div>

            <div className="ec-footer-bottom">
                <span>© {year} Economic. Dados informativos.</span>
                <span>Indicadores, preços, simulações e educação econômica.</span>
            </div>
        </footer>
    );
};

export default Footer;
