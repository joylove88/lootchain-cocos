import type { ProtagonistCreateFormState, ProtagonistGender, ProtagonistLocalProfile, ProtagonistServerProfile } from '../../types/ProtagonistTypes';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const STORAGE_PREFIX = 'lootchain.protagonist.preview.v1.';
const DEFAULT_ATTACK_FORM = 'attack';
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 12;

/** 主角色创建页状态。当前以服务端创建为准，本地存储只保留预览镜像，不能当成正式数据。 */
export class ProtagonistCreateState {
  private readonly memoryProfiles = new Map<number, ProtagonistLocalProfile>();
  private formState: ProtagonistCreateFormState = this.createInitialState(0);
  private revision = 0;

  get version(): number {
    return this.revision;
  }

  beginCreate(userId: number): void {
    // 每次进入创建页都重置表单，避免上一账号的性别/名字残留到新账号。
    this.formState = this.createInitialState(userId);
    this.bump();
  }

  snapshot(): ProtagonistCreateFormState {
    return {
      ...this.formState,
      version: this.revision,
    };
  }

  setGender(gender: ProtagonistGender): void {
    this.formState = {
      ...this.formState,
      selectedGender: gender,
      error: '',
    };
    this.bump();
  }

  setName(name: string): void {
    this.formState = {
      ...this.formState,
      protagonistName: name.trim(),
      error: '',
    };
    this.bump();
  }

  setError(error: string): void {
    this.formState = {
      ...this.formState,
      error,
      creating: false,
    };
    this.bump();
  }

  startCreating(): void {
    this.formState = {
      ...this.formState,
      creating: true,
      error: '',
    };
    this.bump();
  }

  hasProfile(userId: number): boolean {
    return !!this.loadProfile(userId);
  }

  rememberServerProfile(profile: ProtagonistServerProfile): void {
    const localProfile: ProtagonistLocalProfile = {
      userId: profile.userId,
      gender: profile.gender,
      protagonistName: profile.protagonistName,
      rarity: 'SSR',
      selectedForm: profile.currentForm,
      createdAt: new Date().toISOString(),
    };
    // 服务端创建成功后仅保存一个本地镜像，方便预览排查；是否已创建仍以后端 state 接口为准。
    this.memoryProfiles.set(profile.userId, localProfile);
    this.storage()?.setItem(this.storageKey(profile.userId), JSON.stringify(localProfile));
    this.formState = {
      ...this.formState,
      protagonistName: profile.protagonistName,
      selectedGender: profile.gender,
      selectedForm: profile.currentForm,
      creating: false,
      error: '',
    };
    this.bump();
  }

  loadProfile(userId: number): ProtagonistLocalProfile | null {
    const memory = this.memoryProfiles.get(userId);
    if (memory) {
      return memory;
    }
    const storage = this.storage();
    const raw = storage?.getItem(this.storageKey(userId));
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<ProtagonistLocalProfile>;
      if (this.isValidProfile(userId, parsed)) {
        this.memoryProfiles.set(userId, parsed);
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }

  createLocalProfile(userId: number, rawName: string): ProtagonistLocalProfile | null {
    const name = rawName.trim();
    const error = this.validateName(name);
    if (error) {
      this.setError(error);
      return null;
    }
    const profile: ProtagonistLocalProfile = {
      userId,
      gender: this.formState.selectedGender,
      protagonistName: name,
      rarity: 'SSR',
      selectedForm: DEFAULT_ATTACK_FORM,
      createdAt: new Date().toISOString(),
    };
    // 仅作为离线预览兜底；正式流程不得依赖此方法判断是否已创建。
    this.memoryProfiles.set(userId, profile);
    this.storage()?.setItem(this.storageKey(userId), JSON.stringify(profile));
    this.formState = {
      ...this.formState,
      protagonistName: name,
      creating: false,
      error: '',
    };
    this.bump();
    return profile;
  }

  validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN_LENGTH) {
      return '角色名至少需要 2 个字符。';
    }
    if (trimmed.length > NAME_MAX_LENGTH) {
      return '角色名最多 12 个字符。';
    }
    if (!/^[\u4e00-\u9fa5A-Za-z0-9_]+$/.test(trimmed)) {
      return '角色名仅支持中文、英文、数字和下划线。';
    }
    return '';
  }

  private createInitialState(userId: number): ProtagonistCreateFormState {
    return {
      userId,
      selectedGender: 'male',
      protagonistName: `圣契${userId || 1}`,
      selectedForm: DEFAULT_ATTACK_FORM,
      error: '',
      creating: false,
      version: this.revision,
    };
  }

  private bump(): void {
    this.revision += 1;
  }

  private storageKey(userId: number): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  private storage(): StorageLike | null {
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
    if (!candidate || typeof candidate.getItem !== 'function' || typeof candidate.setItem !== 'function') {
      return null;
    }
    return candidate;
  }

  private isValidProfile(userId: number, value: Partial<ProtagonistLocalProfile>): value is ProtagonistLocalProfile {
    return (
      value.userId === userId &&
      (value.gender === 'male' || value.gender === 'female') &&
      typeof value.protagonistName === 'string' &&
      value.protagonistName.length >= NAME_MIN_LENGTH &&
      value.rarity === 'SSR' &&
      value.selectedForm === DEFAULT_ATTACK_FORM &&
      typeof value.createdAt === 'string'
    );
  }
}
