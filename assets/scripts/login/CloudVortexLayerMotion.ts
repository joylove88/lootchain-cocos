import { _decorator, Component, UIOpacity, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VortexPivotMotion')
export class VortexPivotMotion extends Component {

    @property
    rotationSpeed = 2.0;

    @property
    scalePulse = 0.006;

    @property
    opacityPulse = 0;

    @property
    phase = 0;

    private baseScale = new Vec3();
    private opacityComp: UIOpacity | null = null;
    private baseOpacity = 255;
    private time = 0;

    start() {
        this.baseScale.set(this.node.scale);

        this.opacityComp = this.getComponent(UIOpacity);

        if (this.opacityComp) {
            this.baseOpacity = this.opacityComp.opacity;
        }
    }

    update(dt: number) {
        this.time += dt;

        // 围绕圆球中心旋转
        this.node.angle += this.rotationSpeed * dt;

        // 极轻微呼吸，不能太明显
        const scale = 1 + Math.sin(this.time * 0.25 + this.phase) * this.scalePulse;

        this.node.setScale(
            this.baseScale.x * scale,
            this.baseScale.y * scale,
            this.baseScale.z
        );

        // 可选透明度呼吸
        if (this.opacityComp && this.opacityPulse > 0) {
            const opacity =
                this.baseOpacity +
                Math.sin(this.time * 0.2 + this.phase) * this.opacityPulse;

            this.opacityComp.opacity = Math.max(0, Math.min(255, opacity));
        }
    }
}