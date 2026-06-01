import {
  Node,
  Size,
  UITransform,
} from 'cc';
import type { UiLayout } from './lobby/LobbyHudTypes';

export interface UiContentRootHost {
  node: Node;
}

/**
 * 管理 Cocos UI 根节点的创建、清空和尺寸。
 *
 * Root 通过这里创建所有运行时 UI 节点，避免多个模块各自持有 contentRoot，
 * 也方便后续排查“节点没有被清理”或“重绘后节点丢失”的问题。
 */
export class UiContentRootController {
  private contentRoot: Node | null = null;

  constructor(private readonly host: UiContentRootHost) {}

  applyRootSize(layout: UiLayout): void {
    const transform = this.host.node.getComponent(UITransform) ?? this.host.node.addComponent(UITransform);
    transform.setContentSize(new Size(layout.width, layout.height));
  }

  createNode(name: string): Node {
    const node = new Node(name);
    node.layer = this.host.node.layer;
    this.ensure().addChild(node);
    return node;
  }

  removeNode(name: string): void {
    const node = this.contentRoot?.getChildByName(name);
    if (!node) {
      return;
    }
    node.removeFromParent();
    node.destroy();
  }

  clear(): void {
    // 整页切换时必须销毁旧节点，避免按钮事件、Tween 和视频节点脱离父节点后继续存活。
    const root = this.ensure();
    const children = [...root.children];
    for (const child of children) {
      child.removeFromParent();
      child.destroy();
    }
  }

  clearExcept(preservedNodeNames: readonly string[]): void {
    const preserved = new Set(preservedNodeNames);
    const root = this.ensure();
    const children = [...root.children];
    for (const child of children) {
      if (preserved.has(child.name)) {
        continue;
      }
      child.removeFromParent();
      child.destroy();
    }
  }

  ensure(): Node {
    if (this.contentRoot?.isValid) {
      return this.contentRoot;
    }
    const root = new Node('LootChainCocosLoginUIRoot');
    root.layer = this.host.node.layer;
    this.host.node.addChild(root);
    this.contentRoot = root;
    return root;
  }
}
