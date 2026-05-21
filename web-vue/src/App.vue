<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  clearPlayerToken,
  defaultApiBaseUrl,
  devLogin,
  loadPlayerToken,
  savePlayerToken,
  type PlayerToken,
} from './api/playerAuth';

const apiBaseUrl = ref(defaultApiBaseUrl());
const accountIdentifier = ref('1');
const password = ref('');
const loading = ref(false);
const loginDialogOpen = ref(false);
const cachedToken = loadPlayerToken();
const status = ref(cachedToken ? '检测到本地凭证，请重新登录完成本阶段验收。' : '等待圣契召唤。');
const token = ref<PlayerToken | null>(null);

if (cachedToken) {
  clearPlayerToken();
}

const isLoggedIn = computed(() => Boolean(token.value));

function openLoginDialog(): void {
  loginDialogOpen.value = true;
  status.value = '请输入账号与密码。';
}

function closeLoginDialog(): void {
  if (!loading.value) {
    loginDialogOpen.value = false;
  }
}

async function loginWithAccount(): Promise<void> {
  if (loading.value) {
    return;
  }
  const account = accountIdentifier.value.trim();
  if (!account) {
    status.value = '请输入账号或邮箱。';
    return;
  }
  if (!password.value) {
    status.value = '请输入密码。';
    return;
  }

  const parsedUserId = Number(account);
  const devUserId = Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : 1;

  loading.value = true;
  status.value = '正在连接永夜圣契...';
  try {
    const nextToken = await devLogin(apiBaseUrl.value, devUserId);
    savePlayerToken(nextToken);
    token.value = nextToken;
    loginDialogOpen.value = false;
    status.value = `登录成功：${nextToken.tokenName}`;
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
  } finally {
    loading.value = false;
  }
}

function comingSoon(): void {
  status.value = '功能即将开放。';
}

function resetLogin(): void {
  clearPlayerToken();
  token.value = null;
  status.value = '等待圣契召唤。';
}
</script>

<template>
  <main class="login-screen" :class="{ 'is-logged-in': isLoggedIn }">
    <div class="painted-background" aria-hidden="true"></div>
    <div class="background-base" aria-hidden="true"></div>
    <div class="cloud-layer cloud-layer-a" aria-hidden="true"></div>
    <div class="cloud-layer cloud-layer-b" aria-hidden="true"></div>

    <section class="hero-stage" aria-label="LootChain 登录">
      <div class="brand-mark">
        <img class="brand-logo-art" src="./assets/login-logo-v12-alpha.png" alt="LootChain Silent Gods" />
      </div>

      <div v-if="!isLoggedIn" class="main-login-entry">
        <button class="login-button primary main-login-button" type="button" @click="openLoginDialog">
          <span class="button-icon account-icon"></span>
          <span>账号登录</span>
        </button>
      </div>

      <div v-else class="login-success">
        <p>登录验收通过</p>
        <strong>{{ token?.tokenName }}</strong>
        <button class="login-button primary" type="button" @click="resetLogin">重新登录</button>
      </div>
    </section>

    <aside class="right-rail" aria-label="侧边功能入口">
      <button type="button" aria-label="谕言" @click="comingSoon">
        <img src="./assets/rail-prophecy-icon-v15.png" alt="" aria-hidden="true" />
        <span>谕言</span>
      </button>
      <button type="button" aria-label="客服" @click="comingSoon">
        <img src="./assets/rail-service-icon-v15.png" alt="" aria-hidden="true" />
        <span>客服</span>
      </button>
      <button type="button" aria-label="公告" @click="comingSoon">
        <img src="./assets/rail-notice-icon-v15.png" alt="" aria-hidden="true" />
        <span>公告</span>
      </button>
      <button type="button" aria-label="修复" @click="comingSoon">
        <img src="./assets/rail-repair-icon-v15.png" alt="" aria-hidden="true" />
        <span>修复</span>
      </button>
    </aside>

    <div v-if="loginDialogOpen && !isLoggedIn" class="login-dialog-layer" @click.self="closeLoginDialog">
      <section class="login-dialog" aria-label="账号登录">
        <button class="dialog-close" :disabled="loading" type="button" aria-label="关闭" @click="closeLoginDialog">×</button>
        <h2>账号登录</h2>
        <p class="dialog-subtitle">暗影之下，圣契永恒</p>

        <label class="login-field">
          <span>账号 / 邮箱</span>
          <input v-model.trim="accountIdentifier" autocomplete="username" placeholder="请输入账号或邮箱" />
        </label>
        <label class="login-field">
          <span>密码</span>
          <input v-model="password" autocomplete="current-password" placeholder="请输入密码" type="password" />
        </label>
        <p class="dialog-status" role="status">{{ status }}</p>

        <button class="login-button primary dialog-submit" :disabled="loading" type="button" @click="loginWithAccount">
          <span>{{ loading ? '连接中' : '进入游戏' }}</span>
        </button>

        <div class="other-login">
          <span></span>
          <p>其他登录方式</p>
          <span></span>
        </div>
        <div class="social-row">
          <button aria-label="Google 登录" type="button" @click="comingSoon">G</button>
          <button aria-label="Apple 登录" type="button" @click="comingSoon">A</button>
          <button aria-label="Discord 登录" type="button" @click="comingSoon">D</button>
          <button aria-label="X 登录" type="button" @click="comingSoon">X</button>
        </div>

        <label class="agreement">
          <input checked type="checkbox" />
          <span>我已阅读并同意《用户协议》和《隐私政策》</span>
        </label>
      </section>
    </div>

    <div v-if="!loginDialogOpen || isLoggedIn" class="status-line" role="status">{{ status }}</div>
    <div class="version">v1.0.0.1023</div>
  </main>
</template>
