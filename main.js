const electron = require('electron')
const { ipcMain , Notification } = require('electron');
const RssFeed = require('rss-to-json');
const axios = require('axios');
const parseString = require('xml2js').parseString;
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const url = require('url');

const feedsList = require('./feedsList.json');
console.log(feedsList[0].url);

// function showNotification(Notification_TITLE , Notification_BODY) {
//    new Notification(Notification_TITLE, {
//     body: Notification_BODY
//   }).show();
// }

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Check for new entries every 30 sec and show notification if there is a new entry 
  // setInterval(() => {
  //   feedsList.forEach(feed => {
  //     RssFeed.load(feed.url, (err, rss) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         // write code to check for new entries and show notification if there is a new entry 
  //         console.log(rss.items[0].title);
  //       }
  //     });
  //   });
  // }, 1000); 

  const latestEntryDates = {};

  const testEntry = {
    title: 'Test Entry',
    pubDate: new Date().toUTCString()
  };
  
  setInterval(() => {
    feedsList.forEach(feed => {
      RssFeed.load(feed.url, (err, rss) => {
        if (err) {
          console.log(err);
        } else {
          const latestDate = latestEntryDates[feed.url] || null;
  
          if (rss.items.length > 0) {
            const latestItem = rss.items[0];
            const itemDate = new Date(latestItem.pubDate);
            console.log(itemDate , 'itemDate' , latestDate , 'latestDate');
            if (!latestDate || itemDate > latestDate) {
              latestEntryDates[feed.url] = itemDate;
              showNotification('New RSS Entry', latestItem.title);
              console.log('New entry');
              rss.items.unshift(testEntry); // Add test entry

            }else {
              console.log('No new entry');
            }
          }
        }
      });
    });
  }, 2000);
  

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // Load your HTML file that displays the main window.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Periodically fetch the Upwork RSS feed and check for new job updates.
  setInterval(fetchAndCheckUpdates, 3000); // Fetch every minute (adjust as needed).
});

async function fetchAndCheckUpdates() {
  try {
    const response = await axios.get('https://www.upwork.com/ab/feed/jobs/rss?sort=recency&and_terms=javascript&paging=0%3B10&api_params=1&q=javascript&securityToken=4dff48490002de5b0c58e888de18f773e74e6a2fe26125a5cd8a3f55f831b98174ae9da14ce72b19a094540b5fbda927b2ffc4e8f192b33f76ae831084bc3cea&userUid=1668593382169522176&orgUid=1668593382169522177');
    const xmlData = response.data;

    parseString(xmlData, (err, result) => {
      if (err) {
        console.error('Error parsing RSS feed:', err);
        return;
      }

      const newJobs = result.rss.channel[0].item;

      // Compare new jobs with previously stored jobs to find new updates.
      // Send notifications for new updates using the Notification module.
      newJobs.forEach(job => {
        // Check if this job is new and send a notification.
        // You can customize the notification content here.
        sendNotification(job.title[0], job.link[0]);
      });
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
  }
}

function sendNotification(title, link) {
  const notification = new Notification({
    title: 'New Upwork Job Update',
    body: title,
  });

  notification.show();

  notification.on('click', () => {
    // Open the job link when the notification is clicked.
    require('electron').shell.openExternal(link)
;
  });
}



// ipcMain.on('checkChangeonRSSFeed', (event, arg) => {

// });

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
