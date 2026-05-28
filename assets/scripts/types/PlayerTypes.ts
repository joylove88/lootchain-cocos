export interface PlayerLobbyProfileVO {
  userId: number;
  displayName: string;
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
