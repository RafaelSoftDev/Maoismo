export function createImageModal(items) {
  const dialog = document.createElement('dialog');
  dialog.className = 'archive-image-modal';
  dialog.setAttribute('aria-label', 'Visor de fotografías históricas');
  dialog.innerHTML = `
    <div class="archive-modal-inner">
      <button type="button" class="archive-modal-close" autofocus aria-label="Cerrar visor">×</button>
      <img class="archive-modal-image" alt="">
      <p class="archive-modal-title" aria-live="polite"></p>
      <div class="archive-modal-controls">
        <button type="button" data-prev>Anterior</button>
        <span data-count></span>
        <button type="button" data-next>Siguiente</button>
      </div>
    </div>`;
  document.body.append(dialog);
  const img = dialog.querySelector('img');
  const title = dialog.querySelector('.archive-modal-title');
  const count = dialog.querySelector('[data-count]');
  let index = 0;
  let trigger;
  function render(next) {
    index = (next + items.length) % items.length;
    img.src = items[index].src;
    img.alt = items[index].title;
    title.textContent = items[index].title;
    count.textContent = `${index + 1} / ${items.length}`;
  }
  dialog.querySelector('[data-prev]').addEventListener('click', () => render(index - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => render(index + 1));
  dialog.querySelector('.archive-modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => trigger?.focus());
  return { open(next) {
    trigger = document.activeElement;
    render(next);
    if (!dialog.open) dialog.showModal();
  } };
}
