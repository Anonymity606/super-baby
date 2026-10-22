window.__ModuleLoader__.load({
  id: '@local/nuke-baby',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'nuke-baby'
    const QUIT_ROUTE = '/__nuke_baby/quit'
    const QUIT_HEADER = 'x-nuke-baby'
    const QUIT_TOKEN = 'detonate-v1'

    /**
     * Live-fire switch. It is enabled again after animation tuning; flip it
     * together with QUIT_ENABLED in index.js to pause the exit once more.
     */
    const QUIT_ENABLED = true

    const zh = {
      'action.label': '超级大宝贝：连点五下蓄力发射并退出',
      'action.labelDemo': '超级大宝贝：连点五下蓄力发射（退出已暂停）',
      'action.title': '超级大宝贝',
      'action.titleDemo': '超级大宝贝 · 演示模式',
      'overlay.arm': '点火程序已启动',
      'overlay.lock': '鲸鱼坐标已锁定',
      'overlay.arc': '抛物线校正完成',
      'overlay.impact': '核平收工',
      'overlay.quit': '正在终止后台进程…',
      'overlay.demo': '演示模式：退出功能已暂停',
      'overlay.demoBadge': 'DEMO · 退出暂停',
      'error.title': '哑弹',
      'error.body': '退出流程没有完成，DeepSeek Harness 还在。',
      'error.dismiss': '收起',
      'error.hint': '再点一次按钮可以重试。',
    }

    const en = {
      'action.label': '超级大宝贝: click five times to charge, launch and quit',
      'action.labelDemo': '超级大宝贝: click five times to charge and launch (quit paused)',
      'action.title': '超级大宝贝',
      'action.titleDemo': '超级大宝贝 · Demo mode',
      'overlay.arm': 'IGNITION SEQUENCE STARTED',
      'overlay.lock': 'WHALE COORDINATES LOCKED',
      'overlay.arc': 'PARABOLIC COURSE CORRECTED',
      'overlay.impact': 'NUCLEAR CLEANUP',
      'overlay.quit': 'TERMINATING BACKGROUND PROCESSES…',
      'overlay.demo': 'DEMO MODE · QUIT DISABLED',
      'overlay.demoBadge': 'DEMO · QUIT PAUSED',
      'error.title': 'DUD',
      'error.body': 'The quit sequence did not finish. DeepSeek Harness is still here.',
      'error.dismiss': 'Dismiss',
      'error.hint': 'Press the button again to retry.',
    }

    const LAUNCHER_CSS = `
      /* The footer seat is a flex row. The shipped Cordis action asks for the
         full row, so wrapping keeps this icon as its own row, directly above
         the account trigger, instead of widening the sidebar by 38px. */
      div:has(> [data-slot="sidebar.footer.action"]) { flex-wrap: wrap; }
      .nb-launcher {
        box-sizing: border-box;
        width: 38px;
        height: 42px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        order: 2;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        position: relative;
        z-index: 2;
        overflow: visible;
        transition: background 120ms ease, transform 120ms ease;
      }
      .nb-launcher:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        transform: translateY(-1px);
      }
      .nb-launcher:active { transform: translateY(0) scale(0.96); }
      .nb-launcher:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: -2px;
      }
      .nb-launcher:disabled { cursor: default; }
      .nb-launcher[data-rail="true"] { width: 36px; height: 36px; border-radius: 10px; }
      .nb-launcher-art {
        display: flex;
        transform-origin: 50% 85%;
        will-change: transform;
        filter: drop-shadow(0 2px 0 rgb(26 15 38 / 18%));
        transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .nb-shaker {
        display: flex;
        transform-origin: 50% 60%;
        will-change: transform;
      }
      .nb-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .nb-launcher, .nb-launcher-art { transition: none; }
        .nb-launcher:hover, .nb-launcher:active { transform: none; }
      }
    `

    const OVERLAY_CSS = `
      .nb-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        overflow: hidden;
        pointer-events: none;
        color: #fff8e7;
        font-family: ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
        contain: layout paint style;
      }
      .nb-overlay.nb-error { pointer-events: auto; background: rgb(8 4 12 / 48%); }
      .nb-overlay.nb-error .nb-demo-badge { display: none; }
      .nb-overlay.nb-demo .nb-fade { display: none; }

      /* Shake the app viewport itself, not just the explosion layer. The style
         is active only while this overlay exists, so teardown restores both
         the root transform and body overflow automatically. */
      body:has([data-nuke-baby-overlay]) { overflow: hidden; }
      #root:has([data-nuke-baby-overlay]) {
        animation: nb-window-shake 720ms 2.78s cubic-bezier(0.36, 0.07, 0.19, 0.97) 1;
        transform-origin: 50% 50%;
      }
      .nb-demo-badge {
        position: absolute;
        right: 24px;
        top: 20px;
        z-index: 2;
        padding: 5px 8px;
        border: 2px solid #7ef0ff;
        background: rgb(11 8 17 / 78%);
        color: #7ef0ff;
        font-size: 10px;
        line-height: 14px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-shadow: 0 0 8px rgb(126 240 255 / 45%);
      }
      .nb-stage { position: absolute; inset: 0; overflow: hidden; }
      .nb-missile-wrap {
        position: absolute;
        left: 0;
        top: 0;
        width: 56px;
        height: 86px;
        opacity: 0;
        will-change: transform;
        transform-origin: 50% 50%;
        pointer-events: none;
      }
      .nb-missile { display: block; shape-rendering: crispEdges; image-rendering: pixelated; }
      .nb-flame {
        position: absolute;
        left: 50%;
        top: 63px;
        width: 26px;
        height: 24px;
        transform: translateX(-50%);
        transform-origin: 50% 0;
        filter: drop-shadow(0 0 9px rgb(255 139 53 / 75%));
        pointer-events: none;
      }
      .nb-flame i {
        position: absolute;
        left: 50%;
        display: block;
        transform: translateX(-50%);
        border-radius: 1px;
      }
      .nb-flame-a {
        top: 0;
        width: 10px;
        height: 23px;
        background: #fff3b0;
        animation: nb-flicker 90ms steps(2, end) infinite;
      }
      .nb-flame-b {
        top: 7px;
        width: 20px;
        height: 18px;
        background: #ff9b2f;
        opacity: 0.92;
        animation: nb-flicker 120ms steps(2, end) infinite reverse;
      }
      .nb-flame-c {
        top: 14px;
        width: 26px;
        height: 11px;
        background: #f04d32;
        opacity: 0.78;
        animation: nb-flicker 150ms steps(3, end) infinite;
      }
      .nb-trail {
        position: absolute;
        left: 0;
        top: 0;
        width: 12px;
        height: 12px;
        opacity: 0;
        border-radius: 1px;
        will-change: transform, opacity;
        pointer-events: none;
      }
      .nb-trail:nth-child(3n + 1) { background: #ffe27b; }
      .nb-trail:nth-child(3n + 2) { background: #ff9637; }
      .nb-trail:nth-child(3n + 3) { background: #b45435; }
      .nb-reticle {
        position: absolute;
        left: 0;
        top: 0;
        width: 44px;
        height: 44px;
        opacity: 0;
        color: #7ef0ff;
        pointer-events: none;
        will-change: opacity;
        transition: opacity 100ms linear;
      }
      .nb-reticle span {
        position: absolute;
        display: block;
        background: currentColor;
        box-shadow: 0 0 6px rgb(126 240 255 / 75%);
      }
      .nb-reticle span:nth-child(1) { left: 0; top: 0; width: 14px; height: 3px; }
      .nb-reticle span:nth-child(2) { left: 0; top: 0; width: 3px; height: 14px; }
      .nb-reticle span:nth-child(3) { right: 0; top: 0; width: 14px; height: 3px; }
      .nb-reticle span:nth-child(4) { right: 0; top: 0; width: 3px; height: 14px; }
      .nb-reticle span:nth-child(5) { left: 0; bottom: 0; width: 14px; height: 3px; }
      .nb-reticle span:nth-child(6) { left: 0; bottom: 0; width: 3px; height: 14px; }
      .nb-reticle span:nth-child(7) { right: 0; bottom: 0; width: 14px; height: 3px; }
      .nb-reticle span:nth-child(8) { right: 0; bottom: 0; width: 3px; height: 14px; }
      .nb-hud {
        position: absolute;
        left: 24px;
        bottom: 22px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        line-height: 16px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #ffd76a;
        text-shadow: 0 1px 0 #1a0f26;
      }
      .nb-hud::before {
        content: "";
        width: 7px;
        height: 7px;
        flex: none;
        background: currentColor;
        animation: nb-blink 700ms steps(2, end) infinite;
      }
      .nb-boom { position: absolute; inset: 0; overflow: hidden; }
      .nb-flash {
        position: absolute;
        inset: 0;
        background: #fffdf2;
        opacity: 0;
        animation: nb-flash 720ms ease-out forwards;
      }
      .nb-ring {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 116px;
        height: 116px;
        margin: -58px 0 0 -58px;
        border: 8px solid #ffd15a;
        border-radius: 50%;
        opacity: 0;
        animation: nb-ring 1180ms cubic-bezier(0.08, 0.72, 0.22, 1) forwards;
      }
      .nb-ring-2 { animation-delay: 90ms; border-color: #ff7333; }
      .nb-ring-3 { animation-delay: 190ms; border-width: 3px; border-color: #fff1b0; }
      .nb-burst {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 576px;
        height: 576px;
        margin: -288px 0 0 -288px;
        opacity: 0;
        transform-origin: 50% 50%;
        filter: drop-shadow(0 0 26px rgb(255 114 49 / 72%));
        animation: nb-burst 1050ms cubic-bezier(0.05, 0.75, 0.15, 1) forwards;
        shape-rendering: crispEdges;
      }
      .nb-cloud {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 432px;
        height: 432px;
        margin: -228px 0 0 -216px;
        opacity: 0;
        transform-origin: 50% 64%;
        filter: drop-shadow(0 0 22px rgb(255 103 40 / 48%));
        animation: nb-cloud 1500ms 110ms cubic-bezier(0.18, 0.72, 0.24, 1) forwards;
        shape-rendering: crispEdges;
      }
      .nb-shard {
        position: absolute;
        left: 50%;
        top: 50%;
        width: var(--nb-size);
        height: var(--nb-size);
        background: var(--nb-color);
        opacity: 0;
        animation: nb-shard 1150ms var(--nb-delay) cubic-bezier(0.06, 0.68, 0.25, 1) forwards;
        will-change: transform, opacity;
      }
      .nb-ash {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 50% 50%, transparent 0 8%, rgb(255 112 42 / 22%) 28%, transparent 65%),
          repeating-linear-gradient(0deg, rgb(10 4 14 / 0%) 0 3px, rgb(10 4 14 / 10%) 3px 4px);
        opacity: 0;
        animation: nb-ash 1400ms 220ms ease-out forwards;
      }
      .nb-fade {
        position: absolute;
        inset: 0;
        background: #09050d;
        opacity: 0;
        animation: nb-fade 620ms 1120ms ease-in forwards;
      }
      .nb-error-panel {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(420px, calc(100vw - 40px));
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        padding: 18px 18px 16px;
        background: #17101f;
        border: 3px solid #ffd15a;
        box-shadow: 0 0 0 3px #17101f, 12px 12px 0 rgb(0 0 0 / 42%);
        color: #fff8e7;
      }
      .nb-error-kicker {
        margin: 0 0 8px;
        color: #ff7333;
        font-size: 11px;
        letter-spacing: 0.18em;
      }
      .nb-error-title {
        margin: 0 0 8px;
        color: #ffd15a;
        font-size: 28px;
        line-height: 30px;
        letter-spacing: 0.08em;
      }
      .nb-error-copy { margin: 0 0 8px; font-size: 13px; line-height: 20px; }
      .nb-error-reason {
        margin: 0 0 14px;
        padding: 7px 8px;
        background: #0e0914;
        color: #d8c8ad;
        font-size: 11px;
        line-height: 16px;
        overflow-wrap: anywhere;
      }
      .nb-error-actions { display: flex; align-items: center; gap: 12px; }
      .nb-error-hint { color: #a9927a; font-size: 11px; }
      .nb-error-dismiss {
        margin-left: auto;
        padding: 7px 14px;
        border: 2px solid #ffd15a;
        background: #ffd15a;
        color: #17101f;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
      .nb-error-dismiss:hover { background: #fff0a0; }
      .nb-error-dismiss:focus-visible { outline: 3px solid #7ef0ff; outline-offset: 2px; }
      .nb-overlay.nb-error .nb-hud { display: none; }
      @keyframes nb-flicker {
        0% { transform: translateX(-50%) scaleY(0.72); }
        50% { transform: translateX(-50%) scaleY(1.15); }
        100% { transform: translateX(-50%) scaleY(0.9); }
      }
      @keyframes nb-blink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0.18; } }
      @keyframes nb-flash {
        0% { opacity: 0; }
        7% { opacity: 0.96; }
        34% { opacity: 0.45; }
        100% { opacity: 0; }
      }
      @keyframes nb-ring {
        0% { opacity: 0; transform: scale(0.12); }
        12% { opacity: 0.95; }
        100% { opacity: 0; transform: scale(3.2); }
      }
      @keyframes nb-burst {
        0% { opacity: 0; transform: scale(0.08) rotate(-8deg); }
        12% { opacity: 1; transform: scale(0.72) rotate(0deg); }
        46% { opacity: 0.92; transform: scale(1.08) rotate(4deg); }
        100% { opacity: 0; transform: scale(1.36) rotate(7deg); }
      }
      @keyframes nb-cloud {
        0% { opacity: 0; transform: translateY(26px) scale(0.2); }
        16% { opacity: 1; }
        46% { opacity: 0.96; transform: translateY(-6px) scale(0.98); }
        76% { opacity: 0.78; transform: translateY(-34px) scale(1.08); }
        100% { opacity: 0; transform: translateY(-74px) scale(1.16); }
      }
      @keyframes nb-shard {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(0deg); }
        10% { opacity: 1; }
        100% {
          opacity: 0;
          transform:
            translate(calc(-50% + var(--nb-dx)), calc(-50% + var(--nb-dy)))
            scale(1) rotate(var(--nb-rot));
        }
      }
      @keyframes nb-ash {
        0% { opacity: 0; }
        18% { opacity: 1; }
        100% { opacity: 0.28; }
      }
      @keyframes nb-fade { to { opacity: 1; } }
      @keyframes nb-window-shake {
        0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        8% { transform: translate3d(-12px, 7px, 0) rotate(-0.35deg); }
        16% { transform: translate3d(14px, -9px, 0) rotate(0.42deg); }
        26% { transform: translate3d(-15px, -5px, 0) rotate(-0.3deg); }
        36% { transform: translate3d(12px, 8px, 0) rotate(0.28deg); }
        48% { transform: translate3d(-9px, 6px, 0) rotate(-0.2deg); }
        60% { transform: translate3d(7px, -5px, 0) rotate(0.18deg); }
        72% { transform: translate3d(-5px, 3px, 0) rotate(-0.12deg); }
        84% { transform: translate3d(3px, -2px, 0) rotate(0.06deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .nb-flame i, .nb-hud::before { animation-duration: 1s; }
        #root:has([data-nuke-baby-overlay]) { animation: none; }
      }
    `

    /**
     * @typedef {{ active: boolean, runId: number, start: { x: number, y: number } }} LaunchState
     */

    /**
     * Tiny observable shared by the footer button and the frame-wide overlay.
     * The button supplies its own live bounding box so the missile starts
     * exactly where the user clicked.
     */
    function createLaunchStore() {
      /** @type {LaunchState} */
      let state = { active: false, runId: 0, start: { x: 0, y: 0 } }
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) listener()
      }
      return {
        getSnapshot: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        start(start) {
          if (state.active) return
          state = { active: true, runId: state.runId + 1, start }
          publish()
        },
        reset() {
          if (!state.active) return
          state = { ...state, active: false }
          publish()
        },
        dispose() {
          listeners.clear()
        },
      }
    }

    /** @param {{ getSnapshot: () => LaunchState, subscribe: (listener: () => void) => () => void }} store */
    function useLaunch(store) {
      const [snapshot, setSnapshot] = React.useState(store.getSnapshot)
      React.useEffect(() => store.subscribe(() => {
        setSnapshot(store.getSnapshot())
      }), [store])
      return snapshot
    }

    /**
     * Original pixel-art missile. The same drawing is used at 24 px in the
     * sidebar and at 56 px in flight.
     */
    const Missile = React.memo(function Missile({ size = 24 }) {
      return h('svg', {
        className: 'nb-missile',
        width: size,
        height: Math.round(size * 1.375),
        viewBox: '0 0 32 44',
        'aria-hidden': 'true',
        focusable: 'false',
      },
        h('path', {
          d: 'M16 0H19V2H21V4H23V7H25V23H29V26H28V36H24V32H23V41H9V32H8V36H3V26H2V23H7V7H9V4H11V2H13V0Z',
          fill: '#18111f',
        }),
        h('path', { d: 'M16 1H18V3H20V5H22V8H23V9H9V8H10V5H12V3H14V1Z', fill: '#e6463f' }),
        h('path', { d: 'M16 1H18V3H20V5H21V7H16Z', fill: '#ff8650' }),
        h('rect', { x: 8, y: 9, width: 16, height: 23, fill: '#f8e9cb' }),
        h('rect', { x: 20, y: 9, width: 4, height: 23, fill: '#d8bd8e' }),
        h('rect', { x: 10, y: 9, width: 2, height: 23, fill: '#fff8e7' }),
        h('rect', { x: 11, y: 12, width: 3, height: 2, fill: '#18111f' }),
        h('rect', { x: 18, y: 12, width: 3, height: 2, fill: '#18111f' }),
        h('rect', { x: 14, y: 15, width: 4, height: 1, fill: '#18111f' }),
        h('rect', { x: 13, y: 16, width: 1, height: 1, fill: '#e6463f' }),
        h('rect', { x: 18, y: 16, width: 1, height: 1, fill: '#e6463f' }),
        h('rect', { x: 10, y: 18, width: 12, height: 9, fill: '#18111f' }),
        h('rect', { x: 11, y: 19, width: 10, height: 7, fill: '#ffd54a' }),
        h('rect', { x: 15, y: 21, width: 2, height: 2, fill: '#18111f' }),
        h('rect', { x: 12, y: 19, width: 3, height: 2, fill: '#18111f' }),
        h('rect', { x: 17, y: 19, width: 3, height: 2, fill: '#18111f' }),
        h('rect', { x: 14, y: 24, width: 4, height: 1, fill: '#18111f' }),
        h('rect', { x: 8, y: 29, width: 16, height: 3, fill: '#18111f' }),
        h('rect', { x: 9, y: 29, width: 3, height: 2, fill: '#ffb52e' }),
        h('rect', { x: 14, y: 29, width: 3, height: 2, fill: '#ffb52e' }),
        h('rect', { x: 19, y: 29, width: 3, height: 2, fill: '#ffb52e' }),
        h('path', { d: 'M3 26H8V35H4V33H3Z', fill: '#e6463f' }),
        h('path', { d: 'M29 26H24V35H28V33H29Z', fill: '#c53334' }),
        h('rect', { x: 4, y: 27, width: 2, height: 5, fill: '#ff8650' }),
        h('rect', { x: 26, y: 27, width: 1, height: 5, fill: '#ff8650' }),
        h('rect', { x: 12, y: 32, width: 8, height: 4, fill: '#5d6676' }),
        h('rect', { x: 13, y: 35, width: 6, height: 3, fill: '#18111f' }),
        h('rect', { x: 15, y: 37, width: 2, height: 1, fill: '#ffd54a' }),
      )
    })

    const CHARGE_LIMIT = 5
    const CHARGE_STEP = 0.2
    const CHARGE_IDLE_MS = 800
    const LAUNCH_HOLD_MS = 320

    const AUDIO_MASTER_GAIN = 0.72

    /**
     * Tiny synthesized sound kit: no external samples, no extra licensing.
     * A compressor keeps the charge pops and the explosion from clipping.
     */
    const Sound = (() => {
      let audio
      let master
      let whiteNoise

      /** Create or resume the one AudioContext; must first be called from a click. */
      function ensure() {
        if (audio !== undefined) {
          if (audio.state === 'suspended') audio.resume().catch(() => {})
          return audio
        }
        const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
        if (typeof AudioContextClass !== 'function') return undefined
        try {
          audio = new AudioContextClass()
          const compressor = audio.createDynamicsCompressor()
          compressor.threshold.value = -6
          compressor.knee.value = 8
          compressor.ratio.value = 8
          compressor.attack.value = 0.001
          compressor.release.value = 0.14
          master = audio.createGain()
          master.gain.value = AUDIO_MASTER_GAIN

          const saturator = audio.createWaveShaper()
          const curve = new Float32Array(1024)
          for (let index = 0; index < curve.length; index += 1) {
            const x = index * 2 / (curve.length - 1) - 1
            curve[index] = Math.tanh(x * 2.2) / Math.tanh(2.2)
          }
          saturator.curve = curve
          saturator.oversample = '2x'

          const output = audio.createGain()
          output.gain.value = 0.95
          master.connect(saturator)
          saturator.connect(compressor)
          compressor.connect(output)
          output.connect(audio.destination)

          const length = Math.floor(audio.sampleRate * 2)
          whiteNoise = audio.createBuffer(1, length, audio.sampleRate)
          const samples = whiteNoise.getChannelData(0)
          for (let index = 0; index < length; index += 1) samples[index] = Math.random() * 2 - 1
          if (audio.state === 'suspended') audio.resume().catch(() => {})
          return audio
        } catch (error) {
          console.warn('[nuke-baby] audio unavailable:', error)
          audio = undefined
          return undefined
        }
      }

      /** Connect a source through an optional stereo pan into the master bus. */
      function connectOutput(node, when, duration, pan = 0, panTo = undefined) {
        if (typeof audio.createStereoPanner !== 'function') {
          node.connect(master)
          return
        }
        const panner = audio.createStereoPanner()
        panner.pan.setValueAtTime(pan, when)
        if (panTo !== undefined) panner.pan.linearRampToValueAtTime(panTo, when + duration)
        node.connect(panner)
        panner.connect(master)
      }

      /** One pitched oscillator hit with an exponential decay. */
      function tone({ type = 'sine', from, to, when, duration, volume, pan = 0, panTo = undefined }) {
        if (ensure() === undefined) return
        const oscillator = audio.createOscillator()
        oscillator.type = type
        oscillator.frequency.setValueAtTime(Math.max(20, from), when)
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), when + duration)
        const amp = audio.createGain()
        amp.gain.setValueAtTime(0.0001, when)
        amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), when + 0.008)
        amp.gain.exponentialRampToValueAtTime(0.0001, when + duration)
        oscillator.connect(amp)
        connectOutput(amp, when, duration, pan, panTo)
        oscillator.start(when)
        oscillator.stop(when + duration + 0.04)
      }

      /** Filtered white-noise sweep used for clicks, air and the blast body. */
      function noiseSweep({
        when,
        duration,
        from,
        to,
        q = 1,
        volume,
        type = 'bandpass',
        pan = 0,
        panTo = undefined,
        attack = 0.008,
      }) {
        if (ensure() === undefined) return
        const source = audio.createBufferSource()
        source.buffer = whiteNoise
        source.loop = true
        const filter = audio.createBiquadFilter()
        filter.type = type
        filter.Q.value = q
        filter.frequency.setValueAtTime(Math.max(20, from), when)
        filter.frequency.exponentialRampToValueAtTime(Math.max(20, to), when + duration)
        const amp = audio.createGain()
        amp.gain.setValueAtTime(0.0001, when)
        amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), when + attack)
        amp.gain.exponentialRampToValueAtTime(0.0001, when + duration)
        source.connect(filter)
        filter.connect(amp)
        connectOutput(amp, when, duration, pan, panTo)
        source.start(when)
        source.stop(when + duration + 0.04)
      }

      return {
        /** Call from every click so the first user gesture unlocks audio. */
        unlock() {
          ensure()
        },

        /** Release the context when the plugin is disabled or hot-replaced. */
        dispose() {
          if (audio === undefined) return
          audio.close().catch(() => {})
          audio = undefined
          master = undefined
          whiteNoise = undefined
        },

        /** A punchy rising pop; the fifth click adds a fuller charged chord. */
        charge(level) {
          const context = ensure()
          if (context === undefined) return
          const when = context.currentTime + 0.004
          const base = 190 * Math.pow(1.21, Math.max(0, level - 1))
          tone({
            type: 'sine',
            from: base * 0.62,
            to: base * 0.38,
            when,
            duration: 0.14,
            volume: 0.48,
          })
          tone({
            type: 'triangle',
            from: base,
            to: base * 1.95,
            when: when + 0.004,
            duration: 0.12,
            volume: 0.16,
          })
          noiseSweep({
            when,
            duration: 0.034,
            from: 4200,
            to: 1600,
            q: 0.7,
            volume: 0.11,
            type: 'highpass',
            attack: 0.002,
          })
          noiseSweep({
            when: when + 0.002,
            duration: 0.075,
            from: 2200,
            to: 420,
            q: 1.1,
            volume: 0.1,
            type: 'bandpass',
            attack: 0.002,
          })
          if (level >= CHARGE_LIMIT) {
            tone({
              type: 'sine',
              from: base * 2.1,
              to: base * 2.8,
              when: when + 0.03,
              duration: 0.26,
              volume: 0.13,
            })
            tone({
              type: 'sine',
              from: base * 2.65,
              to: base * 3.5,
              when: when + 0.03,
              duration: 0.26,
              volume: 0.09,
            })
            noiseSweep({
              when,
              duration: 0.28,
              from: 520,
              to: 3800,
              q: 1.2,
              volume: 0.17,
              pan: -0.2,
              panTo: 0,
              attack: 0.02,
            })
            noiseSweep({
              when,
              duration: 0.07,
              from: 5200,
              to: 2500,
              q: 0.8,
              volume: 0.08,
              type: 'highpass',
              attack: 0.002,
            })
          }
        },

        /** Ignition thump, airy ascent whoosh and a narrower dive whistle. */
        launch() {
          const context = ensure()
          if (context === undefined) return
          const when = context.currentTime + 0.01
          tone({
            type: 'sine',
            from: 96,
            to: 30,
            when,
            duration: 0.55,
            volume: 0.6,
            pan: -0.2,
          })
          noiseSweep({
            when,
            duration: 0.6,
            from: 1400,
            to: 130,
            q: 0.7,
            volume: 0.32,
            type: 'lowpass',
            pan: -0.3,
            attack: 0.005,
          })
          noiseSweep({
            when: when + 0.02,
            duration: 1.35,
            from: 260,
            to: 2800,
            q: 1.8,
            volume: 0.4,
            pan: -0.55,
            panTo: 0.25,
            attack: 0.07,
          })
          noiseSweep({
            when: when + 0.06,
            duration: 1.1,
            from: 620,
            to: 3400,
            q: 1.2,
            volume: 0.15,
            pan: 0.55,
            panTo: 0.1,
            attack: 0.1,
          })
          tone({
            type: 'sawtooth',
            from: 62,
            to: 44,
            when,
            duration: 1.8,
            volume: 0.08,
            pan: -0.1,
          })
          noiseSweep({
            when: when + 1.3,
            duration: 1.45,
            from: 1900,
            to: 420,
            q: 2.4,
            volume: 0.24,
            pan: 0.2,
            panTo: 0.55,
            attack: 0.16,
          })
          tone({
            type: 'sine',
            from: 720,
            to: 220,
            when: when + 1.32,
            duration: 1.1,
            volume: 0.05,
            pan: 0.35,
          })
        },

        /** Sub-bass drop, sharp crack, body noise, rumble tail and debris taps. */
        explosion() {
          const context = ensure()
          if (context === undefined) return
          const when = context.currentTime + 0.005
          noiseSweep({
            when,
            duration: 0.11,
            from: 4200,
            to: 1100,
            q: 0.6,
            volume: 0.6,
            type: 'highpass',
            attack: 0.002,
          })
          noiseSweep({
            when: when + 0.002,
            duration: 0.36,
            from: 1100,
            to: 220,
            q: 0.85,
            volume: 0.32,
            type: 'bandpass',
            attack: 0.003,
          })
          tone({
            type: 'sine',
            from: 105,
            to: 27,
            when,
            duration: 1.25,
            volume: 0.82,
          })
          tone({
            type: 'triangle',
            from: 70,
            to: 24,
            when: when + 0.015,
            duration: 1.0,
            volume: 0.34,
          })
          noiseSweep({
            when,
            duration: 1.45,
            from: 5200,
            to: 110,
            q: 0.7,
            volume: 0.55,
            type: 'lowpass',
            pan: 0.05,
            attack: 0.006,
          })
          noiseSweep({
            when: when + 0.03,
            duration: 0.6,
            from: 5200,
            to: 1400,
            q: 0.6,
            volume: 0.13,
            type: 'highpass',
            pan: -0.65,
            attack: 0.005,
          })
          noiseSweep({
            when: when + 0.08,
            duration: 0.52,
            from: 6200,
            to: 1800,
            q: 0.6,
            volume: 0.1,
            type: 'highpass',
            pan: 0.65,
            attack: 0.005,
          })
          noiseSweep({
            when: when + 0.15,
            duration: 1.9,
            from: 280,
            to: 60,
            q: 0.5,
            volume: 0.24,
            type: 'lowpass',
            attack: 0.12,
          })
          tone({
            type: 'sine',
            from: 58,
            to: 26,
            when: when + 0.38,
            duration: 1.2,
            volume: 0.24,
          })
          for (let index = 0; index < 10; index += 1) {
            noiseSweep({
              when: when + 0.09 + index * 0.072 + Math.random() * 0.04,
              duration: 0.04 + Math.random() * 0.05,
              from: 2200 + index * 260,
              to: 480 + Math.random() * 300,
              q: 2.2,
              volume: 0.06 + Math.random() * 0.04,
              pan: index % 2 === 0 ? -0.5 : 0.5,
              attack: 0.002,
            })
          }
          tone({
            type: 'sine',
            from: 1420,
            to: 820,
            when: when + 0.01,
            duration: 0.48,
            volume: 0.065,
          })
        },
      }
    })()

    /** Footer action: click to charge the missile, then launch on the fifth click. */
    function NukeLauncher({ wide, store, t }) {
      const state = useLaunch(store)
      const [charges, setCharges] = React.useState(0)
      const [launching, setLaunching] = React.useState(false)
      const chargesRef = React.useRef(0)
      const launchingRef = React.useRef(false)
      const shrinkTimer = React.useRef(0)
      const launchTimer = React.useRef(0)
      const wasActive = React.useRef(false)
      const buttonRef = React.useRef(null)
      const artRef = React.useRef(null)
      const shakerRef = React.useRef(null)

      const writeCharges = (value) => {
        chargesRef.current = value
        setCharges(value)
      }

      const cancelShrink = () => {
        if (shrinkTimer.current === 0) return
        window.clearTimeout(shrinkTimer.current)
        shrinkTimer.current = 0
      }

      /** Restartable WAAPI shake, kept on an inner node so the grow scale survives. */
      const shake = () => {
        const node = shakerRef.current
        if (node === null || typeof node.animate !== 'function') return
        for (const animation of node.getAnimations()) animation.cancel()
        node.animate([
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          { transform: 'translate3d(-3px, 1px, 0) rotate(-4deg)', offset: 0.2 },
          { transform: 'translate3d(3px, -1px, 0) rotate(4deg)', offset: 0.4 },
          { transform: 'translate3d(-2px, 1px, 0) rotate(-3deg)', offset: 0.62 },
          { transform: 'translate3d(2px, 0, 0) rotate(2deg)', offset: 0.8 },
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
        ], {
          duration: 300,
          easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)',
        })
      }

      /**
       * One 20% step disappears every 800 ms of inactivity. Any click clears
       * this timer and restarts the grace period.
       */
      const scheduleShrink = () => {
        cancelShrink()
        if (launchingRef.current) return
        shrinkTimer.current = window.setTimeout(() => {
          shrinkTimer.current = 0
          if (launchingRef.current) return
          const next = Math.max(0, chargesRef.current - 1)
          writeCharges(next)
          if (next > 0) scheduleShrink()
        }, CHARGE_IDLE_MS)
      }

      React.useEffect(() => () => {
        if (shrinkTimer.current !== 0) window.clearTimeout(shrinkTimer.current)
        if (launchTimer.current !== 0) window.clearTimeout(launchTimer.current)
      }, [])

      React.useEffect(() => {
        if (state.active) {
          wasActive.current = true
          return
        }
        if (!wasActive.current) return
        wasActive.current = false
        launchingRef.current = false
        setLaunching(false)
        if (chargesRef.current !== 0) writeCharges(0)
      }, [state.active])

      const beginLaunch = (buttonRect) => {
        if (launchingRef.current) return
        launchingRef.current = true
        setLaunching(true)
        cancelShrink()
        launchTimer.current = window.setTimeout(() => {
          launchTimer.current = 0
          const artRect = artRef.current?.getBoundingClientRect()
          const rect = artRect ?? buttonRect
          if (rect === undefined) {
            launchingRef.current = false
            setLaunching(false)
            writeCharges(0)
            return
          }
          store.start({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          })
          writeCharges(0)
        }, LAUNCH_HOLD_MS)
      }

      const onClick = () => {
        if (launchingRef.current || store.getSnapshot().active) return
        Sound.unlock()
        const next = Math.min(CHARGE_LIMIT, chargesRef.current + 1)
        writeCharges(next)
        Sound.charge(next)
        shake()
        if (next >= CHARGE_LIMIT) beginLaunch(buttonRef.current?.getBoundingClientRect())
        else scheduleShrink()
      }

      const baseLabel = t(QUIT_ENABLED ? 'action.label' : 'action.labelDemo')
      const progress = charges > 0 ? ` · ${charges}/${CHARGE_LIMIT}` : ''
      const label = `${baseLabel}${progress}`
      return h(React.Fragment, null,
        h('style', { key: 'css' }, LAUNCHER_CSS),
        h('button', {
          type: 'button',
          ref: buttonRef,
          className: 'nb-launcher',
          'data-rail': wide ? undefined : 'true',
          'data-charges': charges,
          disabled: state.active || launching,
          'aria-label': label,
          title: `${t(QUIT_ENABLED ? 'action.title' : 'action.titleDemo')}${progress}`,
          onClick,
        },
          h('span', {
            className: 'nb-launcher-art',
            ref: artRef,
            style: { transform: `scale(${1 + charges * CHARGE_STEP})` },
          },
            h('span', { className: 'nb-shaker', ref: shakerRef },
              h(Missile, { size: 24 }),
            ),
          ),
          h('span', { className: 'nb-sr-only' }, label),
        ),
      )
    }

    const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
    const lerp = (from, to, amount) => from + (to - from) * amount
    const smooth = (value) => value * value * (3 - 2 * value)

    const FLIGHT = {
      ignition: 520,
      ascent: 900,
      hold: 280,
      arc: 1120,
    }
    const ASCENT_END = FLIGHT.ignition + FLIGHT.ascent
    const HOLD_END = ASCENT_END + FLIGHT.hold
    const IMPACT = HOLD_END + FLIGHT.arc
    const QUIT_DELAY = 1500

    /**
     * A point on the top-left → centre quadratic Bézier, plus the missile's
     * rotation from its tangent. The missile art points up, hence +90°.
     */
    function arcPoint(u, from, control, to) {
      const rest = 1 - u
      const x = rest * rest * from.x + 2 * rest * u * control.x + u * u * to.x
      const y = rest * rest * from.y + 2 * rest * u * control.y + u * u * to.y
      const dx = 2 * rest * (control.x - from.x) + 2 * u * (to.x - control.x)
      const dy = 2 * rest * (control.y - from.y) + 2 * u * (to.y - control.y)
      return { x, y, angle: Math.atan2(dy, dx) * 180 / Math.PI + 90 }
    }

    /**
     * Pose for one frame. Everything is fixed to viewport pixels measured when
     * the run starts, so the path stays clipped inside the window.
     */
    function poseAt(ms, view, start, whale, control, center, arcStartAngle) {
      if (ms < FLIGHT.ignition) {
        const u = clamp(ms / FLIGHT.ignition, 0, 1)
        return {
          x: start.x + Math.sin(ms * 0.09) * 1.6 * u,
          y: start.y + Math.cos(ms * 0.07) * 1.4 * u,
          angle: Math.sin(ms * 0.085) * 1.8,
          scale: 0.82 + 0.18 * smooth(u),
          power: 0.45 + 0.55 * u + Math.sin(ms * 0.045) * 0.08,
          trail: 0.18 + 0.5 * u,
          reticle: 0,
        }
      }

      if (ms < ASCENT_END) {
        const u = clamp((ms - FLIGHT.ignition) / FLIGHT.ascent, 0, 1)
        const eased = smooth(u)
        return {
          x: lerp(start.x, whale.x, eased) + Math.sin(u * Math.PI * 2) * (1 - eased) * 5,
          y: lerp(start.y, whale.y, eased) - Math.sin(u * Math.PI) * 7,
          angle: -6 * eased + Math.sin(u * Math.PI * 2) * 2.4 * (1 - eased),
          scale: 1 + 0.1 * eased,
          power: 1,
          trail: 1,
          reticle: 0,
        }
      }

      if (ms < HOLD_END) {
        const u = clamp((ms - ASCENT_END) / FLIGHT.hold, 0, 1)
        return {
          x: whale.x + Math.sin(u * Math.PI * 4) * 1.4,
          y: whale.y + Math.sin(u * Math.PI * 2) * 2,
          angle: lerp(-6, arcStartAngle, smooth(u)),
          scale: 1.1 + Math.sin(u * Math.PI) * 0.035,
          power: 0.72,
          trail: 0.55,
          reticle: 1,
        }
      }

      const u = clamp((ms - HOLD_END) / FLIGHT.arc, 0, 1)
      const point = arcPoint(u, whale, control, center)
      return {
        x: point.x,
        y: point.y,
        angle: point.angle,
        scale: 1.12 + u * 0.34,
        power: 1,
        trail: 1,
        reticle: u < 0.18 ? 1 : 0,
      }
    }

    /** Draw the old launch exhaust as a short, pixel-stepped trail. */
    function updateTrail(ms, pose, nodes) {
      const radians = pose.angle * Math.PI / 180
      const noseX = Math.sin(radians)
      const noseY = -Math.cos(radians)
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index]
        if (node === null) continue
        const distance = 24 + index * 11
        const side = (index % 2 === 0 ? 1 : -1) * (3 + index * 0.7) + Math.sin(ms * 0.018 + index * 2.1) * 2
        const x = pose.x - noseX * distance - noseY * side
        const y = pose.y - noseY * distance + noseX * side
        const fade = Math.max(0, 1 - index / 10)
        const flicker = 0.65 + 0.35 * Math.sin(ms * 0.025 + index * 1.7)
        const scale = (1.15 - index * 0.065) * (0.68 + 0.32 * flicker)
        node.style.opacity = String(pose.trail * fade * flicker)
        node.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0) scale(${scale})`
      }
    }

    function clearTrail(nodes) {
      for (const node of nodes) {
        if (node !== null) node.style.opacity = '0'
      }
    }

    /** Pixel mushroom cloud, drawn with stepped rectangles rather than smooth curves. */
    function PixelCloud() {
      return h('svg', {
        className: 'nb-cloud',
        viewBox: '0 0 240 240',
        'aria-hidden': 'true',
        focusable: 'false',
      },
        h('path', {
          d: 'M96 24H144V16H160V24H176V32H192V48H200V72H192V88H176V96H160V88H80V96H64V88H48V72H40V48H48V32H64V24H80V16H96Z',
          fill: '#2a1622',
        }),
        h('path', {
          d: 'M100 32H140V24H154V32H168V40H182V54H188V72H180V84H166V90H154V80H86V90H74V84H60V72H52V54H58V40H72V32H86V24H100Z',
          fill: '#ff6a2e',
        }),
        h('path', {
          d: 'M108 40H136V32H148V40H160V48H170V58H176V70H168V76H158V62H142V54H120V62H108Z',
          fill: '#ffad35',
        }),
        h('path', {
          d: 'M116 50H140V58H152V66H158V74H150V80H138V72H126V80H112V72H104V62H108Z',
          fill: '#ffe08a',
        }),
        h('path', { d: 'M104 96H136V152H150V184H90V152H104Z', fill: '#2a1622' }),
        h('path', { d: 'M110 96H130V148H140V176H100V148H110Z', fill: '#ff7a2f' }),
        h('rect', { x: 114, y: 104, width: 8, height: 58, fill: '#ffc247' }),
        h('rect', { x: 124, y: 128, width: 6, height: 30, fill: '#d94a2a' }),
        h('path', { d: 'M70 184H170V196H186V216H54V196H70Z', fill: '#2a1622' }),
        h('path', { d: 'M78 190H162V200H172V208H68V200H78Z', fill: '#b83a28' }),
        h('rect', { x: 94, y: 160, width: 6, height: 6, fill: '#ffbd3d' }),
        h('rect', { x: 136, y: 146, width: 5, height: 5, fill: '#ffd15a' }),
        h('rect', { x: 68, y: 62, width: 6, height: 4, fill: '#ffd15a' }),
        h('rect', { x: 170, y: 58, width: 5, height: 4, fill: '#ffe9a3' }),
        h('rect', { x: 84, y: 46, width: 4, height: 4, fill: '#ffe9a3' }),
      )
    }

    const SHARD_COLORS = ['#ff5a2e', '#ff9b2f', '#ffd15a', '#fff0b0', '#8d3c2a', '#d94a2a', '#ff7333']

    function makeShards() {
      const shards = []
      for (let index = 0; index < 30; index += 1) {
        const angle = index / 30 * Math.PI * 2 + (index % 4) * 0.11
        const distance = (120 + (index * 53) % 250) * 1.2
        shards.push({
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.72,
          size: (4 + (index % 4) * 3) * 1.2,
          rot: (index * 37) % 360,
          delay: (index % 6) * 22,
          color: SHARD_COLORS[index % SHARD_COLORS.length],
        })
      }
      return shards
    }

    /** The full post-impact frame; all motion is CSS once this mounts. */
    function ExplosionVisual() {
      const shards = React.useMemo(makeShards, [])
      return h('div', { className: 'nb-boom', 'aria-hidden': 'true' },
        h('div', { className: 'nb-flash' }),
        h('div', { className: 'nb-ring' }),
        h('div', { className: 'nb-ring nb-ring-2' }),
        h('div', { className: 'nb-ring nb-ring-3' }),
        h('svg', {
          className: 'nb-burst',
          viewBox: '0 0 200 200',
          focusable: 'false',
        },
          h('path', {
            d: 'M96 0H104V18H120V26H142V38H156V52H178V72H190V96H200V104H190V120H178V142H156V158H142V176H120V190H104V200H96V190H72V176H58V158H42V142H30V120H0V104H10V96H24V72H42V52H58V38H72V26H82V18H96Z',
            fill: '#ff5a2e',
          }),
          h('g', { transform: 'translate(100 100) scale(0.68) translate(-100 -100)' },
            h('path', {
              d: 'M96 0H104V18H120V26H142V38H156V52H178V72H190V96H200V104H190V120H178V142H156V158H142V176H120V190H104V200H96V190H72V176H58V158H42V142H30V120H0V104H10V96H24V72H42V52H58V38H72V26H82V18H96Z',
              fill: '#ffb52e',
            }),
          ),
          h('g', { transform: 'translate(100 100) scale(0.36) translate(-100 -100)' },
            h('path', {
              d: 'M96 0H104V18H120V26H142V38H156V52H178V72H190V96H200V104H190V120H178V142H156V158H142V176H120V190H104V200H96V190H72V176H58V158H42V142H30V120H0V104H10V96H24V72H42V52H58V38H72V26H82V18H96Z',
              fill: '#fff4c8',
            }),
          ),
        ),
        h(PixelCloud),
        shards.map((shard, index) => h('span', {
          key: index,
          className: 'nb-shard',
          style: {
            '--nb-dx': `${Math.round(shard.dx)}px`,
            '--nb-dy': `${Math.round(shard.dy)}px`,
            '--nb-size': `${shard.size}px`,
            '--nb-rot': `${shard.rot}deg`,
            '--nb-delay': `${shard.delay}ms`,
            '--nb-color': shard.color,
          },
        })),
        h('div', { className: 'nb-ash' }),
        h('div', { className: 'nb-fade' }),
      )
    }

    function NukeSequence({ start, store, t }) {
      const missileRef = React.useRef(null)
      const flameRef = React.useRef(null)
      const reticleRef = React.useRef(null)
      const trailRef = React.useRef([])
      const closeRef = React.useRef(null)
      const [boom, setBoom] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [log, setLog] = React.useState(t('overlay.arm'))

      React.useEffect(() => {
        if (error === null) return undefined
        closeRef.current?.focus()
        const onKeyDown = (event) => {
          if (event.key === 'Escape') store.reset()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [error, store])

      React.useEffect(() => {
        const view = { w: window.innerWidth, h: window.innerHeight }
        const origin = {
          x: clamp(start.x, 16, view.w - 16),
          y: clamp(start.y, 16, view.h - 16),
        }
        const whale = {
          x: 72,
          y: clamp(view.h * 0.082, 58, 92),
        }
        const center = { x: view.w / 2, y: view.h / 2 }
        const control = {
          x: clamp(view.w * 0.56, whale.x + 80, view.w - 64),
          y: clamp(view.h * 0.035, 12, 96),
        }
        const arcStartAngle = arcPoint(0, whale, control, center).angle
        const missile = missileRef.current
        const flame = flameRef.current
        const reticle = reticleRef.current
        const trails = trailRef.current.filter(Boolean)
        const first = performance.now()
        let frame = 0
        let quitTimer = 0
        let shutdownWatchdog = 0
        let demoLogTimer = 0
        let demoResetTimer = 0
        let alive = true

        Sound.launch()

        if (reticle !== null) {
          reticle.style.transform = `translate3d(${whale.x - 22}px, ${whale.y - 22}px, 0)`
        }

        const timers = [
          window.setTimeout(() => {
            if (alive) setLog(t('overlay.lock'))
          }, ASCENT_END - 120),
          window.setTimeout(() => {
            if (alive) setLog(t('overlay.arc'))
          }, HOLD_END - 60),
        ]

        /** Send the quit request only after the explosion has had its full beat. */
        const requestQuit = async () => {
          if (!alive) return
          setLog(t('overlay.quit'))
          const abort = new AbortController()
          const timeout = window.setTimeout(() => abort.abort(), 5000)
          try {
            const response = await fetch(QUIT_ROUTE, {
              method: 'POST',
              credentials: 'same-origin',
              cache: 'no-store',
              headers: {
                'content-type': 'application/json',
                [QUIT_HEADER]: QUIT_TOKEN,
              },
              body: '{}',
              signal: abort.signal,
            })
            if (!response.ok) throw new Error(`Host answered HTTP ${response.status}`)
            const result = await response.json().catch(() => ({}))
            if (result.ok !== true) throw new Error('Host refused the quit request')
            shutdownWatchdog = window.setTimeout(() => {
              if (!alive) return
              setError('Host accepted the quit request, but the window is still running')
              setLog(t('error.title'))
            }, 3500)
          } catch (reason) {
            if (!alive) return
            setError(reason instanceof Error ? reason.message : String(reason))
            setLog(t('error.title'))
          } finally {
            window.clearTimeout(timeout)
          }
        }

        const tick = (now) => {
          if (!alive) return
          const ms = now - first
          if (ms >= IMPACT) {
            if (missile !== null) missile.style.opacity = '0'
            if (flame !== null) flame.style.opacity = '0'
            if (reticle !== null) reticle.style.opacity = '0'
            clearTrail(trails)
            Sound.explosion()
            setBoom(true)
            setLog(t('overlay.impact'))
            if (QUIT_ENABLED) {
              quitTimer = window.setTimeout(requestQuit, QUIT_DELAY)
            } else {
              demoLogTimer = window.setTimeout(() => {
                if (alive) setLog(t('overlay.demo'))
              }, 620)
              demoResetTimer = window.setTimeout(() => {
                if (alive) store.reset()
              }, 2100)
            }
            return
          }

          const pose = poseAt(ms, view, origin, whale, control, center, arcStartAngle)
          if (missile !== null) {
            missile.style.opacity = '1'
            missile.style.transform = `translate3d(${pose.x - 28}px, ${pose.y - 43}px, 0) rotate(${pose.angle}deg) scale(${pose.scale})`
          }
          if (flame !== null) {
            flame.style.opacity = '1'
            flame.style.transform = `translateX(-50%) scaleY(${0.7 + pose.power * 0.42})`
          }
          if (reticle !== null) reticle.style.opacity = String(pose.reticle)
          updateTrail(ms, pose, trails)
          frame = window.requestAnimationFrame(tick)
        }

        frame = window.requestAnimationFrame(tick)
        return () => {
          alive = false
          window.cancelAnimationFrame(frame)
          window.clearTimeout(quitTimer)
          window.clearTimeout(shutdownWatchdog)
          window.clearTimeout(demoLogTimer)
          window.clearTimeout(demoResetTimer)
          for (const timer of timers) window.clearTimeout(timer)
        }
        // The run key remounts this component for every click; measured geometry
        // and the locale snapshot are intentionally frozen for that run.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return h('div', {
        className: `nb-overlay${error === null ? '' : ' nb-error'}${QUIT_ENABLED ? '' : ' nb-demo'}`,
        'data-nuke-baby-overlay': '',
      },
        h('style', { key: 'css' }, OVERLAY_CSS),
        !QUIT_ENABLED && h('div', {
          className: 'nb-demo-badge',
          role: 'status',
        }, t('overlay.demoBadge')),
        h('div', { className: 'nb-stage', 'aria-hidden': 'true' },
          h('div', { className: 'nb-missile-wrap', ref: missileRef },
            h(Missile, { size: 56 }),
            h('span', { className: 'nb-flame', ref: flameRef },
              h('i', { className: 'nb-flame-a' }),
              h('i', { className: 'nb-flame-b' }),
              h('i', { className: 'nb-flame-c' }),
            ),
          ),
          h('div', { className: 'nb-reticle', ref: reticleRef },
            h('span'), h('span'), h('span'), h('span'),
            h('span'), h('span'), h('span'), h('span'),
          ),
          Array.from({ length: 10 }, (_, index) => h('span', {
            key: `trail-${index}`,
            className: 'nb-trail',
            ref: (node) => { trailRef.current[index] = node },
          })),
          boom && h(ExplosionVisual, { key: 'boom' }),
        ),
        h('div', { className: 'nb-hud', role: 'status', 'aria-live': 'polite' }, log),
        error !== null && h('section', {
          className: 'nb-error-panel',
          role: 'alertdialog',
          'aria-modal': 'true',
          'aria-labelledby': 'nb-error-title',
          'aria-describedby': 'nb-error-body nb-error-reason',
        },
          h('p', { className: 'nb-error-kicker' }, 'SYSTEM / DETONATION FAILED'),
          h('h2', { className: 'nb-error-title', id: 'nb-error-title' }, t('error.title')),
          h('p', { className: 'nb-error-copy', id: 'nb-error-body' }, t('error.body')),
          h('p', { className: 'nb-error-reason', id: 'nb-error-reason' }, error),
          h('div', { className: 'nb-error-actions' },
            h('span', { className: 'nb-error-hint' }, t('error.hint')),
            h('button', {
              type: 'button',
              className: 'nb-error-dismiss',
              ref: closeRef,
              onClick: () => store.reset(),
            }, t('error.dismiss')),
          ),
        ),
      )
    }

    /** Frame-wide half; renders nothing until the footer button starts a run. */
    function NukeOverlay({ store, t }) {
      const state = useLaunch(store)
      if (!state.active) return null
      return h(NukeSequence, {
        key: state.runId,
        start: state.start,
        store,
        t,
      })
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const store = createLaunchStore()
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'nuke-baby: dictionaries')
        ctx.effect(() => {
          const offLauncher = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
            name: 'sidebar.footer.action',
            id: 'nuke-baby',
            order: -10,
            locale: NS,
            inject: () => ({ store }),
          }, NukeLauncher))
          const offOverlay = ctx.slots.inject('shell.overlay', () => ctx.slots.register({
            name: 'shell.overlay',
            id: 'nuke-baby-overlay',
            order: 100,
            locale: NS,
            inject: () => ({ store }),
          }, NukeOverlay))
          return () => {
            offLauncher()
            offOverlay()
            store.dispose()
            Sound.dispose()
          }
        }, 'nuke-baby: sidebar action and overlay')
      },
    }
  },
})
