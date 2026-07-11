import React from 'react';

interface ChartDataItem {
    label: string;
    value: number;
}

interface PerformanceDataItem {
    departmentName: string;
    totalAssigned: number;
    resolvedCount: number;
}

interface SVGChartProps {
    title: string;
    data: ChartDataItem[];
    color?: 'blue' | 'green' | 'orange';
}

/* 1. Bar Chart (SVG-based) */
export const BarChart: React.FC<SVGChartProps> = ({ title, data, color = 'blue' }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const height = 200;
    const paddingX = 40;
    const paddingY = 20;
    const chartHeight = height - paddingY * 2;

    const fillColor = color === 'green' ? 'var(--primary-green)' : color === 'orange' ? '#f97316' : 'var(--primary-blue-medium)';

    return (
        <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
            {data.length === 0 ? (
                <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No data available
                </div>
            ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox={`0 0 500 ${height}`} width="100%" height={height} style={{ display: 'block' }}>
                        {/* Draw grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const y = paddingY + chartHeight * (1 - ratio);
                            return (
                                <g key={idx}>
                                    <line x1={paddingX} y1={y} x2={480} y2={y} stroke="var(--border-color)" strokeDasharray="4 4" />
                                    <text x={paddingX - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize={10}>
                                        {Math.round(maxVal * ratio)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Draw bars */}
                        {data.map((item, idx) => {
                            const barWidth = 28;
                            const spacing = (440 - paddingX) / data.length;
                            const x = paddingX + idx * spacing + (spacing - barWidth) / 2;
                            const barHeight = (item.value / maxVal) * chartHeight;
                            const y = height - paddingY - barHeight;

                            return (
                                <g key={idx}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={Math.max(barHeight, 4)}
                                        rx={6}
                                        fill={fillColor}
                                        style={{ transition: 'all 0.5s ease-out' }}
                                    />
                                    <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fill="var(--text-secondary)" fontSize={9}>
                                        {item.label.length > 8 ? `${item.label.slice(2, 7)}.` : item.label}
                                    </text>
                                    <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fill="var(--text-primary)" fontSize={10} fontWeight="bold">
                                        {item.value}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
        </div>
    );
};

/* 2. Line Chart (SVG-based with path curves and gradients) */
export const LineChart: React.FC<SVGChartProps> = ({ title, data, color = 'blue' }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const height = 200;
    const paddingX = 40;
    const paddingY = 20;
    const width = 500;
    const chartHeight = height - paddingY * 2;
    const chartWidth = width - paddingX - 20;

    const strokeColor = color === 'green' ? 'var(--primary-green)' : 'var(--primary-blue)';

    // Build SVG Path points
    const points = data.map((item, idx) => {
        const spacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
        const x = paddingX + idx * spacing;
        const y = paddingY + chartHeight * (1 - (item.value / maxVal));
        return { x, y, value: item.value, label: item.label };
    });

    const pathD = points.length > 0
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';

    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
        : '';

    return (
        <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
            {data.length === 0 ? (
                <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No data available
                </div>
            ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Grid */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const y = paddingY + chartHeight * (1 - ratio);
                            return (
                                <g key={idx}>
                                    <line x1={paddingX} y1={y} x2={width - 10} y2={y} stroke="var(--border-color)" strokeDasharray="4 4" />
                                    <text x={paddingX - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize={10}>
                                        {Math.round(maxVal * ratio)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Area Fill */}
                        {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                        {/* Line Path */}
                        {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} />}

                        {/* Circles & Labels */}
                        {points.map((p, idx) => (
                            <g key={idx}>
                                <circle cx={p.x} cy={p.y} r={4.5} fill="var(--bg-secondary)" stroke={strokeColor} strokeWidth={2} />
                                <text x={p.x} y={height - 4} textAnchor="middle" fill="var(--text-secondary)" fontSize={9}>
                                    {p.label.length > 8 ? `${p.label.slice(2, 7)}.` : p.label}
                                </text>
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="var(--text-primary)" fontSize={9} fontWeight="bold">
                                    {p.value}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            )}
        </div>
    );
};

/* 3. Pie / Donut Chart */
export const DonutChart: React.FC<SVGChartProps> = ({ title, data }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const size = 180;
    const radius = 60;
    const thickness = 16;
    const center = size / 2;
    const cx = center;
    const cy = center;

    const colors = [
        'var(--primary-blue)', 'var(--primary-green)', '#f59e0b', '#8b5cf6',
        '#ec4899', '#3b82f6', '#10b981', '#f97316', '#ef4444'
    ];

    let accumulatedAngle = -90; // start at the top

    const slices = data.map((item, idx) => {
        const percentage = total > 0 ? item.value / total : 0;
        const angle = percentage * 360;
        const startAngle = accumulatedAngle;
        const endAngle = accumulatedAngle + angle;
        accumulatedAngle += angle;

        // Convert polar coordinates to Cartesian
        const rad = Math.PI / 180;
        const x1 = cx + radius * Math.cos(startAngle * rad);
        const y1 = cy + radius * Math.sin(startAngle * rad);
        const x2 = cx + radius * Math.cos(endAngle * rad);
        const y2 = cy + radius * Math.sin(endAngle * rad);

        const largeArcFlag = angle > 180 ? 1 : 0;
        const color = colors[idx % colors.length];

        // Path representing the sector border arc
        const pathD = `${percentage === 1 ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}` : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`} `;

        return {
            d: pathD,
            color,
            label: item.label,
            value: item.value,
            pct: (percentage * 100).toFixed(0)
        };
    });

    return (
        <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                {total === 0 ? (
                    <div style={{ height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        No status distribution available
                    </div>
                ) : (
                    <>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                            {slices.map((slice, idx) => (
                                <path
                                    key={idx}
                                    d={slice.d}
                                    fill="none"
                                    stroke={slice.color}
                                    strokeWidth={thickness}
                                />
                            ))}
                            <circle cx={cx} cy={cy} r={radius - thickness} fill="transparent" />
                            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fill="var(--text-secondary)" fontWeight="500">
                                Total:
                            </text>
                            <text x={cx} y={cy + 18} textAnchor="middle" fontSize={16} fill="var(--text-primary)" fontWeight="bold">
                                {total}
                            </text>
                        </svg>
                        <div style={{ flex: '1', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {slices.map((slice, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: slice.color }} />
                                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{slice.label}</span>
                                    <span style={{ fontWeight: 'bold' }}>{slice.value} ({slice.pct}%)</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* 4. Multi-Department Performance Comparison Chart */
export const DepartmentChart: React.FC<{ data: PerformanceDataItem[] }> = ({ data }) => {
    return (
        <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>Department Performance</h4>
            {data.length === 0 ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No performance reports.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {data.map((dept, idx) => {
                        const pct = dept.totalAssigned > 0 ? (dept.resolvedCount / dept.totalAssigned) * 100 : 0;
                        return (
                            <div key={idx} style={{ fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{dept.departmentName}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {dept.resolvedCount}/{dept.totalAssigned} Resolved ({pct.toFixed(0)}%)
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            backgroundColor: pct > 75 ? 'var(--primary-green-medium)' : pct > 40 ? 'var(--primary-blue-medium)' : '#f59e0b',
                                            borderRadius: '4px',
                                            transition: 'width 0.6s ease'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
