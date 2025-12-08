'use client';

export default function Loading({ 
  size = 'default', 
  text = 'Cargando...', 
  fullScreen = true,
  showText = true 
}) {
  const sizes = {
    small: 'h-6 w-6 border-2',
    default: 'h-12 w-12 border-3',
    large: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`animate-spin rounded-full ${sizes[size]} border-primary/30 border-t-primary`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-full bg-primary/10 ${size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-8 w-8' : 'h-5 w-5'}`}></div>
        </div>
      </div>
      {showText && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Variante inline para botones
export function LoadingSpinner({ className = '' }) {
  return (
    <svg 
      className={`animate-spin h-4 w-4 ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Loading overlay para modales o secciones
export function LoadingOverlay({ text = 'Procesando...' }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <Loading size="default" text={text} fullScreen={false} />
    </div>
  );
}
