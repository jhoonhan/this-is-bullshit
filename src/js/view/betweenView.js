import * as config from '../config.js';
import View from './View.js';

class BetweenView extends View {
  _parentElement = document.querySelector('.top-level');
  _btnClose = document.querySelector('.btn--close-between');
  _message = document.querySelector('.top-level .message');

  constructor() {
    super();
    this._addHandlerHideWindow();
  }
  showBetween() {
    this._toggleWindow();
  }

  _toggleWindow() {
    this._parentElement.classList.toggle('hidden');
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener(
      'click',
      function () {
        this._toggleWindow();
      }.bind(this)
    );
  }

  _generateMarkup(data) {
    const { name, id, index } = data;
    const formattedName = `${name
      .split(' ')
      .map(el => el.slice(0, 1).toUpperCase() + el.slice(1))
      .join(' ')}`;
    return `
      <div class="fullSizeBetween">
        <div class="between--container">
          <span class="message">Your artwork has been submitted.</span>
          <ul class="between--information">
            <label>Name</label>
            <label class="column">:</label>
            <li>${formattedName}</li>
            <label>Order</label>
            <label class="column">:</label>
            <li>${index}</li>
            <label>ID</label>
            <label class="column">:</label>
            <li>${id}</li>
          </ul>
          <button class="btn--large btn--close-between">next</button>
        </div>
      </div>
      `;
  }
}

export default new BetweenView();
