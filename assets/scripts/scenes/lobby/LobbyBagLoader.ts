import type { BagApi } from '../../api/BagApi';
import type { HeroApi } from '../../api/HeroApi';
import type { BagItemEntryVO, ItemTypeBagGroupVO, LobbyBagPanelState } from '../../types/BagTypes';
import type { UserHeroFragmentVO } from '../../types/HeroTypes';
import { LobbyBagState } from './LobbyBagState';

export interface LobbyBagLoaderHost {
  isLobbyViewActive(): boolean;
  refreshLobbyOverlay(): void;
}

/** 大厅背包只读加载器。 */
export class LobbyBagLoader {
  private readonly bagState = new LobbyBagState();
  private loadTicket = 0;
  private sourceTicket = 0;

  constructor(
    private readonly bagApi: BagApi,
    private readonly heroApi: HeroApi,
    private readonly host: LobbyBagLoaderHost,
  ) {}

  get loading(): boolean {
    return this.bagState.snapshot().loading;
  }

  get loaded(): boolean {
    return this.bagState.snapshot().loaded;
  }

  get version(): number {
    return this.bagState.version;
  }

  cancel(): void {
    // 销毁场景或重新登录时让旧请求失效，防止慢响应覆盖新玩家背包。
    this.loadTicket += 1;
    this.sourceTicket += 1;
  }

  resetForLogin(): void {
    this.cancel();
    this.bagState.reset();
  }

  currentState(): LobbyBagPanelState {
    return this.bagState.snapshot();
  }

  selectItem(itemCode: string): boolean {
    const changed = this.bagState.selectItem(itemCode);
    if (changed) {
      this.refreshIfActive();
    }
    return changed;
  }

  async load(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.loaded && !force) {
      return;
    }
    const ticket = this.nextLoadTicket();
    this.bagState.startLoading();
    this.refreshIfActive();
    try {
      const [bag, fragments] = await Promise.all([
        this.bagApi.myBag(),
        this.heroApi.fragments().catch((error) => {
          console.warn('[LootChain] hero fragments load failed while composing bag:', error);
          return [] as UserHeroFragmentVO[];
        }),
      ]);
      if (!this.isCurrentLoad(ticket)) {
        return;
      }
      this.bagState.applyLoaded(mergeBagGroupsWithFragments(bag.groups ?? [], fragments));
      const selectedItemCode = this.bagState.snapshot().selectedItemCode;
      if (selectedItemCode) {
        void this.loadSource(selectedItemCode, true);
      }
    } catch (error) {
      if (!this.isCurrentLoad(ticket)) {
        return;
      }
      this.bagState.applyError(error);
      console.warn('[LootChain] lobby bag load failed:', error);
    } finally {
      if (this.isCurrentLoad(ticket)) {
        this.refreshIfActive();
      }
    }
  }

  async loadSource(itemCode: string, force = false): Promise<void> {
    const safeCode = itemCode.trim();
    if (!safeCode) {
      return;
    }
    const state = this.bagState.snapshot();
    if (!force && state.sourceItemCode === safeCode && (state.sourceLoading || state.sourceDesc || state.sourceError)) {
      return;
    }
    const ticket = this.nextSourceTicket();
    this.bagState.startSourceLoading(safeCode);
    this.refreshIfActive();
    const fragmentItem = this.findItem(safeCode);
    if (fragmentItem && isHeroFragmentItem(fragmentItem)) {
      this.bagState.applySourceLoaded(safeCode, heroFragmentSourceDesc(fragmentItem));
      this.refreshIfActive();
      return;
    }
    try {
      const source = await this.bagApi.source(safeCode);
      if (!this.isCurrentSource(ticket)) {
        return;
      }
      this.bagState.applySourceLoaded(safeCode, source.sourceDesc ?? '');
    } catch (error) {
      if (!this.isCurrentSource(ticket)) {
        return;
      }
      this.bagState.applySourceError(safeCode, error);
      console.warn('[LootChain] lobby bag source load failed:', error);
    } finally {
      if (this.isCurrentSource(ticket)) {
        this.refreshIfActive();
      }
    }
  }

  private nextLoadTicket(): number {
    this.loadTicket += 1;
    return this.loadTicket;
  }

  private nextSourceTicket(): number {
    this.sourceTicket += 1;
    return this.sourceTicket;
  }

  private isCurrentLoad(ticket: number): boolean {
    return ticket === this.loadTicket;
  }

  private isCurrentSource(ticket: number): boolean {
    return ticket === this.sourceTicket;
  }

  private findItem(itemCode: string): BagItemEntryVO | null {
    return this.bagState.snapshot().groups.flatMap((group) => group.items).find((item) => item.itemCode === itemCode) ?? null;
  }

  private refreshIfActive(): void {
    if (this.host.isLobbyViewActive()) {
      this.host.refreshLobbyOverlay();
    }
  }
}

function mergeBagGroupsWithFragments(groups: ItemTypeBagGroupVO[], fragments: UserHeroFragmentVO[]): ItemTypeBagGroupVO[] {
  const fragmentItems = (fragments ?? [])
    .filter((fragment) => fragment && fragment.heroCode && Number(fragment.fragmentCount) > 0)
    .map(toFragmentBagItem);
  if (fragmentItems.length === 0) {
    return groups ?? [];
  }
  return [
    ...(groups ?? []),
    {
      itemType: 'HERO_FRAGMENT',
      itemTypeLabel: '英雄碎片',
      items: fragmentItems,
    },
  ];
}

function toFragmentBagItem(fragment: UserHeroFragmentVO, index: number): BagItemEntryVO {
  const heroCode = safeText(fragment.heroCode || `HERO_${index}`);
  const heroName = safeText(fragment.heroName || heroCode);
  return {
    bagId: -100000 - index,
    itemCode: `HERO_FRAGMENT:${heroCode}`,
    itemName: `${heroName}碎片`,
    itemType: 'HERO_FRAGMENT',
    rarity: safeText(fragment.rarity || 'R'),
    itemCount: Math.max(0, Math.floor(Number(fragment.fragmentCount) || 0)),
    expireTime: null,
    maxStack: 999999,
    sellGold: 0,
    useEffectType: '重复英雄转化碎片',
  };
}

function isHeroFragmentItem(item: BagItemEntryVO): boolean {
  return (item.itemType || '').toUpperCase() === 'HERO_FRAGMENT' || item.itemCode.startsWith('HERO_FRAGMENT:');
}

function heroFragmentSourceDesc(item: BagItemEntryVO): string {
  return `${safeText(item.itemName)}来自重复抽到同名英雄后的自动转化，当前只读展示，不提供兑换、升星或资源变更入口。`;
}

function safeText(value: string): string {
  return String(value ?? '').trim();
}
