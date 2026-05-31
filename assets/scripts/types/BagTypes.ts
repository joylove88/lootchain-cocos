import type { DateTimeString, DecimalValue } from './CommonTypes';

/** 背包条目展示模型；当前大厅阶段不主动打开背包功能。 */
export interface BagItemEntryVO {
  bagId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  rarity: string;
  itemCount: number;
  expireTime?: DateTimeString | null;
  maxStack: number;
  sellGold: DecimalValue;
  useEffectType?: string | null;
}

export interface ItemTypeBagGroupVO {
  itemType: string;
  itemTypeLabel: string;
  items: BagItemEntryVO[];
}

export interface PlayerBagGroupedVO {
  groups: ItemTypeBagGroupVO[];
}

export interface ItemSourceVO {
  itemCode: string;
  sourceDesc: string;
}
