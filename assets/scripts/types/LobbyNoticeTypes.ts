import type { DateTimeString } from './CommonTypes';

/** 大厅公告接口返回项。只用于玩家端只读展示，不承载任何领取或资源变更语义。 */
export interface LobbyNoticeVO {
  noticeNo: string;
  noticeType: string;
  title: string;
  content: string;
  priority: number;
  startTime: DateTimeString | null;
  endTime: DateTimeString | null;
  publishTime: DateTimeString | null;
}

/** 公告面板渲染所需的本地状态快照。 */
export interface LobbyNoticePanelState {
  loading: boolean;
  loaded: boolean;
  error: string;
  notices: LobbyNoticeVO[];
}
