import React, { useState } from 'react';
import { DistributeIcon, XIcon } from '../Common/Icons';

interface DistributeNowProps {
    onClick: () => void;
    reportName?: string;
    variant?: 'card' | 'menu'; // Default to 'card'
}

export const DistributeNowButton: React.FC<DistributeNowProps> = ({ 
    onClick, 
    reportName, 
    variant = 'card' 
}) => {
    const [step, setStep] = useState<'idle' | 'confirming' | 'completed'>('idle');

    const handleConfirm = () => {
        onClick();
        setStep('completed');
        setTimeout(() => setStep('idle'), 4000);
    };

    return (
        <>
            {/* 1. CONDITIONAL TRIGGER UI */}
            {variant === 'card' ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); setStep('confirming'); }}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                    <DistributeIcon size={14} className="group-hover:stroke-[3px]" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Distribute</span>
                </button>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); setStep('confirming'); }}
                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                >
                    <DistributeIcon className="mr-3 text-gray-400 group-hover:text-blue-600" size={16} />
                    Distribute Now
                </button>
            )}

            {/* 2. THE MODAL OVERLAY (Shared by both variants) */}
            {step !== 'idle' && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setStep('idle'); }} 
                >
                    <div 
                        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {step === 'confirming' ? 'Confirm Action' : 'Notification'}
                            </span>
                            <button onClick={() => setStep('idle')} className="text-gray-400 hover:text-slate-600">
                                <XIcon size={16} />
                            </button>
                        </div>

                        <div className="p-6">
                            {step === 'confirming' ? (
                                <>
                                    <p className="text-sm text-slate-600 leading-normal mb-6">
                                        This will distribute the report {reportName ? `"${reportName}"` : ''} now to all participants. <span className="font-bold text-slate-800">Are you sure?</span>
                                    </p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleConfirm}
                                            className="flex-1 py-2 bg-primary text-white text-[11px] font-bold uppercase rounded hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            Yes, Distribute
                                        </button>
                                        <button 
                                            onClick={() => setStep('idle')}
                                            className="flex-1 py-2 bg-gray-100 text-slate-600 text-[11px] font-bold uppercase rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-2 text-center">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <DistributeIcon size={18} />
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-800 mb-1">Queued for Distribution</p>
                                    <p className="text-[11px] text-slate-500">
                                        The report has been scheduled and will be sent shortly.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};