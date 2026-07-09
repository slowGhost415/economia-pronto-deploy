import { useState } from 'react';

const AuthPanel = ({ onLogin, onSignup, onDemo, loading }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ nome: '', email: '', senha: '' });
    const [lembrar, setLembrar] = useState(false);
    const senhaForte = form.senha.length >= 8 && /[A-Za-z]/.test(form.senha) && /\d/.test(form.senha);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin({ email: form.email.trim(), senha: form.senha });
        } else {
            if (!form.nome.trim()) return;
            onSignup({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha });
        }
    };

    return (
        <div className="auth-page">
            <section className="auth-showcase" aria-labelledby="auth-showcase-title">
                <span className="site-eyebrow">Projeto full stack para portfólio</span>
                <h1 id="auth-showcase-title">Dashboard econômico com dados, autenticação e análise visual.</h1>
                <p>
                    Plataforma construída com React, Vite, Node.js, Express, Prisma e PostgreSQL
                    para consultar indicadores, comparar séries, simular cenários e explicar conceitos econômicos.
                </p>

                <div className="auth-stack-grid" aria-label="Tecnologias e módulos do projeto">
                    <span>React 18</span>
                    <span>Node + Express</span>
                    <span>Prisma ORM</span>
                    <span>PostgreSQL</span>
                    <span>JWT Auth</span>
                    <span>Chart.js</span>
                </div>

                <div className="auth-proof-grid">
                    <article>
                        <strong>Rotas protegidas</strong>
                        <span>Conta real ou modo visitante para avaliação rápida.</span>
                    </article>
                    <article>
                        <strong>Dados econômicos</strong>
                        <span>Selic, IPCA, preços locais, filtros e exportação.</span>
                    </article>
                    <article>
                        <strong>Produto navegavel</strong>
                        <span>Dashboard, educação, simulações e página técnica do projeto.</span>
                    </article>
                </div>
            </section>

            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span>Ec</span>
                    </div>
                    <div className="auth-logo-text">
                        <h2>Economic</h2>
                        <span>Plataforma de análise econômica</span>
                    </div>
                </div>

                <h2 className="auth-title">{isLogin ? 'Acessar plataforma' : 'Criar conta'}</h2>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Entre com sua conta ou use a demonstração para avaliar o projeto sem cadastro.'
                        : 'Cadastre-se para acessar todos os recursos da plataforma.'}
                </p>

                <form onSubmit={submit}>
                    {!isLogin && (
                        <div className="auth-field">
                            <label htmlFor="auth-nome">Nome completo</label>
                            <input
                                id="auth-nome"
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                placeholder="Seu nome"
                                required={!isLogin}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="auth-email">E-mail</label>
                        <input
                            id="auth-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-senha">Senha</label>
                        <input
                            id="auth-senha"
                            type="password"
                            name="senha"
                            value={form.senha}
                            onChange={handleChange}
                            placeholder={isLogin ? 'Sua senha' : 'Mínimo 8 caracteres com letras e números'}
                            required
                            minLength={isLogin ? 6 : 8}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                        {!isLogin && (
                            <div className={`password-meter ${senhaForte ? 'strong' : ''}`}>
                                <span />
                                {senhaForte ? 'Senha forte' : 'Use letras, números e 8+ caracteres'}
                            </div>
                        )}
                    </div>

                    {isLogin && (
                        <div className="auth-options">
                            <label className="auth-remember">
                                <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} />
                                Lembrar acesso
                            </label>
                            <span className="auth-forgot" style={{ cursor: 'default' }}>
                                Esqueceu a senha?
                            </span>
                        </div>
                    )}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Processando...' : isLogin ? 'Entrar na plataforma' : 'Criar minha conta'}
                    </button>

                    {isLogin && (
                        <button type="button" className="auth-demo-btn" onClick={onDemo}>
                            Ver demonstração sem cadastro
                        </button>
                    )}
                </form>

                <div className="auth-divider">
                    <span>ou</span>
                </div>

                <div className="auth-toggle">
                    {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                    <button type="button" onClick={() => setIsLogin(v => !v)}>
                        {isLogin ? 'Cadastre-se gratuitamente' : 'Fazer login'}
                    </button>
                </div>

                <p className="auth-render-note">
                    No Render gratuito, a primeira abertura pode levar alguns segundos enquanto o serviço inicia.
                </p>
            </div>
        </div>
    );
};

export default AuthPanel;
