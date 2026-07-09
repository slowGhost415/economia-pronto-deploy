import { useState } from 'react';

const AuthPanel = ({ onLogin, onSignup, loading }) => {
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
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span style={{ fontSize: '1.3rem' }}>&#128200;</span>
                    </div>
                    <div className="auth-logo-text">
                        <h2>Economic</h2>
                        <span>Plataforma de análise macroeconômica</span>
                    </div>
                </div>

                <h1 className="auth-title">{isLogin ? 'Bem-vindo de volta' : 'Criar conta'}</h1>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Acesse sua conta para continuar suas análises.'
                        : 'Cadastre-se para acessar todos os recursos da plataforma.'}
                </p>

                <form onSubmit={submit}>
                    {!isLogin && (
                        <div className="auth-field">
                            <label>Nome completo</label>
                            <input
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
                        <label>E-mail</label>
                        <input
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
                        <label>Senha</label>
                        <input
                            type="password"
                            name="senha"
                            value={form.senha}
                            onChange={handleChange}
                            placeholder={isLogin ? 'Sua senha' : 'Minimo 8 caracteres com letras e numeros'}
                            required
                            minLength={isLogin ? 6 : 8}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                        {!isLogin && (
                            <div className={`password-meter ${senhaForte ? 'strong' : ''}`}>
                                <span />
                                {senhaForte ? 'Senha forte' : 'Use letras, numeros e 8+ caracteres'}
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
            </div>
        </div>
    );
};

export default AuthPanel;
