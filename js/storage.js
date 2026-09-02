const STORAGE_KEY = 'scent_archive_v1';

export const DEFAULT_ITEMS = [
  {
    id: 'p_1',
    brand: 'Le Labo',
    name: 'Santal 33',
    category: '우디',
    concentration: 'EDP',
    seasons: ['가을', '겨울'],
    capacity: '50ml',
    remain: 80,
    rating: 5,
    notes: '바이올렛, 카다멈 / 아이리스, 앰브록스 / 샌달우드, 시더우드, 가죽',
    memo: '처음엔 종이 태우는 듯 스파이시하지만 살에 스며들수록 부드러운 샌달우드 잔향.'
  }
];

export function loadPerfumes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ITEMS;
  try {
    const parsed = JSON.parse(raw);
    // 기존 단일 문자열(season)로 저장된 이전 데이터와의 하위 호환성 보장
    return parsed.map(item => ({
      ...item,
      seasons: Array.isArray(item.seasons) 
        ? item.seasons 
        : (item.season ? [item.season] : ['사계절'])
    }));
  } catch (e) {
    console.error('Data parse error:', e);
    return DEFAULT_ITEMS;
  }
}

export function savePerfumes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
