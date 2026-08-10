const cache = new Map();
let cancelPreload = null;

export async function preloadAssets(onProgress = () => {}) {
  const controller = new AbortController();
  cancelPreload = () => controller.abort();

  const paths = await fetch("./assets.json", {
    signal: controller.signal,
  }).then((r) => r.json());

  let loaded = 0;
  const CONCURRENCY = 8;
  let index = 0;

  async function worker() {
    while (index < paths.length && !controller.signal.aborted) {
      const path = paths[index++];

      await new Promise(async (resolve) => {
        const timeout = setTimeout(() => {
          done();
        }, 10000);

        let finished = false;

        function done(asset = null) {
          if (controller.signal.aborted)
            console.warn(`Preload aborted: ${path}`);
          else if (asset === null) console.warn(`Asset loading error: ${path}`);
          if (finished) return;
          finished = true;
          clearTimeout(timeout);

          if (asset) cache.set(path, asset);

          loaded++;
          onProgress(loaded, paths.length);
          resolve();
        }

        const ext = path.split(".").pop().toLowerCase();

        if (
          [
            "mp3",
            "mpeg",
            "ogg",
            "wav",
            "m4a",
            "aac",
            "flac",
            "opus",
            "weba",
            "oga",
            "mid",
            "midi",
            "aif",
            "aiff",
            "caf",
          ].includes(ext)
        ) {
          try {
            const response = await fetch(path, {
              signal: controller.signal,
            });
            const blob = await response.blob();
            if (controller.signal.aborted) {
              done();
              return;
            }
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.oncanplaythrough = () => done(audio);
            audio.onerror = () => done();
            audio.load();
          } catch (e) {
            done();
          }
        } else {
          done();
        }
      });
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  cancelPreload = null;

  return cache;
}

export function cancelPreloadAssets() {
  if (cancelPreload) {
    cancelPreload();
    cancelPreload = null;
  }
}

export function getAsset(path) {
  return cache.get(path);
}
