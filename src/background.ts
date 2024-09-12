import logger from 'logger';
import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  void browser.storage.local.get('enabled').then(() => {
    // Create the parent menu item
    browser.contextMenus.create({
      id: 'classroom',
      title: 'Classroom',
      contexts: ['all'],
    });

    // Create the toggle submenu item under Classroom
    browser.contextMenus.create({
      id: 'toggle',
      parentId: 'classroom',
      title: 'Toggle enabled',
      contexts: ['all'],
    });
  });
});

browser.contextMenus.onClicked.addListener((info) => {
  try {
    if (info.menuItemId === 'toggle') {
      void browser.storage.local.get('enabled').then((data) => {
        const enabled = data.enabled !== true; // Toggle the enabled state
        void browser.storage.local.set({ enabled });
        logger.info(`Extension is now ${enabled ? 'enabled' : 'disabled'}`);
      });
    }
  } catch (error) {
    logger.error(error);
  }
});
