import browser from 'webextension-polyfill';
import logger from 'logger';

logger.info('Extension loaded.');
logger.info(
  'Please star the repository if you like!\nhttps://github.com/minagishl/n-prep-school-auto-play-extension',
);

let isEnabled: boolean;
let isValidPath: boolean | undefined;
let lastExecutionTime = 0;
let lastVideoPlayerTime = 0;
let lastVideoPlayer = false;
let videoPlayer: HTMLVideoElement | undefined | null = null;
let completed = false;

async function updateIsEnabled(): Promise<void> {
  const data = await browser.storage.local.get('enabled');
  isEnabled = data.enabled !== undefined ? data.enabled : true;
  if (isEnabled) {
    await browser.storage.local.set({ enabled: true });
  }
  toggleExtension();
}

function toggleExtension(): void {
  if (isEnabled) {
    logger.info('Extension is enabled.');
  } else {
    logger.info('Extension is disabled.');
  }
}

function getIsValidPath(): boolean {
  if (isValidPath === undefined) {
    const url = new URL(window.location.href);
    isValidPath = /\/courses\/\w+\/chapters\/\w+\/movie/.test(url.pathname);
  }
  return isValidPath;
}

void updateIsEnabled();

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
      moveElement(index + 1);
    } else {
      if (!completed) {
        completed = true;
        window.alert('All videos have been completed.');

        logger.info('All videos have been completed.');
        logger.info('Move to chapter after 3 seconds...');

        setTimeout(() => {
          const url = new URL(window.location.href);
          const course = url.pathname.split('/')[2];
          const chapter = url.pathname.split('/')[4];
          window.location.href = `/courses/${course}/chapters/${chapter}`;
        }, 3000);
      }
    }
  } else {
    logger.info('Extensions were not executed because they are disabled');
  }
}
setInterval(function () {
  if (getIsValidPath()) {
    const videoPlayer: HTMLVideoElement | null | undefined = getVideoPlayer();
    if (typeof videoPlayer !== 'undefined' && videoPlayer !== null) {
      if (!lastVideoPlayer) logger.info('Video player found.');
      lastVideoPlayer = true;
      if (videoPlayer.ended) {
        handleVideoEnd();
      } else {
        videoPlayer.addEventListener('ended', () => {
          handleVideoEnd();
        });
      }
    } else {
      if (Date.now() - lastVideoPlayerTime > 10000) {
        logger.info('Video player not found.');
        lastVideoPlayerTime = Date.now();
      }
    }
  }
}, 1000);

function getVideoPlayer(): HTMLVideoElement | null {
  try {
    if (videoPlayer === null || videoPlayer === undefined) {
      const iframeElement: HTMLIFrameElement | null =
        document.querySelector('iframe[title="教材"]');
      const iframeDocument =
        iframeElement?.contentDocument ??
        iframeElement?.contentWindow?.document;

      videoPlayer = iframeDocument?.querySelector('video');
      return videoPlayer ?? null;
    } else {
      return videoPlayer;
    }
  } catch (error) {
    return null;
  }
}

// Create MutationObserver to monitor DOM changes
const observer = new MutationObserver(() => {
  videoPlayer = null;
  isValidPath = undefined;
});

// Start monitoring changes in child and descendant nodes of the body element
observer.observe(document.body, { childList: true, subtree: true });

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
      iconElement?.getAttribute('type') === 'movie-rounded-plus'
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
