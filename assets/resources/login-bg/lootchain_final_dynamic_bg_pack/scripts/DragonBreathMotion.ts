import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DragonBreathMotion')
export class DragonBreathMotion extends Component {
  @property scaleStrength = 0.012;
  @property moveX = 2;
  @property moveY = 1.5;
  @property speed = 0.65;

  private baseScale = new Vec3();
  private basePos = new Vec3();

  start() {
    this.baseScale.set(this.node.scale);
    this.basePos.set(this.node.position);
  }

  update() {
    const t = performance.now() * 0.001;
    const s = 1 + Math.sin(t * this.speed) * this.scaleStrength;
    this.node.setScale(this.baseScale.x * s, this.baseScale.y * s, this.baseScale.z);
    this.node.setPosition(
      this.basePos.x + Math.sin(t * 0.35) * this.moveX,
      this.basePos.y + Math.cos(t * 0.28) * this.moveY,
      this.basePos.z
    );
  }
}
