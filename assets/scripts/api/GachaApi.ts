import { HttpClient } from '../net/HttpClient';
import type { PageResult } from '../types/CommonTypes';
import type {
  GachaDrawDTO,
  GachaDrawLogVO,
  GachaDrawResultVO,
  GachaPityVO,
  GachaPoolVO,
} from '../types/GachaTypes';

/**
 * 抽卡接口封装。
 *
 * 当前 Cocos 大厅阶段没有开放抽卡入口；保留本类只是为了历史/后续模块复用。
 */
export class GachaApi {
  constructor(private readonly http: HttpClient) {}

  pools(): Promise<GachaPoolVO[]> {
    return this.http.get<GachaPoolVO[]>('/api/player/gacha/pools');
  }

  pool(poolCode: string): Promise<GachaPoolVO> {
    return this.http.get<GachaPoolVO>(`/api/player/gacha/pools/${encodeURIComponent(poolCode)}`);
  }

  pity(poolCode: string): Promise<GachaPityVO[]> {
    return this.http.get<GachaPityVO[]>(`/api/player/gacha/pity/${encodeURIComponent(poolCode)}`);
  }

  draw(dto: GachaDrawDTO): Promise<GachaDrawResultVO> {
    // 当前 Cocos 阶段不开放抽卡写入口；保留方法签名是为了后续正式阶段复用类型。
    void dto;
    return Promise.reject(new Error('当前 Cocos 阶段未开放抽卡'));
  }

  logs(pageNo = 1, pageSize = 20, poolCode?: string): Promise<PageResult<GachaDrawLogVO>> {
    return this.http.get<PageResult<GachaDrawLogVO>>('/api/player/gacha/logs', { pageNo, pageSize, poolCode });
  }
}
