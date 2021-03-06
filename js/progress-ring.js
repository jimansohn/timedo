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

class ProgressRing extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._label = this.getAttribute('lable');
    this._radius = 100;
    this._root.innerHTML = `
    <div class="ring-container">
    <svg
      height="100%"
      width="100%"
      viewBox="0 0 ${this._radius * 2} ${this._radius * 2}"
    >
      <circle class="basering" />
      <circle
        class="progress"
      />
    </svg>
    <div class="display">
    <div class="label-display"></div>
    <div class="time-display"></div>
    </div>
  </div>
  <style>
    .ring-container {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
    }
    .time-display{
        font-size: 2rem;
    }
    .display {
        font-size: 1.2rem;
        display: flex;
        flex-direction: column;
        align-items:center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    circle {
        fill: transparent;
        r: calc(${this._radius} - var(--thickness)/2);
        cx: ${this._radius};
        cy: ${this._radius};
        stroke-width: var(--thickness);
        transition: stroke-dashoffset 1s;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition-timing-function: linear;
    }
    .basering {
        stroke: var(--background-color);
    }
    .progress {
        stroke: var(--color);
        stroke-dasharray:calc((${
          this._radius
        } - var(--thickness)/2)*2*3.1416) calc((${
      this._radius
    } - var(--thickness)/2)*2*3.1416);
    }
  </style>
    
        `;
  }

  update() {
    this._data.update();
    this.updateRing();
    this.updateClock();
  }

  updateClock() {
    this._root.querySelector('.time-display').innerHTML = this._data.remain;
  }

  updateRing() {
    const percent = (this._data.progress + 1) / this._data.timeInSec;
    const offset = (1 - percent) * this._circumference;
    const circle = this._root.querySelector('.progress');
    circle.style.strokeDashoffset = offset > 0 ? offset : 0;
  }

  setStatus(old, status) {
    if (status === 'running' && old != 'running') {
      this._data.sessionStart = Date.now();
      this.update();
      this.interval = setInterval(() => {
        this.update();
        if (this._data.remainInSec == 0) {
          clearInterval(this.interval);
          const buttons = this.parentElement.children[1].children;
          buttons[0].disabled = true;
          buttons[1].disabled = true;
          buttons[3].disabled = false;
        }
      }, 1000);
    } else if (status === 'paused') {
      this._data.update();
      this._data.progress += 1;
      this._data.prevProg = this._data.progress;
      const remainder = this._data.timeInSec - this._data.progress;
      this._data.remainInSec = remainder >= 0 ? remainder : 0;
      this._data.remain = seconds2iso(this._data.remainInSec);
      if (remainder != 0) clearInterval(this.interval);
    } else if (status === 'refreshed') {
      console.log('refreshed');
      clearInterval(this.interval);
      this._data = new TimerData(this._data.time);
      this.updateClock();
      this.initializeRing();
    }
  }

  setTime(time) {
    this._data = new TimerData(time);
    this.updateClock();
  }

  setLabel(label) {
    this.initializeRing();
    this._label = label;
    this._root.querySelector('.label-display').innerHTML = label;
  }

  initializeRing() {
    const circle = this._root.querySelector('.progress');
    const array = getComputedStyle(circle).strokeDasharray;
    this._circumference = array.substring(0, array.indexOf('px'));
    circle.style.strokeDashoffset = this._circumference;
  }

  static get observedAttributes() {
    return ['status', 'time', 'label'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'progress') {
      this.setProgress(newValue);
    } else if (name === 'status') {
      this.setStatus(oldValue, newValue);
    } else if (name === 'time') {
      this.setTime(newValue);
    } else if (name === 'label') {
      this.setLabel(newValue);
    }
  }
}

class TimerData {
  time;
  timeInSec;
  prevProg;
  sessionStart;
  sessionProg;
  progress;
  remainInSec;
  remain;
  constructor(time) {
    this.time = time;
    this.timeInSec = iso2seconds(this.time);
    this.prevProg = 0; // set when pause
    this.sessionStart = 0; // set when start
    this.sessionProg = 0;
    this.progress = 0;
    this.remainInSec = this.timeInSec - this.progress;
    this.remain = seconds2iso(this.remainInSec);
  }

  update() {
    const now = Date.now();
    this.sessionProg = Math.floor((now - this.sessionStart) / 1000);
    this.progress = this.prevProg + this.sessionProg;
    const remainder = this.timeInSec - this.progress;
    this.remainInSec = remainder >= 0 ? remainder : 0;
    this.remain = seconds2iso(this.remainInSec);
  }
}
customElements.define('progress-ring', ProgressRing);
