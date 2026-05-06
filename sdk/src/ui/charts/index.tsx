// OM UI - Chart Components

import { useEffect, useRef } from 'react';

// Line Chart
export interface ChartData {
  label: string;
  value: number;
}

export function LineChart({
  data,
  width = '100%',
  height = 200,
  color = '#286af0',
}: {
  data: ChartData[];
  width?: string | number;
  height?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw line
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * rect.width;
      const y = rect.height - ((d.value - min) / range) * rect.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area
    ctx.lineTo(rect.width, rect.height);
    ctx.lineTo(0, rect.height);
    ctx.closePath();
    ctx.fillStyle = color + '20';
    ctx.fill();
  }, [data, color]);

  return <canvas ref={canvasRef} style={{ width, height }} className="w-full" />;
}

// Bar Chart
export function BarChart({
  data,
  width = '100%',
  height = 200,
  color = '#286af0',
}: {
  data: ChartData[];
  width?: string | number;
  height?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data.map(d => d.value));

    ctx.clearRect(0, 0, rect.width, rect.height);

    const barWidth = (rect.width / data.length) * 0.8;
    const gap = (rect.width / data.length) * 0.1;

    data.forEach((d, i) => {
      const x = i * (barWidth + gap * 2) + gap;
      const barHeight = (d.value / max) * rect.height;
      const y = rect.height - barHeight;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [data, color]);

  return <canvas ref={canvasRef} style={{ width, height }} className="w-full" />;
}

// Pie Chart
export function PieChart({
  data,
  size = 200,
  colors = ['#286af0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
}: {
  data: { label: string; value: number }[];
  size?: number;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(size / 2, size / 2, size / 2 - 2, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    });
  }, [data, colors, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}

// Progress Ring
export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#286af0',
  bgColor = '#e5e5e5',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (progress / 100) * Math.PI * 2;

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Progress
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }, [progress, size, strokeWidth, color, bgColor]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />;
}

// Sparkline
export function Sparkline({
  data,
  width = 100,
  height = 24,
  color = '#286af0',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - 1 - ((d - min) / range) * (height - 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [data, width, height, color]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}

// Simple Donut Chart
export function DonutChart({ percentage = 0, size = 40, color = '#286af0' }) {
  return <ProgressRing progress={percentage} size={size} color={color} />;
}