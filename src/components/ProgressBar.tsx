interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'purple' | 'blue' | 'green' | 'gradient';
}

export default function ProgressBar({
    current,
    total,
    label,
    showPercentage = true,
    size = 'md',
    color = 'gradient',
}: ProgressBarProps) {
    const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const colorClasses = {
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
    };

    return (
        <div className="w-full">
            {/* Метка и процент */}
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && (
                        <span className="text-white/60 text-sm">{label}</span>
                    )}
                    {showPercentage && (
                        <span className="text-white/80 text-sm font-medium">{percentage}%</span>
                    )}
                </div>
            )}

            {/* Бар */}
            <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Детальная информация */}
            {size === 'lg' && (
                <div className="flex justify-between mt-1 text-xs text-white/40">
                    <span>{current} из {total}</span>
                    <span>Осталось: {total - current}</span>
                </div>
            )}
        </div>
    );
}
