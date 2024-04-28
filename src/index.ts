import browser from 'webextension-polyfill';
import logger from 'logger';

logger.info('Extension loaded.');
logger.info(
  'Please star the repository if you like!\nhttps://github.com/minagishl/n-prep-school-auto-play-extension',
);

const targetNode = document.body;
let lastExecutionTime = 0;

const config = {
  childList: true,
  attributes: true,
  subtree: true,
};

let isEnabled = true;

void browser.storage.local.get('enabled').then((data) => {
  isEnabled = data.enabled === true;
  toggleExtension();
});

function toggleExtension(): void {
  if (isEnabled === undefined) {
    void browser.storage.local.set({ enabled: true });
  } else if (isEnabled) {
    logger.info('Extension is enabled.');
    observer.observe(targetNode, config);
  } else {
    logger.info('Extension is disabled.');
  }
}

browser.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    logger.info(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    window.alert(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
  }
});

function handleVideoEnd(): void {
  if (isEnabled) {
    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < 2500) {
      // Exit without executing the function if it is within 2500 ms since the last execution.
      return;
    }
    lastExecutionTime = currentTime;

    logger.info('Video ended.');
    const list = getList();
    const index = findIndex(list);
    if (index !== -1) {
      logger.info('Moving to the next video.');
      observer.observe(targetNode, config);
      moveElement(index + 1);
    } else {
      logger.info('All videos have been completed.');
    }
  } else {
    logger.info('Extensions were not executed because they are disabled');
  }
}

const callback: MutationCallback = function (mutationsList: MutationRecord[]) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      if (
        /\/courses\/\w+\/chapters\/\w+\/movie/.test(window.location.pathname)
      ) {
        const videoPlayer: HTMLVideoElement | null | undefined =
          getVideoPlayer();
        if (typeof videoPlayer !== 'undefined' && videoPlayer !== null) {
          observer.disconnect();
          logger.info('Video player found.');
          if (videoPlayer.ended) {
            handleVideoEnd();
          } else {
            videoPlayer.addEventListener('ended', () => {
              handleVideoEnd();
            });
          }
        } else {
          logger.info('Video player not found.');
        }
      }
    }
  }
};

const observer: MutationObserver = new MutationObserver(callback);
observer.observe(targetNode, config);

function getVideoPlayer(): HTMLVideoElement | null {
  try {
    const iframeElement: HTMLIFrameElement | null =
      document.querySelector('iframe[title="教材"]');
    const iframeDocument =
      iframeElement?.contentDocument ?? iframeElement?.contentWindow?.document;

    return iframeDocument?.querySelector('#video-player') ?? null;
  } catch (error) {
    return null;
  }
}

function findIndex(
  data: Array<{ title: string; passed: boolean; type: string }>,
): number {
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === 'main' && !data[i].passed) {
      return i;
    }
  }
  return -1; // If the corresponding object could not be found
}

function getList(): Array<{ title: string; passed: boolean; type: string }> {
  const element = Array.from(
    document.querySelector('ul[aria-label="必修教材リスト"]')?.childNodes ?? [],
  ) as HTMLElement[];

  if (element === null) {
    throw new Error('Error: cannot find an element');
  }

  const list = Array.from(element).map((element) => {
    // Get the title (though it's not particularly useful)
    const titleElement = element.querySelector(
      'div div div span:nth-child(2)',
    ) as unknown as HTMLElement;
    const title = titleElement.textContent?.trim() ?? '';

    // Confirmation of completion
    const iconElement = element.querySelector(
      'div div div i',
    ) as unknown as HTMLElement;
    const passed =
      // Countermeasure to delay icon color in case of DOM construction.
      iconElement.style.color === 'rgb(0, 197, 65)' ||
      element.textContent?.includes('視聴済み') === true;

    // Confirmation of availability of preliminary and required materials
    const type =
      iconElement.getAttribute('type') === 'movie-rounded-plus'
        ? 'supplement'
        : 'main';

    return { title, passed, type };
  });

  return list;
}

function moveElement(number: number): void {
  // Please update in due course.
  const element = document.querySelector(
    `ul[aria-label="必修教材リスト"] li:nth-child(${number}) div`,
  );

  if (element === null) {
    throw new Error(`Error: cannot find an element with the number ${number}`);
  }

  // Dispatches a click event
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  element.dispatchEvent(event);
}
