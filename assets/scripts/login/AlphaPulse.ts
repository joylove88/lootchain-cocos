import { _decorator, Component, UIOpacity } from 'cc';

const { ccclass } = _decorator;

/** 透明度脉冲脚本：给登录页小型光效做循环呼吸。 */
@ccclass('AlphaPulse')
export class AlphaPulse extends Component {

    private opacity: UIOpacity | null = null;

    start() {
        this.opacity = this.getComponent(UIOpacity);
    }

    update() {

        if (!this.opacity) return;

        const t = performance.now() * 0.001;

        const pulse = (Math.sin(t * 1.6) + 1) * 0.5;

        this.opacity.opacity = 90 + pulse * 70;
    }
}
