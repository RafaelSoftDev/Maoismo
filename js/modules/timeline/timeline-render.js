import { getRoot } from "../../core/utils.js";
import { CATEGORIAS, FUENTES, RANGO } from "./timeline-data.js";

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.flat().filter((c) => c != null));
  return node;
}

const fechaCorta = (e) => (e.fin && e.fin !== e.inicio ? `${e.inicio}–${e.fin}` : `${e.inicio}`);
const nombreCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? id;

/* ---------- Filtros ---------- */
export function renderFilters(container, onChange) {
  const opciones = [{ id: "todos", nombre: "Todos" }, ...CATEGORIAS];
  const botones = opciones.map((o) => {
    const b = h("button", { class: "chip", type: "button", "data-filtro": o.id, "aria-pressed": "false", text: o.nombre });
    b.addEventListener("click", () => onChange(o.id));
    return b;
  });
  container.replaceChildren(...botones);
  return {
    setActive(id) {
      botones.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtro === id)));
    },
  };
}

/* ---------- Línea temporal ---------- */
export function renderTrack(scroller, eventos, onSelect) {
  const track = h("div", { class: "chrono-track" });
  track.style.setProperty("--yrs", RANGO.fin - RANGO.inicio);
  track.append(h("div", { class: "chrono-axis", "aria-hidden": "true" }));

  for (let y = RANGO.inicio; y <= RANGO.fin; y++) {
    const tick = h("span", { class: "chrono-tick", "aria-hidden": "true", text: y });
    tick.style.setProperty("--i", y - RANGO.inicio);
    track.append(tick);
  }

  const nodes = new Map();
  const add = (id, n) => nodes.set(id, [...(nodes.get(id) ?? []), n]);
  const laneEnds = [];

  eventos.forEach((e) => {
    const i = e.inicio - RANGO.inicio;
    const marker = h("button", { class: "chrono-marker", type: "button", "data-id": e.id, "aria-label": `${fechaCorta(e)}: ${e.titulo}` },
      h("span", { class: "chrono-marker-year", text: fechaCorta(e) }),
      h("span", { class: "chrono-marker-name", text: e.etiqueta }),
      h("span", { class: "chrono-dot" }));
    marker.style.setProperty("--i", i);
    track.append(marker);
    add(e.id, marker);

    if (e.fin && e.fin > e.inicio) {
      let lane = laneEnds.findIndex((end) => end <= e.inicio);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = e.fin;
      const range = h("button", { class: "chrono-range", type: "button", "data-id": e.id, "aria-label": `Período ${fechaCorta(e)}: ${e.titulo}`, title: `${fechaCorta(e)} · ${e.etiqueta}` });
      range.style.setProperty("--i", i);
      range.style.setProperty("--len", e.fin - e.inicio);
      range.style.setProperty("--lane", lane);
      track.append(range);
      add(e.id, range);
    }
  });

  track.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-id]");
    if (b && !b.disabled) onSelect(b.dataset.id);
  });
  scroller.replaceChildren(track);

  return {
    setActive(id, behavior = "smooth") {
      nodes.forEach((list, key) => list.forEach((n) => {
        n.classList.toggle("is-active", key === id);
        n.toggleAttribute("aria-current", key === id);
      }));
      const marker = nodes.get(id)?.[0];
      if (marker) scroller.scrollTo({ left: Math.max(0, marker.offsetLeft - scroller.clientWidth / 2), behavior });
    },
    setVisible(ids) {
      nodes.forEach((list, key) => list.forEach((n) => {
        n.disabled = !ids.has(key);
        n.classList.toggle("is-dim", !ids.has(key));
      }));
    },
  };
}

/* ---------- Tarjetas ---------- */
export function renderCards(container, eventos, onSelect) {
  const cards = new Map();
  eventos.forEach((e) => {
    const card = h("button", { class: "chrono-card", type: "button", "data-id": e.id },
      h("span", { class: "chrono-card-year", text: fechaCorta(e) }),
      h("h3", { text: e.titulo }),
      h("p", { text: e.resumen }),
      h("span", { class: "chrono-card-tags", text: e.categorias.map(nombreCategoria).join(" · ") }));
    card.addEventListener("click", () => onSelect(e.id));
    cards.set(e.id, card);
  });
  container.replaceChildren(...cards.values());
  return {
    setActive(id) {
      cards.forEach((c, key) => c.toggleAttribute("aria-current", key === id));
    },
    setVisible(ids) {
      cards.forEach((c, key) => { c.hidden = !ids.has(key); });
    },
  };
}

/* ---------- Panel ampliado ---------- */
function renderFoto(fig, e) {
  const extensiones = ["jpg", "jpeg", "png", "webp"];
  const base = `${getRoot()}assets/images/historical/${e.id}`;
  const img = h("img", {
    alt: `Fotografía histórica asociada a: ${e.titulo}`
  });
  let intento = 0;
  img.addEventListener("error", () => {
    intento++;
    if (intento < extensiones.length) {
      img.src = `${base}.${extensiones[intento]}`;
    } else {
      fig.replaceChildren();
    }
  });
  img.src = `${base}.${extensiones[intento]}`;
  fig.replaceChildren(img);
}

export function renderPanel(refs, e, posicion, total) {
  refs.fecha.textContent = e.fecha;
  refs.titulo.textContent = e.titulo;
  refs.descripcion.replaceChildren(...e.descripcion.map((p) => h("p", { text: p })));
  refs.actores.replaceChildren(...e.actores.map((a) => h("li", { text: a })));
  refs.consecuencias.replaceChildren(...e.consecuencias.map((c) => h("li", { text: c })));
  refs.fuentes.replaceChildren(...e.fuentes.map((id) => {
    const f = FUENTES[id];
    return h("li", {}, f.cita, h("span", { class: "source-type", text: f.tipo === "primaria" ? "Fuente primaria" : "Estudio académico" }));
  }));
  renderFoto(refs.foto, e);
  refs.contador.textContent = `${posicion + 1} de ${total}`;
  refs.prev.disabled = posicion <= 0;
  refs.next.disabled = posicion >= total - 1;
}
