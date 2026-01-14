const { Characters, Locations, Items, Traps, Magic } = require('../src/database');
const Scryfall = require('../src/scryfall');

const CLASS_TYPES = ['Warrior','Wizard','Cleric','Shaman','Scout','Soldier','Ally','Archer','Druid','Berserker','Rogue','Bard'];

// 종족별 lore 생성
function getCreatureLore(card) {
  const typeLine = card.typeLine;
  const flavor = card.flavorText || '';
  const oracle = card.oracleText?.split('.')[0] + '.' || '';

  if (typeLine.includes('Vampire')) {
    return `구울 드라즈의 뱀파이어. ${flavor || oracle}`;
  } else if (typeLine.includes('Kor')) {
    return `코르족. 갈고리와 밧줄의 달인. ${flavor || oracle}`;
  } else if (typeLine.includes('Elf')) {
    return `젠디카르의 엘프. 숲과 하나된 존재. ${flavor || oracle}`;
  } else if (typeLine.includes('Merfolk')) {
    return `타지임의 머포크. 물과 지식의 종족. ${flavor || oracle}`;
  } else if (typeLine.includes('Goblin')) {
    return `아쿰의 고블린. 무모하지만 용감한 종족. ${flavor || oracle}`;
  } else if (typeLine.includes('Human')) {
    return `젠디카르의 인간 모험가. ${flavor || oracle}`;
  } else if (typeLine.includes('Ally')) {
    return `젠디카르의 모험가 동맹. 함께하면 더 강해진다. ${flavor || oracle}`;
  } else if (typeLine.includes('Elemental')) {
    return `젠디카르의 마나가 형상화된 정령. ${flavor || oracle}`;
  } else if (typeLine.includes('Beast')) {
    return `젠디카르의 야수. 로완 현상 속에서 진화한 생명체. ${flavor || oracle}`;
  } else if (typeLine.includes('Zombie')) {
    return `구울 드라즈의 언데드. 뱀파이어의 하수인. ${flavor || oracle}`;
  } else if (typeLine.includes('Spirit')) {
    return `젠디카르에 떠도는 영혼. ${flavor || oracle}`;
  } else if (typeLine.includes('Giant')) {
    return `젠디카르의 거인. 고대부터 이 땅을 걸어온 존재. ${flavor || oracle}`;
  } else if (typeLine.includes('Bird')) {
    return `젠디카르의 하늘을 나는 새. ${flavor || oracle}`;
  } else if (typeLine.includes('Cat')) {
    return `젠디카르의 야생 고양이과 생물. ${flavor || oracle}`;
  } else if (typeLine.includes('Insect')) {
    return `젠디카르의 거대 곤충. ${flavor || oracle}`;
  } else if (typeLine.includes('Construct') || typeLine.includes('Artifact Creature')) {
    return `고대 유적에서 발견된 구조물. 헤드론의 마법으로 움직인다. ${flavor || oracle}`;
  } else if (typeLine.includes('Wurm')) {
    return `젠디카르 지하에 서식하는 거대 웜. ${flavor || oracle}`;
  } else if (typeLine.includes('Spider')) {
    return `무라사 숲의 거대 거미. ${flavor || oracle}`;
  } else if (typeLine.includes('Serpent') || typeLine.includes('Fish')) {
    return `젠디카르 바다의 생물. ${flavor || oracle}`;
  } else if (typeLine.includes('Drake')) {
    return `젠디카르의 하늘을 지배하는 드레이크. ${flavor || oracle}`;
  } else if (typeLine.includes('Shade') || typeLine.includes('Wraith')) {
    return `구울 드라즈의 어둠에서 태어난 존재. ${flavor || oracle}`;
  } else {
    return `젠디카르의 생명체. ${flavor || oracle}`;
  }
}

// 대지 lore
const landLore = {
  'Kabira Crossroads': '카비라 교차로. 온두의 중요한 길목. 이곳을 지나는 여행자들에게 생명력을 회복시켜주는 신성한 땅.',
  'Piranha Marsh': '피라냐 늪. 구울 드라즈의 위험한 늪지대. 발을 들이면 생명력이 빨려나간다.',
  'Soaring Seacliff': '솟아오른 바다 절벽. 타지임의 떠다니는 절벽. 이곳에서 뛰어내리면 하늘을 날 수 있다는 전설이 있다.',
  'Teetering Peaks': '흔들리는 봉우리. 아쿰의 불안정한 산악지대. 로완 현상으로 끊임없이 흔들리며, 이곳의 힘은 전사들을 강하게 만든다.',
  'Turntimber Grove': '턴팀버 숲. 무라사의 울창한 숲. 이곳에 들어서면 자연의 힘이 생명체를 강화시킨다.'
};

// 아티팩트 lore
const artifactLore = {
  'Adventuring Gear': '모험가의 장비. 젠디카르 탐험가의 필수품. 새로운 땅을 발견할 때마다 착용자를 강화시킨다.',
  'Expedition Map': '탐험 지도. 젠디카르의 변화무쌍한 지형을 기록한 마법 지도. 원하는 땅을 찾아준다.',
  "Explorer's Scope": '탐험가의 망원경. 먼 곳의 땅을 살펴볼 수 있는 마법 장비. 때로는 새로운 땅을 발견하기도 한다.',
  'Spidersilk Net': '거미줄 그물. 무라사 거미의 실로 만든 그물. 날아다니는 생물도 잡아낼 수 있다.'
};

// 함정 lore
const trapLore = {
  'Lethargy Trap': '무기력 함정. 너무 많은 공격자가 몰려오면 발동되는 마법 함정. 모든 공격자를 무기력하게 만든다.',
  'Whiplash Trap': '채찍질 함정. 둘 이상의 생물이 한 턴에 나타나면 발동되는 함정. 침입자들을 원래 있던 곳으로 돌려보낸다.'
};

// 마법 lore 생성
function getMagicLore(card) {
  const name = card.name;
  const flavor = card.flavorText || '';
  const oracle = card.oracleText?.split('.')[0] + '.' || '';
  const colors = card.colors || [];

  // 특정 카드 lore
  const specificLore = {
    'Bold Defense': '대담한 방어. 코르 전사들의 방어 기술. 위기의 순간 아군을 강화한다.',
    'Burst Lightning': '번개 폭발. 아쿰 화산의 전기를 담은 마법. 더 많은 마나를 쏟으면 더 강력해진다.',
    'Cancel': '취소. 기본적인 대항 마법. 상대의 주문을 무효화한다.',
    'Disfigure': '일그러뜨리기. 구울 드라즈의 저주 마법. 대상을 약화시킨다.',
    'Harrow': '땅 갈기. 자신의 땅을 희생해 더 많은 땅을 찾는 드루이드 마법.',
    'Hideous End': '끔찍한 최후. 뱀파이어의 처형 마법. 흑마법이 아닌 생물을 즉사시킨다.',
    'Into the Roil': '로완 속으로. 젠디카르 특유의 마법. 대상을 손으로 돌려보낸다.',
    'Narrow Escape': '아슬아슬한 탈출. 위기의 순간 자신의 것을 구해내는 마법.',
    'Relic Crush': '유물 파쇄. 마법 물품을 파괴하는 강력한 마법.',
    'Seismic Shudder': '지진파. 아쿰의 화산 마법. 날지 못하는 모든 것에 피해를 준다.',
    "Shieldmate's Blessing": '방패동료의 축복. 코르 전사들의 보호 마법.',
    'Slaughter Cry': '학살의 함성. 고블린 전사들의 전투 고함. 순간적으로 전투력을 폭발시킨다.',
    'Spell Pierce': '주문 꿰뚫기. 머포크 마법사들의 방해 마법. 마나가 부족한 주문을 무효화한다.',
    'Tanglesap': '엉킴 수액. 무라사 숲의 덩굴 마법. 비행 없는 생물의 피해를 막는다.',
    "Vampire's Bite": '뱀파이어의 물기. 생명력을 흡수하는 뱀파이어 마법.',
    'Vines of Vastwood': '광활한 숲의 덩굴. 대상을 보호하고 강화하는 엘프 마법.',
    'Beast Hunt': '야수 사냥. 숲에서 생물을 찾아내는 드루이드 기술.',
    'Demolish': '철거. 건물이나 마법 물품을 파괴하는 마법.',
    'Desecrated Earth': '더럽혀진 땅. 구울 드라즈의 저주. 대상의 땅을 파괴하고 손패를 버리게 한다.',
    'Grim Discovery': '암울한 발견. 무덤에서 생물과 땅을 되찾는 사령술.',
    'Magma Rift': '마그마 균열. 화산의 힘으로 대지를 파괴하며 적을 공격.',
    'Spire Barrage': '첨탑 포격. 산이 많을수록 강해지는 화염 마법.',
    "Trapfinder's Trick": '함정탐지사의 속임수. 적의 손을 공개하고 함정을 무력화.',
    'Goblin War Paint': '고블린 전쟁 물감. 착용자에게 신속과 힘을 부여하는 고블린 마법.',
    'Ior Ruin Expedition': '이오르 유적 탐험. 탐험 카운터를 모아 카드를 뽑는 마법.',
    'Journey to Nowhere': '어디론가의 여행. 대상을 다른 차원으로 추방하는 마법.',
    'Khalni Heart Expedition': '칼니 심장 탐험. 탐험 카운터를 모아 땅을 찾는 마법.',
    'Mire Blight': '수렁의 역병. 피해를 입은 생물을 파괴하는 저주.',
    'Nimbus Wings': '적운 날개. 비행 능력을 부여하는 마법.',
    'Paralyzing Grasp': '마비의 손아귀. 생물을 영원히 탭 상태로 만드는 마법.',
    'Savage Silhouette': '야만의 실루엣. 재생 능력과 힘을 부여하는 야수 마법.',
    'Soul Stair Expedition': '영혼 계단 탐험. 탐험 카운터를 모아 무덤의 생물을 되찾는 마법.',
    'Spreading Seas': '퍼지는 바다. 대상 땅을 섬으로 바꾸는 머포크 마법.',
    'Sunspring Expedition': '태양샘 탐험. 탐험 카운터를 모아 생명력을 얻는 마법.',
    'Zektar Shrine Expedition': '젝타르 신전 탐험. 탐험 카운터를 모아 거대한 정령을 소환하는 마법.'
  };

  if (specificLore[name]) return specificLore[name];

  // 색상 기반 기본 lore
  if (colors.includes('W')) return `코르의 백색 마법. ${flavor || oracle}`;
  if (colors.includes('U')) return `머포크의 청색 마법. ${flavor || oracle}`;
  if (colors.includes('B')) return `구울 드라즈의 흑색 마법. ${flavor || oracle}`;
  if (colors.includes('R')) return `아쿰의 적색 마법. ${flavor || oracle}`;
  if (colors.includes('G')) return `무라사의 녹색 마법. ${flavor || oracle}`;
  return `젠디카르의 마법. ${flavor || oracle}`;
}

async function addCommons() {
  console.log('zen 세트 커먼 카드 추가 시작...\n');

  const result = await Scryfall.search('set:zen rarity:common');
  const commons = result.cards.filter(c => !c.typeLine.includes('Basic Land'));

  let added = { characters: 0, locations: 0, items: 0, traps: 0, magic: 0 };

  // === Creatures → Characters ===
  console.log('=== Creature → Characters ===');
  const creatures = commons.filter(c => c.typeLine.toLowerCase().includes('creature'));

  for (const card of creatures) {
    const types = card.types;
    const race = types.subtypes.filter(s => !CLASS_TYPES.includes(s)).join(' ');
    const charClass = types.subtypes.filter(s => CLASS_TYPES.includes(s)).join(' ');

    Characters.add({
      name: card.name,
      race: race || card.types.subtypes[0] || '',
      class: charClass,
      description: card.oracleText,
      loreDescription: getCreatureLore(card),
      cardEffect: card.oracleText,
      cardStats: {
        manaCost: card.manaCost,
        power: card.power,
        toughness: card.toughness,
        colors: card.colors,
        rarity: card.rarity,
        typeLine: card.typeLine
      },
      flavorText: card.flavorText || '',
      cardRef: { id: card.id, name: card.name, set: card.set, image: card.images?.normal }
    });
    added.characters++;
    console.log('  + ' + card.name);
  }

  // === Lands → Locations ===
  console.log('\n=== Land → Locations ===');
  const lands = commons.filter(c => c.typeLine.toLowerCase().includes('land') && !c.typeLine.includes('Basic'));

  for (const card of lands) {
    const continent = card.name.split(' ')[0];
    Locations.add({
      name: card.name,
      type: '커먼 대지',
      continent: continent,
      description: card.oracleText,
      loreDescription: landLore[card.name] || '젠디카르의 특별한 장소.',
      cardEffect: card.oracleText,
      cardStats: { typeLine: card.typeLine, rarity: card.rarity },
      flavorText: card.flavorText || '',
      cardRef: { id: card.id, name: card.name, set: card.set, image: card.images?.normal }
    });
    added.locations++;
    console.log('  + ' + card.name);
  }

  // === Artifacts → Items ===
  console.log('\n=== Artifact → Items ===');
  const artifacts = commons.filter(c =>
    c.typeLine.toLowerCase().includes('artifact') &&
    !c.typeLine.toLowerCase().includes('creature')
  );

  for (const card of artifacts) {
    Items.add({
      name: card.name,
      type: card.typeLine.includes('Equipment') ? 'Equipment' : 'Artifact',
      description: card.oracleText,
      loreDescription: artifactLore[card.name] || '젠디카르의 마법 물품.',
      cardEffect: card.oracleText,
      cardStats: { manaCost: card.manaCost, typeLine: card.typeLine, rarity: card.rarity },
      flavorText: card.flavorText || '',
      cardRef: { id: card.id, name: card.name, set: card.set, image: card.images?.normal }
    });
    added.items++;
    console.log('  + ' + card.name);
  }

  // === Trap Instants → Traps ===
  console.log('\n=== Trap Instant → Traps ===');
  const traps = commons.filter(c => c.typeLine.toLowerCase().includes('trap'));

  for (const card of traps) {
    Traps.add({
      name: card.name,
      type: '커먼 함정',
      description: card.oracleText,
      loreDescription: trapLore[card.name] || '젠디카르의 함정.',
      cardEffect: card.oracleText,
      cardStats: { manaCost: card.manaCost, typeLine: card.typeLine, rarity: card.rarity, colors: card.colors },
      flavorText: card.flavorText || '',
      cardRef: { id: card.id, name: card.name, set: card.set, image: card.images?.normal }
    });
    added.traps++;
    console.log('  + ' + card.name);
  }

  // === Instants/Sorceries/Enchantments (non-Trap) → Magic ===
  console.log('\n=== Instant/Sorcery/Enchantment → Magic ===');
  const spells = commons.filter(c => {
    const type = c.typeLine.toLowerCase();
    return (type.includes('instant') || type.includes('sorcery') || type.includes('enchantment'))
           && !type.includes('trap');
  });

  for (const card of spells) {
    let type = '마법';
    if (card.name.includes('Expedition')) type = '탐험 (Expedition)';
    else if (card.typeLine.includes('Aura')) type = '오라 마법';
    else if (card.typeLine.includes('Sorcery')) type = '집중마법';
    else type = '순간마법';

    Magic.add({
      name: card.name,
      type: type,
      school: card.colors.join('/') || 'colorless',
      description: card.oracleText,
      loreDescription: getMagicLore(card),
      cardEffect: card.oracleText,
      cardStats: { manaCost: card.manaCost, typeLine: card.typeLine, rarity: card.rarity, colors: card.colors },
      flavorText: card.flavorText || '',
      cardRef: { id: card.id, name: card.name, set: card.set, image: card.images?.normal }
    });
    added.magic++;
    console.log('  + ' + card.name);
  }

  console.log('\n=== 완료 ===');
  console.log('Characters: +' + added.characters + ' (총 ' + Characters.getAll().length + ')');
  console.log('Locations: +' + added.locations + ' (총 ' + Locations.getAll().length + ')');
  console.log('Items: +' + added.items + ' (총 ' + Items.getAll().length + ')');
  console.log('Traps: +' + added.traps + ' (총 ' + Traps.getAll().length + ')');
  console.log('Magic: +' + added.magic + ' (총 ' + Magic.getAll().length + ')');

  const total = added.characters + added.locations + added.items + added.traps + added.magic;
  console.log('\n총 추가: ' + total + '개');
}

addCommons();
