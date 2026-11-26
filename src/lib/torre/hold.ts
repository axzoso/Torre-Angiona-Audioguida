/**
 * Altezza in px della sosta finale della torre in home (`--torre-hold`, in svh,
 * definita in index.astro). Una variabile CSS in svh non si legge già risolta,
 * quindi la misura un elemento invisibile dentro il contenitore del disegno.
 * La usano sia l'animazione (TorreDrawing) sia il racconto (index.astro), così
 * restano sincronizzati.
 */
export function holdHeight(box: HTMLElement): number {
  let probe = box.querySelector<HTMLElement>('[data-torre-hold]');
  if (!probe) {
    probe = document.createElement('div');
    probe.dataset.torreHold = '';
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:var(--torre-hold, 0px)';
    box.append(probe);
  }
  return probe.offsetHeight;
}
