import { HttpClient } from '../net/HttpClient';
import type { ItemSourceVO, PlayerBagGroupedVO } from '../types/BagTypes';

/** 背包只读接口封装；当前只允许读取列表和来源，不接入 use/sell。 */
export class BagApi {
  constructor(private readonly http: HttpClient) {}

  myBag(): Promise<PlayerBagGroupedVO> {
    return this.http.get<PlayerBagGroupedVO>('/api/player/bag');
  }

  source(itemCode: string): Promise<ItemSourceVO> {
    return this.http.get<ItemSourceVO>(`/api/player/bag/items/${encodeURIComponent(itemCode)}/source`);
  }
}
