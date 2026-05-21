import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CloakWindMotion')
export class CloakWindMotion extends Component {
  @property moveX = 3;
  @property rotate = 0.8;
  @property speed = 0.9;
  private basePos = new Vec3();
  private baseAngle = 0;

  start() {
    this.basePos.set(this.node.position);
    this.baseAngle = this.node.angle;
  }

  update() {
    const t = performance.now() * 0.001;
    const p = Math.sin(t * this.speed) * 0.7 + Math.sin(t * this.speed * 1.7) * 0.3;
    this.node.setPosition(this.basePos.x + p * this.moveX, this.basePos.y, this.basePos.z);
    this.node.angle = this.baseAngle + p * this.rotate;
  }
}
