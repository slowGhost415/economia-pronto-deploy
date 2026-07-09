import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    const links = [
        { to: '/demo', label: 'Abrir demo' },
        { to: '/inicio', label: 'Início' },
        { to: '/analise', label: 'Análises' },
        { to: '/dados', label: 'Indicadores' },
        { to: '/simulador', label: 'Simulador' },
        { to: '/sobre', label: 'Projeto' },
    ];

    const fontes = [
        'Banco Central do Brasil / SGS',
        'Base local de preços',
        'PostgreSQL + Prisma para dados de usuário',
        'Fontes oficiais planejadas no roadmap'
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
                            Projeto full stack de análise econômica com frontend React, backend Express,
                            autenticação JWT, Prisma, PostgreSQL, gráficos e modo demonstração.
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
                    <h3 id="footer-sources-title">Fontes e stack</h3>
                    {fontes.map((fonte) => (
                        <span key={fonte}>{fonte}</span>
                    ))}
                </section>

                <section className="ec-footer-contact" aria-labelledby="footer-contact-title">
                    <h3 id="footer-contact-title">Uso do projeto</h3>
                    <p>Desenvolvido como plataforma de estudo, portfolio e demonstracao tecnica.</p>
                    <p className="ec-footer-note">
                        Dados e interpretações têm caráter informativo e não constituem recomendação
                        financeira, fiscal ou de investimento.
                    </p>
                </section>
            </div>

            <div className="ec-footer-bottom">
                <span>© {year} Economic. Projeto de portfólio.</span>
                <span>React + Node + Prisma + PostgreSQL + Chart.js.</span>
            </div>
        </footer>
    );
};

export default Footer;
