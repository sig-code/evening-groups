import { Member, Group } from './types';

/**
 * Fisher-Yatesシャッフルアルゴリズムを使用して配列をランダムにシャッフル
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 前回のグループ分けとの多様性スコアを計算
 * スコアが低いほど前回と重複が少ない（より良い）
 */
function calculateDiversityScore(currentGroups: Group[], previousGroups?: Group[]): number {
  if (!previousGroups || previousGroups.length === 0) {
    return 0; // 前回の履歴がない場合は最高スコア
  }

  let duplicateCount = 0;
  let totalPairs = 0;

  // 現在のグループでの全ペア組み合わせをチェック
  for (const currentGroup of currentGroups) {
    const members = currentGroup.members;
    
    // グループ内の全ペア組み合わせをチェック
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        totalPairs++;
        
        // 前回のグループで同じペアが存在するかチェック
        const member1 = members[i].name;
        const member2 = members[j].name;
        
        for (const prevGroup of previousGroups) {
          const prevMemberNames = prevGroup.members.map(m => m.name);
          if (prevMemberNames.includes(member1) && prevMemberNames.includes(member2)) {
            duplicateCount++;
            break;
          }
        }
      }
    }
  }

  return totalPairs > 0 ? duplicateCount / totalPairs : 0;
}

/**
 * メンバーをランダムにグループ分けする（前回の履歴を考慮）
 */
export async function createOptimalGroups(
  members: Member[], 
  groupCount: number, 
  previousGroups?: Group[]
): Promise<Group[]> {
  if (members.length === 0) {
    throw new Error('メンバーが設定されていません');
  }

  if (groupCount <= 0) {
    throw new Error('グループ数は1以上である必要があります');
  }

  // グループ数がメンバー数より多い場合は調整
  const actualGroupCount = Math.min(groupCount, members.length);
  
  let bestGroups: Group[] = [];
  let bestScore = Infinity;
  
  // 前回の履歴がある場合は複数回試行して最適解を探す
  const attempts = previousGroups && previousGroups.length > 0 ? 50 : 1;
  
  for (let attempt = 0; attempt < attempts; attempt++) {
    // メンバーをランダムにシャッフル
    const shuffledMembers = shuffleArray(members);
    
    // グループを初期化
    const groups: Group[] = [];
    for (let i = 0; i < actualGroupCount; i++) {
      groups.push({
        id: i + 1,
        members: []
      });
    }
    
    // メンバーを順番にグループに配置
    shuffledMembers.forEach((member, index) => {
      const groupIndex = index % actualGroupCount;
      groups[groupIndex].members.push(member);
    });
    
    // 多様性スコアを計算
    const score = calculateDiversityScore(groups, previousGroups);
    
    // より良いスコアの場合は更新
    if (score < bestScore) {
      bestScore = score;
      bestGroups = groups;
    }
    
    // 完璧なスコア（重複なし）の場合は早期終了
    if (score === 0) {
      break;
    }
  }
  
  return bestGroups;
}