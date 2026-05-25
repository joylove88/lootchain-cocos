import {
    _decorator,
    Component,
    VideoPlayer,
    UIOpacity
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LoginVideoBackground')
export class LoginVideoBackground extends Component {

    @property(VideoPlayer)
    video: VideoPlayer | null = null;

    @property(UIOpacity)
    posterOpacity: UIOpacity | null = null;

    @property
    fadeDuration = 0.4;

    private fadeTimer = 0;
    private fadingPoster = false;

    onLoad() {
        if (!this.video) {
            this.video = this.getComponent(VideoPlayer);
        }

        if (!this.video) {
            console.error('[LoginVideoBackground] VideoPlayer not found');
            return;
        }

        this.video.mute = true;
        this.video.volume = 0;
        this.video.loop = true;
        this.video.playOnAwake = false;

        this.video.node.on(
            VideoPlayer.EventType.READY_TO_PLAY,
            this.onVideoReady,
            this
        );

        this.video.node.on(
            VideoPlayer.EventType.COMPLETED,
            this.onVideoCompleted,
            this
        );

        this.video.node.on(
            VideoPlayer.EventType.ERROR,
            this.onVideoError,
            this
        );
    }

    start() {
        if (!this.video) return;

        // 有些平台需要主动 play 一下才会开始准备视频。
        // Cocos 视频事件虽然好用，但平台差异这种人类发明的灾难还是要防。
        this.scheduleOnce(() => {
            try {
                this.video?.play();
            } catch (err) {
                console.warn('[LoginVideoBackground] play failed:', err);
            }
        }, 0.1);
    }

    private onVideoReady() {
        if (!this.video) return;

        this.video.play();

        this.fadeTimer = 0;
        this.fadingPoster = true;
    }

    private onVideoCompleted() {
        if (!this.video) return;

        // loop = true 理论上会自动循环。
        // 这里做一层保险，防止某些平台 completed 后停住。
        this.video.currentTime = 0;
        this.video.play();
    }

    private onVideoError() {
        console.error('[LoginVideoBackground] video error');

        // 视频挂了就保留 poster，不要让登录页黑屏。
        if (this.posterOpacity) {
            this.posterOpacity.opacity = 255;
        }
    }

    update(dt: number) {
        if (!this.fadingPoster || !this.posterOpacity) return;

        this.fadeTimer += dt;

        const t = Math.min(this.fadeTimer / this.fadeDuration, 1);

        this.posterOpacity.opacity = 255 * (1 - t);

        if (t >= 1) {
            this.posterOpacity.opacity = 0;
            this.fadingPoster = false;
        }
    }

    onDestroy() {
        if (!this.video) return;

        this.video.node.off(
            VideoPlayer.EventType.READY_TO_PLAY,
            this.onVideoReady,
            this
        );

        this.video.node.off(
            VideoPlayer.EventType.COMPLETED,
            this.onVideoCompleted,
            this
        );

        this.video.node.off(
            VideoPlayer.EventType.ERROR,
            this.onVideoError,
            this
        );
    }
}