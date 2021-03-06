import 'core-js/stable';
import 'regenerator-runtime/runtime';
import mobile from 'is-mobile';

import titleView from './view/titleView.js';
import * as model from './model.js';
import * as api from './api.js';
import * as config from './config.js';
import renderView from './view/renderView.js';
import descriptionView from './view/descriptionView.js';
import betweenView from './view/betweenView.js';
import logView from './view/logView.js';
import detailView from './view/detailView.js';
import animationView from './view/animationView.js';
import scrollLogView from './view/scrollLogView.js';
import mobileView from './view/mobileView.js';
import { isMobile } from './helper.js';
import { controlSpinner } from './helper.js';
import popUpView from './view/popUpView.js';
import infinityView from './view/infinityView.js';

if (module.hot) {
  module.hot.accept();
}

const _updateRender = async function (log, location = 'artwork') {
  try {
    // Selects location (artwork or artworkInfo)
    renderView.locationDecider(location);
    // Renders artwork
    if (!log) return;

    const { img: imgURL } = await api.getImage(log.imgID);
    renderView.artworkRender(imgURL);

    // Insert ID to artwork on view
    renderView.artworkID(log._id);
    // latest log data to artwork title for render
    titleView.addTitles(log, location);
  } catch (err) {
    throw err;
  }
};

const controlLatestArtwork = async () => {
  try {
    console.log(`controlLatestArtwork fired`);
    controlSpinner('add', 'controlLatestArtwork');

    // Sets "STATE.CURRENT" with latest data from API calls
    await model.loadLatest();
    // if (!hasData) return;

    await _updateRender(model.state.current);

    // set has location
    window.location.hash = `#${model.state.current._id}`;

    // load latest log data to description
    descriptionView.addDescription(model.state.current);

    // Refresh state
    model.state.totalCount = await api.getTotalCount();
    model.state.resultAccurate = '';
    model.state.resultProximate = '';
    // PERFORMANCE = does NOT get API call for an image
    model.state.searchedIMG = '';
    //
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlLatestArtwork');
  }
};

const controlGenerateArtwork = async function (renderImage) {
  // @renderImage = html node to be converted to image
  try {
    console.log(`controlGenerateArtwork fired`);

    if (mobile()) {
      throw new Error('Mobile Support Coming Soon...');
    }
    controlSpinner('add', 'GenerateArtwork');

    // get and checks input data
    const inputData = descriptionView.artworkInputData();
    if (!inputData) return;

    // reduce dummy to fit in the center with 70%
    renderView.artworkReducer('add');

    //ERR handled
    await model.loadArtwork(renderImage);

    // use current IMG to render to the canvas
    renderView.artworkGenerate(model.state.current.img);

    // rolls back reducer
    renderView.artworkReducer('remove');

    // Get rendered blob from the canvas
    const [imgBlob, img64] = await renderView.artworkImgURL();

    // Save the imgURL data
    // ERR handled
    await model.logArtwork(inputData, imgBlob);
    // await model.uploadIMG(imgURL);

    // Refresh
    await controlLatestArtwork();

    // Prompt between page
    betweenView.showBetween();
    // Update between page
    betweenView.update([model.state.current, img64]);

    // Hide form
    descriptionView.toggleWindow();
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'GenerateArtwork');
  }
};

const controlLogRender = async () => {
  // event: HASH CHANGE
  try {
    console.log(`controlLogRender fired`);

    controlSpinner('add', 'controlLogRender');

    // Guard clause
    if (!model.state.resultProximate) {
      return;
    }

    const hashID = window.location.hash.slice(1);
    const selectedArtwork = await api.getArtwork(true, hashID);

    const { img: selectedIMG } = await api.getImage(selectedArtwork.imgID);

    logView.highlightActiveLog(selectedArtwork._id, isMobile());
    logView.scrollIntoView(selectedArtwork._id, isMobile());

    // Web
    if (!isMobile()) {
      scrollLogView.highlightActiveScroll(selectedArtwork._id);

      scrollLogView.renderActiveScroll(selectedIMG);

      controlSpinner('remove', 'controlLogRender');

      scrollLogView.moveToActiveScroll(selectedArtwork._id);
    }
    //
    //Mobile
    if (isMobile()) {
      mobileView.renderDetail([
        selectedArtwork,
        selectedIMG,
        model.state.totalCount,
      ]);
    }
    /////// Turned on/off : When Log closed, go back to latest work?
    // model.updateProperties(model.state.current, selectedArtwork);
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlLogRender');
  }
};

//

const controlSearch = async () => {
  try {
    controlSpinner('add', 'controlSearch');

    // Resets the page;
    model.state.page = 1;

    // Sets new "RESULTS" thourgh "SEARCH"
    const [keyword, type] = logView.getSearchValue(isMobile());
    await model.search([keyword, type], [model.state.page, false]);
    // Get new image from new "RESULTACCURATE"
    const { img: searchedIMG } = await api.getImage(
      model.state.resultAccurate.imgID
    );

    // Side effects to change searchType'
    logView.searchType = type;
    logView.searchKeyword = keyword;

    logView.renderLogs(model.state.resultProximate, isMobile());
    logView.highlightActiveLog(model.state.resultAccurate._id, isMobile());

    window.location.hash = `#${model.state.resultAccurate._id}`;

    controlSpinner('remove', 'controlSearch');

    // Web
    if (!isMobile()) {
      scrollLogView.renderScrolls([
        model.state.resultProximate,
        model.state.totalCount,
      ]);
      // Render image with searched image
      scrollLogView.highlightActiveScroll(model.state.resultAccurate._id);
      scrollLogView.moveToActiveScroll(model.state.resultAccurate._id);
      scrollLogView.renderActiveScroll(searchedIMG);
    }
    // Mobile
    if (isMobile()) return;
    //
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlSearch');
  }
};

const controlSerachView = async () => {
  try {
    controlSpinner('add', 'controlSerachView');

    // PERFORMANCE -- no API call when closed
    if (!logView.getLogPosition()) {
      animationView.animateToggleSearchView();
      return;
    }
    // PERFORMANCE -- runs only on a fresh reload
    if (logView.getLogPosition() && !model.state.resultAccurate) {
      // await model.loadLatest();
      await _updateRender(model.state.current);
      await model.search([model.state.current._id, 'id']);

      const { img: searchedIMG } = await api.getImage(
        model.state.resultAccurate.imgID
      );
      model.state.searchedIMG = searchedIMG;

      model.updateProperties(model.state.current, model.state.resultAccurate);

      logView.renderLogs(model.state.resultProximate, isMobile());

      // Web
      if (!isMobile()) {
        scrollLogView.renderScrolls([
          model.state.resultProximate,
          model.state.totalCount,
        ]);
      }
    }

    // Everything false...
    if (!model.state.resultAccurate)
      throw new Error('Could not find the accurate result');
    //

    logView.highlightActiveLog(model.state.current._id, isMobile());
    logView.scrollIntoView(model.state.current._id, isMobile());

    if (!isMobile()) {
      scrollLogView.highlightActiveScroll(model.state.current._id);
      scrollLogView.renderActiveScroll(model.state.searchedIMG);
      scrollLogView.moveToActiveScroll(model.state.current._id);
    }
    if (isMobile()) {
      mobileView.renderDetail([
        model.state.current,
        model.state.searchedIMG,
        model.state.totalCount,
      ]);
    }

    // Removes spinner before animation
    controlSpinner('remove', 'controlSerachView');

    isMobile()
      ? animationView.animateMobileArchive()
      : animationView.animateToggleSearchView();
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlSerachView');
  }
};

const controlInfinity = async () => {
  try {
    // if (logView.searchType === 'name') console.log(`cibal`);

    let direction;
    const listener = infinityView.scrollListener(isMobile());
    if (listener === 'top') {
      direction = true;
    }
    if (listener === 'bottom') {
      direction = false;
    }
    // Guard clause
    if (direction === undefined) return;

    if (logView.searchType !== 'name') {
      const lastLogID = infinityView.getLastLogID(direction, isMobile());
      const data = await api.searchInfinity(lastLogID, direction);

      if (data.results.length <= 0) return;

      infinityView.renderInfinity({
        data: data.results,
        totalCount: model.state.totalCount,
        direction,
        isMobile: isMobile(),
      });
    }

    if (logView.searchType === 'name') {
      const keyword = logView.searchKeyword;
      const data = await api.getSearchedPaginated(
        keyword,
        model.state.page,
        true
      );
      model.state.page = model.state.page + 1;

      if (data.resultProx.length <= 0) return;

      infinityView.renderInfinity({
        data: data.resultProx,
        totalCount: data.resultAccu.order,
        direction: false,
        isMobile: isMobile(),
      });
    }

    // stop top infinity pushing active log
    // const curLocation = window.location.hash.slice(1);
    // infinityView.catchInfinityLog(direction, curLocation, isMobile());
  } catch (err) {
    console.error(err);
  }
};

const init = function () {
  titleView.addHandlerLatest(controlLatestArtwork);
  renderView.addHandlerGenerateArtwork(controlGenerateArtwork);
  logView.addHandlerLogRender(controlLogRender);
  logView.addHandlerSearch(controlSearch);
  logView.addHandlerToggleView(controlSerachView);
  mobileView.addHandlerToggleView(controlSerachView);
  infinityView.addHandlerLogRenderInfinity(controlInfinity);

  // api.getSearchedPaginated('1', 2);
};

init();
