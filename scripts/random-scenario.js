const { Characters, Locations, Items, Magic, Traps, Factions } = require('../src/database');

function randomPick(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

function generateScenario() {
  const chars = Characters.getAll();
  const locs = Locations.getAll();
  const items = Items.getAll();
  const magics = Magic.getAll();
  const traps = Traps.getAll();
  const factions = Factions.getAll();

  // 주인공 (플레이어블 캐릭터 또는 새 캐릭터의 베이스)
  const protagonist = randomPick(chars);

  // 조력자 또는 동료
  const ally = randomPick(chars.filter(c => c.id !== protagonist.id));

  // 시작 장소
  const startLocation = randomPick(locs);

  // 목표 장소 (다른 곳)
  const goalLocation = randomPick(locs.filter(l => l.id !== startLocation.id));

  // 발견할 아이템
  const questItem = randomPick(items);

  // 직면할 함정
  const trap = randomPick(traps);

  // 등장하는 마법 (모든 색상)
  const magic = randomPick(magics);

  // 관련 세력
  const faction = randomPick(factions);

  // 시나리오 훅 생성
  const hooks = [
    `${protagonist.name}은(는) ${startLocation.name}에서 ${questItem.name}에 대한 소문을 듣는다.`,
    `${faction.name}이(가) ${goalLocation.name}에서 무언가를 찾고 있다는 정보가 들려온다.`,
    `${startLocation.name}에 로완 현상의 전조가 나타나기 시작한다.`,
    `${ally.name}이(가) 긴급한 도움을 요청하며 나타난다.`,
    `고대 헤드론에서 이상한 빛이 뿜어져 나온다.`
  ];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🎲 젠디카르 어드벤처 - 1화 시나리오 생성기');
  console.log('═══════════════════════════════════════════════════════════');

  console.log('\n【 주인공 】');
  console.log(`  이름: ${protagonist.name}`);
  console.log(`  종족/직업: ${protagonist.race || ''} ${protagonist.class || ''}`);
  console.log(`  배경: ${protagonist.loreDescription || protagonist.description}`);
  if (protagonist.cardRef?.image) {
    console.log(`  이미지: ${protagonist.cardRef.image}`);
  }

  console.log('\n【 동료/조력자 】');
  console.log(`  이름: ${ally.name}`);
  console.log(`  종족/직업: ${ally.race || ''} ${ally.class || ''}`);
  console.log(`  배경: ${ally.loreDescription || ally.description}`);

  console.log('\n【 시작 장소 】');
  console.log(`  이름: ${startLocation.name}`);
  console.log(`  유형: ${startLocation.type || ''}`);
  console.log(`  설명: ${startLocation.loreDescription || startLocation.description}`);

  console.log('\n【 목표 장소 】');
  console.log(`  이름: ${goalLocation.name}`);
  console.log(`  유형: ${goalLocation.type || ''}`);
  console.log(`  설명: ${goalLocation.loreDescription || goalLocation.description}`);

  console.log('\n【 퀘스트 아이템 】');
  console.log(`  이름: ${questItem.name}`);
  console.log(`  유형: ${questItem.type || ''}`);
  console.log(`  설명: ${questItem.loreDescription || questItem.description}`);

  console.log('\n【 함정 】');
  console.log(`  이름: ${trap.name}`);
  console.log(`  유형: ${trap.type || ''}`);
  console.log(`  효과: ${trap.loreDescription || trap.description}`);

  console.log('\n【 마법 】');
  console.log(`  이름: ${magic.name}`);
  console.log(`  유형: ${magic.type || ''}`);
  console.log(`  색상: ${magic.cardStats?.colors?.join('/') || 'colorless'}`);
  console.log(`  효과: ${magic.loreDescription || magic.description}`);

  console.log('\n【 관련 세력 】');
  console.log(`  이름: ${faction.name}`);
  console.log(`  목표: ${faction.goals?.join(', ') || ''}`);
  console.log(`  배경: ${faction.loreDescription || faction.description}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   📖 시나리오 훅 (도입부 아이디어)');
  console.log('═══════════════════════════════════════════════════════════');
  hooks.forEach((hook, i) => {
    console.log(`  ${i + 1}. ${hook}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   💡 1화 플롯 제안');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`
  ${protagonist.name}은(는) ${startLocation.name}에서 평범한 하루를 보내고 있었다.
  그러던 중 ${ally.name}을(를) 만나게 되고, ${questItem.name}에 대한
  이야기를 듣게 된다.

  ${faction.name}이(가) ${goalLocation.name}에서 무언가를 획책하고 있다는
  소문이 돌고, 두 사람은 진실을 밝히기 위해 여정을 시작한다.

  여정 중 ${magic.name}의 힘을 발견하지만,
  그들의 앞에는 ${trap.name}이(가) 기다리고 있었으니...
  `);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  다시 생성하려면: node scripts/random-scenario.js');
  console.log('═══════════════════════════════════════════════════════════');

  return {
    protagonist,
    ally,
    startLocation,
    goalLocation,
    questItem,
    trap,
    magic,
    faction
  };
}

generateScenario();
