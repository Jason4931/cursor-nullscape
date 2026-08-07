const cache = new Map();

export async function preloadAssets(onProgress = () => {}) {
  const paths = await fetch("./assets.json").then((r) => r.json());

  let loaded = 0;
  const CONCURRENCY = 8;
  let index = 0;
  async function worker() {
    while (index < paths.length) {
      const path = paths[index++];

      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          done();
        }, 10000);

        let finished = false;

        function done(asset = null) {
          if (asset === null) console.warn(`Asset loading error: ${path}`);
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
          const audio = new Audio();

          audio.oncanplaythrough = () => done(audio);
          audio.onerror = () => done();

          audio.preload = "auto";
          audio.src = path;
        } else {
          done();
        }
      });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return cache;
}
