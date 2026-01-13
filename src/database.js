const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 데이터 파일 읽기
function loadData(type) {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data[type] || [];
}

// 데이터 파일 저장
function saveData(type, items) {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ [type]: items }, null, 2), 'utf8');
}

// ID 생성
function generateId(type) {
  const prefix = type.charAt(0).toUpperCase();
  return `${prefix}-${Date.now().toString(36)}`;
}

// ========== 캐릭터 관리 ==========
const Characters = {
  getAll: () => loadData('characters'),

  add: (character) => {
    const characters = loadData('characters');
    const newChar = {
      id: generateId('char'),
      createdAt: new Date().toISOString(),
      ...character,
      // 기본 구조
      name: character.name || '',
      race: character.race || '',           // 종족
      class: character.class || '',         // 직업/역할
      faction: character.faction || '',     // 소속
      location: character.location || '',   // 현재 위치
      description: character.description || '',
      personality: character.personality || '',
      goals: character.goals || [],         // 목표
      secrets: character.secrets || [],     // 비밀
      relationships: character.relationships || [], // 관계
      cardRef: character.cardRef || null,   // MTG 카드 참조
      chapters: character.chapters || [],   // 등장 챕터
    };
    characters.push(newChar);
    saveData('characters', characters);
    return newChar;
  },

  update: (id, updates) => {
    const characters = loadData('characters');
    const index = characters.findIndex(c => c.id === id);
    if (index === -1) return null;
    characters[index] = { ...characters[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('characters', characters);
    return characters[index];
  },

  delete: (id) => {
    const characters = loadData('characters');
    const filtered = characters.filter(c => c.id !== id);
    saveData('characters', filtered);
    return filtered.length < characters.length;
  },

  findByName: (name) => {
    const characters = loadData('characters');
    return characters.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
  },

  findByRace: (race) => {
    const characters = loadData('characters');
    return characters.filter(c => c.race.toLowerCase() === race.toLowerCase());
  }
};

// ========== 장소 관리 ==========
const Locations = {
  getAll: () => loadData('locations'),

  add: (location) => {
    const locations = loadData('locations');
    const newLoc = {
      id: generateId('loc'),
      createdAt: new Date().toISOString(),
      ...location,
      name: location.name || '',
      continent: location.continent || '',   // 대륙
      type: location.type || '',             // 유형 (도시, 던전, 유적 등)
      description: location.description || '',
      dangers: location.dangers || [],       // 위험 요소
      treasures: location.treasures || [],   // 보물/자원
      inhabitants: location.inhabitants || [], // 거주자
      cardRef: location.cardRef || null,
      chapters: location.chapters || [],
    };
    locations.push(newLoc);
    saveData('locations', locations);
    return newLoc;
  },

  update: (id, updates) => {
    const locations = loadData('locations');
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) return null;
    locations[index] = { ...locations[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('locations', locations);
    return locations[index];
  },

  delete: (id) => {
    const locations = loadData('locations');
    const filtered = locations.filter(l => l.id !== id);
    saveData('locations', filtered);
    return filtered.length < locations.length;
  },

  findByContinent: (continent) => {
    const locations = loadData('locations');
    return locations.filter(l => l.continent.toLowerCase() === continent.toLowerCase());
  }
};

// ========== 아이템 관리 ==========
const Items = {
  getAll: () => loadData('items'),

  add: (item) => {
    const items = loadData('items');
    const newItem = {
      id: generateId('item'),
      createdAt: new Date().toISOString(),
      ...item,
      name: item.name || '',
      type: item.type || '',              // 무기, 방어구, 마법물품 등
      rarity: item.rarity || '',          // 희귀도
      description: item.description || '',
      abilities: item.abilities || [],    // 능력
      origin: item.origin || '',          // 출처
      owner: item.owner || null,          // 현재 소유자
      cardRef: item.cardRef || null,
      chapters: item.chapters || [],
    };
    items.push(newItem);
    saveData('items', items);
    return newItem;
  },

  update: (id, updates) => {
    const items = loadData('items');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('items', items);
    return items[index];
  },

  delete: (id) => {
    const items = loadData('items');
    const filtered = items.filter(i => i.id !== id);
    saveData('items', filtered);
    return filtered.length < items.length;
  }
};

// ========== 사건 관리 ==========
const Events = {
  getAll: () => loadData('events'),

  add: (event) => {
    const events = loadData('events');
    const newEvent = {
      id: generateId('evt'),
      createdAt: new Date().toISOString(),
      ...event,
      name: event.name || '',
      era: event.era || '',               // 시대
      date: event.date || '',             // 작중 날짜
      location: event.location || '',
      description: event.description || '',
      participants: event.participants || [], // 참여자
      consequences: event.consequences || [], // 결과
      cardRef: event.cardRef || null,
      chapters: event.chapters || [],
    };
    events.push(newEvent);
    saveData('events', events);
    return newEvent;
  },

  update: (id, updates) => {
    const events = loadData('events');
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('events', events);
    return events[index];
  },

  delete: (id) => {
    const events = loadData('events');
    const filtered = events.filter(e => e.id !== id);
    saveData('events', filtered);
    return filtered.length < events.length;
  }
};

// ========== 세력 관리 ==========
const Factions = {
  getAll: () => loadData('factions'),

  add: (faction) => {
    const factions = loadData('factions');
    const newFaction = {
      id: generateId('fac'),
      createdAt: new Date().toISOString(),
      ...faction,
      name: faction.name || '',
      type: faction.type || '',           // 유형 (부족, 길드, 종교 등)
      location: faction.location || '',
      description: faction.description || '',
      leader: faction.leader || null,
      members: faction.members || [],
      goals: faction.goals || [],
      allies: faction.allies || [],
      enemies: faction.enemies || [],
      cardRef: faction.cardRef || null,
      chapters: faction.chapters || [],
    };
    factions.push(newFaction);
    saveData('factions', factions);
    return newFaction;
  },

  update: (id, updates) => {
    const factions = loadData('factions');
    const index = factions.findIndex(f => f.id === id);
    if (index === -1) return null;
    factions[index] = { ...factions[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('factions', factions);
    return factions[index];
  },

  delete: (id) => {
    const factions = loadData('factions');
    const filtered = factions.filter(f => f.id !== id);
    saveData('factions', filtered);
    return filtered.length < factions.length;
  }
};

// ========== 마법/주문 관리 ==========
const Magic = {
  getAll: () => loadData('magic'),

  add: (spell) => {
    const magic = loadData('magic');
    const newSpell = {
      id: generateId('mag'),
      createdAt: new Date().toISOString(),
      ...spell,
      name: spell.name || '',
      type: spell.type || '',             // 소환술, 변신술, 강화술, 승천술 등
      school: spell.school || '',         // 마법 계열 (화염, 정신, 자연 등)
      difficulty: spell.difficulty || '', // 난이도
      description: spell.description || '',
      effect: spell.effect || '',         // 효과
      requirements: spell.requirements || [], // 시전 조건
      practitioners: spell.practitioners || [], // 사용 가능한 자
      cardRef: spell.cardRef || null,
      chapters: spell.chapters || [],
    };
    magic.push(newSpell);
    saveData('magic', magic);
    return newSpell;
  },

  update: (id, updates) => {
    const magic = loadData('magic');
    const index = magic.findIndex(m => m.id === id);
    if (index === -1) return null;
    magic[index] = { ...magic[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('magic', magic);
    return magic[index];
  },

  delete: (id) => {
    const magic = loadData('magic');
    const filtered = magic.filter(m => m.id !== id);
    saveData('magic', filtered);
    return filtered.length < magic.length;
  }
};

// ========== 함정 관리 ==========
const Traps = {
  getAll: () => loadData('traps'),

  add: (trap) => {
    const traps = loadData('traps');
    const newTrap = {
      id: generateId('trp'),
      createdAt: new Date().toISOString(),
      ...trap,
      name: trap.name || '',
      type: trap.type || '',              // 마법 함정, 자연 함정, 기계 함정 등
      location: trap.location || '',      // 주로 발견되는 장소
      trigger: trap.trigger || '',        // 발동 조건
      effect: trap.effect || '',          // 효과
      danger: trap.danger || '',          // 위험도
      description: trap.description || '',
      cardRef: trap.cardRef || null,
      chapters: trap.chapters || [],
    };
    traps.push(newTrap);
    saveData('traps', traps);
    return newTrap;
  },

  update: (id, updates) => {
    const traps = loadData('traps');
    const index = traps.findIndex(t => t.id === id);
    if (index === -1) return null;
    traps[index] = { ...traps[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('traps', traps);
    return traps[index];
  },

  delete: (id) => {
    const traps = loadData('traps');
    const filtered = traps.filter(t => t.id !== id);
    saveData('traps', filtered);
    return filtered.length < traps.length;
  }
};

module.exports = {
  Characters,
  Locations,
  Items,
  Events,
  Factions,
  Magic,
  Traps
};
