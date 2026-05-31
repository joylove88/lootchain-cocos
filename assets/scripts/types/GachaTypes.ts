import type { DateTimeString, DecimalValue } from './CommonTypes';

/** 抽卡池展示模型；当前 Cocos-only 阶段入口仍未开放。 */
export interface GachaPoolVO {
  id: number;
  poolCode: string;
  poolName: string;
  poolType: string;
  configVersion: number;
  pityGroupCode: string;
  costType: string;
  costCode: string;
  singleCost: DecimalValue;
  tenCost: DecimalValue;
  startTime?: DateTimeString | null;
  endTime?: DateTimeString | null;
  status: number;
}

export interface GachaPityVO {
  poolCode: string;
  pityGroupCode: string;
  rarity: string;
  counter: number;
  pityCount: number;
  totalCount: number;
}

export interface GachaDrawDTO {
  poolCode: string;
  requestId: string;
  drawCount: 1 | 10;
  useTicket?: boolean;
}

export interface GachaDrawItemVO {
  rewardType: string;
  rewardCode: string;
  rewardName: string;
  rarity: string;
  up: boolean;
  duplicate: boolean;
  grantNo?: string | null;
  fragmentCount?: number | null;
}

export interface GachaDrawResultVO {
  drawNo: string;
  poolCode: string;
  configVersion: number;
  items: GachaDrawItemVO[];
}

export interface GachaDrawLogVO {
  id: number;
  drawNo: string;
  userId: number;
  requestId: string;
  poolCode: string;
  configVersion: number;
  drawCount: number;
  costType: string;
  costCode: string;
  costAmount: DecimalValue;
  createTime: DateTimeString;
}
