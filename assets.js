const cache = new Map();

export async function preloadAssets(onProgress = () => {}) {
  const paths = await fetch("./assets.json").then((r) => r.json());

  let loaded = 0;

  await Promise.all(
    paths.map((path) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Timed out:", path);
          done();
        }, 3000);
        let finished = false;
        function done(asset = null) {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          if (asset) cache.set(path, asset);
          loaded++;
          onProgress(loaded, paths.length);
          resolve();
        }

        const ext = path.split(".").pop().toLowerCase();

        if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)) {
          const img = new Image();

          img.onload = img.onerror = () => {
            clearTimeout(timeout);
            cache.set(path, img);
            loaded++;
            onProgress(loaded, paths.length);
            resolve();
          };
          img.onload = () => done(img);
          img.onerror = () => done();

          img.src = path;
        } else if (["mp3", "wav", "ogg", "m4a"].includes(ext)) {
          const audio = new Audio();

          audio.oncanplaythrough = audio.onerror = () => {
            clearTimeout(timeout);
            cache.set(path, audio);
            loaded++;
            onProgress(loaded, paths.length);
            resolve();
          };
          audio.oncanplaythrough = () => done(audio);
          audio.onerror = () => done();

          audio.preload = "auto";
          audio.src = path;
        } else {
          loaded++;
          onProgress(loaded, paths.length);
          resolve();
        }
      });
    }),
  );

  return cache;
}

export function getAsset(path) {
  return cache.get(path);
}

export function getCache() {
  return cache;
}
