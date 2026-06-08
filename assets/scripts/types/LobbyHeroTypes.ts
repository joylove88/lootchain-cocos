/** 大厅英雄队列只读展示项；只展示拥有英雄，不承载养成、抽卡或奖励语义。 */
export interface LobbyHeroItemVO {
  id: number;
  heroCode: string;
  heroName: string;
  rarity: string;
  faction?: string | null;
  heroClass?: string | null;
  level: number;
  star: number;
  power: number;
  protagonist: boolean;
  sourceType: string;
  portraitAsset?: string | null;
  cardBackgroundAsset?: string | null;
  spineAsset?: string | null;
  spineUuid?: string | null;
  currentForm?: string | null;
  formLabel?: string | null;
}

export interface LobbyHeroFilterOptionsVO {
  heroClasses: string[];
}

/** 英雄队列面板渲染所需的本地状态快照。 */
export interface LobbyHeroRosterPanelState {
  loading: boolean;
  loaded: boolean;
  error: string;
  heroes: LobbyHeroItemVO[];
  heroClassOptions: string[];
}
