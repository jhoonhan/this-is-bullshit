import * as config from '../config.js';
import View from './View.js';

class DetailView extends View {
  _parentElement = document.querySelector('.description');

  addDetailInformation(data) {
    super.insertHTML(data, this._parentElement);
  }
  _generateMarkup(data) {
    return `
    <div class="cell cell--2 artwork-subtitle">
        <h3>by ${this.capitalizeName(data.name)}, ${data.year}</h3>
    </div>
    <div class="cell cell--3 artwork-description">
        <p>
        &quot${data.statement}&quot
        </p>
    </div>
    `;
  }
}

export default new DetailView();
