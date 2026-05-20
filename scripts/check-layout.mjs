import { existsSync } from 'node:fs';

const required = [
  'assets/scripts/app/AppConfig.ts',
  'assets/scripts/net/HttpClient.ts',
  'assets/scripts/api/PlayerAuthApi.ts',
  'assets/scripts/api/GachaApi.ts',
  'assets/scripts/api/HeroApi.ts',
  'assets/scripts/api/BagApi.ts',
  'assets/scripts/scenes/LootChainGameRoot.ts',
  'assets/scripts/scenes/LootChainLoginEffectLayer.ts',
  'docs/api-contract.md',
  'docs/web-h5-build.md',
  'docs/art-vfx-pipeline.md',
];

let ok = true;
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`missing: ${file}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('layout ok');
