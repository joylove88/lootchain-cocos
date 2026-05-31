import { HttpClient } from '../net/HttpClient';
import type { ItemSourceVO, PlayerBagGroupedVO } from '../types/BagTypes';

/** 背包只读接口封装；当前大厅入口仍是占位，不在本阶段主动调用。 */
export class BagApi {
  constructor(private readonly http: HttpClient) {}

  myBag(): Promise<PlayerBagGroupedVO> {
    return this.http.get<PlayerBagGroupedVO>('/api/player/bag');
  }

  source(itemCode: string): Promise<ItemSourceVO> {
    return this.http.get<ItemSourceVO>(`/api/player/bag/items/${encodeURIComponent(itemCode)}/source`);
  }
}
