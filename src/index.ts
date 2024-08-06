import browser from 'webextension-polyfill';
import logger from 'logger';

// Show in log when extension is loaded
logger.info('Extension loaded.');
logger.info(
  'Please star the repository if you like!\nhttps://github.com/minagishl/collaboration',
);

// Flags to be used in the code, etc.
let isEnabled: boolean;
let isValidPath: boolean | undefined;
let lastExecutionTime = 0;
let lastVideoPlayerTime = 0;
let previousVideoPlayer = false;
let previousBackgroundAutoPlay = false;
let videoPlayer: HTMLMediaElement | undefined | null = null;
let completed = false;
let autoPlayEnabled: boolean = true; // default to true

// Specify the value to be detected
const RGB_COLOR_GREEN = 'rgb(0, 197, 65)';
const TYPE_MOVIE_ROUNDED_PLUS = 'movie-rounded-plus';
const REDIRECT_TIME = 3000;
const COOL_TIME = 5000;

// Changing this value allows background playback
// Just not recommended from a moral standpoint.
const BACKGROUND_AUTO_PLAY = false;

if (BACKGROUND_AUTO_PLAY) {
  logger.info('Background playback is enabled.');
}

async function updateIsEnabled(): Promise<void> {
  const data = await browser.storage.local.get(['enabled', 'autoPlayEnabled']);
  isEnabled = data.enabled !== undefined ? data.enabled : true;
  autoPlayEnabled =
    data.autoPlayEnabled !== undefined ? data.autoPlayEnabled : true;
  if (isEnabled) {
    await browser.storage.local.set({ enabled: true });
  }
  toggleExtension();
  updateAutoPlayButton();
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

// Create auto-play toggle button
async function createAutoPlayButton(): Promise<void> {
  const button = document.createElement('button');
  button.id = 'autoPlayToggleButton';
  button.style.position = 'absolute';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.zIndex = '99999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.textContent = autoPlayEnabled ? 'AutoPlay: ON' : 'AutoPlay: OFF';

  button.addEventListener('click', () => {
    autoPlayEnabled = !autoPlayEnabled;
    button.textContent = autoPlayEnabled ? 'AutoPlay: ON' : 'AutoPlay: OFF';
    browser.storage.local.set({ autoPlayEnabled }).catch((error) => {
      logger.error(`Failed to set autoPlayEnabled in storage: ${error}`);
    });
  });

  document.body.appendChild(button);
}

function updateAutoPlayButton(): void {
  const button = document.getElementById('autoPlayToggleButton');
  if (button !== null) {
    button.textContent = autoPlayEnabled ? 'AutoPlay: ON' : 'AutoPlay: OFF';
  }
}

// Execute the function when the page is loaded
void updateIsEnabled();
void createAutoPlayButton();

browser.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    logger.info(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    window.alert(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
  }
  if (changes.autoPlayEnabled !== undefined) {
    autoPlayEnabled = changes.autoPlayEnabled.newValue;
    updateAutoPlayButton();
  }
});

function handleVideoEnd(): void {
  if (isEnabled) {
    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < COOL_TIME) {
      return;
    }
    lastExecutionTime = currentTime;

    // return if background playback is in the background and backgroundAutoPlay is false
    if (document.hidden && !BACKGROUND_AUTO_PLAY) {
      // Once output, do not output again
      if (!previousBackgroundAutoPlay)
        logger.info('Did not move because it was playing in the background');
      previousBackgroundAutoPlay = true;
      return;
    } else if (document.hidden && BACKGROUND_AUTO_PLAY) {
      logger.info('Playback proceeds in the background');
    }

    previousBackgroundAutoPlay = false;
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
        logger.info(`Move to chapter after ${REDIRECT_TIME / 1000} seconds...`);

        setTimeout(() => {
          const url = new URL(window.location.href);
          const course = url.pathname.split('/')[2];
          const chapter = url.pathname.split('/')[4];
          window.location.href = `/courses/${course}/chapters/${chapter}`;
        }, REDIRECT_TIME);
      }
    }
  } else {
    logger.info('Extensions were not executed because they are disabled');
  }
}

// Reason for this code: It could be a code that looks for it when rendering the DOM,
// But sometimes it fails, so this code is used.
setInterval(function () {
  if (getIsValidPath()) {
    const videoPlayer: HTMLMediaElement | null | undefined = getVideoPlayer();
    if (typeof videoPlayer !== 'undefined' && videoPlayer !== null) {
      if (!previousVideoPlayer) logger.info('Video player found.');
      previousVideoPlayer = true;
      if (videoPlayer.ended) {
        handleVideoEnd();
      } else if (autoPlayEnabled && videoPlayer.paused) {
        void videoPlayer.play();
      } else {
        videoPlayer.addEventListener('ended', () => {
          handleVideoEnd();
        });
      }
    } else {
      if (Date.now() - lastVideoPlayerTime > COOL_TIME) {
        logger.info('Video player not found.');
        lastVideoPlayerTime = Date.now();
      }
    }
  }
}, 1000);

function getVideoPlayer(): HTMLMediaElement | null {
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
      iconElement.style.color === RGB_COLOR_GREEN ||
      element.textContent?.includes('視聴済み') === true;

    // Confirmation of availability of preliminary and required materials
    const type =
      iconElement?.getAttribute('type') === TYPE_MOVIE_ROUNDED_PLUS
        ? 'supplement'
        : 'main';

    return { title, passed, type };
  });

  return list;
}

function moveElement(number: number): void {
  const element = document.querySelector(
    `ul[aria-label="必修教材リスト"] li:nth-child(${number}) div`,
  );

  if (element === null) {
    throw new Error(`Error: cannot find an element with the number ${number}`);
  }

  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  element.dispatchEvent(event);
}
