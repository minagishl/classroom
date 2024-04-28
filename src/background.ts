import browser from 'webextension-polyfill';
import logger from 'logger';

browser.runtime.onInstalled.addListener(() => {
  void browser.storage.local.get('enabled').then(() => {
    browser.contextMenus.create({
      id: 'toggle',
      title: 'Toggle extension',
    });
  });
});

browser.contextMenus.onClicked.addListener((info) => {
  try {
    if (info.menuItemId === 'toggle') {
      void browser.storage.local.get('enabled').then((data) => {
        const enabled = data.enabled !== true; // To reverse true false ! == to reverse false
        void browser.storage.local.set({ enabled });
        logger.info(`Extension is now ${enabled ? 'enabled' : 'disabled'}`);
      });
    }
  } catch (error) {
    logger.error(error);
  }
});
