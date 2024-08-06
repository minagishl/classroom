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
let backgroundAutoPlay: boolean = false; // default to false

// Specify the value to be detected
const RGB_COLOR_GREEN = 'rgb(0, 197, 65)';
const TYPE_MOVIE_ROUNDED_PLUS = 'movie-rounded-plus';
const REDIRECT_TIME = 3000;
const COOL_TIME = 5000;

async function updateIsEnabled(): Promise<void> {
  const data = await browser.storage.local.get([
    'enabled',
    'autoPlayEnabled',
    'backgroundAutoPlay',
  ]);
  isEnabled = data.enabled !== undefined ? data.enabled : true;
  autoPlayEnabled =
    data.autoPlayEnabled !== undefined ? data.autoPlayEnabled : true;
  backgroundAutoPlay =
    data.backgroundAutoPlay !== undefined ? data.backgroundAutoPlay : false;
  if (isEnabled) {
    await browser.storage.local.set({ enabled: true });
  }
  toggleExtension();
  updateButtons();
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

// Create toggle buttons
async function createToggleButtons(): Promise<void> {
  // Common button styles
  const buttonStyle = `
    position: absolute;
    z-index: 99999;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    min-width: 120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  // AutoPlay button
  const autoPlayButton = document.createElement('button');
  autoPlayButton.id = 'autoPlayToggleButton';
  autoPlayButton.style.cssText = buttonStyle;
  autoPlayButton.style.top = '10px';
  autoPlayButton.style.right = '10px';
  autoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Automatic:</span><span>${autoPlayEnabled ? 'ON' : 'OFF'}</span>`;

  autoPlayButton.addEventListener('click', () => {
    autoPlayEnabled = !autoPlayEnabled;
    autoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Automatic:</span><span>${autoPlayEnabled ? 'ON' : 'OFF'}</span>`;
    browser.storage.local.set({ autoPlayEnabled }).catch((error) => {
      logger.error(`Failed to set autoPlayEnabled in storage: ${error}`);
    });
  });

  // Enable/Disable Extension button
  const enableButton = document.createElement('button');
  enableButton.id = 'extensionToggleButton';
  enableButton.style.cssText = buttonStyle;
  enableButton.style.top = '50px';
  enableButton.style.right = '10px';
  enableButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Extension:</span><span>${isEnabled ? 'ON' : 'OFF'}</span>`;

  enableButton.addEventListener('click', () => {
    isEnabled = !isEnabled;
    enableButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Extension:</span><span>${isEnabled ? 'ON' : 'OFF'}</span>`;
    browser.storage.local.set({ enabled: isEnabled }).catch((error) => {
      logger.error(`Failed to set enabled in storage: ${error}`);
    });
    toggleExtension();
  });

  // Background AutoPlay button
  const backgroundAutoPlayButton = document.createElement('button');
  backgroundAutoPlayButton.id = 'backgroundAutoPlayToggleButton';
  backgroundAutoPlayButton.style.cssText = buttonStyle;
  backgroundAutoPlayButton.style.top = '90px';
  backgroundAutoPlayButton.style.right = '10px';
  backgroundAutoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left; padding-right: 10px;">Background:</span><span>${backgroundAutoPlay ? 'ON' : 'OFF'}</span>`;

  backgroundAutoPlayButton.addEventListener('click', () => {
    backgroundAutoPlay = !backgroundAutoPlay;
    backgroundAutoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left; padding-right: 10px;">Background:</span><span>${backgroundAutoPlay ? 'ON' : 'OFF'}</span>`;
    browser.storage.local.set({ backgroundAutoPlay }).catch((error) => {
      logger.error(`Failed to set backgroundAutoPlay in storage: ${error}`);
    });
  });

  document.body.appendChild(autoPlayButton);
  document.body.appendChild(enableButton);
  document.body.appendChild(backgroundAutoPlayButton);
}

function updateButtons(): void {
  const autoPlayButton = document.getElementById('autoPlayToggleButton');
  if (autoPlayButton !== null) {
    autoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Automatic:</span><span>${autoPlayEnabled ? 'ON' : 'OFF'}</span>`;
  }

  const enableButton = document.getElementById('extensionToggleButton');
  if (enableButton !== null) {
    enableButton.innerHTML = `<span style="flex-grow: 1; text-align: left;">Extension:</span><span>${isEnabled ? 'ON' : 'OFF'}</span>`;
  }

  const backgroundAutoPlayButton = document.getElementById(
    'backgroundAutoPlayToggleButton',
  );
  if (backgroundAutoPlayButton !== null) {
    backgroundAutoPlayButton.innerHTML = `<span style="flex-grow: 1; text-align: left; padding-right: 10px;">Background:</span><span>${backgroundAutoPlay ? 'ON' : 'OFF'}</span>`;
  }
}

// Execute the function when the page is loaded
void updateIsEnabled();
void createToggleButtons();

browser.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    logger.info(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    window.alert(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    updateButtons();
  }
  if (changes.autoPlayEnabled !== undefined) {
    autoPlayEnabled = changes.autoPlayEnabled.newValue;
    updateButtons();
  }
  if (changes.backgroundAutoPlay !== undefined) {
    backgroundAutoPlay = changes.backgroundAutoPlay.newValue;
    updateButtons();
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
    if (document.hidden && !backgroundAutoPlay) {
      // Once output, do not output again
      if (!previousBackgroundAutoPlay)
        logger.info('Did not move because it was playing in the background');
      previousBackgroundAutoPlay = true;
      return;
    } else if (document.hidden && backgroundAutoPlay) {
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
