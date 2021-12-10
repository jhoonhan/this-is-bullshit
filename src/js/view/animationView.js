import * as config from '../config.js';
import View from './View.js';

class AnimationView extends View {
  _column1 = document.querySelector('.column--1');
  _column2 = document.querySelector('.column--2');
  _column3 = document.querySelector('.column--3');
  _column4 = document.querySelector('.column--4');
  _column5 = document.querySelector('.column--5');
  _row1 = document.querySelector('.row--1');
  _row2 = document.querySelector('.row--2');
  _row3 = document.querySelector('.row--3');

  // Log view
  _logContainer = document.querySelector('.log--container');
  _scrollContainer = document.querySelector('.scroll-log-container');
  _description = document.querySelector('.description');
  _form = document.querySelector('.form-artwork');
  _btnToggleView = document.querySelector('.log--toggle-view');
  //
  // Serach view
  _expandSearchBtn = document.querySelector('.log--toggle-view');
  //
  // Search box
  _searchContainer = document.querySelector('.log--search--container');
  _searchExpandBtn = document.querySelector('.log--search--expand');
  _searchDropdown = document.querySelector('.log--search--dropdown');
  _searchOptionContainer = document.querySelector('.log--search--options');
  _searchOptions = document.querySelectorAll('.log--search--option');
  _searchForm = document.querySelector('.log--search--form');
  _searchInput = document.querySelector('.log--search--input');
  //

  constructor() {
    super();
    this._initSearchView();
    this._searchExpandBtn.addEventListener(
      'click',
      function () {
        this.sq1();
      }.bind(this)
    );
    this._searchOptions.forEach(
      function (btn) {
        btn.addEventListener(
          'click',
          function () {
            this.sq2();
            this._searchInput.value = '';
          }.bind(this)
        );
      }.bind(this)
    );
    this._searchForm.addEventListener(
      'submit',
      function () {
        this.sq3();
      }.bind(this)
    );
  }

  sq1() {
    this._searchOptionContainer.classList.toggle('hidden');
  }

  sq2() {
    console.log(`sq2 fired`);
    this._searchForm.classList.toggle('hidden');
  }
  sq3() {
    console.log(`sq3 fired`);
    this._searchOptionContainer.classList.toggle('hidden');
    this._searchForm.classList.toggle('hidden');
  }

  _initSearchView() {
    const left = this._logContainer.getBoundingClientRect().width;
    this._logContainer.style.left = `-${left + 1}px`;
    this._logContainer.classList.remove('left-100vw');
  }

  _toggleDescription() {
    this._row1.classList.toggle('left100vw');
  }
  _toggleDetailInformation() {
    this._row2.classList.toggle('top100vh');
  }

  _toggleRotateExpandBtn() {
    this._expandSearchBtn.classList.toggle('arrow-rotate');
  }

  _toggleSerachView(rect) {
    if (rect.x < 0) {
      this._logContainer.style.left = `0px`;
    }
    if (rect.x >= 0) {
      this._logContainer.style.left = `-${rect.width + 1}px`;
    }
  }

  animateToggleSearchView() {
    const rect = this._logContainer.getBoundingClientRect();
    const sequence0 = function () {
      this._toggleDescription();
      this._toggleDetailInformation();
      this._toggleRotateExpandBtn();
    }.bind(this);

    this._toggleSerachView(rect);
    if (rect.x < 0) {
      sequence0();
    }
    if (rect.x >= 0) {
      sequence0();
      this._scrollContainer.style.top = '0';
    }
    // opening search will hide form
    this._description.classList.remove('hidden');
    this._form.classList.add('hidden');
  }
}

export default new AnimationView();