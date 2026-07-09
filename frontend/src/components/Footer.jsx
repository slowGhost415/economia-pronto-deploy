import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    const links = [
        { to: '/inicio', label: 'Início' },
        { to: '/analise', label: 'Análises' },
        { to: '/dados', label: 'Indicadores' },
        { to: '/analise#graficos', label: 'Gráficos' },
        { to: '/analise#educacao-economica', label: 'Educação Econômica' },
        { to: '/analise#fontes-dados', label: 'Fontes dos dados' },
    ];

    const fontes = [
        'Banco Central do Brasil / SGS',
        'Base local de preços',
        'Fontes oficiais previstas para próximas integrações'
    ];

    return (
        <footer id="sobre-site" className="ec-footer">
            <div className="ec-footer-inner">
                <section className="ec-footer-brand" aria-labelledby="footer-brand-title">
                    <div className="ec-brand-icon ec-footer-icon">
                        <span aria-hidden="true">&#128200;</span>
                    </div>
                    <div>
                        <h2 id="footer-brand-title">Economic</h2>
                        <p>
                            Plataforma de análise econômica para acompanhar Selic, inflação,
                            preços, indicadores e leitura de cenário com linguagem clara.
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
                    <h3 id="footer-sources-title">Fontes e transparência</h3>
                    {fontes.map((fonte) => (
                        <span key={fonte}>{fonte}</span>
                    ))}
                </section>

                <section className="ec-footer-contact" aria-labelledby="footer-contact-title">
                    <h3 id="footer-contact-title">Créditos</h3>
                    <p>Projeto Economic, desenvolvido para estudo, análise e educação financeira.</p>
                    <p className="ec-footer-note">
                        Dados e interpretações têm caráter informativo e não constituem recomendação
                        financeira, fiscal ou de investimento.
                    </p>
                </section>
            </div>

            <div className="ec-footer-bottom">
                <span>© {year} Economic. Todos os direitos reservados.</span>
                <span>Última revisão visual: plataforma econômica moderna e responsiva.</span>
            </div>
        </footer>
    );
};

export default Footer;
