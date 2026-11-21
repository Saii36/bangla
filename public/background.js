/* global browser, chrome */
const ext = typeof browser !== 'undefined' ? browser : typeof chrome !== 'undefined' ? chrome : null;

function openFullDashboard(hash = '') {
  if (!ext || !ext.tabs || !ext.runtime) return;
  const targetUrl = ext.runtime.getURL(`index.html${hash ? `#${hash}` : ''}`);
  ext.tabs.create({ url: targetUrl });
}

if (ext && ext.runtime) {
  ext.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'OPEN_DASHBOARD') {
      openFullDashboard(message.route || '');
    }
  });
}

if (ext && ext.commands) {
  ext.commands.onCommand.addListener((command) => {
    if (command === 'open-dashboard') {
      openFullDashboard('practice');
    }
  });
}
