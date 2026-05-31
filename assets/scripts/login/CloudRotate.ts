import { _decorator, Component, UIOpacity, Vec3 } from 'cc';

const { ccclass } = _decorator;

/** 登录背景云层漂移脚本：做轻微位移、透明度和缩放变化。 */
@ccclass('CloudRotate')
export class CloudRotate extends Component {
    private basePos = new Vec3();
    private opacity: UIOpacity | null = null;

    start() {
        this.basePos.set(this.node.position);
        this.opacity = this.getComponent(UIOpacity);
    }

    update() {
        const t = performance.now() * 0.001;

        // 很轻微的位置流动
        this.node.setPosition(
            this.basePos.x + Math.sin(t * 0.35) * 6,
            this.basePos.y + Math.cos(t * 0.22) * 3,
            this.basePos.z
        );

        // 透明度呼吸，这个最容易看出“活着”
        if (this.opacity) {
            const pulse = (Math.sin(t * 1.2) + 1) * 0.5;
            this.opacity.opacity = 80 + pulse * 110;
        }

        // 极轻微缩放
        const scale = 0.6667 + Math.sin(t * 0.45) * 0.01;
        this.node.setScale(scale, scale, 1);
    }
}
