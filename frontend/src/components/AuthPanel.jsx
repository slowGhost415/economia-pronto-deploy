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
                <span className="site-eyebrow">Análise econômica para o dia a dia</span>
                <h1 id="auth-showcase-title">Entenda juros, inflação e preços com uma leitura clara.</h1>
                <p>
                    Acompanhe indicadores, compare produtos essenciais, simule cenários financeiros
                    e aprenda conceitos econômicos em uma experiência objetiva.
                </p>

                <div className="auth-area-grid" aria-label="Áreas disponíveis na plataforma">
                    <span>Selic</span>
                    <span>IPCA</span>
                    <span>Preços</span>
                    <span>Simulações</span>
                    <span>Educação</span>
                    <span>Fontes</span>
                </div>

                <div className="auth-proof-grid">
                    <article>
                        <strong>Acesso rápido</strong>
                        <span>Entre com conta própria ou navegue em uma demonstração.</span>
                    </article>
                    <article>
                        <strong>Dados econômicos</strong>
                        <span>Selic, IPCA, preços locais, filtros e exportação.</span>
                    </article>
                    <article>
                        <strong>Leitura guiada</strong>
                        <span>Análises, educação, simulações e fontes em uma navegação simples.</span>
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

                <h2 className="auth-title">{isLogin ? 'Acessar Economic' : 'Criar conta'}</h2>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Entre com sua conta ou acesse uma demonstração sem cadastro.'
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
                            Acessar demonstração
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
                    A demonstração usa dados informativos e permite conhecer as principais áreas do site.
                </p>
            </div>
        </div>
    );
};

export default AuthPanel;
