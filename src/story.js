const fs = require('fs');
const path = require('path');

const STORY_DIR = path.join(__dirname, '..', 'story');

// 데이터 파일 읽기/저장
function loadStory(type) {
  const filePath = path.join(STORY_DIR, `${type}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data[type] || [];
}

function saveStory(type, items) {
  const filePath = path.join(STORY_DIR, `${type}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ [type]: items }, null, 2), 'utf8');
}

// ========== 챕터 관리 ==========
const Chapters = {
  getAll: () => loadStory('chapters'),

  add: (chapter) => {
    const chapters = loadStory('chapters');
    const number = chapters.length + 1;
    const newChapter = {
      number,
      id: `CH-${String(number).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      ...chapter,
      title: chapter.title || `제 ${number}장`,
      summary: chapter.summary || '',
      status: chapter.status || 'planned', // planned, draft, complete
      // 등장 요소 추적
      characters: chapter.characters || [],    // 등장 캐릭터 ID
      locations: chapter.locations || [],      // 등장 장소 ID
      items: chapter.items || [],              // 등장 아이템 ID
      events: chapter.events || [],            // 관련 사건 ID
      // 스토리 요소
      scenes: chapter.scenes || [],            // 씬 목록
      notes: chapter.notes || '',              // 작가 노트
      wordCount: chapter.wordCount || 0,
    };
    chapters.push(newChapter);
    saveStory('chapters', chapters);
    return newChapter;
  },

  update: (id, updates) => {
    const chapters = loadStory('chapters');
    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) return null;
    chapters[index] = { ...chapters[index], ...updates, updatedAt: new Date().toISOString() };
    saveStory('chapters', chapters);
    return chapters[index];
  },

  delete: (id) => {
    const chapters = loadStory('chapters');
    const filtered = chapters.filter(c => c.id !== id);
    // 번호 재정렬
    filtered.forEach((ch, i) => {
      ch.number = i + 1;
      ch.id = `CH-${String(i + 1).padStart(3, '0')}`;
    });
    saveStory('chapters', filtered);
    return filtered.length < chapters.length;
  },

  // 챕터에 씬 추가
  addScene: (chapterId, scene) => {
    const chapters = loadStory('chapters');
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return null;

    const newScene = {
      id: `${chapterId}-S${String(chapter.scenes.length + 1).padStart(2, '0')}`,
      ...scene,
      title: scene.title || '',
      location: scene.location || '',
      characters: scene.characters || [],
      summary: scene.summary || '',
      mood: scene.mood || '',  // 분위기
    };
    chapter.scenes.push(newScene);
    saveStory('chapters', chapters);
    return newScene;
  },

  // 특정 캐릭터가 등장하는 모든 챕터 찾기
  findByCharacter: (characterId) => {
    const chapters = loadStory('chapters');
    return chapters.filter(ch => ch.characters.includes(characterId));
  },

  // 특정 장소가 등장하는 모든 챕터 찾기
  findByLocation: (locationId) => {
    const chapters = loadStory('chapters');
    return chapters.filter(ch => ch.locations.includes(locationId));
  }
};

// ========== 타임라인 관리 ==========
const Timeline = {
  getAll: () => loadStory('timeline').sort((a, b) => a.order - b.order),

  add: (entry) => {
    const timeline = loadStory('timeline');
    const newEntry = {
      id: `TL-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...entry,
      order: entry.order || timeline.length + 1, // 순서
      era: entry.era || '',                      // 시대
      date: entry.date || '',                    // 작중 날짜/시간
      title: entry.title || '',
      description: entry.description || '',
      type: entry.type || 'event',               // event, backstory, future
      relatedChapter: entry.relatedChapter || null,
      characters: entry.characters || [],
      locations: entry.locations || [],
    };
    timeline.push(newEntry);
    saveStory('timeline', timeline);
    return newEntry;
  },

  update: (id, updates) => {
    const timeline = loadStory('timeline');
    const index = timeline.findIndex(t => t.id === id);
    if (index === -1) return null;
    timeline[index] = { ...timeline[index], ...updates, updatedAt: new Date().toISOString() };
    saveStory('timeline', timeline);
    return timeline[index];
  },

  delete: (id) => {
    const timeline = loadStory('timeline');
    const filtered = timeline.filter(t => t.id !== id);
    saveStory('timeline', filtered);
    return filtered.length < timeline.length;
  },

  // 시대별 필터
  findByEra: (era) => {
    const timeline = loadStory('timeline');
    return timeline.filter(t => t.era === era).sort((a, b) => a.order - b.order);
  },

  // 순서 재정렬
  reorder: (orderedIds) => {
    const timeline = loadStory('timeline');
    orderedIds.forEach((id, index) => {
      const entry = timeline.find(t => t.id === id);
      if (entry) entry.order = index + 1;
    });
    saveStory('timeline', timeline);
    return timeline;
  }
};

// ========== 복선/떡밥 관리 ==========
const Foreshadowing = {
  getAll: () => loadStory('foreshadowing'),

  add: (item) => {
    const foreshadowing = loadStory('foreshadowing');
    const newItem = {
      id: `FS-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...item,
      title: item.title || '',               // 복선 제목
      description: item.description || '',   // 설명
      status: item.status || 'planted',      // planted(심음), hinted(암시), revealed(회수)
      plantedIn: item.plantedIn || null,     // 심은 챕터 ID
      hintedIn: item.hintedIn || [],         // 암시한 챕터 ID들
      revealedIn: item.revealedIn || null,   // 회수한 챕터 ID
      importance: item.importance || 'minor', // major, minor, twist
      relatedCharacters: item.relatedCharacters || [],
      notes: item.notes || '',
    };
    foreshadowing.push(newItem);
    saveStory('foreshadowing', foreshadowing);
    return newItem;
  },

  update: (id, updates) => {
    const foreshadowing = loadStory('foreshadowing');
    const index = foreshadowing.findIndex(f => f.id === id);
    if (index === -1) return null;
    foreshadowing[index] = { ...foreshadowing[index], ...updates, updatedAt: new Date().toISOString() };
    saveStory('foreshadowing', foreshadowing);
    return foreshadowing[index];
  },

  delete: (id) => {
    const foreshadowing = loadStory('foreshadowing');
    const filtered = foreshadowing.filter(f => f.id !== id);
    saveStory('foreshadowing', filtered);
    return filtered.length < foreshadowing.length;
  },

  // 상태별 필터
  findByStatus: (status) => {
    const foreshadowing = loadStory('foreshadowing');
    return foreshadowing.filter(f => f.status === status);
  },

  // 아직 회수 안 된 복선
  getUnresolved: () => {
    const foreshadowing = loadStory('foreshadowing');
    return foreshadowing.filter(f => f.status !== 'revealed');
  },

  // 복선 암시 추가
  addHint: (id, chapterId) => {
    const foreshadowing = loadStory('foreshadowing');
    const item = foreshadowing.find(f => f.id === id);
    if (!item) return null;
    if (!item.hintedIn.includes(chapterId)) {
      item.hintedIn.push(chapterId);
      item.status = 'hinted';
    }
    saveStory('foreshadowing', foreshadowing);
    return item;
  },

  // 복선 회수
  reveal: (id, chapterId) => {
    const foreshadowing = loadStory('foreshadowing');
    const item = foreshadowing.find(f => f.id === id);
    if (!item) return null;
    item.revealedIn = chapterId;
    item.status = 'revealed';
    saveStory('foreshadowing', foreshadowing);
    return item;
  }
};

module.exports = {
  Chapters,
  Timeline,
  Foreshadowing
};
