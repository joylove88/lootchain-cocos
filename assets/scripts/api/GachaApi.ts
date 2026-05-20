import { HttpClient } from '../net/HttpClient';
import type { PageResult } from '../types/CommonTypes';
import type {
  GachaDrawDTO,
  GachaDrawLogVO,
  GachaDrawResultVO,
  GachaPityVO,
  GachaPoolVO,
} from '../types/GachaTypes';

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
    return this.http.post<GachaDrawResultVO>('/api/player/gacha/draw', dto);
  }

  logs(pageNo = 1, pageSize = 20, poolCode?: string): Promise<PageResult<GachaDrawLogVO>> {
    return this.http.get<PageResult<GachaDrawLogVO>>('/api/player/gacha/logs', { pageNo, pageSize, poolCode });
  }
}
