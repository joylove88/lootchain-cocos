import { _decorator, Component, Sprite, Vec4, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VortexCloudMaterialController')
export class VortexCloudMaterialController extends Component {
    @property({ type: Sprite })
    targetSprite: Sprite | null = null;

    @property
    centerX = 0.5;

    @property
    centerY = 0.68;

    @property
    innerCloudRadius = 0.075;

    @property
    outerCloudRadius = 1.15;

    @property
    edgeSoftness = 0.18;

    @property
    blackVoidRadius = 0.105;

    @property
    rotationSpeed = -0.22;

    @property
    innerAcceleration = 0.075;

    @property
    twistStrength = 1.25;

    @property
    radialScrollSpeed = 0.045;

    @property
    angularTiling = 2.75;

    @property
    radialTiling = 2.15;

    @property
    contrast = 1.35;

    @property
    alphaMul = 0.86;

    start() {
        this.applyParams();
    }

    applyParams() {
        const sprite = this.targetSprite ?? this.getComponent(Sprite);
        if (!sprite) return;

        // sprite.material returns an instance, so this won't mutate every other object using the same material.
        const mat = sprite.material;
        if (!mat) return;

        const visible = view.getVisibleSize();
        const aspect = visible.width / Math.max(1, visible.height);

        mat.setProperty('centerAspect', new Vec4(this.centerX, this.centerY, aspect, 0));
        mat.setProperty('radiusParams', new Vec4(this.innerCloudRadius, this.outerCloudRadius, this.edgeSoftness, this.blackVoidRadius));
        mat.setProperty('motionParams', new Vec4(this.rotationSpeed, this.innerAcceleration, this.twistStrength, this.radialScrollSpeed));
        mat.setProperty('detailParams', new Vec4(this.angularTiling, this.radialTiling, this.contrast, this.alphaMul));
    }
}
