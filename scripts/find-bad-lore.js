const { Characters, Locations, Items, Traps, Magic } = require('../src/database');

// 영어가 포함되어 있거나 너무 짧은 loreDescription 찾기
function hasBadLore(lore) {
  if (!lore) return true;

  // 영어 문장이 포함되어 있는지 (따옴표 안의 영어 인용문)
  const hasEnglishQuote = /[""][A-Za-z]/.test(lore);

  // 영어 단어가 많이 포함되어 있는지
  const englishWords = lore.match(/[A-Za-z]{4,}/g) || [];
  const hasLotsOfEnglish = englishWords.length > 3;

  // 너무 짧은지 (30자 미만)
  const tooShort = lore.length < 30;

  return hasEnglishQuote || hasLotsOfEnglish || tooShort;
}

function checkCategory(category, name) {
  const items = category.getAll();
  const badItems = items.filter(i => hasBadLore(i.loreDescription));

  if (badItems.length > 0) {
    console.log(`\n=== ${name}: ${badItems.length}개 문제 발견 ===`);
    badItems.forEach(i => {
      console.log(`  - ${i.name}`);
      console.log(`    "${(i.loreDescription || '').substring(0, 80)}..."`);
    });
  } else {
    console.log(`\n=== ${name}: 문제 없음 ===`);
  }

  return badItems;
}

console.log('=== loreDescription 품질 검사 ===');
console.log('기준: 영어 인용문 포함, 영어 단어 4개 이상, 30자 미만\n');

const badChars = checkCategory(Characters, 'Characters');
const badLocs = checkCategory(Locations, 'Locations');
const badItems = checkCategory(Items, 'Items');
const badTraps = checkCategory(Traps, 'Traps');
const badMagic = checkCategory(Magic, 'Magic');

const total = badChars.length + badLocs.length + badItems.length + badTraps.length + badMagic.length;
console.log(`\n=== 총 ${total}개 수정 필요 ===`);
