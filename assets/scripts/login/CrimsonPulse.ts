import { _decorator, Component, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

/** 红色能量脉冲脚本：叠加两组正弦波，让红光变化更自然。 */
@ccclass('CrimsonPulse')
export class CrimsonPulse extends Component {
    @property
    baseOpacity: number = 200;

    @property
    amp1: number = 25;

    @property
    amp2: number = 10;

    @property
    speed1: number = 7.1;

    @property
    speed2: number = 13.7;

    private _time = 0;
    private _opacity: UIOpacity | null = null;

    start() {
        this._opacity = this.node.getComponent(UIOpacity);
    }

    update(deltaTime: number) {
        this._time += deltaTime;
        if (!this._opacity) return;

        const v = this.baseOpacity
            + this.amp1 * Math.sin(this._time * this.speed1)
            + this.amp2 * Math.sin(this._time * this.speed2);

        this._opacity.opacity = Math.max(0, Math.min(255, v));
    }
}
