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

const _update = async function (log, location = 'artwork') {
  try {
    // Selects location (artwork or artworkInfo)
    renderView.locationDecider(location);
    // Renders artwork
    if (!log) return;

    // renderView.artworkRender(await api.api('getImage', log.imgURL));
    const imgURL = await api.getImage(log.imgURL);
    renderView.artworkRender(imgURL);

    // Insert ID to artwork on view
    renderView.artworkID(log._id);
    // latest log data to artwork title for render
    titleView.addTitles(log, location);
  } catch (err) {
    throw err;
  }
};

const controlGenerateArtwork = async function (renderImage) {
  // @renderImage = html node to be converted to image
  try {
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

const controlLatestArtwork = async () => {
  try {
    controlSpinner('add', 'controlLatestArtwork');

    await model.loadLatest();
    await _update(model.state.current);

    // set has location
    window.location.hash = `#${model.state.current._id}`;

    // load latest log data to description
    descriptionView.addDescription(model.state.current);

    // Refresh state
    model.state.resultAccurate = '';
    model.state.resultProximate = '';
    model.state.searchedIMG = '';
    //
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlLatestArtwork');
  }
};

const controlLogRender = async () => {
  try {
    controlSpinner('add', 'controlLogRender');

    // Guard clause
    if (!model.state.resultProximate) {
      return;
    }

    // Gets imgURL of selected log
    const hashID = window.location.hash.slice(1);
    const selectedArtwork = await api.getArtwork(true, hashID);

    // Web
    if (!isMobile()) {
      console.log(selectedArtwork.name);
      scrollLogView.highlightActiveScroll(selectedArtwork._id);

      logView.highlightActiveLog(selectedArtwork._id);

      scrollLogView.renderActiveScroll(
        await api.getImage(selectedArtwork.imgURL)
      );
      controlSpinner('remove', 'controlLogRender');

      logView.scrollIntoView(selectedArtwork._id, 'landscape');
      scrollLogView.moveToActiveScroll(selectedArtwork._id, 'shit');
      // scrollLogView.moveToActiveScroll();
    }
    //
    //Mobile
    if (isMobile()) {
      mobileView.renderDetail([
        selectedArtwork,
        await api.getImage(selectedArtwork.imgURL),
        model.state.current.order,
      ]);

      logView.highlightActiveLogMobile();
      logView.scrollIntoView('.highlighted-text--mobile', 'portrait');
    }
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlLogRender');
  }
};

const controlLogRenderInfinity = async () => {
  try {
    let state;
    const listener = infinityView.scrollListener();
    if (listener === 'top') {
      state = true;
    }
    if (listener === 'bottom') {
      state = false;
    }
    // Guard clause
    if (state === undefined) return;

    const lastLogID = infinityView.getLastLogID(state);
    const data = await api.searchInfinity(lastLogID, state);
    console.log(data.results);

    if (data.results.length <= 0) return;

    const lastScrollOrder = infinityView.getLastScrollOrder(state);

    infinityView.renderInfinity({
      data: data.results,
      totalNumber: model.state.current.order,
      type: state,
      orientation: 'landscape',
      lastOrder: lastScrollOrder,
    });
  } catch (err) {
    console.log(err);
  }
};
//

const controlSearch = async () => {
  try {
    controlSpinner('add', 'controlSearch');

    // Web
    if (!isMobile()) {
      await model.search(logView.getSearchValue());

      // if (!model.state.resultAccurate) return;
      scrollLogView.renderScrolls([
        model.state.resultProximate,
        model.state.current.order,
      ]);

      scrollLogView.highlightActiveScroll(model.state.resultAccurate.order);

      scrollLogView.renderActiveScroll(
        await api.getImage(model.state.resultAccurate.imgURL)
      );

      logView.renderLogs(model.state.resultProximate, 'landscape');
      logView.highlightActiveLog(model.state.resultAccurate._id);
      window.location.hash = `#${model.state.resultAccurate._id}`;

      controlSpinner('remove', 'controlSearch');
      scrollLogView.moveToActiveScroll();

      model.updateProperties(model.state.current, model.state.resultAccurate);
    }

    // Mobile
    if (isMobile()) {
      await model.search(logView.getSearchValueMobile());

      logView.renderLogs(model.state.resultProximate, 'portrait');

      window.location.hash = `#${model.state.resultAccurate._id}`;
    }
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

    // PERFORMANCE -- no api call when closed
    if (logView.getLogPosition() >= 300) {
      animationView.animateToggleSearchView();
      return;
    }
    // PERFORMANCE -- runs only on fresh reload
    if (logView.getLogPosition() < 300 && !model.state.resultAccurate) {
      await model.loadLatest();
      await _update(model.state.current);
      await model.search([model.state.current._id, 'id']);
    }
    // If no image found, used default
    if (!model.state.searchedIMG) {
      model.state.searchedIMG = await api.getImage(
        model.state.resultAccurate.imgURL
      );
    }
    // Everything false...
    if (!model.state.resultAccurate)
      throw new Error('Could not find accurate result');
    //

    model.updateProperties(model.state.current, model.state.resultAccurate);

    // Web
    if (!isMobile()) {
      scrollLogView.renderScrolls([
        model.state.resultProximate,
        model.state.current.order,
      ]);

      scrollLogView.highlightActiveScroll(model.state.resultAccurate._id);
      scrollLogView.renderActiveScroll(model.state.searchedIMG);

      logView.renderLogs(model.state.resultProximate, 'landscape');
      logView.highlightActiveLog(model.state.resultAccurate._id);

      controlSpinner('remove', 'controlSerachView');
      // logView.scrollIntoView('.highlighted-text', '.log__results', 'landscape');
      // scrollLogView.moveToActiveScroll();

      animationView.animateToggleSearchView();
    }

    // Mobile
    if (isMobile()) {
      // Mobile render option
      logView.renderLogs(model.state.resultProximate, 'portrait');
      mobileView.renderDetail([
        model.state.resultAccurate,
        model.state.searchedIMG,
        model.state.current.order,
      ]);

      logView.highlightActiveLogMobile();
      logView.scrollIntoView('.highlighted-text--mobile', 'portrait');

      animationView.animateMobileArchive();
    }
  } catch (err) {
    popUpView.renderErrorPrompt(err.message.split(' (')[0]);
    console.error(err);
  } finally {
    controlSpinner('remove', 'controlSerachView');
  }
};

const init = function () {
  titleView.addHandlerLatest(controlLatestArtwork);
  renderView.addHandlerGenerateArtwork(controlGenerateArtwork);
  logView.addHandlerLogRender(controlLogRender);
  logView.addHandlerSearch(controlSearch);
  logView.addHandlerToggleView(controlSerachView);
  mobileView.addHandlerToggleView(controlSerachView);
  // popUpView.renderErrorPrompt(`aaaang!2`);
  infinityView.addHandlerLogRenderInfinity(controlLogRenderInfinity);
};

init();
