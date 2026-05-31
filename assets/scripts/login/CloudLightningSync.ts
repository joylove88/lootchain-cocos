import { _decorator, Component, ParticleSystem2D, SpriteFrame, Sprite, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/** 闪电同步脚本：随机切换闪电帧，并用遮罩高度做快速显隐。 */
@ccclass('CloudLightningSync')
export class CloudLightningSync extends Component {
  @property(Node) lightningMask: Node | null = null;
  @property(Sprite) lightningSprite: Sprite | null = null;
  @property(ParticleSystem2D) spark: ParticleSystem2D | null = null;
  @property(ParticleSystem2D) dust: ParticleSystem2D | null = null;
  @property([SpriteFrame]) lightningFrames: SpriteFrame[] = [];

  @property minInterval = 3;
  @property maxInterval = 8;
  @property revealHeight = 900;
  @property revealWidth = 700;

  private timer = 0;
  private nextTime = 3;
  private revealTimer = 0;
  private revealing = false;

  start() {
    this.stopParticles();
    this.randomNextTime();
    this.setMaskHeight(0);
  }

  update(dt: number) {
    this.timer += dt;
    if (this.timer >= this.nextTime) {
      this.playLightning();
      this.timer = 0;
      this.randomNextTime();
    }

    if (this.revealing) {
      this.revealTimer += dt;
      if (this.revealTimer <= 0.12) {
        this.setMaskHeight(this.revealHeight * (this.revealTimer / 0.12));
      } else if (this.revealTimer <= 0.65) {
        const p = 1 - ((this.revealTimer - 0.12) / 0.53);
        this.setMaskHeight(this.revealHeight * p);
      } else {
        this.setMaskHeight(0);
        this.revealing = false;
      }
    }
  }

  private randomNextTime() {
    this.nextTime = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
  }

  private setMaskHeight(h: number) {
    const ui = this.lightningMask?.getComponent(UITransform);
    if (ui) ui.setContentSize(this.revealWidth, h);
  }

  private playLightning() {
    if (this.lightningFrames.length > 0 && this.lightningSprite) {
      const index = Math.floor(Math.random() * this.lightningFrames.length);
      this.lightningSprite.spriteFrame = this.lightningFrames[index];
    }

    this.node.setPosition((Math.random() - 0.5) * 520, 320 + Math.random() * 120, 0);
    this.node.angle = (Math.random() - 0.5) * 18;

    this.revealing = true;
    this.revealTimer = 0;
    this.setMaskHeight(0);

    if (this.spark) { this.spark.emissionRate = 14; this.spark.resetSystem(); }
    if (this.dust) { this.dust.emissionRate = 8; this.dust.resetSystem(); }

    setTimeout(() => { if (this.spark) this.spark.emissionRate = 0; }, 220);
    setTimeout(() => { if (this.dust) this.dust.emissionRate = 0; }, 900);
  }

  private stopParticles() {
    if (this.spark) this.spark.emissionRate = 0;
    if (this.dust) this.dust.emissionRate = 0;
  }
}
