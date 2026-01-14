const { Characters, Locations, Items, Traps, Magic } = require('../src/database');

// 레어도별 loreDescription 확인
const checkLore = (category, name) => {
  const items = category.getAll();

  const byRarity = {
    mythic: items.filter(i => i.cardStats?.rarity === 'mythic'),
    rare: items.filter(i => i.cardStats?.rarity === 'rare'),
    uncommon: items.filter(i => i.cardStats?.rarity === 'uncommon'),
    common: items.filter(i => i.cardStats?.rarity === 'common'),
    other: items.filter(i => !i.cardStats?.rarity)
  };

  console.log(`\n=== ${name} (총 ${items.length}개) ===`);

  Object.entries(byRarity).forEach(([rarity, cards]) => {
    if (cards.length === 0) return;
    const missing = cards.filter(i => !i.loreDescription || i.loreDescription === '');
    console.log(`  ${rarity}: ${cards.length}개, 누락: ${missing.length}`);
    if (missing.length > 0) {
      missing.forEach(i => console.log(`    - ${i.name}`));
    }
  });
};

console.log('=== loreDescription 검증 ===');
checkLore(Characters, 'Characters');
checkLore(Locations, 'Locations');
checkLore(Items, 'Items');
checkLore(Traps, 'Traps');
checkLore(Magic, 'Magic');

console.log('\n=== 전체 요약 ===');
console.log('Characters:', Characters.getAll().length);
console.log('Locations:', Locations.getAll().length);
console.log('Items:', Items.getAll().length);
console.log('Traps:', Traps.getAll().length);
console.log('Magic:', Magic.getAll().length);
console.log('총계:', Characters.getAll().length + Locations.getAll().length + Items.getAll().length + Traps.getAll().length + Magic.getAll().length);
