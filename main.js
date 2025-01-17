const {app, clipboard, Menu, Tray, BrowserWindow} = require('electron');
var ipc = require('electron').ipcRenderer;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const DaemonCommander = require('./commander')
const commander = new DaemonCommander()

const start = async function() {
  while(true) {
    var state = await commander.status();
    createTrayMenu(state.CrcStatus);
    await delay(1000);
  }

}

openAbout = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true 
      }
    });
  childWindow.setMenuBarVisibility (false);
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'about.html')
  })
  childWindow.loadURL(url);
}

openSettings = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true,
      }
    });
  childWindow.setMenuBarVisibility (false);
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'settings.html')
  })
  childWindow.loadURL(url)
}

openStatus = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true,
      }
    });
  childWindow.setMenuBarVisibility (false);
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'status.html')
  })
  childWindow.loadURL(url)
}


openWebConsole = async function() {
  var result = await commander.consoleUrl();
  var url = result.ClusterConfig.WebConsoleURL;
  require('electron').shell.openExternal(url);
}

clipLoginAdminCommand = async function() {
  var result = await commander.consoleUrl();
  var command = "oc.exe login -u kubeadmin -p " + result.ClusterConfig.KubeAdminPass + " " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

clipLoginDeveloperCommand = async function() {
  var result = await commander.consoleUrl();
  var command = "oc.exe login -u developer -p developer " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

mapStateForImage = function(state) {
  state = state.toLowerCase();

  switch(state) {
    case 'running':  // started
    case 'stopped':
    case 'unknown':
      return state;
    case 'starting':
    case 'stopping':
      return 'busy';
    default:
      return 'unknown';
  }
}

createTrayMenu = function(state) {

  if(state == '' || state == undefined) state = `Unknown`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: state,
      click() { null },
      icon: "./assets/status-" + mapStateForImage(state) + ".png",
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Status and logs',
      click() { openStatus(); }
    },
    { type: 'separator' },
    {
      label: 'Start',
      click() { commander.start(); }
    },
    {
      label: 'Stop',
      click() { commander.stop(); }
    },
    {
      label: 'Delete',
      click() { commander.delete(); }
    },
    { type: 'separator' },
    {
      label: 'Launch Web Console',
      click() { openWebConsole(); }
    },
    {
      label: 'Copy OC Login Command',
      submenu: [
        {
          label: 'Admin',
          click() { clipLoginAdminCommand(); }
        },
        {
          label: 'Developer',
          click() { clipLoginDeveloperCommand(); }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click() { openSettings(); }
    },
    { type: 'separator' },
    {
      label: 'About',
      click() { openAbout(); }
    },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  // parent window to prevent app closing
  const parentWindow = new BrowserWindow({ show: false })
  
  // Setup tray
  tray = new Tray(`./assets/ocp-logo.png`)
  tray.setToolTip('CodeReady Containers');
  createTrayMenu("Unknown");

  start();
});
