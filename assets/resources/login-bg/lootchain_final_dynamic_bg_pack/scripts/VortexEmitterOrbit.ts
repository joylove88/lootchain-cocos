import { _decorator, Component, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VortexEmitterOrbit')
export class VortexEmitterOrbit extends Component {
    @property radiusX = 420;
    @property radiusY = 120;
    @property angularSpeed = 0.15;
    @property phase = 0;
    @property followTangent = true;
    @property tangentOffsetDeg = 0;

    private t = 0;
    private particle: ParticleSystem2D | null = null;

    start() {
        this.particle = this.getComponent(ParticleSystem2D);
    }

    update(dt: number) {
        this.t += dt;

        const a = this.t * this.angularSpeed + this.phase;
        this.node.setPosition(Math.cos(a) * this.radiusX, Math.sin(a) * this.radiusY, 0);

        if (this.followTangent && this.particle) {
            const dx = -Math.sin(a) * this.radiusX;
            const dy =  Math.cos(a) * this.radiusY;
            const deg = Math.atan2(dy, dx) * 180 / Math.PI;
            this.particle.angle = deg + this.tangentOffsetDeg;
        }
    }
}
