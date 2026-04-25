import React from 'react';
import { PlayIcon } from '../Common/Icons';

interface RunNowProps {
    onClick: () => void;
    variant?: 'icon' | 'full'; // 'icon' for cards, 'full' for list grid
}

export const RunNowButton: React.FC<RunNowProps> = ({ onClick, variant = 'full' }) => {
    
    const handleRunClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onClick();
    };

    return (
        <button 
            onClick={handleRunClick}
            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
            title={variant === 'icon' ? "Run Now" : ""}
        >
            <div className="p-1 rounded-md group-hover:bg-indigo-50 transition-colors">
                <PlayIcon 
                    size={14} 
                    className={variant === 'full' ? "group-hover:stroke-[3px]" : "stroke-[2.5px]"} 
                />
            </div>
            
            {/* Conditional Text Rendering */}
            <span className="text-[10px] font-bold uppercase tracking-tight">
                {variant === 'full' ? 'Run Now' : 'Run'}
            </span>
        </button>
    );
};