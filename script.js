const buttons = [...document.querySelectorAll('[data-focus]')];
const cases = [...document.querySelectorAll('.case')];
function focusWork(focus) {
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.focus === focus)));
  cases.forEach(c => c.hidden = focus !== 'all' && !c.dataset.tags.split(' ').includes(focus));
}
buttons.forEach(b => b.addEventListener('click', () => focusWork(b.dataset.focus)));
function revealAnchor() {
  const current = cases.find(c => '#' + c.id === location.hash);
  if (current) { focusWork('all'); current.querySelector('details').open = true; }
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();
