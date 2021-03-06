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

var colors = [...originalColors];
var holders = [...inputPlaceholder];

function updateColor() {
  const index = Math.floor(Math.random() * Math.floor(colors.length));
  const color = colors.splice(index, 1)[0];
  if (colors.length == 0) {
    colors = [...originalColors];
  }
  this.color = color;

  const promptElements = document.querySelectorAll('.prompt.element');
  promptElements.forEach((element) => {
    if (!element.classList.contains('spacer')) {
      element.style.borderColor = color;
      element.style.backgroundColor = color + '1A';
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

function getAssociatedRing(button) {
  return button.parentElement.parentElement.children[0];
}

function changeStatus(button, status) {
  getAssociatedRing(button).setAttribute('status', status);
}

function disableButton(button, tfarray) {
  // console.log(`disabling: ${tfarray}`);
  for (ii = 0; ii < tfarray.length; ii++) {
    button.parentElement.children[ii].disabled = tfarray[ii];
  }
}

function startTimer(button) {
  // console.log('running timer');
  changeStatus(button, 'running');
  disableButton(button, [true, false, false]);
}

function pauseTimer(button) {
  // console.log('pause timer');
  changeStatus(button, 'paused');
  disableButton(button, [false, true, false]);
}
function refreshTimer(button) {
  // console.log('refresh timer');
  changeStatus(button, 'refreshed');
  disableButton(button, [false, true, true]);
}
function trashTimer(button) {
  // console.log('trash timer');
  refreshTimer(button);
  getAssociatedRing(button).parentElement.parentElement.remove();
  button.parentElement.remove();
}

function addTimer() {
  if (document.querySelector('.main').children.length <= 7) {
    const label = document.querySelector('.prompt.label').value;
    const time = document.querySelector('.prompt.time').value;
    if (label != null && time != '00:00:00') {
      const color = this.color;

      const container = document.createElement('div');
      container.className = 'container';

      const card = document.createElement('div');
      card.className = 'card';

      const ring = document.createElement('progress-ring');
      ring.className = 'ring';
      document.querySelector('.main').appendChild(ring);
      ring.setAttribute('label', label);
      ring.setAttribute(
        'style',
        `--color: ${color}; --background-color: ${color}32 `
      );
      ring.setAttribute('time', time);
      document.querySelector('.main').removeChild(ring);

      const controller = document.createElement('div');
      controller.className = 'controller';
      controller.style.color = color;

      const play = document.createElement('button');
      play.className = 'play control';
      play.innerHTML = '<i class="fas fa-play-circle"></i>';
      play.onclick = () => {
        startTimer(play);
      };

      const pause = document.createElement('button');
      pause.className = 'pause control';
      pause.innerHTML = '<i class="fas fa-pause-circle"></i>';
      pause.onclick = () => {
        pauseTimer(pause);
      };

      const refresh = document.createElement('button');
      refresh.className = 'refresh control';
      refresh.innerHTML = '<i class="fas fa-undo-alt"></i>';
      refresh.onclick = () => {
        refreshTimer(refresh);
      };

      const trash = document.createElement('button');
      trash.className = 'trash control';
      trash.innerHTML = '<i class="fas fa-trash"></i>';
      trash.onclick = () => {
        trashTimer(trash);
      };

      controller.appendChild(play);
      controller.appendChild(pause);
      controller.appendChild(refresh);
      controller.appendChild(trash);
      card.appendChild(ring);
      card.appendChild(controller);
      container.appendChild(card);
      const promptContainer = document.querySelector('.prompt.card').parentNode;
      promptContainer.parentNode.insertBefore(
        container,
        promptContainer.nextSibling
      );

      disableButton(trash, [false, true, true]);

      document.querySelector('.prompt.label').value = '';
      document.querySelector('.prompt.time').value = '00:00:00';
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

window.onload = function () {
  updateColor();
  updatePlaceholder();
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
