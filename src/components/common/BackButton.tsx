import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
    onClick?: () => void;
    variant?: 'cream' | 'light' | 'default';
    showLabel?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function BackButton({
    label = 'Back',
    onClick,
    variant = 'default',
    showLabel = false,
    className = '',
    size = 'md'
}: BackButtonProps) {
    const router = useRouter();
    const previousPathRef = useRef<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const currentPath = window.location.pathname + window.location.search + window.location.hash;
        const storedCurrent = sessionStorage.getItem('fieldsy_admin_current_path');

        if (storedCurrent && storedCurrent !== currentPath) {
            sessionStorage.setItem('fieldsy_admin_previous_path', storedCurrent);
        }

        sessionStorage.setItem('fieldsy_admin_current_path', currentPath);
        previousPathRef.current = sessionStorage.getItem('fieldsy_admin_previous_path');
    }, [router.asPath]);

    const navigateToFallback = () => {
        const fallbackPath = previousPathRef.current;

        if (fallbackPath && fallbackPath !== router.asPath) {
            router.push(fallbackPath);
            return;
        }

        if (typeof window !== 'undefined' && document.referrer) {
            try {
                const refUrl = new URL(document.referrer);
                if (refUrl.origin === window.location.origin) {
                    router.push(refUrl.pathname + refUrl.search + refUrl.hash);
                    return;
                }
                window.location.href = refUrl.toString();
                return;
            } catch {
                router.push('/dashboard');
                return;
            }
        }

        router.push('/dashboard');
    };

    const canUseNativeBack = () => {
        if (typeof window === 'undefined') return false;
        const historyState = window.history.state;
        if (historyState && typeof historyState.idx === 'number') {
            return historyState.idx > 0;
        }
        return window.history.length > 1;
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            if (canUseNativeBack()) {
                router.back();
            } else {
                navigateToFallback();
            }
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const bgClasses = {
        cream: 'bg-[#FDFBF7] hover:bg-[#F5F2EB] text-[#192215]',
        light: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
        default: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                onClick={handleClick}
                className={`
          ${sizeClasses[size]}
          ${bgClasses[variant]}
          rounded-full flex items-center justify-center 
          transition-all duration-200 
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
          shadow-sm
        `}
                aria-label={label}
            >
                <ArrowLeft className={iconSizes[size]} />
            </button>
            {showLabel && (
                <span className="font-semibold text-lg text-gray-900">
                    {label}
                </span>
            )}
        </div>
    );
}
