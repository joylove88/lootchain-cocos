/** 大厅左上角玩家资料与资料弹窗使用的只读展示模型。 */
export interface PlayerLobbyProfileVO {
  userId: number;
  displayName: string;
  protagonistName?: string | null;
  username?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  playerLevel: number;
  exp: number;
  stamina: number;
  maxStamina: number;
  combatPower: number;
  status?: number | null;
  accountStatus: string;
  walletBound: boolean;
  walletAddress?: string | null;
  loginMethod: string;
}
