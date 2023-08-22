const ArticleList = require('./ArticleList');
const { ipcRenderer } = require('electron');

const FeedDigest = (feed, index) => {
  const feedDigest = document.createElement('div');
  feedDigest.id = `feedDigest${index}`;
  const header = document.createElement('h2');
  header.innerHTML = feed.title;
  feedDigest.appendChild(header);
  feedDigest.appendChild(ArticleList(feed));

  // create a button to check for changes on the feed
  const checkChangeonRSSFeedButton = document.createElement('button');
  checkChangeonRSSFeedButton.id = `checkChangeonRSSFeedButton${index}`;
  checkChangeonRSSFeedButton.innerHTML = 'Check for changes on the feed';
  feedDigest.appendChild(checkChangeonRSSFeedButton);

  // add an event listener to the button
  checkChangeonRSSFeedButton.addEventListener('click', () => {
    console.log('checkChangeonRSSFeedButton');
    ipcRenderer.send('checkChangeonRSSFeed', feed.url);
  });

  return feedDigest;
};

module.exports = FeedDigest;