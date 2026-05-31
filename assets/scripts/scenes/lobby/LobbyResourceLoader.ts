import {
  resources,
  SpriteFrame,
  VideoClip,
} from 'cc';
import {
  LOBBY_POSTER_PATH,
  LOBBY_VIDEO_PATH,
  USE_LOBBY_NATIVE_VIDEO_BACKGROUND,
} from './LobbyBackgroundController';

export interface LobbyResourceLoadResult {
  posterFrame: SpriteFrame;
  videoClip: VideoClip | null;
}

export type LobbyResourceProgressReporter = (progress: number, message: string) => Promise<boolean>;

/**
 * 大厅本地资源加载器。
 *
 * 只加载 poster 和可选视频资源；progress 返回 false 时说明流程已过期，需要立即停止后续加载。
 */
export class LobbyResourceLoader {
  async load(progress: LobbyResourceProgressReporter): Promise<LobbyResourceLoadResult | null> {
    if (!await progress(0.16, '检查大厅背景资源...')) {
      return null;
    }
    const posterFrame = await this.loadSpriteFrameResource(LOBBY_POSTER_PATH);
    let videoClip: VideoClip | null = null;
    if (USE_LOBBY_NATIVE_VIDEO_BACKGROUND) {
      if (!await progress(0.48, '大厅首帧准备完成，加载动态背景...')) {
        return null;
      }
      videoClip = await this.loadVideoClipResource(LOBBY_VIDEO_PATH);
      if (!await progress(0.82, '大厅动态背景准备完成，整理界面状态...')) {
        return null;
      }
    } else if (!await progress(0.82, '大厅静态背景准备完成，整理界面状态...')) {
      return null;
    }
    return { posterFrame, videoClip };
  }

  private loadVideoClipResource(path: string): Promise<VideoClip> {
    return new Promise((resolve, reject) => {
      resources.load(path, VideoClip, (error, clip) => {
        if (error || !clip) {
          reject(error ?? new Error(`video clip not found: ${path}`));
          return;
        }
        resolve(clip);
      });
    });
  }

  private loadSpriteFrameResource(path: string): Promise<SpriteFrame> {
    return new Promise((resolve, reject) => {
      resources.load(`${path}/spriteFrame`, SpriteFrame, (spriteError, spriteFrame) => {
        if (!spriteError && spriteFrame) {
          resolve(spriteFrame);
          return;
        }

        // 大厅背景是关键资源，必须有 Creator 导入后的 spriteFrame，避免运行时兜底掩盖导入问题。
        reject(spriteError ?? new Error(`sprite frame not found: ${path}`));
      });
    });
  }
}
