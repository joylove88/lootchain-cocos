import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

/** 云层旋转脚本：给登录页旋涡云层提供持续角速度。 */
@ccclass('CloudVortexRotate')
export class CloudVortexRotate extends Component {

    @property
    speed = 0.18;

    update(dt: number) {
        this.node.angle += this.speed * dt;
    }
}
