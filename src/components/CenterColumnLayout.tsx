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
        <div className={`center-column-layout ${className}`} style={{ minHeight: '100dvh', position: 'relative', maxWidth: '100vw', overflowX: 'hidden', ...style }}>
            {showBackButton && onBack && (
                <div className="center-column-layout__back">
                    <button
                        onClick={onBack}
                        className="btn-premium btn-premium-secondary center-column-layout__back-btn"
                    >
                        <ChevronLeft size={18} />
                        {backText}
                    </button>
                </div>
            )}
            <div className="center-column-layout__content">
                {children}
            </div>
        </div>
    );
};

export default CenterColumnLayout;
