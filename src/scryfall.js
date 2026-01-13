// Scryfall API 연동 모듈
// https://scryfall.com/docs/api

const SCRYFALL_BASE = 'https://api.scryfall.com';

// API 요청 딜레이 (Scryfall 권장: 50-100ms)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 젠디카르 관련 세트 코드
const ZENDIKAR_SETS = {
  zen: 'Zendikar (2009)', //1-1
  wwk: 'Worldwake (2010)',//1-2
  roe: 'Rise of the Eldrazi (2010)',//1-3
  bfz: 'Battle for Zendikar (2015)',
  ogw: 'Oath of the Gatewatch (2016)',
  znr: 'Zendikar Rising (2020)',
  znc: 'Zendikar Rising Commander (2020)'
};

// ========== 카드 검색 ==========

// 카드 이름으로 검색 (fuzzy matching)
async function searchByName(cardName) {
  try {
    const response = await fetch(
      `${SCRYFALL_BASE}/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { error: '카드를 찾을 수 없습니다', cardName };
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const card = await response.json();
    return parseCard(card);
  } catch (error) {
    return { error: error.message, cardName };
  }
}

// 정확한 이름으로 검색
async function searchExact(cardName) {
  try {
    const response = await fetch(
      `${SCRYFALL_BASE}/cards/named?exact=${encodeURIComponent(cardName)}`
    );

    if (!response.ok) {
      return { error: '카드를 찾을 수 없습니다', cardName };
    }

    const card = await response.json();
    return parseCard(card);
  } catch (error) {
    return { error: error.message, cardName };
  }
}

// 쿼리로 검색 (여러 결과)
async function search(query) {
  try {
    const response = await fetch(
      `${SCRYFALL_BASE}/cards/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { error: '검색 결과 없음', query, cards: [] };
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return {
      total: data.total_cards,
      cards: data.data.map(parseCard)
    };
  } catch (error) {
    return { error: error.message, query, cards: [] };
  }
}

// ========== 젠디카르 세트 검색 ==========

// 특정 세트의 모든 카드 가져오기
async function getSetCards(setCode, options = {}) {
  const { type, rarity, limit } = options;

  let query = `set:${setCode}`;
  if (type) query += ` type:${type}`;
  if (rarity) query += ` rarity:${rarity}`;

  const allCards = [];
  let nextPage = `${SCRYFALL_BASE}/cards/search?q=${encodeURIComponent(query)}`;

  while (nextPage) {
    await delay(100); // Rate limiting

    const response = await fetch(nextPage);
    if (!response.ok) break;

    const data = await response.json();
    allCards.push(...data.data.map(parseCard));

    if (limit && allCards.length >= limit) {
      return allCards.slice(0, limit);
    }

    nextPage = data.has_more ? data.next_page : null;
  }

  return allCards;
}

// 모든 젠디카르 세트에서 검색
async function searchZendikarCards(query, options = {}) {
  const setQuery = Object.keys(ZENDIKAR_SETS).map(s => `set:${s}`).join(' or ');
  const fullQuery = `(${setQuery}) ${query}`;
  return search(fullQuery);
}

// 젠디카르 전설적 생물 가져오기
async function getZendikarLegendaries() {
  return searchZendikarCards('type:legendary type:creature');
}

// 젠디카르 장소(대지) 카드 가져오기
async function getZendikarLands() {
  return searchZendikarCards('type:land');
}

// ========== 카드 파싱 ==========

function parseCard(card) {
  // 양면 카드 처리
  const faces = card.card_faces || [card];
  const mainFace = faces[0];

  return {
    // 기본 정보
    id: card.id,
    name: card.name,
    koreanName: card.printed_name || null,

    // 타입
    typeLine: card.type_line,
    types: parseTypes(card.type_line),

    // 텍스트
    oracleText: mainFace.oracle_text || card.oracle_text || '',
    flavorText: mainFace.flavor_text || card.flavor_text || '',

    // 게임 정보
    manaCost: card.mana_cost || mainFace.mana_cost || '',
    colors: card.colors || mainFace.colors || [],
    colorIdentity: card.color_identity || [],
    rarity: card.rarity,

    // 생물 스탯
    power: card.power || mainFace.power || null,
    toughness: card.toughness || mainFace.toughness || null,

    // 세트 정보
    set: card.set,
    setName: card.set_name,

    // 이미지
    images: {
      normal: card.image_uris?.normal || mainFace.image_uris?.normal || null,
      art_crop: card.image_uris?.art_crop || mainFace.image_uris?.art_crop || null,
      small: card.image_uris?.small || mainFace.image_uris?.small || null
    },

    // 아티스트
    artist: card.artist,

    // Scryfall 링크
    scryfallUrl: card.scryfall_uri,

    // 양면 카드인 경우 뒷면
    backFace: faces.length > 1 ? {
      name: faces[1].name,
      typeLine: faces[1].type_line,
      oracleText: faces[1].oracle_text || '',
      flavorText: faces[1].flavor_text || '',
      image: faces[1].image_uris?.normal || null
    } : null
  };
}

function parseTypes(typeLine) {
  if (!typeLine) return { supertypes: [], types: [], subtypes: [] };

  const [mainPart, subtypePart] = typeLine.split(' — ');
  const mainTypes = mainPart.split(' ');

  const supertypes = [];
  const types = [];

  const SUPERTYPES = ['Legendary', 'Basic', 'Snow', 'World'];
  const CARD_TYPES = ['Creature', 'Artifact', 'Enchantment', 'Land', 'Instant', 'Sorcery', 'Planeswalker', 'Battle', 'Kindred'];

  mainTypes.forEach(t => {
    if (SUPERTYPES.includes(t)) supertypes.push(t);
    else if (CARD_TYPES.includes(t)) types.push(t);
  });

  return {
    supertypes,
    types,
    subtypes: subtypePart ? subtypePart.split(' ') : []
  };
}

// ========== 세계관 요소 추출 ==========

// 카드에서 세계관 요소 추출 (캐릭터, 장소 등으로 변환하기 좋은 형태)
function extractWorldbuildingData(card) {
  const types = card.types;

  let elementType = 'unknown';
  if (types.types.includes('Creature') || types.types.includes('Planeswalker')) {
    elementType = 'character';
  } else if (types.types.includes('Land')) {
    elementType = 'location';
  } else if (types.types.includes('Artifact')) {
    elementType = 'item';
  } else if (types.types.includes('Enchantment') || types.types.includes('Instant') || types.types.includes('Sorcery')) {
    elementType = 'event';
  }

  return {
    elementType,
    name: card.name,
    isLegendary: types.supertypes.includes('Legendary'),
    race: types.subtypes.filter(s => !['Warrior', 'Wizard', 'Cleric', 'Rogue', 'Shaman', 'Scout', 'Ally', 'Soldier'].includes(s)),
    class: types.subtypes.filter(s => ['Warrior', 'Wizard', 'Cleric', 'Rogue', 'Shaman', 'Scout', 'Ally', 'Soldier'].includes(s)),
    description: card.oracleText,
    flavorText: card.flavorText,
    colors: card.colors,
    cardRef: {
      id: card.id,
      name: card.name,
      set: card.set,
      image: card.images.normal,
      url: card.scryfallUrl
    }
  };
}

module.exports = {
  ZENDIKAR_SETS,
  searchByName,
  searchExact,
  search,
  getSetCards,
  searchZendikarCards,
  getZendikarLegendaries,
  getZendikarLands,
  extractWorldbuildingData
};

// CLI 모드
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    switch (command) {
      case 'card':
        if (args[1]) {
          console.log(`\n"${args.slice(1).join(' ')}" 검색 중...`);
          const card = await searchByName(args.slice(1).join(' '));
          console.log(JSON.stringify(card, null, 2));
        } else {
          console.log('카드 이름을 입력하세요: node src/scryfall.js card <카드이름>');
        }
        break;

      case 'sets':
        console.log('\n=== 젠디카르 관련 세트 ===');
        Object.entries(ZENDIKAR_SETS).forEach(([code, name]) => {
          console.log(`  ${code}: ${name}`);
        });
        break;

      case 'legendaries':
        console.log('\n젠디카르 전설적 생물 검색 중...');
        const legends = await getZendikarLegendaries();
        if (legends.cards) {
          console.log(`총 ${legends.total}개 발견`);
          legends.cards.slice(0, 10).forEach(c => console.log(`  - ${c.name}`));
          if (legends.total > 10) console.log(`  ... 외 ${legends.total - 10}개`);
        }
        break;

      default:
        console.log(`
Scryfall API 도구

사용법:
  node src/scryfall.js <명령어>

명령어:
  card <이름>   - 카드 검색
  sets          - 젠디카르 세트 목록
  legendaries   - 젠디카르 전설적 생물 목록
        `);
    }
  })();
}
