const { Characters, Magic } = require('../src/database');

// 남은 문제 항목들 수정
const remainingCharLore = {
  'Goblin Ruinblaster': '고블린 폐허 파괴자. 적의 거점을 파괴하는 전문가. 키커 마법과 함께 소환하면 즉시 적의 비기본 대지를 부순다.',
  'Gomazoa': '고마조아. 타지임 하늘에 떠다니는 거대 해파리. 공격하는 적을 감싸 서고 위로 돌려보내는 기이한 방어 생물.',
  'Hellfire Mongrel': '지옥불 맹견. 화염 정령이 깃든 사냥개. 적의 손이 비어있으면 불타는 분노로 추가 피해를 입힌다.',
  'Kor Duelist': '코르 결투사. 쌍검을 사용하는 무장 전문가. 장비를 착용하면 이중 공격으로 적을 두 번 베어낸다.',
  'Merfolk Wayfinder': '머포크 길탐색자. 하늘을 나는 머포크 정찰병. 전장에 나타나면 자신의 지식으로 땅을 찾아 손에 든다.',
  'Shepherd of the Lost': '잃어버린 자들의 목자. 황야에서 쓰러진 영혼을 인도하는 천사. 선제공격과 경계로 위험에서 동료를 보호한다.',
  'Caller of Gales': '돌풍 소환사. 하늘을 선택한 머포크 마법사. 바람을 불러 아군에게 비행을 부여하는 능력을 지녔다.',
  'Giant Scorpion': '거대 전갈. 젠디카르 사막의 맹독 전갈. 한 방이면 어떤 생물이든 치명상을 입는다.',
  'Grazing Gladehart': '풀 뜯는 숲사슴. 온순해 보이지만 로완 속에서 살아남은 강인한 생물. 새로운 땅을 밟으면 생명력을 회복시킨다.',
  'Kraken Hatchling': '크라켄 새끼. 타지임 바다의 어린 괴물. 아직 작지만 엄청난 방어력으로 대부분의 공격을 버텨낸다.',
  'Molten Ravager': '용융 약탈자. 아쿰 화산의 불 정령. 적마나를 먹으면 더욱 뜨겁게 불타오른다.',
  'Stonework Puma': '석조 퓨마. 헤드론으로 만들어진 고대 구조물. 모든 동맹 유형을 가진 다재다능한 존재.'
};

const remainingMagicLore = {
  'Mark of Mutiny': '반역의 낙인. 구울 드라즈 뱀파이어들이 사용하는 정신 지배 마법. 적의 생물을 일시적으로 빼앗아 조종하고, 전투 의욕까지 불태운다.',
  'Demolish': '철거. 아쿰 고블린들이 즐겨 사용하는 파괴 마법. 건물이든 마법 물품이든 가리지 않고 산산조각 낸다.',
  'Nimbus Wings': '적운 날개. 에메리아의 축복으로 비행 능력을 부여하는 마법. 날개가 없는 생물도 하늘을 날 수 있게 해준다.',
  "Shieldmate's Blessing": '방패동료의 축복. 코르 전사들이 동료를 지키기 위해 사용하는 순간 방어 마법. 피해를 크게 줄여준다.',
  'Spire Barrage': '첨탑 포격. 아쿰 화염술사들의 마법. 자신이 지배하는 산이 많을수록 더 강력한 화염을 쏟아붓는다.',
  'Spreading Seas': '퍼지는 바다. 머포크 럴마법사들의 영역 변환 마법. 적의 땅을 섬으로 바꾸어 자신의 영역으로 만든다.',
  "Vampire's Bite": '뱀파이어의 이빨. 구울 드라즈의 흡혈 마법. 대상에게 흡혈 능력을 부여하고, 키커로 강화하면 더욱 강력한 힘을 준다.'
};

let fixed = 0;

// 이름으로 찾아서 모두 업데이트
console.log('=== 남은 Characters 수정 ===');
const chars = Characters.getAll();
for (const [name, lore] of Object.entries(remainingCharLore)) {
  const matches = chars.filter(c => c.name === name);
  for (const char of matches) {
    Characters.update(char.id, { loreDescription: lore });
    console.log('  ✓ ' + name + ' (ID: ' + char.id + ')');
    fixed++;
  }
}

console.log('\n=== 남은 Magic 수정 ===');
const magics = Magic.getAll();
for (const [name, lore] of Object.entries(remainingMagicLore)) {
  const matches = magics.filter(m => m.name === name);
  for (const magic of matches) {
    Magic.update(magic.id, { loreDescription: lore });
    console.log('  ✓ ' + name + ' (ID: ' + magic.id + ')');
    fixed++;
  }
}

console.log('\n=== 완료: ' + fixed + '개 수정됨 ===');
