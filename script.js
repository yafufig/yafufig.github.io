const buttons = [...document.querySelectorAll('[data-focus]')];
const cases = [...document.querySelectorAll('.case')];
function focusWork(focus) {
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.focus === focus)));
  cases.forEach(c => c.hidden = focus !== 'all' && !c.dataset.tags.split(' ').includes(focus));
}
buttons.forEach(b => b.addEventListener('click', () => focusWork(b.dataset.focus)));
function revealAnchor() {
  const target = document.getElementById(location.hash.slice(1));
  const current = target && cases.find(c => c === target || c.contains(target));
  if (current) { focusWork('all'); current.querySelector('details').open = true; }
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();

const awardSummary = document.querySelector('.award-summary');
const awardInfo = awardSummary.querySelector('.award-info');
const awardTooltip = document.getElementById('award-results');
let awardsPinned = false;
function showAwards() {
  awardTooltip.hidden = false;
  awardInfo.setAttribute('aria-expanded', 'true');
  awardTooltip.classList.remove('above');
  const roomBelow = window.innerHeight - awardSummary.getBoundingClientRect().bottom;
  const requiredRoom = awardTooltip.getBoundingClientRect().height + 16;
  if (roomBelow < requiredRoom && awardSummary.getBoundingClientRect().top > requiredRoom) {
    awardTooltip.classList.add('above');
  }
}
function hideAwards() {
  awardTooltip.hidden = true;
  awardInfo.setAttribute('aria-expanded', 'false');
}
awardInfo.addEventListener('pointerenter', event => {
  if (event.pointerType !== 'touch') showAwards();
});
awardSummary.addEventListener('pointerleave', () => {
  if (!awardsPinned && !awardSummary.contains(document.activeElement)) hideAwards();
});
awardInfo.addEventListener('focus', showAwards);
awardInfo.addEventListener('blur', () => {
  if (!awardsPinned) hideAwards();
});
awardInfo.addEventListener('click', () => {
  awardsPinned = !awardsPinned;
  if (awardsPinned) showAwards(); else hideAwards();
});
document.addEventListener('pointerdown', event => {
  if (!awardSummary.contains(event.target)) {
    awardsPinned = false;
    hideAwards();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    awardsPinned = false;
    hideAwards();
  }
});
