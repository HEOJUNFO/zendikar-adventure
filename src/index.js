const { Characters, Locations, Items, Events, Factions, Magic, Traps } = require('./database');
const { Chapters, Timeline, Foreshadowing } = require('./story');
const Scryfall = require('./scryfall');

// 젠디카르 세계관 데이터베이스 & 스토리 관리 도구
const Zendikar = {
  // 세계관 데이터베이스
  db: {
    Characters,
    Locations,
    Items,
    Events,
    Factions,
    Magic,
    Traps
  },

  // 스토리 관리
  story: {
    Chapters,
    Timeline,
    Foreshadowing
  },

  // Scryfall API
  scryfall: Scryfall,

  // ========== 유틸리티 함수 ==========

  // 전체 통계
  getStats: () => {
    return {
      characters: Characters.getAll().length,
      locations: Locations.getAll().length,
      items: Items.getAll().length,
      events: Events.getAll().length,
      factions: Factions.getAll().length,
      magic: Magic.getAll().length,
      traps: Traps.getAll().length,
      chapters: Chapters.getAll().length,
      timeline: Timeline.getAll().length,
      foreshadowing: Foreshadowing.getAll().length,
      unresolvedForeshadowing: Foreshadowing.getUnresolved().length
    };
  },

  // 특정 챕터의 모든 요소 가져오기
  getChapterDetails: (chapterId) => {
    const chapters = Chapters.getAll();
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return null;

    return {
      chapter,
      characters: chapter.characters.map(id =>
        Characters.getAll().find(c => c.id === id)
      ).filter(Boolean),
      locations: chapter.locations.map(id =>
        Locations.getAll().find(l => l.id === id)
      ).filter(Boolean),
      items: chapter.items.map(id =>
        Items.getAll().find(i => i.id === id)
      ).filter(Boolean),
      events: chapter.events.map(id =>
        Events.getAll().find(e => e.id === id)
      ).filter(Boolean),
      foreshadowing: {
        planted: Foreshadowing.getAll().filter(f => f.plantedIn === chapterId),
        hinted: Foreshadowing.getAll().filter(f => f.hintedIn.includes(chapterId)),
        revealed: Foreshadowing.getAll().filter(f => f.revealedIn === chapterId)
      }
    };
  },

  // 캐릭터 관계도 가져오기
  getRelationshipMap: () => {
    const characters = Characters.getAll();
    const relationships = [];

    characters.forEach(char => {
      if (char.relationships && char.relationships.length > 0) {
        char.relationships.forEach(rel => {
          relationships.push({
            from: char.id,
            fromName: char.name,
            to: rel.characterId,
            toName: rel.characterName,
            type: rel.type  // friend, enemy, family, lover, rival, etc.
          });
        });
      }
    });

    return relationships;
  },

  // 검색 (모든 타입에서)
  search: (query) => {
    const lowerQuery = query.toLowerCase();
    const results = {
      characters: Characters.getAll().filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery)
      ),
      locations: Locations.getAll().filter(l =>
        l.name.toLowerCase().includes(lowerQuery) ||
        l.description.toLowerCase().includes(lowerQuery)
      ),
      items: Items.getAll().filter(i =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery)
      ),
      events: Events.getAll().filter(e =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery)
      ),
      factions: Factions.getAll().filter(f =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.description.toLowerCase().includes(lowerQuery)
      )
    };
    return results;
  },

  // 진행 상황 요약
  getProgress: () => {
    const chapters = Chapters.getAll();
    const foreshadowing = Foreshadowing.getAll();

    return {
      totalChapters: chapters.length,
      completed: chapters.filter(ch => ch.status === 'complete').length,
      drafts: chapters.filter(ch => ch.status === 'draft').length,
      planned: chapters.filter(ch => ch.status === 'planned').length,
      totalWordCount: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      foreshadowing: {
        total: foreshadowing.length,
        planted: foreshadowing.filter(f => f.status === 'planted').length,
        hinted: foreshadowing.filter(f => f.status === 'hinted').length,
        revealed: foreshadowing.filter(f => f.status === 'revealed').length
      }
    };
  },

  // ========== 카드 → 세계관 요소 자동 변환 ==========

  // MTG 카드로부터 세계관 요소 추가
  async importFromCard(cardName) {
    const card = await Scryfall.searchByName(cardName);
    if (card.error) {
      return { success: false, error: card.error };
    }

    const worldData = Scryfall.extractWorldbuildingData(card);
    let result;

    switch (worldData.elementType) {
      case 'character':
        result = Characters.add({
          name: card.name,
          race: worldData.race.join(' '),
          class: worldData.class.join(' '),
          description: card.flavorText || card.oracleText,
          cardRef: worldData.cardRef,
          isLegendary: worldData.isLegendary,
          colors: worldData.colors
        });
        return { success: true, type: 'character', data: result, card };

      case 'location':
        result = Locations.add({
          name: card.name,
          type: card.types.subtypes.join(' ') || 'Land',
          description: card.flavorText || card.oracleText,
          cardRef: worldData.cardRef
        });
        return { success: true, type: 'location', data: result, card };

      case 'item':
        result = Items.add({
          name: card.name,
          type: card.types.subtypes.join(' ') || 'Artifact',
          description: card.flavorText || card.oracleText,
          abilities: [card.oracleText],
          cardRef: worldData.cardRef
        });
        return { success: true, type: 'item', data: result, card };

      case 'event':
        result = Events.add({
          name: card.name,
          description: card.flavorText || card.oracleText,
          cardRef: worldData.cardRef
        });
        return { success: true, type: 'event', data: result, card };

      default:
        return { success: false, error: '알 수 없는 카드 타입', card };
    }
  },

  // 카드 정보만 조회 (추가하지 않음)
  async lookupCard(cardName) {
    const card = await Scryfall.searchByName(cardName);
    if (card.error) {
      return { success: false, error: card.error };
    }
    return {
      success: true,
      card,
      worldData: Scryfall.extractWorldbuildingData(card)
    };
  }
};

module.exports = Zendikar;

// CLI 모드로 실행 시
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    switch (command) {
      case 'stats':
        console.log('\n=== 젠디카르 세계관 통계 ===');
        console.log(JSON.stringify(Zendikar.getStats(), null, 2));
        break;

      case 'progress':
        console.log('\n=== 집필 진행 상황 ===');
        console.log(JSON.stringify(Zendikar.getProgress(), null, 2));
        break;

      case 'search':
        if (args[1]) {
          console.log(`\n=== "${args[1]}" 검색 결과 ===`);
          console.log(JSON.stringify(Zendikar.search(args[1]), null, 2));
        } else {
          console.log('검색어를 입력하세요: node src/index.js search <검색어>');
        }
        break;

      case 'unresolved':
        console.log('\n=== 미회수 복선 목록 ===');
        console.log(JSON.stringify(Foreshadowing.getUnresolved(), null, 2));
        break;

      // ===== 카드 관련 명령어 =====
      case 'card':
        if (args[1]) {
          const cardName = args.slice(1).join(' ');
          console.log(`\n"${cardName}" 카드 검색 중...`);
          const result = await Zendikar.lookupCard(cardName);
          if (result.success) {
            console.log('\n=== 카드 정보 ===');
            console.log(`이름: ${result.card.name}`);
            console.log(`타입: ${result.card.typeLine}`);
            console.log(`세트: ${result.card.setName}`);
            console.log(`레어도: ${result.card.rarity}`);
            if (result.card.flavorText) {
              console.log(`\n플레이버 텍스트:\n"${result.card.flavorText}"`);
            }
            console.log(`\n이미지: ${result.card.images.normal}`);
            console.log(`\n세계관 요소 타입: ${result.worldData.elementType}`);
          } else {
            console.log(`오류: ${result.error}`);
          }
        } else {
          console.log('카드 이름을 입력하세요: node src/index.js card <카드이름>');
        }
        break;

      case 'import':
        if (args[1]) {
          const cardName = args.slice(1).join(' ');
          console.log(`\n"${cardName}" 카드를 세계관에 추가 중...`);
          const result = await Zendikar.importFromCard(cardName);
          if (result.success) {
            console.log(`\n성공! "${result.card.name}"을(를) ${result.type}(으)로 추가했습니다.`);
            console.log(`ID: ${result.data.id}`);
            if (result.card.images.normal) {
              console.log(`이미지: ${result.card.images.normal}`);
            }
          } else {
            console.log(`오류: ${result.error}`);
          }
        } else {
          console.log('카드 이름을 입력하세요: node src/index.js import <카드이름>');
        }
        break;

      case 'sets':
        console.log('\n=== 젠디카르 관련 세트 ===');
        Object.entries(Scryfall.ZENDIKAR_SETS).forEach(([code, name]) => {
          console.log(`  ${code}: ${name}`);
        });
        break;

      case 'legendaries':
        console.log('\n젠디카르 전설적 생물 검색 중...');
        const legends = await Scryfall.searchZendikarCards('type:legendary type:creature');
        if (legends.cards && legends.cards.length > 0) {
          console.log(`\n총 ${legends.total}개 발견:\n`);
          legends.cards.forEach(c => {
            console.log(`  - ${c.name} (${c.setName})`);
          });
        } else {
          console.log('검색 결과 없음');
        }
        break;

      default:
        console.log(`
젠디카르 세계관 관리 도구

사용법:
  node src/index.js <명령어>

[세계관 관리]
  stats      - 전체 통계 보기
  progress   - 집필 진행 상황
  search     - 검색 (node src/index.js search <검색어>)
  unresolved - 미회수 복선 목록

[MTG 카드]
  card       - 카드 정보 조회 (node src/index.js card <카드이름>)
  import     - 카드를 세계관 요소로 추가 (node src/index.js import <카드이름>)
  sets       - 젠디카르 관련 세트 목록
  legendaries - 젠디카르 전설적 생물 목록
        `);
    }
  })();
}
