const timerMap = new Map();

/*
PROMPT RELATED SCRIPTS
*/

const originalColors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffc107',
  '#ff9800',
  '#ff5722',
];
var colors = [...originalColors];

const inputPlaceholder = [
  'What will you do today?',
  'Task to Tackle',
  'Gotta finish this!',
  'YOLO, cherish it.',
  'You can do it!',
  'Just Do It.',
  "I'm working.",
  "Let's be productive.",
];
var holders = [...inputPlaceholder];

function updateColor() {
  const index = Math.floor(Math.random() * Math.floor(colors.length));
  const color = colors.splice(index, 1)[0];
  this.color = color;

  const promptElements = document.querySelectorAll('.prompt.element');
  promptElements.forEach((element) => {
    if (!element.classList.contains('spacer')) {
      element.style.borderColor = color;
      element.style.backgroundColor = color + ringBaseOpacity;
    }
  });

  document.querySelector('circle.prompt').setAttribute('stroke', color);

  document.styleSheets[0].addRule(
    'input::selection',
    'background: ' + color + '8F'
  );
}

function updatePlaceholder() {
  const index = Math.floor(Math.random() * Math.floor(holders.length));
  const holder = holders.splice(index, 1)[0];
  if (holders.length == 0) {
    holders = [...inputPlaceholder];
  }
  document.querySelector('.prompt.label').placeholder = holder;
}
/**
 * Modal Functions
 */
function closeModal() {
  document.querySelector('.modal.layer').style.display = 'none';
  document.querySelector('.modal.invalid.title').style.display = 'none';
  document.querySelector('.modal.invalid.message').style.display = 'none';
  document.querySelector('.modal.nomore.title').style.display = 'none';
  document.querySelector('.modal.nomore.message').style.display = 'none';
}
function showInvalid() {
  document.querySelector('.modal.layer').style.display = 'flex';
  document.querySelector('.modal.invalid.title').style.display = 'block';
  document.querySelector('.modal.invalid.message').style.display = 'block';
}
function showNomore() {
  document.querySelector('.modal.layer').style.display = 'flex';
  document.querySelector('.modal.nomore.title').style.display = 'block';
  document.querySelector('.modal.nomore.message').style.display = 'block';
}
/**
 * End of Modal Functions
 */

/**
 * Timer Scripts
 */
const ringStrokeWidth = 30;
const ringOuterRadius = 100;
const ringBaseOpacity = 44;

const ringRadius = ringOuterRadius - ringStrokeWidth / 2;
const ringCircum = 2 * Math.PI * ringRadius;

function fetchTime() {
  const timeInput = document.querySelector('.prompt.time');
  const hour = timeInput.querySelector('.hour').value;
  const mins = timeInput.querySelector('.mins').value;
  const secs = timeInput.querySelector('.secs').value;
  return parseInt(hour) * 3600 + parseInt(mins) * 60 + parseInt(secs);
}

function resetTime() {
  const timeInput = document.querySelector('.prompt.time');
  timeInput.querySelector('.hour').value = '';
  timeInput.querySelector('.mins').value = '';
  timeInput.querySelector('.secs').value = '';
}

function addTimer() {
  const main = document.querySelector('.main');
  if (main.children.length <= 7) {
    const label = document.querySelector('.prompt.label');
    const time = fetchTime();
    if (label.value != null && time > 0) {
      const timer = constructTimer(label.value, time, this.color);
      main.appendChild(timer);
      label.value = '';
      resetTime();
    } else {
      showInvalid();
    }
  } else {
    showNomore();
  }
  document.querySelector('.prompt.label').focus();
  updateColor();
  updatePlaceholder();
}

function constructTimer(label, time, color) {
  timerMap.set(color, new TimerData(label, time, color));

  const timer = document.createElement('div');
  timer.className = 'timer';
  timer.id = color;
  timer.setAttribute('data-time', time);

  const card = document.createElement('div');
  card.className = 'card';

  const ring = constructRing(color);
  const display = constructDisplay(label, time);
  const controller = constructController(color);

  card.appendChild(ring);
  card.appendChild(display);
  card.appendChild(controller);
  timer.appendChild(card);
  return timer;
}

function constructRing(color) {
  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ring.class = 'ring';

  const viewboxSize = ringOuterRadius * 2;
  ring.setAttribute('viewBox', `0 0 ${viewboxSize} ${viewboxSize}`);

  const base = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  console.log(base);
  base.setAttribute('fill', 'transparent');
  base.setAttribute('r', ringRadius);
  base.setAttribute('cx', ringOuterRadius);
  base.setAttribute('cy', ringOuterRadius);
  base.setAttribute('stroke-width', ringStrokeWidth);
  base.setAttribute('stroke', color + ringBaseOpacity);

  const progress = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  );
  progress.class = 'ring progress';
  progress.setAttribute('fill', 'transparent');
  progress.setAttribute('r', ringRadius);
  progress.setAttribute('cx', ringOuterRadius);
  progress.setAttribute('cy', ringOuterRadius);
  progress.setAttribute('stroke-width', ringStrokeWidth);
  progress.setAttribute('stroke', color);
  progress.setAttribute('stroke-dasharray', `${ringCircum} ${ringCircum}`);
  progress.setAttribute('stroke-dashoffset', ringCircum);
  progress.setAttribute(
    'transform',
    `rotate(-90, ${ringOuterRadius}, ${ringOuterRadius})`
  );
  progress.style.transition = 'stroke-dashoffset 1s';
  progress.style.transitionTimingFunction = 'linear';

  ring.appendChild(base);
  ring.appendChild(progress);

  return ring;
}

function constructDisplay(l, t) {
  const display = document.createElement('div');
  display.className = 'display';

  const label = document.createElement('div');
  label.className = 'label timer-disp';
  label.innerHTML = l;

  const clock = document.createElement('div');
  clock.className = 'clock timer-disp ';
  clock.innerHTML = seconds2iso(t);

  display.appendChild(label);
  display.appendChild(clock);
  return display;
}

function constructController(color) {
  const controller = document.createElement('div');
  controller.className = 'controller';
  controller.setAttribute('data-color', color);
  controller.style.color = color;

  const play = document.createElement('button');
  play.className = 'play control';
  play.innerHTML = '<i class="fas fa-play-circle"></i>';
  play.addEventListener('click', startTimer, false);

  const pause = document.createElement('button');
  pause.className = 'pause control';
  pause.innerHTML = '<i class="fas fa-pause-circle"></i>';
  pause.style.display = 'none';
  pause.addEventListener('click', pauseTimer, false);

  const refresh = document.createElement('button');
  refresh.className = 'refresh control';
  refresh.innerHTML = '<i class="fas fa-undo-alt"></i>';
  refresh.addEventListener('click', refreshTimer, false);

  const trash = document.createElement('button');
  trash.className = 'trash control';
  trash.innerHTML = '<i class="fas fa-trash"></i>';
  trash.addEventListener('click', trashTimer, false);

  controller.appendChild(play);
  controller.appendChild(pause);
  controller.appendChild(refresh);
  controller.appendChild(trash);
  return controller;
}

/**
 * End of Timer Scripts
 */

/**
 * Processing Functions
 */

function startTimer(event) {
  const controller = getParentElement(event.target, 'controller');
  controller.children[0].style.display = 'none';
  controller.children[1].style.display = 'block';

  const color = controller.getAttribute('data-color');
  const timerData = timerMap.get(color);
  const timer = document.getElementById(timerData.color);
  const ring = timer.querySelector('svg').children[1];
  const clock = timer.querySelector('.clock');
  timerData.sessionStart = Date.now();
  updateTimer(timerData, ring, clock);
  timerData.interval = setInterval(() => {
    updateTimer(timerData, ring, clock);
    if (timerData.remain <= 0) {
      clearInterval(timerData.interval);
      controller.children[0].disabled = true;
      controller.children[1].disabled = true;
    }
  }, 1000);
}

function pauseTimer(event) {
  const controller = getParentElement(event.target, 'controller');
  const timerData = timerMap.get(controller.getAttribute('data-color'));
  const timer = document.getElementById(timerData.color);
  const ring = timer.querySelector('svg').children[1];
  const clock = timer.querySelector('.clock');
  controller.children[0].style.display = 'block';
  controller.children[1].style.display = 'none';
  if (timerData.remain > 1) {
    timerData.prevProg = timerData.progress + 1;
    clearInterval(timerData.interval);
  }
}

function refreshTimer(event) {
  pauseTimer(event);
  const controller = getParentElement(event.target, 'controller');
  const color = controller.getAttribute('data-color');
  const timerData = timerMap.get(color);
  const timer = document.getElementById(timerData.color);
  const ring = timer.querySelector('svg').children[1];
  const clock = timer.querySelector('.clock');
  controller.children[0].disabled = false;
  controller.children[1].disabled = false;
  timerData.reset();
  ring.setAttribute('stroke-dashoffset', ringCircum);
  clock.innerHTML = seconds2iso(timerData.remain);
}

function trashTimer(event) {
  refreshTimer(event);
  getParentElement(event.target, 'timer').remove();
}

function getParentElement(elm, targetClass) {
  var element = elm;
  while (!element.classList.contains(targetClass)) {
    element = element.parentElement;
  }
  return element;
}

function updateTimer(timerData, ring, clock) {
  clock.innerHTML = seconds2iso(timerData.remain);
  ring.setAttribute(
    'stroke-dashoffset',
    timerData.remain <= 0
      ? 0
      : ((timerData.remain - 1) / timerData.time) * ringCircum
  );
}

/**
 * End of Processing Functions
 */

class TimerData {
  _label;
  _color;
  _time;
  _prevProg;
  _sessionStart;
  _interval;
  get interval() {
    return this._interval;
  }
  set interval(i) {
    this._interval = i;
  }
  get label() {
    return this._label;
  }
  get color() {
    return this._color;
  }
  get time() {
    return this._time;
  }
  set prevProg(prepro) {
    this._prevProg = prepro;
  }
  get prevProg() {
    return this._prevProg;
  }
  set sessionStart(sessionStart) {
    this._sessionStart = sessionStart;
  }
  get sessionStart() {
    return this._sessionStart;
  }

  get progress() {
    if (this.sessionStart != 0) {
      return (
        this._prevProg + Math.floor((Date.now() - this._sessionStart) / 1000)
      );
    } else {
      return 0;
    }
  }

  get remain() {
    const remain = this._time - this.progress;
    return remain < 0 ? 0 : remain;
  }

  reset() {
    this._sessionStart = 0; // set when start
    this._prevProg = 0;
  }

  constructor(label, time, color) {
    this._label = label;
    this._color = color;
    this._time = time;
    this._sessionStart = 0; // set when start
    this._prevProg = 0; // set when paused
  }
}

window.onload = function () {
  updateColor();
  updatePlaceholder();
  resetTime();
  document.querySelector('.prompt.label').focus();
};

window.addEventListener('keyup', (event) => {
  // Number 13 is the "Enter" key on the keyboard
  if (event.code === 'Enter' || event.code === 'NumpadEnter') {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.querySelector('.prompt.button').click();
  }
});
function iso2seconds(iso) {
  const hr = parseInt(iso.substring(0, 2));
  const min = parseInt(iso.substring(3, 5));
  const sec = parseInt(iso.substring(6, 8));
  return parseInt(hr * 3600 + min * 60 + sec);
}

function seconds2iso(seconds) {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = (seconds % 3600) % 60;
  return (
    hr.toString().padStart(2, '0') +
    ':' +
    min.toString().padStart(2, '0') +
    ':' +
    sec.toString().padStart(2, '0')
  );
}
