/*jslint node: true */
/*global $, chrome, FirebaseApp*/
"use strict";

class Main {
  constructor() {
    this._iFrame = undefined;
    this.boardName = '';
  }

  init() {
    this.listenRoutes();
    this.setBoardName();

    this.firebaseApp = new FirebaseApp(this.boardName);
  }

  listenRoutes() {
    this.location = '';
    setInterval(() => {
      if (location.href !== this.location) {
        this.location = location.href;
        if (!this.mainButtonIsAppended() && (this.isBoardRoute() || this.isCardRoute())) {
          this.appendMainButton();
          this.initIFrame();
        }

        if (!this.cardButtonIsAppended() && this.isCardRoute()) {
          this.appendCardButton();
        }
      }
    }, 500);
  }

  isBoardRoute() {
    return this.location.indexOf('https://trello.com/b/') >= 0;
  }

  isCardRoute() {
    return this.location.indexOf('https://trello.com/c/') >= 0;
  }

  mainButtonIsAppended() {
    return $('.scrumcoon-button').length > 0;
  }

  cardButtonIsAppended() {
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
  }

  toggleScrumcoon(show) {
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

    //$('body').addClass('show-scrumcoon');

    var a = chrome.extension.getURL('src/content-scripts/trello.css');
    $('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo('head');
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
    let metaContent = $('meta[name="apple-itunes-app"]').attr('content');
    let urlSegments = metaContent.substr(metaContent.indexOf('https://trello.com')).split('/');
    this.boardName = urlSegments[urlSegments.length-1];
  }
}

$(document).ready(() => {
  let main = new Main();
  main.init();
});
