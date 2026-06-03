import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  Sprite,
  UITransform,
  UIOpacity,
  Vec3,
  tween,
} from 'cc';
import type { PlayerBattleEnemyVO, PlayerBattleLineupHeroVO } from '../../types/BattleTypes';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import type { LobbyBattlePanelState } from './LobbyBattleState';
import type { BattlePresentationLayout, BattlePresentationRect, BattlePresentationSlot } from './LobbyBattlePresentationLayout';
import { resolveBattlePresentationLayout } from './LobbyBattlePresentationLayout';
import { resolveLobbyBattlePresentationState, type LobbyBattlePresentationState } from './LobbyBattlePresentationState';
import { rgba, type UiLayout } from './LobbyHudTypes';

export const LOBBY_BATTLE_SCENE_BG_ASSET = 'ui/battle/battle_scene_cathedral/spriteFrame';

interface BattleDisplayUnit {
  title: string;
  subline: string;
  leader: boolean;
  enemy: boolean;
  hp: number;
}

export interface LobbyBattlePreviewPanelHost {
  node: Node;
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  currentLobbyBattleState(): LobbyBattlePanelState;
  startLobbyBattleSession(): void;
  settleLobbyBattleSession(): void;
  closeLobbyBattlePreviewPanel(): void;
  returnToLobbyFromBattlePreview(): void;
  createUiNode(name: string): Node;
  addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Node;
  addChildLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    contentSize?: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/** 战斗表现面板。当前只做 battle session 和无奖励 settlement 的影视化展示，不开放真实经济结算。
 * 主要动作节点名包括 LobbyBattleStartButton、LobbyBattleSettlementButton、LobbyBattleReturnLobbyButton。 */
export class LobbyBattlePreviewPanelRenderer {
  constructor(private readonly host: LobbyBattlePreviewPanelHost) {}

  render(layout: UiLayout): void {
    const heroState = this.host.currentLobbyHeroRosterState();
    const battleState = this.host.currentLobbyBattleState();
    const presentation = resolveLobbyBattlePresentationState(battleState);
    const scale = Math.max(0.62, Math.min(1, layout.uiScale));
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const sceneWidth = Math.max(320 * scale, layout.width);
    const sceneHeight = Math.max(240 * scale, layout.height);
    const frameWidth = Math.min(layout.stageWidth, sceneWidth);
    const frameHeight = Math.min(layout.stageHeight, sceneHeight);
    const presentationLayout = resolveBattlePresentationLayout(frameWidth, frameHeight, scale);

    const dim = this.createUiNode('LobbyBattlePreviewDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 166);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    dim.addComponent(Button);
    dim.on(Button.EventType.CLICK, () => {
      // 结果已记录后，遮罩点击也回大厅，避免玩家回到旧编队后复用已结算状态。
      if (presentation.returnToLobby) {
        this.host.returnToLobbyFromBattlePreview();
        return;
      }
      this.host.closeLobbyBattlePreviewPanel();
    }, this);

    const sceneRoot = this.createUiNode('LobbyBattleSceneRoot');
    sceneRoot.setPosition(new Vec3(centerX, centerY, 0));
    sceneRoot.addComponent(UITransform).setContentSize(new Size(sceneWidth, sceneHeight));
    // 全屏战斗层必须吞掉输入，防止战斗演出点击穿透到底层大厅。
    sceneRoot.addComponent(BlockInputEvents);
    const bg = this.host.addSprite('LobbyBattleSceneBackdropSprite', LOBBY_BATTLE_SCENE_BG_ASSET, 0, 0, sceneWidth, sceneHeight, sceneRoot);
    if (!bg) {
      const fallback = sceneRoot.addComponent(Graphics);
      fallback.fillColor = rgba(3, 3, 5, 255);
      fallback.rect(-sceneWidth / 2, -sceneHeight / 2, sceneWidth, sceneHeight);
      fallback.fill();
    }
    this.drawBattleSceneAtmosphere(sceneRoot, sceneWidth, sceneHeight, scale, presentation);
    const panelWidth = frameWidth;
    const panelHeight = frameHeight;
    const panelGroup = this.host.addChildPlainNode(sceneRoot, 'LobbyBattlePreviewPanel', 0, 0, panelWidth, panelHeight);
    // 战斗表现层内部点击必须被吞掉，避免点单位、日志、按钮附近时误触遮罩关闭。
    panelGroup.addComponent(BlockInputEvents);
    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyBattlePreviewPanelFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(4, 4, 7, 68),
      rgba(195, 144, 61, 230),
      18 * scale,
    );
    this.drawBattleBackdrop(panel, panelWidth, panelHeight, scale, presentation);
    this.renderHeader(panel, panelWidth, panelHeight, scale, battleState, presentation);
    this.renderBattleField(panel, presentationLayout, scale, heroState.heroes, battleState, presentation);
    this.renderFooter(panel, presentationLayout, scale, battleState, presentation);
    renderSceneBackButton(this.host, sceneRoot, layout, 'LobbyBattlePreviewBackButton', () => {
      if (presentation.returnToLobby) {
        this.host.returnToLobbyFromBattlePreview();
        return;
      }
      this.host.closeLobbyBattlePreviewPanel();
    }, scale, '战斗');
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderHeader(parent: Node, width: number, height: number, scale: number, state: LobbyBattlePanelState, presentation: LobbyBattlePresentationState): void {
    const title = this.host.addChildLabel(parent, 'LobbyBattlePreviewTitle', presentation.title, 0, height / 2 - 42 * scale, 29 * scale, rgba(252, 225, 158), new Size(width - 100 * scale, 38 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const status = this.host.addChildLabel(parent, 'LobbyBattlePreviewStatus', presentation.subtitle, 0, height / 2 - 76 * scale, 17 * scale, rgba(204, 167, 88), new Size(width - 112 * scale, 28 * scale));
    status.overflow = Label.Overflow.SHRINK;
    if (state.error && presentation.phase !== 'resultRecorded') {
      const error = this.host.addChildLabel(parent, 'LobbyBattlePreviewError', state.error, 0, height / 2 - 102 * scale, 15 * scale, rgba(255, 116, 116), new Size(width - 112 * scale, 24 * scale));
      error.overflow = Label.Overflow.SHRINK;
    }
  }

  private renderBattleField(
    parent: Node,
    layout: BattlePresentationLayout,
    scale: number,
    heroes: LobbyHeroItemVO[],
    state: LobbyBattlePanelState,
    presentation: LobbyBattlePresentationState,
  ): void {
    const fieldRect = layout.field;
    const field = this.host.addChildPlainNode(parent, 'LobbyBattlePreviewField', fieldRect.x, fieldRect.y, fieldRect.width, fieldRect.height);
    const graphics = field.addComponent(Graphics);
    this.drawFieldFrame(graphics, fieldRect.width, fieldRect.height, scale);
    this.renderBoundaryBadge(field, layout.timeline, scale, presentation);
    this.renderUnitActors(field, layout.allySlots, this.resolveAllies(heroes, state), scale, false, presentation);
    this.renderUnitActors(field, layout.enemySlots, this.resolveEnemies(state, presentation), scale, true, presentation);
    this.renderImpactLayer(field, fieldRect.width, fieldRect.height, scale, presentation);
    this.renderSettlementReceipt(field, fieldRect.width, fieldRect.height, scale, presentation, layout.compact);
    this.renderBattleLog(field, layout.log, scale, presentation);
  }

  private renderBoundaryBadge(parent: Node, rect: BattlePresentationRect, scale: number, presentation: LobbyBattlePresentationState): void {
    const badge = this.host.addChildPlainNode(parent, 'LobbyBattleBoundaryBadge', rect.x, rect.y, rect.width, rect.height);
    const graphics = badge.addComponent(Graphics);
    graphics.fillColor = rgba(12, 10, 9, 220);
    graphics.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    graphics.fill();
    graphics.strokeColor = rgba(174, 119, 49, 168);
    graphics.stroke();
    const label = this.host.addChildLabel(badge, 'LobbyBattleTimelineText', presentation.timelineText, 0, 0, 15 * scale, rgba(238, 200, 119), new Size(rect.width - 18 * scale, rect.height));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderUnitActors(parent: Node, slots: BattlePresentationSlot[], units: BattleDisplayUnit[], scale: number, enemy: boolean, presentation: LobbyBattlePresentationState): void {
    const visible = units.slice(0, slots.length);
    visible.forEach((unit, index) => {
      this.renderActor(parent, slots[index], unit, scale, enemy, index, presentation);
    });
  }

  private renderActor(parent: Node, slot: BattlePresentationSlot, unit: BattleDisplayUnit, scale: number, enemy: boolean, index: number, presentation: LobbyBattlePresentationState): void {
    const actor = this.host.addChildPlainNode(parent, `LobbyBattleActor_${enemy ? 'Enemy' : 'Ally'}_${index}`, slot.x, slot.y, slot.width, slot.height);
    const graphics = actor.addComponent(Graphics);
    const active = presentation.phase === 'roundPlaying' && index === 0;
    const fill = enemy ? rgba(46, 11, 14, 218) : unit.leader ? rgba(48, 13, 15, 226) : rgba(10, 10, 13, 206);
    graphics.fillColor = fill;
    graphics.rect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);
    graphics.fill();
    graphics.strokeColor = active ? rgba(248, 196, 84, 230) : enemy ? rgba(172, 58, 54, 170) : rgba(142, 106, 55, 168);
    graphics.lineWidth = Math.max(1, active ? 2 * scale : 1 * scale);
    graphics.stroke();

    const crestX = enemy ? slot.width / 2 - 24 * scale : -slot.width / 2 + 24 * scale;
    graphics.fillColor = enemy ? rgba(134, 24, 28, 220) : rgba(152, 96, 31, 220);
    graphics.circle(crestX, 5 * scale, 14 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(236, 185, 93, 180);
    graphics.stroke();

    const textX = enemy ? -slot.width / 2 + 12 * scale : -slot.width / 2 + 44 * scale;
    const textWidth = slot.width - 56 * scale;
    const name = this.host.addChildLabel(actor, 'LobbyBattleActorName', unit.title, textX, 13 * scale, 15 * scale, rgba(244, 218, 157), new Size(textWidth, 20 * scale), HorizontalTextAlignment.LEFT);
    name.overflow = Label.Overflow.SHRINK;
    const subline = this.host.addChildLabel(actor, 'LobbyBattleActorSubline', unit.subline, textX, -7 * scale, 12 * scale, rgba(184, 164, 115), new Size(textWidth, 18 * scale), HorizontalTextAlignment.LEFT);
    subline.overflow = Label.Overflow.SHRINK;
    this.renderHpBar(actor, -slot.width / 2 + 12 * scale, -slot.height / 2 + 8 * scale, slot.width - 24 * scale, 7 * scale, unit.hp, scale, enemy);
    if (active) {
      const lunge = enemy ? -8 * scale : 8 * scale;
      // 当前阶段用轻量位移模拟普攻压进，后续可替换为 Spine/序列帧动画。
      tween(actor)
        .repeatForever(tween().by(0.24, { position: new Vec3(lunge, 0, 0) }).by(0.32, { position: new Vec3(-lunge, 0, 0) }).delay(0.56))
        .start();
    }
  }

  private renderHpBar(parent: Node, x: number, y: number, width: number, height: number, hp: number, scale: number, enemy: boolean): void {
    const bar = this.host.addChildPlainNode(parent, 'LobbyBattleActorHpBar', x + width / 2, y + height / 2, width, height);
    const graphics = bar.addComponent(Graphics);
    graphics.fillColor = rgba(10, 8, 8, 230);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = enemy ? rgba(151, 34, 32, 230) : rgba(188, 140, 58, 230);
    graphics.rect(-width / 2, -height / 2, width * clamp(hp, 0.08, 1), height);
    graphics.fill();
    graphics.strokeColor = rgba(220, 180, 92, 120);
    graphics.lineWidth = Math.max(1, 0.8 * scale);
    graphics.stroke();
  }

  private renderImpactLayer(parent: Node, width: number, height: number, scale: number, presentation: LobbyBattlePresentationState): void {
    if (presentation.phase !== 'roundPlaying' && presentation.phase !== 'resultRecording' && presentation.phase !== 'resultRecorded') {
      return;
    }
    const effect = this.host.addChildPlainNode(parent, 'LobbyBattleEffectLayer', 0, 0, width, height);
    const graphics = effect.addComponent(Graphics);
    graphics.strokeColor = rgba(236, 63, 48, 168);
    graphics.lineWidth = Math.max(2, 2.4 * scale);
    graphics.moveTo(-width * 0.08, height * 0.14);
    graphics.lineTo(width * 0.13, height * 0.02);
    graphics.lineTo(width * 0.04, -height * 0.1);
    graphics.stroke();
    graphics.strokeColor = rgba(246, 198, 92, 128);
    graphics.lineWidth = Math.max(1, 1.3 * scale);
    graphics.moveTo(-width * 0.02, height * 0.1);
    graphics.lineTo(width * 0.18, -height * 0.04);
    graphics.stroke();
    const damage = this.host.addChildLabel(effect, 'LobbyBattleDamageText', presentation.damageText || '-1284', width * 0.17, height * 0.04, 24 * scale, rgba(255, 214, 111), new Size(150 * scale, 32 * scale));
    damage.overflow = Label.Overflow.SHRINK;
    this.applyOutline(damage, scale, true);
    const opacity = effect.addComponent(UIOpacity);
    opacity.opacity = 186;
    // 命中层做短促闪烁，突出“打斗中”而不是静态弹框。
    tween(effect)
      .repeatForever(tween().to(0.2, { scale: new Vec3(1.06, 1.06, 1) }).to(0.28, { scale: Vec3.ONE }).delay(0.55))
      .start();
    tween(opacity)
      .repeatForever(tween().to(0.2, { opacity: 245 }).to(0.36, { opacity: 120 }).delay(0.48))
      .start();
  }

  private renderBattleLog(parent: Node, rect: BattlePresentationRect, scale: number, presentation: LobbyBattlePresentationState): void {
    const log = this.host.addChildPlainNode(parent, 'LobbyBattlePreviewLog', rect.x, rect.y, rect.width, rect.height);
    const graphics = log.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 7, 205);
    graphics.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    graphics.fill();
    graphics.strokeColor = rgba(132, 98, 52, 120);
    graphics.stroke();
    const text = this.host.addChildLabel(log, 'LobbyBattlePreviewLogText', presentation.logLines.join('\n'), 0, 0, 13 * scale, rgba(207, 188, 145), new Size(rect.width - 28 * scale, rect.height - 10 * scale));
    text.lineHeight = 18 * scale;
    text.overflow = Label.Overflow.SHRINK;
  }

  private renderSettlementReceipt(parent: Node, width: number, height: number, scale: number, presentation: LobbyBattlePresentationState, compact: boolean): void {
    const receiptLines = presentation.settlementReceiptLines ?? [];
    if (presentation.phase !== 'resultRecorded' || compact || receiptLines.length === 0) {
      return;
    }
    const receiptWidth = Math.min(300 * scale, width * 0.38);
    const receiptHeight = 126 * scale;
    const receipt = this.host.addChildPlainNode(parent, 'LobbyBattleSettlementReceipt', 0, -4 * scale, receiptWidth, receiptHeight);
    const graphics = receipt.addComponent(Graphics);
    graphics.fillColor = rgba(8, 7, 8, 228);
    graphics.rect(-receiptWidth / 2, -receiptHeight / 2, receiptWidth, receiptHeight);
    graphics.fill();
    graphics.strokeColor = rgba(215, 157, 67, 216);
    graphics.lineWidth = Math.max(1, 1.1 * scale);
    graphics.stroke();
    graphics.fillColor = rgba(102, 22, 20, 92);
    graphics.rect(-receiptWidth / 2 + 8 * scale, receiptHeight / 2 - 34 * scale, receiptWidth - 16 * scale, 26 * scale);
    graphics.fill();

    const title = this.host.addChildLabel(receipt, 'LobbyBattleSettlementReceiptTitle', '结算回执', 0, receiptHeight / 2 - 21 * scale, 16 * scale, rgba(248, 219, 151), new Size(receiptWidth - 18 * scale, 22 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, false);

    receiptLines.slice(0, 5).forEach((line, index) => {
      const label = this.host.addChildLabel(
        receipt,
        `LobbyBattleSettlementReceiptLine_${index}`,
        line,
        -receiptWidth / 2 + 14 * scale,
        receiptHeight / 2 - (50 + index * 15) * scale,
        12 * scale,
        index >= 2 ? rgba(188, 218, 231) : rgba(221, 198, 145),
        new Size(receiptWidth - 28 * scale, 16 * scale),
        HorizontalTextAlignment.LEFT,
      );
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderFooter(parent: Node, layout: BattlePresentationLayout, scale: number, state: LobbyBattlePanelState, presentation: LobbyBattlePresentationState): void {
    const note = this.host.addChildLabel(
      parent,
      'LobbyBattlePreviewBoundaryNote',
      presentation.boundaryText,
      layout.boundary.x,
      layout.boundary.y,
      15 * scale,
      rgba(168, 146, 105),
      new Size(layout.boundary.width, layout.boundary.height),
    );
    note.overflow = Label.Overflow.SHRINK;

    const disabledRect = layout.footerButtons[0];
    const disabled = this.host.addChildPlainNode(parent, 'LobbyBattleSettleDisabled', disabledRect.x, disabledRect.y, disabledRect.width, disabledRect.height);
    this.drawDisabledButton(disabled, disabledRect.width, disabledRect.height, scale);
    const disabledLabel = this.host.addChildLabel(disabled, 'LobbyBattleSettleDisabledLabel', '奖励未开放', 0, 0, 16 * scale, rgba(179, 150, 91), new Size(disabledRect.width - 10 * scale, disabledRect.height));
    disabledLabel.overflow = Label.Overflow.SHRINK;

    this.renderActionButton(parent, layout.footerButtons[1], scale, state, presentation);
    const backRect = layout.footerButtons[2];
    if (presentation.returnToLobby) {
      const locked = this.host.addChildPlainNode(parent, 'LobbyBattlePreviewCloseButton', backRect.x, backRect.y, backRect.width, backRect.height);
      this.drawDisabledButton(locked, backRect.width, backRect.height, scale);
      const label = this.host.addChildLabel(locked, 'LobbyBattlePreviewCloseButtonLabel', '已记录', 0, 0, 16 * scale, rgba(179, 150, 91), new Size(backRect.width - 10 * scale, backRect.height));
      label.overflow = Label.Overflow.SHRINK;
      return;
    }
    const back = this.addFooterButton(parent, 'LobbyBattlePreviewCloseButton', '返回编队', backRect, scale);
    back.on(Button.EventType.CLICK, () => this.host.closeLobbyBattlePreviewPanel(), this);
  }

  private renderActionButton(parent: Node, rect: BattlePresentationRect, scale: number, state: LobbyBattlePanelState, presentation: LobbyBattlePresentationState): void {
    if (!presentation.actionEnabled) {
      const pending = this.host.addChildPlainNode(parent, presentation.actionNodeName, rect.x, rect.y, rect.width, rect.height);
      this.drawDisabledButton(pending, rect.width, rect.height, scale);
      const label = this.host.addChildLabel(pending, `${presentation.actionNodeName}Label`, presentation.actionLabel, 0, 0, 16 * scale, rgba(179, 150, 91), new Size(rect.width, rect.height));
      label.overflow = Label.Overflow.SHRINK;
      return;
    }
    const button = this.addFooterButton(parent, presentation.actionNodeName, presentation.actionLabel, rect, scale);
    if (presentation.returnToLobby) {
      button.on(Button.EventType.CLICK, () => this.host.returnToLobbyFromBattlePreview(), this);
    } else if (!state.start) {
      button.on(Button.EventType.CLICK, () => this.host.startLobbyBattleSession(), this);
    } else {
      button.on(Button.EventType.CLICK, () => this.host.settleLobbyBattleSession(), this);
    }
  }

  private addFooterButton(parent: Node, name: string, text: string, rect: BattlePresentationRect, scale: number): Node {
    const button = this.host.addChildPlainNode(parent, name, rect.x, rect.y, rect.width, rect.height);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(20, 16, 15, 226);
    graphics.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    graphics.fill();
    graphics.strokeColor = rgba(188, 137, 58, 216);
    graphics.stroke();
    button.addComponent(Button);
    this.host.applyImageButtonFeedback(button, 1.025, 0.975);
    const label = this.host.addChildLabel(button, `${name}Label`, text, 0, 0, 17 * scale, rgba(245, 211, 123), new Size(rect.width - 10 * scale, rect.height));
    label.overflow = Label.Overflow.SHRINK;
    return button;
  }

  private resolveAllies(heroes: LobbyHeroItemVO[], state: LobbyBattlePanelState): BattleDisplayUnit[] {
    if (state.start?.lineup?.length) {
      return fillUnits(state.start.lineup.map((hero, index) => this.fromLineupHero(hero, index)), false);
    }
    const units = [...heroes]
      .sort((a, b) => Number(b.protagonist) - Number(a.protagonist) || b.power - a.power)
      .slice(0, 5)
      .map((hero, index) => ({
        title: safeText(hero.heroName),
        subline: `Lv.${hero.level} / ${formatInteger(hero.power)}${index === 0 ? ' / 队长' : ''}`,
        leader: index === 0,
        enemy: false,
        hp: index === 0 ? 0.92 : 0.76,
      }));
    return fillUnits(units, false);
  }

  private resolveEnemies(state: LobbyBattlePanelState, presentation: LobbyBattlePresentationState): BattleDisplayUnit[] {
    if (state.start?.enemyPreview?.length) {
      return fillUnits(state.start.enemyPreview.map((enemy, index) => this.fromEnemy(enemy, index, presentation)), true);
    }
    return fillUnits(
      [
        { title: '裂隙侍从', subline: 'Lv.1 / 预演', leader: false, enemy: true, hp: presentation.leadEnemyHp },
        { title: '黑甲守卫', subline: 'Lv.1 / 预演', leader: false, enemy: true, hp: 0.64 },
        { title: '裂隙法师', subline: 'Lv.1 / 预演', leader: false, enemy: true, hp: 0.7 },
      ],
      true,
    );
  }

  private fromLineupHero(hero: PlayerBattleLineupHeroVO, index: number): BattleDisplayUnit {
    return {
      title: safeText(hero.heroName),
      subline: `Lv.${hero.level} / ${formatInteger(hero.power)}${hero.leader ? ' / 队长' : ''}`,
      leader: hero.leader,
      enemy: false,
      hp: hero.leader ? 0.92 : Math.max(0.62, 0.86 - index * 0.07),
    };
  }

  private fromEnemy(enemy: PlayerBattleEnemyVO, index: number, presentation: LobbyBattlePresentationState): BattleDisplayUnit {
    return {
      title: safeText(enemy.enemyName),
      subline: `Lv.${enemy.level} / ${formatInteger(enemy.power)} / ${safeText(enemy.role)}`,
      leader: false,
      enemy: true,
      hp: index === 0 ? presentation.leadEnemyHp : Math.max(0.34, 0.72 - index * 0.08),
    };
  }

  private drawBattleSceneAtmosphere(parent: Node, width: number, height: number, scale: number, presentation: LobbyBattlePresentationState): void {
    const shade = this.host.addChildPlainNode(parent, 'LobbyBattleSceneShade', 0, 0, width, height);
    const graphics = shade.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 92);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = presentation.phase === 'resultRecorded' ? rgba(194, 41, 30, 50) : rgba(122, 13, 18, 42);
    graphics.circle(width * 0.22, height * 0.16, Math.min(width, height) * 0.28);
    graphics.fill();
    graphics.strokeColor = rgba(232, 65, 50, 92);
    graphics.lineWidth = Math.max(1, 1.4 * scale);
    for (let index = 0; index < 3; index += 1) {
      const startX = -width * 0.42 + index * width * 0.42;
      graphics.moveTo(startX, height * 0.32);
      graphics.lineTo(startX + 42 * scale, height * 0.22);
      graphics.lineTo(startX + 18 * scale, height * 0.12);
    }
    graphics.stroke();

    const ember = this.host.addChildPlainNode(parent, 'LobbyBattleSceneEmberMotion', width * 0.18, height * 0.06, 130 * scale, 130 * scale);
    const emberGraphics = ember.addComponent(Graphics);
    emberGraphics.strokeColor = rgba(246, 172, 72, 132);
    emberGraphics.lineWidth = Math.max(1, 1.2 * scale);
    emberGraphics.circle(0, 0, 48 * scale);
    emberGraphics.stroke();
    const opacity = ember.addComponent(UIOpacity);
    opacity.opacity = 150;
    // 轻量 Tween 让全屏战斗页保持“正在演出”的动感，不改变后端战斗结果。
    tween(ember)
      .repeatForever(tween().by(1.8, { angle: 14 }).to(1.8, { scale: new Vec3(1.08, 1.08, 1) }).to(1.8, { scale: Vec3.ONE }))
      .start();
    tween(opacity)
      .repeatForever(tween().to(1.1, { opacity: 215 }).to(1.1, { opacity: 116 }))
      .start();
  }

  private drawBattleBackdrop(parent: Node, width: number, height: number, scale: number, presentation: LobbyBattlePresentationState): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyBattleCinematicBackdrop', 0, 0, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(99, 12, 18, 34);
    graphics.rect(-width / 2 + 18 * scale, height / 2 - 92 * scale, width - 36 * scale, 48 * scale);
    graphics.fill();
    graphics.fillColor = presentation.phase === 'resultRecorded' ? rgba(210, 58, 40, 48) : rgba(210, 40, 35, 38);
    graphics.circle(width * 0.16, height * 0.08, Math.min(width, height) * 0.2);
    graphics.fill();
    graphics.strokeColor = rgba(88, 34, 34, 92);
    graphics.lineWidth = Math.max(1, 1.1 * scale);
    for (let index = 0; index < 5; index += 1) {
      const x = -width * 0.34 + index * width * 0.17;
      graphics.moveTo(x, height * 0.22);
      graphics.lineTo(x + 34 * scale, height * 0.05);
      graphics.lineTo(x + 18 * scale, -height * 0.18);
    }
    graphics.stroke();
  }

  private drawFieldFrame(graphics: Graphics, width: number, height: number, scale: number): void {
    graphics.fillColor = rgba(7, 7, 10, 196);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(137, 100, 50, 136);
    graphics.lineWidth = Math.max(1, scale);
    graphics.stroke();
    graphics.strokeColor = rgba(138, 42, 40, 108);
    graphics.moveTo(-width / 2 + 34 * scale, -height * 0.2);
    graphics.bezierCurveTo(-width * 0.18, height * 0.08, width * 0.18, -height * 0.12, width / 2 - 34 * scale, height * 0.16);
    graphics.stroke();
    graphics.fillColor = rgba(255, 255, 255, 22);
    graphics.rect(-width / 2 + 16 * scale, height / 2 - 20 * scale, width - 32 * scale, 16 * scale);
    graphics.fill();
  }

  private drawDisabledButton(node: Node, width: number, height: number, scale: number): void {
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(24, 21, 18, 184);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(119, 91, 48, 148);
    graphics.lineWidth = Math.max(1, scale);
    graphics.stroke();
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 226 : 190);
    label.outlineWidth = Math.max(1, (strong ? 1.4 : 1) * scale);
  }
}

function fillUnits(units: BattleDisplayUnit[], enemy: boolean): BattleDisplayUnit[] {
  const result = units.slice(0, 5);
  while (result.length < 5) {
    result.push({
      title: '空位',
      subline: enemy ? '待确认' : '待上阵',
      leader: false,
      enemy,
      hp: enemy ? 0.4 : 0.65,
    });
  }
  return result;
}

function formatInteger(value: number | null | undefined): string {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return numeric.toLocaleString('en-US');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
