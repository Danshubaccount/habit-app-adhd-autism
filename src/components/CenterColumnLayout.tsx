import { ChevronLeft } from 'lucide-react';

interface CenterColumnLayoutProps {
    children: React.ReactNode;
    onBack?: () => void;
    backText?: string;
    className?: string;
    showBackButton?: boolean;
    style?: React.CSSProperties;
}

const CenterColumnLayout: React.FC<CenterColumnLayoutProps> = ({
    children,
    onBack,
    backText = "Back",
    className = "",
    showBackButton = true,
    style = {}
}) => {
    return (
        <div className={`center-column-layout ${className}`} style={{ minHeight: '100vh', position: 'relative', maxWidth: '100vw', overflowX: 'hidden', ...style }}>
            {showBackButton && onBack && (
                <div style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 100 }}>
                    <button
                        onClick={onBack}
                        className="btn-premium btn-premium-secondary"
                        style={{
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        <ChevronLeft size={18} />
                        {backText}
                    </button>
                </div>
            )}
            <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden', boxSizing: 'border-box' }}>
                {children}
            </div>
        </div>
    );
};

export default CenterColumnLayout;
