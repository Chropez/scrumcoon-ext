/*jslint node: true */
/*global $, chrome, FirebaseApp*/
"use strict";

class Main {
  constructor() {
    this._iFrame = undefined;
    this.boardName = '';
    this.location = '';
  }

  init() {
    this.listenRoutes();
    this.firebaseApp = new FirebaseApp();
  }

  listenRoutes() {
    setInterval(() => {
      if (!this.mainButtonIsAppended && this.isBoardRoute) {
        this.setBoardName();
        this.appendMainButton();
      } else if (this.isCardRoute && this.mainButtonIsAppended && !this.cardButtonIsAppended) {
        this.appendCardButton();
      }

      this.location = location.href;
    }, 500);
  }

  get localtionChanged() {
    return location.href !== this.location;
  }

  get isBoardRoute() {
    return this.location.indexOf('https://trello.com/b/') >= 0;
  }

  get isCardRoute() {
    return this.location.indexOf('https://trello.com/c/') >= 0;
  }

  get mainButtonIsAppended() {
    return $('.scrumcoon-button').length > 0;
  }

  get cardButtonIsAppended() {
    return $('.window-wrapper .scrumcoon-title-button').length > 0;
  }

  appendMainButton() {
    let toolbar = $('.header-user');

    $('<a></a>')
      .addClass('scrumcoon-button')
      .addClass('header-btn')
      .text('SC')
      .on('click', (evt) => {
        evt.preventDefault();
        this.toggleScrumcoon();
      })
      .appendTo(toolbar);

      let css = chrome.extension.getURL('src/content-scripts/trello.css');
      $(`<link rel="stylesheet" type="text/css" href="${css}" >`).appendTo('head');

    $(`<div id="close-scrumcoon">&gt;</div>`)
      .appendTo('body')
      .on('click', () => { this.toggleScrumcoon(false); })

  }

  toggleScrumcoon(show) {
    // load iframe the first toggle
    if ($('#scrumcoon-container').length === 0) {
      this.initIFrame();
    }

    $('body').toggleClass('show-scrumcoon', show);
  }

  initIFrame() {
    let container = $('<div id="scrumcoon-container"></div>').appendTo($('body'));
    this._iFrame = $('<iframe>', {
     src: `https://scrumcoon.firebaseapp.com/${this.boardName}` ,
     id:  'scrumcoon',
     frameborder: 0,
     scrolling: 'yes',
    }).appendTo(container);

  }

  appendCardButton() {
    let module = $('<div class="window-module u-clearfix"></div>')
      .html(this.generateSidebarModule());
    module.prependTo($('.window-wrapper .window-sidebar'));
    $('.scrumcoon-title-button', module)
      .on('click', () => {
        let title = this.getTitle();
        this.firebaseApp.resetStory({ title: title });
        this.toggleScrumcoon(true);
      });
  }

  getTitle() {
    return $('.window-wrapper .window-title .card-detail-title-assist').text();
  }

  generateSidebarModule() {
    return `
      <h3>Scrumcoon</h3>
      <div class="u-clearfix">
          <a class="scrumcoon-title-button button-link" href="#">
            Estimate in SC
          </a>
      </div>
    `;
  }

  setBoardName() {
    if (!this.isBoardRoute)
      return;

    let urlSegments = this.location.substr(this.location.indexOf('https://trello.com')).split('/');
    this.boardName = urlSegments[urlSegments.length-1];
    this.firebaseApp.session = this.boardName;
  }
}

$(document).ready(() => {
  let main = new Main();
  main.init();
});
