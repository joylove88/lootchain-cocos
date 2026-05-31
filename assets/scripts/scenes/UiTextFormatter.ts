export const UI_TEXT_MAX_LENGTH = 1200;

/** 把后端或本地传入的数值规整为非负整数，失败时使用兜底值。 */
export function positiveInteger(value: number | null | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

/** 用千分位展示普通整数，例如战力、经验、体力等。 */
export function formatInteger(value: number | null | undefined): string {
  const safeValue = positiveInteger(value, 0);
  return String(safeValue).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 顶部资源栏使用的短格式，避免宽度不足时数值把 HUD 撑开。 */
export function compactResourceValue(value: number | null | undefined): string {
  const safeValue = positiveInteger(value, 0);
  if (safeValue >= 1_000_000_000) {
    return `${Math.floor(safeValue / 100_000_000) / 10}B`;
  }
  if (safeValue >= 1_000_000) {
    return `${Math.floor(safeValue / 100_000) / 10}M`;
  }
  if (safeValue >= 100_000) {
    return `${Math.floor(safeValue / 100) / 10}K`;
  }
  return formatInteger(safeValue);
}

/** 限制动态文本长度，防止接口异常或调试文案导致界面文字过长。 */
export function trimText(text: string): string {
  return text.length > UI_TEXT_MAX_LENGTH ? `${text.slice(0, UI_TEXT_MAX_LENGTH)}...` : text;
}

/** 清理可空字符串，统一交给 UI 层展示。 */
export function safeText(value: string | null | undefined): string {
  return trimText(String(value ?? '').trim());
}
