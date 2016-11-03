/*jslint node: true */
/* globals $, firebase */
'use strict';


class FirebaseApp {
  constructor(session) {
    const config = {
      apiKey: "AIzaSyAJJnvmt79PthO8ZrscAZIj357S6sdRahc",
      authDomain: "scrumcoon.firebaseapp.com",
      databaseURL: "https://scrumcoon.firebaseio.com",
      messagingSenderId: "363807648744"
    };

    this.app = firebase.initializeApp(config);
    this.session = session;
  }

  get currentStory() {
    if (this._currentStory) {
      return this.currentStoryObject(this._currentStory);
    }

    return firebase.database()
      .ref(`/channels/${this.session}/currentStory`)
      .once('value')
      .then((snapshot) => {
        return snapshot.val();
      });
  }

  get storyTitle() { }

  resetStory(newStory) {
    this.currentStory.then((storyId) => {
      let story = $.extend({}, { isClosed: false }, newStory);
      firebase.database()
        .ref(`stories/${storyId}`)
        .update(story);

        // TODO remove all votes
    });
  }


}

/*exported FirebaseApp */
