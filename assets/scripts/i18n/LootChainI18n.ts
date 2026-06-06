import { sys } from 'cc';

export type LootChainLanguage = 'zh-CN' | 'en-US';

export type LootChainI18nKey =
  | 'common.back'
  | 'language.changed'
  | 'language.current'
  | 'language.english'
  | 'language.simplifiedChinese'
  | 'language.title'
  | 'language.subtitle'
  | 'login.rightRail.language'
  | 'login.rightRail.placeholder'
  | 'lobby.system.friends'
  | 'lobby.system.mail'
  | 'lobby.system.settings'
  | 'lobby.system.menu'
  | 'lobby.system.unopenedDetail'
  | 'settings.title'
  | 'settings.languageRow'
  | 'settings.languageDetail';

const LANGUAGE_STORAGE_KEY = 'lootchain.player.language';
const DEFAULT_LANGUAGE: LootChainLanguage = 'zh-CN';

const LANGUAGE_LABELS: Record<LootChainLanguage, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

const DICTIONARY: Record<LootChainLanguage, Record<LootChainI18nKey, string>> = {
  'zh-CN': {
    'common.back': '返回',
    'language.changed': '已切换为{language}。',
    'language.current': '当前语言',
    'language.english': 'English',
    'language.simplifiedChinese': '简体中文',
    'language.title': '语言',
    'language.subtitle': '选择显示语言',
    'login.rightRail.language': '语言',
    'login.rightRail.placeholder': '该入口为登录页占位，当前阶段暂未开放。',
    'lobby.system.friends': '好友',
    'lobby.system.mail': '邮件',
    'lobby.system.settings': '设置',
    'lobby.system.menu': '更多菜单',
    'lobby.system.unopenedDetail': '系统入口暂未开放；当前仅保留本地占位反馈，不读取或写入系统数据。',
    'settings.title': '设置',
    'settings.languageRow': '语言',
    'settings.languageDetail': '选择显示语言',
  },
  'en-US': {
    'common.back': 'Back',
    'language.changed': 'Language set to {language}.',
    'language.current': 'Current language',
    'language.english': 'English',
    'language.simplifiedChinese': 'Simplified Chinese',
    'language.title': 'Language',
    'language.subtitle': 'Choose display language',
    'login.rightRail.language': 'Lang',
    'login.rightRail.placeholder': 'This login entry is a placeholder for the current stage.',
    'lobby.system.friends': 'Friends',
    'lobby.system.mail': 'Mail',
    'lobby.system.settings': 'Settings',
    'lobby.system.menu': 'More',
    'lobby.system.unopenedDetail': 'This system entry is not open yet. It only shows local placeholder feedback.',
    'settings.title': 'Settings',
    'settings.languageRow': 'Language',
    'settings.languageDetail': 'Choose display language',
  },
};

type Interpolation = Record<string, string | number>;

const STATIC_TEXT_TRANSLATIONS: Partial<Record<LootChainLanguage, Record<string, string>>> = {
  'en-US': {
    '预言': 'Lang',
    '客服': 'Support',
    '公告': 'Notice',
    '修复': 'Repair',
    '账号登录': 'Account Login',
    '等待圣契召唤。': 'Waiting for covenant summons.',
    '使用测试账号进入 LootChain 当前 Cocos 阶段': 'Use a test account to enter the current Cocos stage',
    '账号 / 邮箱': 'Account / Email',
    '密码': 'Password',
    '进入游戏': 'Enter Game',
    '返回登录': 'Back',
    '当前阶段只接入 dev-login；账号为数字时作为 User ID。': 'Current stage only uses dev-login; numeric account is treated as User ID.',
    '其他登录方式': 'Other Login Methods',
    '第三方登录暂未开放。': 'Third-party login is not open yet.',
    '我已阅读并同意《用户协议》和《隐私政策》': 'I have read and agree to the User Agreement and Privacy Policy',
    '该入口为登录页占位，当前阶段暂未开放。': 'This login entry is a placeholder for the current stage.',
    '请求中...': 'Requesting...',
    'Please accept the user agreement and privacy policy first.': 'Please accept the user agreement and privacy policy first.',
    '资源加载中': 'Loading Resources',
    '重试加载': 'Retry',
    '好友': 'Friends',
    '邮件': 'Mail',
    '设置': 'Settings',
    '更多菜单': 'More',
    '语言': 'Language',
    '当前语言': 'Current language',
    '选择显示语言': 'Choose display language',
    '简体中文': 'Simplified Chinese',
    'English': 'English',
    '返回': 'Back',
    '全部': 'All',
    '英雄': 'Heroes',
    '背包': 'Bag',
    '契约': 'Contract',
    '图鉴': 'Codex',
    '任务': 'Quests',
    '锻造': 'Forge',
    '商店': 'Shop',
    '召唤': 'Summon',
    '主线': 'Main',
    '冒险': 'Adventure',
    '编队': 'Formation',
    '详情': 'Details',
    '只读': 'Read Only',
    '刷新': 'Refresh',
    '已同步': 'Synced',
    '拥有': 'Owned',
    '战力': 'Power',
    '等级': 'Level',
    '升级关闭': 'Upgrade Closed',
    '养成入口未开放': 'Growth Closed',
    '限定召唤': 'Limited Summon',
    '普通召唤': 'Normal Summon',
    '光暗召唤': 'Light/Dark Summon',
    '单次召唤': 'Single Summon',
    '十连召唤': 'Ten Summons',
    '召唤1次': 'Summon 1',
    '召唤10次': 'Summon 10',
    '召唤结果': 'Summon Result',
    '返回召唤': 'Back to Summon',
    '兑换未开放': 'Exchange Closed',
    '补发未开放': 'Reissue Closed',
    '概率提升预览': 'Rate Up Preview',
    '卡池详情': 'Pool Details',
    '召唤记录': 'Summon Logs',
    '背包只读': 'Bag Read Only',
    '使用/出售关闭': 'Use/Sell Disabled',
    '道具': 'Items',
    '碎片': 'Fragments',
    '英雄碎片': 'Hero Fragments',
    '装备': 'Equipment',
    '材料': 'Materials',
    '消耗品': 'Consumables',
    '普通': 'Normal',
    '坦克': 'Tank',
    '近战': 'Melee',
    '远程': 'Ranged',
    '物理': 'Physical',
    '法术': 'Magic',
    '职业': 'Class',
    '阵营': 'Faction',
    '品质': 'Rarity',
    '星级': 'Stars',
    '请选择语言': 'Choose Language',
    '点击空白关闭': 'Tap outside to close',
    '该道具不在当前背包列表中。': 'This item is not in the current bag list.',
    '该主线关卡暂不可选，请刷新冒险面板。': 'This main stage is not selectable. Refresh the adventure panel.',
    '该英雄当前不可查看详情。': 'This hero cannot be opened right now.',
    '该英雄当前不可上阵。': 'This hero cannot join the formation right now.',
    '主角当前固定为队长，不能从本次阵容移除。': 'The protagonist is fixed as leader and cannot be removed.',
    '正在读取召唤卡池配置。': 'Loading summon pool configuration.',
    '该卡池配置不存在，请刷新召唤页。': 'This pool configuration is missing. Refresh the summon page.',
    '当前没有可读取的召唤卡池。': 'No summon pools are available.',
    '当前卡池缺少真实 poolCode，无法召唤。': 'This pool is missing a real poolCode and cannot summon.',
    '该卡池暂未开放真实抽卡。': 'Real draws are not open for this pool.',
    '召唤请求处理中，请勿重复点击。': 'Summon request is processing. Do not tap repeatedly.',
    '召唤演出为本地 mock：不生成 drawNo、不扣资源、不发英雄。': 'Summon animation is local mock: no drawNo, no cost, no hero grant.',
    '本地结果预览：不扣资源、不发英雄、不写入抽卡记录或保底。': 'Local result preview: no cost, no hero grant, no draw log or pity write.',
    '查看本地 mock 结果：仍不扣资源、不发英雄、不写入抽卡记录或保底。': 'Viewing local mock result: no cost, no hero grant, no draw log or pity write.',
    '已关闭召唤结果，兑换和补发入口仍未开放。': 'Summon result closed; exchange and reissue remain closed.',
    '已返回召唤页；兑换和补发入口仍未开放。': 'Returned to summon page; exchange and reissue remain closed.',
    '正在检查主角色状态...': 'Checking protagonist status...',
    '请先创建你的圣契主角。': 'Create your covenant protagonist first.',
    '攻击形态已默认解锁。': 'Attack form is unlocked by default.',
    '该形态需要通过主线剧情道具解锁。': 'This form requires a main story item to unlock.',
    '主角色创建中，请勿重复提交。': 'Creating protagonist. Do not submit repeatedly.',
    '战斗演出完成，可记录无奖励结果。': 'Battle animation complete. No-reward result can be recorded.',
    '战斗记录完成，奖励未开放。': 'Battle log complete. Rewards are not open.',
    '关卡选择已失效，请重新选择主线关卡。': 'Stage selection expired. Choose a main stage again.',
  },
};

class LootChainI18n {
  private language: LootChainLanguage = this.loadLanguage();

  currentLanguage(): LootChainLanguage {
    return this.language;
  }

  setLanguage(language: LootChainLanguage): LootChainLanguage {
    this.language = language;
    this.saveLanguage(language);
    return this.language;
  }

  toggleLanguage(): LootChainLanguage {
    return this.setLanguage(this.language === 'zh-CN' ? 'en-US' : 'zh-CN');
  }

  languageLabel(language: LootChainLanguage = this.language): string {
    return LANGUAGE_LABELS[language];
  }

  t(key: LootChainI18nKey, params?: Interpolation): string {
    const template = DICTIONARY[this.language][key] ?? DICTIONARY[DEFAULT_LANGUAGE][key] ?? key;
    if (!params) {
      return template;
    }
    return Object.entries(params).reduce(
      (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
      template,
    );
  }

  text(value: string): string {
    if (!value || this.language === DEFAULT_LANGUAGE) {
      return value;
    }
    return STATIC_TEXT_TRANSLATIONS[this.language]?.[value] ?? this.translateDynamicText(value);
  }

  private translateDynamicText(value: string): string {
    const battlePower = value.match(/^战力\s*(.+)$/);
    if (battlePower) {
      return `Power ${battlePower[1]}`;
    }
    const closed = value.match(/^(.+) 暂未开放。$/);
    if (closed) {
      return `${closed[1]} is not open yet.`;
    }
    const selected = value.match(/^(.+) 已选中。$/);
    if (selected) {
      return `${selected[1]} selected.`;
    }
    const joined = value.match(/^(.+) 已加入本次阵容。$/);
    if (joined) {
      return `${joined[1]} joined this formation.`;
    }
    const removed = value.match(/^(.+) 已移出本次阵容。$/);
    if (removed) {
      return `${removed[1]} removed from this formation.`;
    }
    const unlockedPreview = value.match(/^(.+) 尚未解锁，当前只展示预告。$/);
    if (unlockedPreview) {
      return `${unlockedPreview[1]} is locked and only shown as preview.`;
    }
    const unlockedFormation = value.match(/^(.+) 尚未解锁，当前只展示预告，不会进入编队。$/);
    if (unlockedFormation) {
      return `${unlockedFormation[1]} is locked and only shown as preview; formation will not open.`;
    }
    const stageSelected = value.match(/^已选择 (.+)，可进入编队确认。$/);
    if (stageSelected) {
      return `${stageSelected[1]} selected. Formation confirmation is available.`;
    }
    const completed = value.match(/^召唤完成：(.+)$/);
    if (completed) {
      return `Summon complete: ${completed[1]}`;
    }
    const failed = value.match(/^召唤失败：(.+)$/);
    if (failed) {
      return `Summon failed: ${failed[1]}`;
    }
    const loadingFailed = value.match(/^召唤卡池读取失败，已使用本地展示兜底：(.+)$/);
    if (loadingFailed) {
      return `Pool loading failed; local fallback is shown: ${loadingFailed[1]}`;
    }
    const pityFailed = value.match(/^保底信息读取失败：(.+)$/);
    if (pityFailed) {
      return `Pity loading failed: ${pityFailed[1]}`;
    }
    const detailFailed = value.match(/^卡池详情读取失败：(.+)$/);
    if (detailFailed) {
      return `Pool detail loading failed: ${detailFailed[1]}`;
    }
    const logFailed = value.match(/^召唤记录读取失败：(.+)$/);
    if (logFailed) {
      return `Summon log loading failed: ${logFailed[1]}`;
    }
    const battleCreated = value.match(/^战斗会话已创建：(.+)$/);
    if (battleCreated) {
      return `Battle session created: ${battleCreated[1]}`;
    }
    const battleCreateFailed = value.match(/^战斗会话创建失败：(.+)$/);
    if (battleCreateFailed) {
      return `Battle session creation failed: ${battleCreateFailed[1]}`;
    }
    const battleRecordFailed = value.match(/^战斗记录失败：(.+)$/);
    if (battleRecordFailed) {
      return `Battle log failed: ${battleRecordFailed[1]}`;
    }
    return value;
  }

  private loadLanguage(): LootChainLanguage {
    try {
      const value = sys.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return this.isLanguage(value) ? value : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  private saveLanguage(language: LootChainLanguage): void {
    try {
      sys.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Local storage can be unavailable in restricted preview containers; the in-memory value still applies.
    }
  }

  private isLanguage(value: string | null): value is LootChainLanguage {
    return value === 'zh-CN' || value === 'en-US';
  }
}

export const lootChainI18n = new LootChainI18n();
