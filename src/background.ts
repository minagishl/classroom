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

    // Create the toggle submenu items under Classroom
    browser.contextMenus.create({
      id: 'toggle',
      parentId: 'classroom',
      title: 'Toggle enabled',
      contexts: ['all'],
    });

    browser.contextMenus.create({
      id: 'returnToChapter',
      parentId: 'classroom',
      title: 'Return to chapter on completion',
      contexts: ['all'],
    });

    browser.contextMenus.create({
      id: 'hideUI',
      parentId: 'classroom',
      title: 'Hide UI buttons',
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
    } else if (info.menuItemId === 'returnToChapter') {
      void browser.storage.local.get('returnToChapter').then((data) => {
        const returnToChapter = data.returnToChapter !== true; // Toggle the return to chapter state
        void browser.storage.local.set({ returnToChapter });
        logger.info(
          `Return to chapter is now ${returnToChapter ? 'enabled' : 'disabled'}`,
        );
      });
    } else if (info.menuItemId === 'hideUI') {
      void browser.storage.local.get('hideUI').then((data) => {
        const hideUI = data.hideUI !== true; // Toggle the hideUI state
        void browser.storage.local.set({ hideUI });
        logger.info(`UI buttons are now ${hideUI ? 'hidden' : 'visible'}`);
      });
    }
  } catch (error) {
    logger.error(error);
  }
});
