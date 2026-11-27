/*
  PROTOTYPE, throwaway (prototype/timeline-periods-main): the minimap's
  periods on the main Timeline. ?periods=a|b|c|d picks a variant; a bar at the
  bottom switches. Reads everything from the rendered minimap, so no template
  work: each row's share from its tick's --tick-at, each period's from
  --p-start/--p-end.
*/
type Period = { id: string; track: string; label: string; dates: string; start: number; end: number; parity: string };
type Row = { el: HTMLElement; at: number };

const VARIANTS: Record<string, string> = {
  a: "A · Chips beside the era pill",
  b: "B · Period markers on the axis",
  c: "C · Bands behind the rows",
  d: "D · Periods replace the eras",
};

const params = new URLSearchParams(location.search);
const variant = params.get("periods") ?? "a";
const axis = document.querySelector<HTMLElement>(".timeline-axis");

function num(el: Element, prop: string): number {
  return Number.parseFloat(getComputedStyle(el).getPropertyValue(prop));
}

function readPeriods(): Period[] {
  return [...document.querySelectorAll<HTMLElement>(".timeline-minimap__period")].map((li) => {
    const id = li.dataset.period ?? "";
    const item = document.querySelector(`#period-${id}`);
    return {
      id,
      track: li.classList.contains("timeline-minimap__period--temple") ? "temple" : "age",
      label: item?.querySelector("strong")?.textContent?.trim() ?? id,
      dates: item?.querySelector(".timeline-periods__dates")?.textContent?.trim() ?? "",
      start: num(li, "--p-start"),
      end: num(li, "--p-end"),
      parity: li.dataset.parity ?? "",
    };
  });
}

function readRows(): Row[] {
  const rows: Row[] = [];
  for (const tick of document.querySelectorAll<HTMLAnchorElement>(".timeline-minimap__tick[href^='#']")) {
    const el = document.getElementById(tick.getAttribute("href")!.slice(1));
    if (el?.closest(".timeline-axis")) rows.push({ el, at: num(tick, "--tick-at") });
  }
  return rows.sort((x, y) => x.at - y.at);
}

function topOf(el: Element): number {
  return el.getBoundingClientRect().top - axis!.getBoundingClientRect().top;
}

/* The y where a share begins: just above the first row at or after it. */
function yAt(rows: Row[], share: number): number | undefined {
  const row = rows.find((r) => r.at >= share - 1e-9);
  return row ? topOf(row.el) - 12 : undefined;
}

function chips(periods: Period[], rows: Row[]) {
  for (const era of document.querySelectorAll<HTMLElement>(".timeline-era")) {
    const label = era.querySelector(".timeline-era__label");
    const first = era.querySelector(".timeline-entry");
    const tick = first && document.querySelector(`.timeline-minimap__tick[href='#${first.id}']`);
    if (!label || !tick) continue;
    const from = num(tick, "--era-start");
    const to = num(tick, "--era-end");
    const inEra = rows.filter((r) => era.contains(r.el));
    const over = periods.filter((p) => inEra.some((r) => r.at >= p.start && r.at < p.end) || (p.start < to && p.end > from && p.start >= from));
    if (!over.length) continue;
    const box = document.createElement("span");
    box.className = "proto-chips";
    box.setAttribute("aria-hidden", "true");
    for (const p of over) {
      const chip = document.createElement("span");
      chip.className = `proto-chip proto-chip--${p.track}`;
      chip.textContent = p.label;
      chip.title = p.dates;
      box.append(chip);
    }
    label.append(box);
  }
}

function layer(): HTMLElement {
  let el = axis!.querySelector<HTMLElement>(".proto-layer");
  if (!el) {
    el = document.createElement("div");
    el.className = "proto-layer";
    el.setAttribute("aria-hidden", "true");
    axis!.prepend(el);
  }
  el.replaceChildren();
  return el;
}

function draw(periods: Period[], rows: Row[]) {
  const out = layer();
  const end = axis!.scrollHeight - 24;
  const bands = variant === "c" || variant === "d";
  const markers = variant === "b" || variant === "d";
  for (const p of periods) {
    const y0 = yAt(rows, p.start);
    if (y0 === undefined) continue;
    const y1 = yAt(rows, p.end) ?? end;
    if (bands) {
      const band = document.createElement("div");
      band.className = `proto-band proto-band--${p.track}`;
      band.dataset.parity = p.parity;
      band.style.top = `${y0}px`;
      band.style.height = `${Math.max(y1 - y0, 4)}px`;
      if (p.track === "age" && !markers) {
        const tag = document.createElement("span");
        tag.className = "proto-band__label";
        tag.textContent = p.label;
        band.append(tag);
      }
      out.append(band);
    }
    if (markers) {
      const pill = document.createElement("div");
      pill.className = `proto-marker proto-marker--${p.track}`;
      pill.style.top = `${y0 - 10}px`;
      /* Where a period starts with an era, sit beside the era pill, not on it. */
      if (variant === "b") {
        for (const l of document.querySelectorAll(".timeline-era__label")) {
          const r = l.getBoundingClientRect();
          const t = r.top - axis!.getBoundingClientRect().top;
          if (Math.abs(t - (y0 - 10)) < 30) {
            pill.style.top = `${t}px`;
            pill.style.translate = `${r.width / 2 + 8}px 0`;
          }
        }
      }
      pill.innerHTML = `<b></b> <span></span>`;
      pill.querySelector("b")!.textContent = p.label;
      pill.querySelector("span")!.textContent = p.dates;
      out.append(pill);
    }
  }
}

function bar() {
  const nav = document.createElement("nav");
  nav.className = "proto-bar";
  nav.innerHTML = `<strong>PROTOTYPE</strong>`;
  for (const [key, name] of Object.entries(VARIANTS)) {
    const a = document.createElement("a");
    const url = new URL(location.href);
    url.searchParams.set("periods", key);
    a.href = url.toString();
    a.textContent = name;
    if (key === variant) a.setAttribute("aria-current", "true");
    nav.append(a);
  }
  document.body.append(nav);
}

if (axis) {
  document.documentElement.dataset.protoPeriods = variant;
  bar();
  const periods = readPeriods();
  const rows = readRows();
  if (variant === "a") chips(periods, rows);
  else {
    let queued = false;
    const redraw = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        draw(periods, rows);
      });
    };
    new ResizeObserver(redraw).observe(axis);
    for (const r of rows) new ResizeObserver(redraw).observe(r.el);
    redraw();
  }
}
