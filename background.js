chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('enabled', (data) => {
    const isEnabled = data.enabled;
    chrome.contextMenus.create({
      id: 'toggle',
      title: 'Toggle extension',
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggle') {
    chrome.storage.sync.get('enabled', (data) => {
      const enabled = !data.enabled;
      chrome.storage.sync.set({ enabled: enabled });
      console.log(`Extension is now ${enabled ? 'enabled' : 'disabled'}`);
    });
  }
});
