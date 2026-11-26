import { createImageModal } from './modal.js';

export function createGallery(container, items) {
  if (!items.length) return;
  const modal = createImageModal(items);
  const grid = document.createElement('div');
  grid.className = 'archive-gallery-grid';
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'archive-gallery-card';
    button.setAttribute('aria-label', `Ampliar: ${item.title}`);
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    const title = document.createElement('span');
    title.className = 'archive-gallery-title';
    title.textContent = item.title;
    button.append(img, title);
    button.addEventListener('click', () => modal.open(index));
    grid.append(button);
  });
  container.replaceChildren(grid);
}
