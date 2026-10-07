const buttons = [...document.querySelectorAll('[data-focus]')];
const cases = [...document.querySelectorAll('.case')];
const workChoices = [...document.querySelectorAll('[data-work]')];
let activeWork = cases[0].id;
const workIndex = document.querySelector('.work-index');
const mobileWork = window.matchMedia('(max-width: 700px)');
function setTabOrientation() {
  workIndex.setAttribute('aria-orientation', mobileWork.matches ? 'horizontal' : 'vertical');
}
mobileWork.addEventListener('change', setTabOrientation);
setTabOrientation();
function activateWork(id, updateHash = false) {
  if (!cases.some(item => item.id === id)) return;
  activeWork = id;
  cases.forEach(item => { item.hidden = item.id !== id; });
  workChoices.forEach(choice => {
    const selected = choice.dataset.work === id;
    choice.setAttribute('aria-selected', String(selected));
    choice.tabIndex = selected ? 0 : -1;
  });
  if (mobileWork.matches) {
    const selected = workChoices.find(choice => choice.dataset.work === id);
    workIndex.scrollTo({left: selected.offsetLeft - workIndex.offsetLeft - parseFloat(getComputedStyle(workIndex).paddingLeft)});
  }
  if (updateHash) history.replaceState(null, '', '#' + id);
}
function focusWork(focus) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.focus === focus)));
  const visibleCases = cases.filter(item => focus === 'all' || item.dataset.tags.split(' ').includes(focus));
  workChoices.forEach(choice => { choice.hidden = !visibleCases.some(item => item.id === choice.dataset.work); });
  document.getElementById('work-count').textContent = visibleCases.length + (visibleCases.length === 1 ? ' work story' : ' work stories');
  if (!visibleCases.some(item => item.id === activeWork)) activateWork(visibleCases[0].id);
}
buttons.forEach(button => button.addEventListener('click', () => focusWork(button.dataset.focus)));
workChoices.forEach(choice => {
  choice.addEventListener('click', () => activateWork(choice.dataset.work, true));
  choice.addEventListener('keydown', event => {
    const available = workChoices.filter(item => !item.hidden);
    let index = available.indexOf(choice);
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') index = (index + 1) % available.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') index = (index - 1 + available.length) % available.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = available.length - 1;
    else return;
    event.preventDefault();
    activateWork(available[index].dataset.work, true);
    available[index].focus();
  });
});
function revealAnchor() {
  const target = document.getElementById(location.hash.slice(1));
  const current = target && cases.find(item => item === target || item.contains(target));
  if (current) {
    focusWork('all');
    activateWork(current.id);
    current.querySelector('details').open = true;
    requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();

const sceneStories = {
  evaluation: {heading: 'Question the uplift.', description: 'Yandex: recommender systems & data leakage.', anchor: '#evaluation', label: 'Explore the Yandex evaluation case'},
  agents: {heading: 'Trace the failure.', description: 'Sber CIB: dialogue logs, routing & offline checks.', anchor: '#agents', label: 'Explore the Sber CIB agent evaluation case'},
  robotics: {heading: 'Close the loop.', description: 'FIRST Tech Challenge: motion, vision & feedback.', anchor: '#robotics', label: 'Explore the robotics competition case'}
};
const sceneButtons = [...document.querySelectorAll('[data-scene]')];
sceneButtons.forEach(button => button.addEventListener('click', () => {
  const mode = button.dataset.scene;
  const story = sceneStories[mode];
  sceneButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('scene-heading').textContent = story.heading;
  document.getElementById('scene-description').textContent = story.description;
  const link = document.getElementById('scene-link');
  link.href = story.anchor;
  link.setAttribute('aria-label', story.label);
  window.dispatchEvent(new CustomEvent('portfolio-focus', {detail: mode}));
}));

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
