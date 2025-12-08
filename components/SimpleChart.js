'use client';

import { useMemo } from 'react';

// Gráfico de barras simple
export function BarChart({ data, height = 200, barColor = 'bg-primary' }) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: height - 40 }}>
                <span className="text-xs font-medium mb-1">{item.value}</span>
                <div 
                  className={`w-full ${barColor} rounded-t-md transition-all duration-500 hover:opacity-80`}
                  style={{ height: `${heightPercent}%`, minHeight: 4 }}
                />
              </div>
              <span className="text-xs text-muted-foreground truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Gráfico de dona/pie simple
export function DonutChart({ data, size = 150, strokeWidth = 20 }) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const segments = useMemo(() => {
    let offset = 0;
    return data.map((item) => {
      const percent = item.value / total;
      const strokeDasharray = `${circumference * percent} ${circumference}`;
      const strokeDashoffset = -offset;
      offset += circumference * percent;
      return { ...item, strokeDasharray, strokeDashoffset };
    });
  }, [data, total, circumference]);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((item, idx) => (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={item.strokeDasharray}
            strokeDashoffset={item.strokeDashoffset}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground block">Total</span>
        </div>
      </div>
    </div>
  );
}

// Gráfico de línea simple
export function LineChart({ data, height = 150, lineColor = '#6366f1' }) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const range = maxValue - minValue || 1;
  
  const points = useMemo(() => {
    const width = 100 / (data.length - 1);
    return data.map((d, i) => ({
      x: i * width,
      y: 100 - ((d.value - minValue) / range) * 80 - 10
    }));
  }, [data, minValue, range]);
  
  const pathD = useMemo(() => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);
  
  const areaD = useMemo(() => {
    return `${pathD} L ${points[points.length - 1].x} 100 L 0 100 Z`;
  }, [pathD, points]);
  
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Área bajo la línea */}
        <path
          d={areaD}
          fill={lineColor}
          fillOpacity="0.1"
        />
        {/* Línea */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-500"
        />
        {/* Puntos */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={lineColor}
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-muted-foreground">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Gráfico de progreso circular
export function ProgressRing({ value, max = 100, size = 80, strokeWidth = 8, color = '#6366f1' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - percent);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{Math.round(percent * 100)}%</span>
      </div>
    </div>
  );
}

// Mini sparkline
export function Sparkline({ data, width = 100, height = 30, color = '#6366f1' }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - minValue) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
