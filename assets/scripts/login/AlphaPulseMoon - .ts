import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

/** 月亮/核心光效缩放脉冲脚本：只做轻微呼吸，不改变节点位置。 */
@ccclass('AlphaPulse')
export class AlphaPulse extends Component {

    private baseScale = new Vec3();

    start() {
        this.baseScale.set(this.node.scale);
    }

    update() {

        const t = performance.now() * 0.001;

        const pulse = 1 + Math.sin(t * 1.2) * 0.04;

        this.node.setScale(
            this.baseScale.x * pulse,
            this.baseScale.y * pulse,
            this.baseScale.z
        );
    }
}
