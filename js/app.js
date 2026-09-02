import { processImageFile } from './storage.js';
import { 
  updateStats, 
  renderPerfumeCards, 
  setCategoryFilter, 
  openPerfumeModal, 
  closePerfumeModal, 
  clearImagePreview,
  savePerfume, 
  deletePerfume 
} from './perfume.js';

// 전역 이벤트 바인딩
window.setCategoryFilter = setCategoryFilter;
window.filterPerfumes = renderPerfumeCards;
window.openPerfumeModal = openPerfumeModal;
window.closePerfumeModal = closePerfumeModal;
window.clearImagePreview = clearImagePreview;
window.savePerfume = savePerfume;
window.deletePerfume = deletePerfume;

// 이미지 파일 선택 이벤트 처리 (최대 폭 700px로 압축)
function setupFileInput() {
  const fileInput = document.getElementById('form-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        processImageFile(file, 700, base64 => {
          document.getElementById('form-img-base64').value = base64;
          document.getElementById('form-img-preview').src = base64;
          document.getElementById('preview-wrap').classList.remove('hidden');
          document.getElementById('btn-remove-img').classList.remove('hidden');
        });
      }
    });
  }
}

// 패밀리 사이트 토글
window.toggleFamilySiteMenu = function() {
  const menu = document.getElementById('family-site-menu');
  const icon = document.getElementById('family-site-icon');
  if (!menu) return;

  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    if (icon) icon.className = "fa-solid fa-xmark text-slate-400 text-base";
  } else {
    menu.classList.add('hidden');
    if (icon) icon.className = "fa-solid fa-layer-group text-purple-400";
  }
};

document.addEventListener('click', function(e) {
  const container = document.getElementById('family-site-menu')?.parentElement;
  const menu = document.getElementById('family-site-menu');
  const icon = document.getElementById('family-site-icon');
  if (container && !container.contains(e.target) && menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
    if (icon) icon.className = "fa-solid fa-layer-group text-purple-400";
  }
});

// 시작 시 렌더링
window.addEventListener('DOMContentLoaded', () => {
  setupFileInput();
  updateStats();
  renderPerfumeCards();
});
