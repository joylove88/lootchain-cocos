import { _decorator, Component, view, Vec3 } from 'cc';
const { ccclass } = _decorator;

/** 登录旋涡场景缩放脚本：按设计分辨率等比缩放整组特效。 */
@ccclass('VortexSceneSetup')
export class VortexSceneSetup extends Component {
    start() {
        const designW = 2048;
        const designH = 1152;

        const frameSize = view.getVisibleSize();
        const scale = Math.min(frameSize.width / designW, frameSize.height / designH);

        this.node.setScale(new Vec3(scale, scale, 1));
    }
}
