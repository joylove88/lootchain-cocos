import { HttpClient } from '../net/HttpClient';
import type { PlayerLobbyProfileVO } from '../types/PlayerTypes';

export class PlayerProfileApi {
  constructor(private readonly http: HttpClient) {}

  lobbyProfile(): Promise<PlayerLobbyProfileVO> {
    return this.http.get<PlayerLobbyProfileVO>('/api/player/me/lobby');
  }
}
