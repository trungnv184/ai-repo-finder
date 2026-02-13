export function formatNumber(num: number): string {
  if (num < 0) return `-${formatNumber(-num)}`;
  if (num === 0) return '0';
  if (num >= 1_000_000) {
    const value = num / 1_000_000;
    return value % 1 === 0 ? `${value}M` : `${parseFloat(value.toFixed(1))}M`;
  }
  if (num >= 1_000) {
    const value = num / 1_000;
    return value % 1 === 0 ? `${value}k` : `${parseFloat(value.toFixed(1))}k`;
  }
  return num.toString();
}
