import { _decorator, Component, Node, Vec3, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VortexLayerMotion')
export class VortexLayerMotion extends Component {
    @property
    rotationSpeed: number = 0; // 度/秒

    @property
    scalePulseX: number = 0;

    @property
    scalePulseY: number = 0;

    @property
    pulsePeriod: number = 8;

    @property
    opacityMin: number = 255;

    @property
    opacityMax: number = 255;

    @property
    opacityPeriod: number = 6;

    private _baseScale: Vec3 = new Vec3();
    private _time = 0;
    private _uiOpacity: UIOpacity | null = null;

    start() {
        this._baseScale.set(this.node.scale);
        this._uiOpacity = this.node.getComponent(UIOpacity);
    }

    update(deltaTime: number) {
        this._time += deltaTime;

        // 旋转
        this.node.angle += this.rotationSpeed * deltaTime;

        // 缩放呼吸
        const sx = this._baseScale.x * (1 + this.scalePulseX * Math.sin((Math.PI * 2 * this._time) / this.pulsePeriod));
        const sy = this._baseScale.y * (1 + this.scalePulseY * Math.sin((Math.PI * 2 * this._time) / this.pulsePeriod));
        this.node.setScale(sx, sy, this._baseScale.z);

        // 透明度脉冲
        if (this._uiOpacity && this.opacityMax > this.opacityMin) {
            const t = 0.5 + 0.5 * Math.sin((Math.PI * 2 * this._time) / this.opacityPeriod);
            const value = this.opacityMin + (this.opacityMax - this.opacityMin) * t;
            this._uiOpacity.opacity = value;
        }
    }
}