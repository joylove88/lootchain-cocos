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

    @property
    videoVolume = 0.1;

    @property
    videoMuted = false;

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

        this.video.mute = this.videoMuted;
        this.video.volume = this.videoMuted ? 0 : this.videoVolume;
        this.video.loop = true;
        this.video.playOnAwake = false;

        this.video.node.on(VideoPlayer.EventType.READY_TO_PLAY, this.onVideoReady, this);
        this.video.node.on(VideoPlayer.EventType.COMPLETED, this.onVideoCompleted, this);
        this.video.node.on(VideoPlayer.EventType.ERROR, this.onVideoError, this);
    }

    start() {
        this.scheduleOnce(() => {
            this.video?.play();
        }, 0.1);
    }

    private onVideoReady() {
        if (!this.video) return;

        this.video.mute = this.videoMuted;
        this.video.volume = this.videoMuted ? 0 : this.videoVolume;
        this.video.play();

        this.fadeTimer = 0;
        this.fadingPoster = true;
    }

    private onVideoCompleted() {
        if (!this.video) return;

        this.video.currentTime = 0;
        this.video.play();
    }

    private onVideoError() {
        console.error('[LoginVideoBackground] video error');

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

        this.video.node.off(VideoPlayer.EventType.READY_TO_PLAY, this.onVideoReady, this);
        this.video.node.off(VideoPlayer.EventType.COMPLETED, this.onVideoCompleted, this);
        this.video.node.off(VideoPlayer.EventType.ERROR, this.onVideoError, this);
    }
}