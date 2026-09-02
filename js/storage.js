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
    buyDate: '2026-01-15',
    store: '이태원 르라보 플래그십',
    img: '',
    notes: '바이올렛, 카다멈 / 아이리스, 앰브록스 / 샌달우드, 시더우드, 가죽',
    memo: '처음엔 종이 태우는 듯 스파이시하지만 살에 스며들수록 부드러운 샌달우드 잔향.'
  },
  {
    id: 'p_2',
    brand: 'Diptyque',
    name: 'Fleur de Peau',
    category: '머스크/비누',
    concentration: 'EDP',
    seasons: ['봄', '가을', '겨울'],
    capacity: '75ml',
    remain: 65,
    rating: 5,
    buyDate: '2026-03-20',
    store: '신세계백화점 강남점',
    img: '',
    notes: '알데하이드, 핑크페퍼 / 아이리스, 터키쉬로즈 / 머스크, 앰버그리스',
    memo: '포근하고 고급스러운 파우더리 살냄새 머스크.'
  }
];

export function loadPerfumes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ITEMS;
  try {
    const parsed = JSON.parse(raw);
    return parsed.map(item => ({
      ...item,
      seasons: Array.isArray(item.seasons) 
        ? item.seasons 
        : (item.season ? [item.season] : ['사계절']),
      buyDate: item.buyDate || '',
      store: item.store || '',
      img: item.img || ''
    }));
  } catch (e) {
    console.error('Data parse error:', e);
    return DEFAULT_ITEMS;
  }
}

export function savePerfumes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 🖼 이미지 리사이즈 및 Base64 변환 함수
export function processImageFile(file, maxWidth, callback) {
  if (!file) return callback('');
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      callback(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
