// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const masterFeedList = require('./feedsList.json');
const loadFeeds = require('./async/loadFeeds');
loadFeeds(masterFeedList);

// store the feeds list in the local storage
localStorage.setItem('feedsList', JSON.stringify(masterFeedList));
