const Scryfall = require('../src/scryfall');

async function checkCommons() {
  console.log('zen 세트 커먼 카드 조회 중...\n');

  const result = await Scryfall.search('set:zen rarity:common');

  if (!result.cards || result.cards.length === 0) {
    console.log('카드를 찾을 수 없습니다.');
    return;
  }

  // 기본 대지 제외
  const commons = result.cards.filter(c => !c.typeLine.includes('Basic Land'));

  console.log(`총 커먼: ${result.cards.length}개`);
  console.log(`기본 대지 제외: ${commons.length}개\n`);

  // 타입별 분류
  const types = {
    creature: [],
    land: [],
    instant: [],
    sorcery: [],
    enchantment: [],
    artifact: [],
    other: []
  };

  commons.forEach(card => {
    const typeLine = card.typeLine.toLowerCase();
    if (typeLine.includes('creature')) {
      types.creature.push(card);
    } else if (typeLine.includes('land')) {
      types.land.push(card);
    } else if (typeLine.includes('instant')) {
      types.instant.push(card);
    } else if (typeLine.includes('sorcery')) {
      types.sorcery.push(card);
    } else if (typeLine.includes('enchantment')) {
      types.enchantment.push(card);
    } else if (typeLine.includes('artifact')) {
      types.artifact.push(card);
    } else {
      types.other.push(card);
    }
  });

  console.log('=== 타입별 분류 ===');
  console.log(`Creature: ${types.creature.length}개 → Characters`);
  console.log(`Land: ${types.land.length}개 → Locations`);
  console.log(`Instant: ${types.instant.length}개 → Magic`);
  console.log(`Sorcery: ${types.sorcery.length}개 → Magic`);
  console.log(`Enchantment: ${types.enchantment.length}개 → Magic`);
  console.log(`Artifact: ${types.artifact.length}개 → Items`);
  console.log(`Other: ${types.other.length}개`);

  console.log('\n=== Creature 목록 ===');
  types.creature.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  console.log('\n=== Land 목록 ===');
  types.land.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  console.log('\n=== Instant 목록 ===');
  types.instant.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  console.log('\n=== Sorcery 목록 ===');
  types.sorcery.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  console.log('\n=== Enchantment 목록 ===');
  types.enchantment.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  console.log('\n=== Artifact 목록 ===');
  types.artifact.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));

  if (types.other.length > 0) {
    console.log('\n=== Other 목록 ===');
    types.other.forEach(c => console.log(`  - ${c.name} (${c.typeLine})`));
  }

  return types;
}

checkCommons();
