import { createGallery } from '../components/gallery.js';

const photographs = [
  ['proclamacion.jpeg', 'Fundación de la República Popular China'],
  ['reforma_agraria.jpeg', 'Reforma agraria'],
  ['vida_comun.jpeg', 'Vida en las comunas populares'],
  ['hornos_acero.jpeg', 'Hornos de acero y Gran Salto Adelante'],
  ['libro_rojo.jpeg', 'El Libro Rojo de Mao'],
  ['guardias_rojos.jpeg', 'Guardias Rojos'],
  ['cartel_dazibao.jpeg', 'Los dazibao'],
  ['cartel.jpeg', 'Propaganda maoísta'],
  ['jovenes_campo.jpeg', 'Jóvenes enviados al campo'],
  ['medicos_descalzos.jpeg', 'Médicos descalzos'],
];

export function init() {
  const container = document.getElementById('galeria-app');
  if (!container || container.dataset.galleryReady) return;
  const root = document.body.dataset.root ?? '';
  const items = photographs.map(([file, title]) => ({
    src: `${root}assets/images/gallery/${file}`, title,
  }));
  createGallery(container, items);
  container.dataset.galleryReady = 'true';
}
