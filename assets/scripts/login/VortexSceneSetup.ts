import { _decorator, Component, view, Vec3 } from 'cc';
const { ccclass } = _decorator;

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