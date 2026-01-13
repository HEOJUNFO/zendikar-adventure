const { Characters, Locations, Items, Traps, Magic } = require('../src/database');

// 언커먼 카드만 필터링해서 loreDescription 확인
const checkLore = (category, name) => {
  const items = category.getAll();
  const uncommons = items.filter(i => i.cardStats && i.cardStats.rarity === 'uncommon');
  const missing = uncommons.filter(i => !i.loreDescription || i.loreDescription === '');
  console.log(name + ': ' + uncommons.length + '개 언커먼, loreDescription 누락: ' + missing.length);
  if (missing.length > 0) {
    missing.forEach(i => console.log('  - ' + i.name));
  }
};

checkLore(Characters, 'Characters');
checkLore(Locations, 'Locations');
checkLore(Items, 'Items');
checkLore(Traps, 'Traps');
checkLore(Magic, 'Magic');

console.log('\n=== 전체 통계 ===');
console.log('Characters: ' + Characters.getAll().length);
console.log('Locations: ' + Locations.getAll().length);
console.log('Items: ' + Items.getAll().length);
console.log('Traps: ' + Traps.getAll().length);
console.log('Magic: ' + Magic.getAll().length);
