import {
  Node,
  resources,
  SpriteFrame,
} from 'cc';
import {
  LOGIN_UI_ASSETS,
  SHOW_LOGIN_BRAND,
  SHOW_RIGHT_RAIL,
  USE_IMAGE_LOGIN_BUTTON,
} from './login/LoginRenderer';
import { LOBBY_PLAYER_INFO_PANEL_ASSET } from './lobby/LobbyHudTypes';
import { LOBBY_BATTLE_SCENE_BG_ASSET } from './lobby/LobbyBattlePreviewPanelRenderer';
import { LOBBY_HERO_DETAIL_BACKDROP_ASSET, LOBBY_HERO_DETAIL_PROTAGONIST_ASSET } from './lobby/LobbyHeroDetailPanelRenderer';
import { GACHA_BACKGROUND_ASSET, GACHA_MODAL_CLOSE_BUTTON_ASSET, GACHA_POOL_LOGO_ASSETS } from './gacha/GachaSceneConfig';
import { SCENE_BACK_BUTTON_ASSET } from './UiSceneBackButton';

export interface UiSpriteFrameCacheHost {
  node: Node;
  renderCurrentView(): void;
}

export interface UiSpriteFrameOverrides {
  logoFrame: SpriteFrame | null;
  mainButtonFrame: SpriteFrame | null;
  rightRailFrames: SpriteFrame[];
}

/**
 * UI 图片帧缓存。
 *
 * Inspector 上手动绑定的 SpriteFrame 优先级最高；未绑定时才走 resources.load。
 * 加载成功后通知 root 重新渲染当前视图，让登录 logo、按钮图和大厅面板自动补上。
 */
export class UiSpriteFrameCache {
  private readonly spriteFrames = new Map<string, SpriteFrame>();
  private readonly loadingSpriteFrames = new Set<string>();

  constructor(private readonly host: UiSpriteFrameCacheHost) {}

  preload(overrides: UiSpriteFrameOverrides): void {
    // 只预加载当前阶段会用到的 UI 图，避免误拉未开放玩法资源。
    if (SHOW_LOGIN_BRAND && !overrides.logoFrame) {
      this.request(LOGIN_UI_ASSETS.logo);
    }
    if (USE_IMAGE_LOGIN_BUTTON && !overrides.mainButtonFrame) {
      this.request(LOGIN_UI_ASSETS.mainButton);
    }
    if (SHOW_RIGHT_RAIL && overrides.rightRailFrames.length < LOGIN_UI_ASSETS.rightRail.length) {
      LOGIN_UI_ASSETS.rightRail.forEach((asset) => this.request(asset.path));
    }
    this.request(LOBBY_PLAYER_INFO_PANEL_ASSET);
    this.request(LOBBY_BATTLE_SCENE_BG_ASSET);
    this.request(LOBBY_HERO_DETAIL_BACKDROP_ASSET);
    this.request(LOBBY_HERO_DETAIL_PROTAGONIST_ASSET);
    this.request(GACHA_BACKGROUND_ASSET);
    this.request(GACHA_MODAL_CLOSE_BUTTON_ASSET);
    GACHA_POOL_LOGO_ASSETS.forEach((asset) => this.request(asset));
    this.request(SCENE_BACK_BUTTON_ASSET);
  }

  request(path: string): void {
    if (this.spriteFrames.has(path) || this.loadingSpriteFrames.has(path)) {
      return;
    }
    // loadingSpriteFrames 用来去重，防止同一帧内重复发起资源加载。
    this.loadingSpriteFrames.add(path);
    resources.load(path, SpriteFrame, (error, frame) => {
      this.loadingSpriteFrames.delete(path);
      if (error) {
        console.warn(`[LootChain] UI sprite load failed: ${path}`, error);
        return;
      }
      if (!error && frame) {
        this.spriteFrames.set(path, frame);
        if (this.host.node.isValid) {
          this.host.renderCurrentView();
        }
      }
    });
  }

  resolve(path: string, overrides: UiSpriteFrameOverrides): SpriteFrame | undefined {
    // 场景 Inspector 绑定的资源用于快速替换美术，不需要改代码路径。
    if (path === LOGIN_UI_ASSETS.logo && overrides.logoFrame) {
      return overrides.logoFrame;
    }
    if (path === LOGIN_UI_ASSETS.mainButton && overrides.mainButtonFrame) {
      return overrides.mainButtonFrame;
    }
    const railIndex = LOGIN_UI_ASSETS.rightRail.findIndex((asset) => asset.path === path);
    if (railIndex >= 0 && overrides.rightRailFrames[railIndex]) {
      return overrides.rightRailFrames[railIndex];
    }
    return this.spriteFrames.get(path);
  }
}
