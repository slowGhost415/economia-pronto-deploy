import { Link } from 'react-router-dom';

export const Badge = ({ children, tone = 'neutral' }) => (
    <span className={`site-badge ${tone}`}>{children}</span>
);

export const SectionHeader = ({ eyebrow, title, description, align = 'left', children }) => (
    <div className={`site-section-header ${align === 'center' ? 'center' : ''}`}>
        <div>
            {eyebrow && <span className="site-eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {description && <p>{description}</p>}
        </div>
        {children && <div className="site-section-actions">{children}</div>}
    </div>
);

export const MetricCard = ({ label, value, unit, meta, trend, tone = 'neutral', variant = 'default' }) => (
    <article className={`metric-card ${tone} ${variant}`}>
        <span>{label}</span>
        <strong>
            {value}
            {unit && <small>{unit}</small>}
        </strong>
        {trend && <em>{trend}</em>}
        {meta && <p>{meta}</p>}
    </article>
);

export const FeatureCard = ({ marker, title, description, action, to, onClick }) => {
    const content = (
        <>
            <span className="feature-marker">{marker}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            {action && <strong>{action}</strong>}
        </>
    );

    if (to) {
        return <Link className="feature-card" to={to}>{content}</Link>;
    }

    return (
        <button type="button" className="feature-card" onClick={onClick}>
            {content}
        </button>
    );
};

export const InsightCard = ({ eyebrow, title, description, tone = 'neutral' }) => (
    <article className={`insight-card ${tone}`}>
        {eyebrow && <span>{eyebrow}</span>}
        <h3>{title}</h3>
        <p>{description}</p>
    </article>
);

export const EducationCard = ({ level, time, title, description, example, to = '/educacao' }) => (
    <article className="education-card">
        <div className="education-card-meta">
            <Badge>{level}</Badge>
            <span>{time}</span>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        {example && <em>{example}</em>}
        <Link to={to}>Aprender agora</Link>
    </article>
);

export const SourceStatusCard = ({ title, status, description, tone = 'neutral' }) => (
    <article className={`source-status-card ${tone}`}>
        <div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        <Badge tone={tone}>{status}</Badge>
    </article>
);

export const CTASection = ({ title, description, primary, secondary }) => (
    <section className="site-cta-section">
        <div>
            <span className="site-eyebrow">Próximo passo</span>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
        <div className="site-cta-actions">
            {primary && <Link className="ec-btn" to={primary.to}>{primary.label}</Link>}
            {secondary && <Link className="ec-btn ec-btn-outline" to={secondary.to}>{secondary.label}</Link>}
        </div>
    </section>
);

export const LoadingSkeleton = ({ lines = 3 }) => (
    <div className="loading-skeleton" aria-label="Carregando">
        {Array.from({ length: lines }).map((_, index) => (
            <span key={index} />
        ))}
    </div>
);

export const EmptyState = ({ title, description, action }) => (
    <div className="empty-state">
        <h3>{title}</h3>
        <p>{description}</p>
        {action}
    </div>
);

export const ChartPanel = ({ title, description, source, updated, children, interpretation }) => (
    <article className="chart-panel">
        <header>
            <div>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
            </div>
            {(source || updated) && (
                <dl>
                    {source && <><dt>Fonte</dt><dd>{source}</dd></>}
                    {updated && <><dt>Atualização</dt><dd>{updated}</dd></>}
                </dl>
            )}
        </header>
        <div className="chart-panel-body">{children}</div>
        {interpretation && <p className="chart-panel-note">{interpretation}</p>}
    </article>
);

export const DataTable = ({ children }) => (
    <div className="data-table-shell">{children}</div>
);

export const Tooltip = ({ label, children }) => (
    <span className="site-tooltip">
        {children}
        <span role="tooltip">{label}</span>
    </span>
);
