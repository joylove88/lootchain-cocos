import { _decorator, Component, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('VortexBandMotion')
export class VortexBandMotion extends Component {

    @property radiusX = 420;
    @property radiusY = 120;
    @property angularSpeed = 0.15;
    @property phase = 0;
    @property rotateWithPath = true;
    @property selfRotateSpeed = 0.05;
    @property scalePulse = 0.006;

    private baseScale = new Vec3();
    private time = 0;

    start() {
        this.baseScale.set(this.node.scale);
    }

    update(dt: number) {
        this.time += dt;

        const a = this.time * this.angularSpeed + this.phase;

        this.node.setPosition(
            Math.cos(a) * this.radiusX,
            Math.sin(a) * this.radiusY,
            0
        );

        if (this.rotateWithPath) {
            const dx = -Math.sin(a) * this.radiusX;
            const dy = Math.cos(a) * this.radiusY;
            this.node.angle = Math.atan2(dy, dx) * 180 / Math.PI;
        }

        this.node.angle += this.selfRotateSpeed * dt;

        const s = 1 + Math.sin(this.time * 0.25 + this.phase) * this.scalePulse;

        this.node.setScale(
            this.baseScale.x * s,
            this.baseScale.y * s,
            this.baseScale.z
        );
    }
}
