(async function () {
  let ws;
  const player = document.querySelector('.html5-main-video');
  const title = document.title.replace(' - YouTube', '');

  if (!player) return;

  if (!document.hidden) {
    await startWs(true);
  }

  function getInit() {
    return {
      type: 'init',
      time: player.currentTime,
      duration: player.duration,
      paused: player.paused,
      title,
      fullscreen: document.webkitIsFullScreen,
    };
  }

  document.addEventListener(
    'visibilitychange',
    async () => {
      const data = {
        type: 'visibility',
        hidden: document.hidden,
        ...(!document.hidden
          ? {
              time: player.currentTime,
              duration: player.duration,
              paused: player.paused,
              title,
              fullscreen: document.webkitIsFullScreen,
            }
          : {}),
      };

      if (!document.hidden) {
        await startWs();
      }

      ws?.send(JSON.stringify(data));

      if (document.hidden) {
        ws.readyState === ws.OPEN && ws?.close();

        return;
      }
    },
    false,
  );

  player.addEventListener('playing', (event) => {
    const data = {
      type: 'play',
      time: event.target.currentTime,
      duration: player.duration,
    };

    ws?.send(JSON.stringify(data));
  });

  player.addEventListener('pause', (event) => {
    const data = {
      type: 'pause',
      time: event.target.currentTime,
    };

    ws?.send(JSON.stringify(data));
  });

  player.addEventListener('waiting', (event) => {
    const data = {
      type: 'waiting',
      time: event.target.currentTime,
    };

    ws?.send(JSON.stringify(data));
  });

  document.addEventListener(
    'fullscreenchange',
    () => {
      const data = {
        type: 'fullscreen',
        fullscreen: document.webkitIsFullScreen,
      };

      ws?.send(JSON.stringify(data));
    },
    false,
  );

  function onWsMessage({ data }) {
    if (document.hidden) return;

    const msg = JSON.parse(data);

    if (msg.type === 'getInit') {
      ws?.send(JSON.stringify(getInit()));

      return;
    }

    if (msg.type === 'setFullscreen') {
      document.querySelector('.ytp-fullscreen-button.ytp-button').click();

      return;
    }

    if (msg.type === 'setSeek') {
      if (typeof msg.seek === 'number') {
        player.currentTime += msg.seek;
      }

      return;
    }

    if (msg.type === 'setPlay') {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }

      return;
    }
  }

  function waitForOpenConnection(socket) {
    return new Promise((resolve, reject) => {
      const maxNumberOfAttempts = 10;
      const intervalTime = 200; //ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject(new Error('Maximum number of attempts exceeded'));
        } else if (socket.readyState === socket.OPEN) {
          clearInterval(interval);
          resolve();
        }
        currentAttempt++;
      }, intervalTime);
    });
  }

  async function startWs(init = false) {
    if (ws && ws.readyState === ws.OPEN) {
      ws?.close();
    }
    ws = new WebSocket('ws://localhost:2292');
    await waitForOpenConnection(ws);

    if (init) {
      if (document.hidden || !player) return;
      ws.send(JSON.stringify(getInit()));
    }

    ws.onmessage = onWsMessage;
  }
})();
