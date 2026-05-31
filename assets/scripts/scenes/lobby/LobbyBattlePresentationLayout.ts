import { Size } from 'cc';

export interface BattlePresentationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BattlePresentationSlot extends BattlePresentationRect {
  lane: number;
}

export interface BattlePresentationLayout {
  compact: boolean;
  stackedFooter: boolean;
  panelSize: Size;
  field: BattlePresentationRect;
  allySlots: BattlePresentationSlot[];
  enemySlots: BattlePresentationSlot[];
  timeline: BattlePresentationRect;
  log: BattlePresentationRect;
  boundary: BattlePresentationRect;
  footerButtons: BattlePresentationRect[];
}

/** 战斗表现专用布局，统一处理桌面、横屏移动和竖屏窄屏。 */
export function resolveBattlePresentationLayout(width: number, height: number, scale: number): BattlePresentationLayout {
  const compact = width < 760 * scale || height < 470 * scale;
  const stackedFooter = width < 620 * scale;
  const verticalCramped = height < 360 * scale;
  const boundaryHeight = (verticalCramped ? 18 : 24) * scale;
  const boundaryY = -height / 2 + (stackedFooter ? (verticalCramped ? 84 : 86) : (verticalCramped ? 54 : 62)) * scale;
  const fieldTop = height / 2 - (verticalCramped ? 84 : 126) * scale;
  const baseFieldBottom = -height / 2 + (stackedFooter ? 122 : 94) * scale;
  const footerClearBottom = boundaryY + boundaryHeight / 2 + (verticalCramped ? 6 : 8) * scale;
  const fieldBottom = Math.max(baseFieldBottom, footerClearBottom);
  const fieldWidth = width - 78 * scale;
  const fieldHeight = Math.max(32 * scale, fieldTop - fieldBottom);
  const fieldY = (fieldTop + fieldBottom) / 2;
  const compactSlotCount = compact && fieldHeight < 190 * scale ? 1 : compact ? 3 : 5;
  const actorWidth = compact ? Math.min((verticalCramped ? 132 : 152) * scale, fieldWidth * 0.3) : Math.min(178 * scale, fieldWidth * 0.24);
  const actorHeight = compact ? Math.min((verticalCramped ? 40 : 54) * scale, fieldHeight * 0.42) : Math.min(70 * scale, fieldHeight * 0.32);
  const laneGap = compact ? 44 * scale : 58 * scale;
  const allyX = compact ? -fieldWidth * 0.24 : -fieldWidth * 0.32;
  const enemyX = compact ? fieldWidth * 0.24 : fieldWidth * 0.32;
  const startY = compactSlotCount === 1 ? fieldHeight * 0.18 : compact ? fieldHeight * 0.12 : 0;
  const allySlots = createSlots(allyX, startY, actorWidth, actorHeight, laneGap, compactSlotCount, false);
  const enemySlots = createSlots(enemyX, startY, actorWidth, actorHeight, laneGap, compactSlotCount, true);
  const timeline: BattlePresentationRect = {
    x: 0,
    y: fieldHeight / 2 - 26 * scale,
    width: Math.min(fieldWidth - 34 * scale, compact ? 330 * scale : 430 * scale),
    height: 28 * scale,
  };
  const log: BattlePresentationRect = {
    x: 0,
    y: -fieldHeight / 2 + (compact ? Math.min((verticalCramped ? 28 : 58) * scale, Math.max((verticalCramped ? 18 : 30) * scale, fieldHeight * 0.3)) / 2 + 8 * scale : 44 * scale),
    width: Math.min(fieldWidth - 34 * scale, compact ? fieldWidth - 40 * scale : 340 * scale),
    height: compact ? Math.min((verticalCramped ? 28 : 58) * scale, Math.max((verticalCramped ? 18 : 30) * scale, fieldHeight * 0.3)) : Math.min(78 * scale, fieldHeight * 0.32),
  };
  const boundary: BattlePresentationRect = {
    x: 0,
    y: boundaryY,
    width: width - 110 * scale,
    height: boundaryHeight,
  };
  const buttonY = -height / 2 + 30 * scale;
  const footerButtons = stackedFooter
    ? [
        { x: 0, y: -height / 2 + 52 * scale, width: 168 * scale, height: 34 * scale },
        { x: -86 * scale, y: -height / 2 + 16 * scale, width: 144 * scale, height: 32 * scale },
        { x: 86 * scale, y: -height / 2 + 16 * scale, width: 144 * scale, height: 32 * scale },
      ]
    : [
        { x: -190 * scale, y: buttonY, width: 132 * scale, height: 36 * scale },
        { x: -36 * scale, y: buttonY, width: 136 * scale, height: 36 * scale },
        { x: 128 * scale, y: buttonY, width: 126 * scale, height: 36 * scale },
      ];
  return {
    compact,
    stackedFooter,
    panelSize: new Size(width, height),
    field: { x: 0, y: fieldY, width: fieldWidth, height: fieldHeight },
    allySlots,
    enemySlots,
    timeline,
    log,
    boundary,
    footerButtons,
  };
}

function createSlots(x: number, startY: number, width: number, height: number, gap: number, count: number, mirror: boolean): BattlePresentationSlot[] {
  const slots: BattlePresentationSlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const row = index - (count - 1) / 2;
    const laneOffset = mirror ? (index % 2) * 18 : -(index % 2) * 18;
    slots.push({
      x: x + laneOffset,
      y: startY - row * gap,
      width,
      height,
      lane: index,
    });
  }
  return slots;
}
