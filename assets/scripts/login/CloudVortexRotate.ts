import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CloudVortexRotate')
export class CloudVortexRotate extends Component {

    @property
    speed = 0.18;

    update(dt: number) {
        this.node.angle += this.speed * dt;
    }
}