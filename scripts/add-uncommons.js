const { Characters, Locations, Items, Traps, Magic } = require('../src/database');
const Scryfall = require('../src/scryfall');

const CLASS_TYPES = ['Warrior','Wizard','Cleric','Shaman','Scout','Soldier','Ally','Archer','Druid','Berserker'];

async function addUncommons() {
  const uncommons = await Scryfall.search('set:zen rarity:uncommon');
  let added = { characters: 0, locations: 0, items: 0, traps: 0, magic: 0 };

  // === Creatures → Characters ===
  console.log('=== Creature → Characters ===');
  const creatures = uncommons.cards.filter(c => c.typeLine.toLowerCase().includes('creature'));

  for (const card of creatures) {
    const types = card.types;
    const race = types.subtypes.filter(s => !CLASS_TYPES.includes(s)).join(' ');
    const charClass = types.subtypes.filter(s => CLASS_TYPES.includes(s)).join(' ');

    let loreDesc = '';
    if (card.typeLine.includes('Vampire')) {
      loreDesc = '구울 드라즈의 뱀파이어. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Kor')) {
      loreDesc = '코르족 전사. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Elf')) {
      loreDesc = '젠디카르의 엘프. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Merfolk')) {
      loreDesc = '타지임의 머포크. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Goblin')) {
      loreDesc = '아쿰의 고블린. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Angel')) {
      loreDesc = '에메리아의 천사. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Elemental')) {
      loreDesc = '젠디카르의 마나가 형상화된 정령. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else if (card.typeLine.includes('Ally')) {
      loreDesc = '젠디카르의 모험가 동맹. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    } else {
      loreDesc = '젠디카르의 생명체. ' + (card.flavorText || card.oracleText.split('.')[0] + '.');
    }

    Characters.add({
      name: card.name,
      race: race || card.types.subtypes[0] || '',
      class: charClass,
      description: card.oracleText,
      loreDescription: loreDesc,
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
  const lands = uncommons.cards.filter(c => c.typeLine.toLowerCase().includes('land'));

  const refugeLore = {
    'Akoum Refuge': '아쿰의 피난처. 화산 지대 한가운데 위치한 오아시스. 뜨거운 대지 속에서도 생명이 숨쉬는 곳으로, 모험가들에게 잠시나마 휴식을 제공한다.',
    'Graypelt Refuge': '그레이펠트 피난처. 온두의 회색 초원에 위치한 안식처. 코르 유목민들이 대대로 이용해온 휴식지로, 평원의 바람이 상처를 치유한다.',
    'Jwar Isle Refuge': '즈와르 섬 피난처. 타지임의 떠다니는 섬에 있는 비밀 은신처. 머포크들이 지키는 곳으로, 바다의 지혜가 깃든 안전지대.',
    'Kazandu Refuge': '카잔두 피난처. 무라사 숲 깊숙이 숨겨진 안전 지대. 엘프들의 보호를 받으며, 숲의 생명력이 여행자를 회복시킨다.',
    'Sejiri Refuge': '세즈리 피난처. 얼어붙은 설원의 따뜻한 동굴. 혹한 속 유일한 생존지로, 세즈리의 빙하 속에 숨겨진 따뜻한 온천이 있다.'
  };

  for (const card of lands) {
    Locations.add({
      name: card.name,
      type: 'Refuge (피난처)',
      continent: card.name.split(' ')[0],
      description: card.oracleText,
      loreDescription: refugeLore[card.name] || '젠디카르의 피난처.',
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
  const artifacts = uncommons.cards.filter(c => c.typeLine.toLowerCase().includes('artifact'));

  const artifactLore = {
    'Blazing Torch': '타오르는 횃불. 어둠을 밝히고 적을 불태우는 모험가의 필수품. 던져서 적에게 화상을 입힐 수 있다.',
    'Carnage Altar': '살육의 제단. 피의 희생을 바치면 금지된 지식을 얻을 수 있는 어둠의 제단. 구울 드라즈의 뱀파이어들이 숭배한다.',
    'Khalni Gem': '칼니의 보석. 젠디카르의 마나를 저장한 신비로운 보석. 땅의 힘을 증폭시켜 더 많은 마나를 끌어올 수 있다.',
    'Trailblazer\'s Boots': '개척자의 장화. 젠디카르의 험난한 지형을 가로지르기 위해 만들어진 마법 장화. 어떤 땅이든 자유롭게 건널 수 있다.',
    'Trusty Machete': '믿음직한 마체테. 젠디카르 탐험가들의 필수 장비. 정글을 헤치고 적과 싸우는 데 모두 유용하다.'
  };

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
  const traps = uncommons.cards.filter(c => c.typeLine.toLowerCase().includes('trap'));

  const trapLore = {
    'Arrow Volley Trap': '화살 폭우 함정. 코르 전사들이 설치하는 방어 함정. 여러 공격자가 동시에 접근하면 하늘에서 화살비가 쏟아진다.',
    'Baloth Cage Trap': '베이로스 우리 함정. 엘프들이 설치하는 역습 함정. 적이 마법 물품을 사용하면 거대한 베이로스가 우리에서 풀려난다.',
    'Cobra Trap': '코브라 함정. 정글에 설치된 독사 함정. 생물이 파괴되면 수많은 독사가 튀어나와 보복한다.',
    'Inferno Trap': '지옥불 함정. 화산 지대에 설치된 화염 함정. 피해를 입은 자에게 불길이 되돌아간다.',
    'Needlebite Trap': '바늘 물기 함정. 생명력을 노리는 뱀파이어의 함정. 상대가 생명력을 얻으면 그 이상을 빼앗는다.',
    'Pitfall Trap': '구덩이 함정. 가장 기본적인 젠디카르 함정. 공격하는 적을 깊은 구덩이로 빠뜨린다.',
    'Ravenous Trap': '탐욕의 함정. 무덤을 노리는 자에게 발동하는 함정. 시체를 건드리면 모든 것이 사라진다.',
    'Runeflare Trap': '룬 섬광 함정. 마법적 지식을 훔치려는 자에게 발동하는 함정. 너무 많은 지식은 불꽃이 되어 되돌아온다.'
  };

  for (const card of traps) {
    Traps.add({
      name: card.name,
      type: '언커먼 함정',
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

  // === Other Instants/Sorceries/Enchantments → Magic ===
  console.log('\n=== Instant/Sorcery/Enchantment → Magic ===');
  const spells = uncommons.cards.filter(c => {
    const type = c.typeLine.toLowerCase();
    return (type.includes('instant') || type.includes('sorcery') || type.includes('enchantment'))
           && !type.includes('trap');
  });

  const spellLore = {
    'Brave the Elements': '원소에 맞서다. 코르 전사들의 방어 마법. 특정 색의 공격을 완전히 무효화한다.',
    'Primal Bellow': '원초적 포효. 숲의 힘을 끌어내는 마법. 숲이 많을수록 더 강해진다.',
    'Punishing Fire': '응징의 불꽃. 적이 생명력을 얻으면 무덤에서 되살아나는 저주받은 화염.',
    'Summoner\'s Bane': '소환사의 파멸. 소환을 방해하고 그 힘을 빼앗는 마법.',
    'Trapmaker\'s Snare': '함정제작자의 올가미. 원하는 함정을 찾아내는 마법. 젠디카르 탐험가의 필수 기술.',
    'Unstable Footing': '불안정한 발판. 로완 현상을 일으켜 적의 발을 헛디디게 하는 마법.',
    'Feast of Blood': '피의 향연. 뱀파이어 의식. 동족이 함께하면 적을 죽이고 생명력을 얻는다.',
    'Landbind Ritual': '대지 결속 의식. 땅과 연결되어 생명력을 회복하는 코르의 의식.',
    'Mark of Mutiny': '반역의 표식. 적의 마음을 일시적으로 빼앗는 마법.',
    'Marsh Casualties': '늪의 재앙. 구울 드라즈의 저주. 약한 생물들을 쓸어버린다.',
    'Mind Sludge': '정신 슬러지. 늪의 힘으로 적의 마음을 짓이기는 마법.',
    'Windborne Charge': '바람을 탄 돌격. 비행 능력을 부여하는 코르의 전투 마법.',
    'Quest for Ancient Secrets': '고대 비밀 탐구. 충분한 지식을 모으면 무덤의 비밀을 되살린다.',
    'Quest for Pure Flame': '순수한 화염 탐구. 피해를 축적하면 폭발적인 화력을 얻는다.',
    'Quest for the Gemblades': '보석칼 탐구. 생물이 죽을 때마다 힘이 쌓여 결국 강력한 힘을 부여한다.',
    'Quest for the Gravelord': '무덤 군주 탐구. 죽음을 모아 거대한 좀비를 소환하는 사령술.',
    'Quest for the Holy Relic': '성스러운 유물 탐구. 충분한 생물을 모으면 전설적인 장비를 찾아낸다.'
  };

  for (const card of spells) {
    let type = '마법';
    if (card.name.includes('Quest')) type = '탐구 (Quest)';
    else if (card.typeLine.includes('Sorcery')) type = '집중마법';
    else type = '순간마법';

    Magic.add({
      name: card.name,
      type: type,
      school: card.colors.join('/') || 'colorless',
      description: card.oracleText,
      loreDescription: spellLore[card.name] || '젠디카르의 마법.',
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
}

addUncommons();
