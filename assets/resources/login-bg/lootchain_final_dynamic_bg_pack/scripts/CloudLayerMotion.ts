import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CloudLayerMotion')
export class CloudLayerMotion extends Component {
  @property rotateSpeed = 0.02;
  @property moveX = 3;
  @property moveY = 2;
  @property moveSpeedX = 0.18;
  @property moveSpeedY = 0.13;

  private basePos = new Vec3();

  start() {
    this.basePos.set(this.node.position);
  }

  update(dt: number) {
    const t = performance.now() * 0.001;
    this.node.angle += this.rotateSpeed * dt;
    this.node.setPosition(
      this.basePos.x + Math.sin(t * this.moveSpeedX) * this.moveX,
      this.basePos.y + Math.cos(t * this.moveSpeedY) * this.moveY,
      this.basePos.z
    );
  }
}
