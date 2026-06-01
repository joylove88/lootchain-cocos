/** 大厅图鉴只读展示项；只用于 Cocos 大厅预览，不承载养成、获取或奖励语义。 */
export interface LobbyCodexItemVO {
  heroCode: string;
  heroName: string;
  rarity: string;
  faction: string;
  heroClass: string;
  roleDesc?: string | null;
  portraitAsset?: string | null;
  owned: boolean;
  ownedCount: number;
}

/** 图鉴面板渲染所需的本地状态快照。 */
export interface LobbyCodexPanelState {
  loading: boolean;
  loaded: boolean;
  error: string;
  items: LobbyCodexItemVO[];
}
