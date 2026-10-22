/**
 * Host half of the Super Baby bundle.
 *
 * The Client plays the launch and explosion, then POSTs to one authenticated
 * loopback route. The Host answers first and only then brings the desktop app
 * down, so the page can finish its last frame. In the Electron desktop the Host
 * is a direct child of the Electron main process; killing that parent ends the
 * app's whole process tree, including shell jobs and background subprocesses
 * that belong to it. A non-desktop Host exits its own process instead.
 *
 * @module @local/nuke-baby
 */

import { posix } from 'node:path'

/** Exact route the Client calls after the explosion. */
const QUIT_ROUTE = '/__nuke_baby/quit'

/** Header token separating the button's request from unrelated same-origin POSTs. */
const QUIT_HEADER = 'x-nuke-baby'
const QUIT_TOKEN = 'detonate-v1'

/**
 * Live-fire switch: when true, an authenticated detonation request schedules
 * app teardown. Flip this together with QUIT_ENABLED in client.js to pause it.
 */
const QUIT_ENABLED = true

/** Time for the HTTP response to reach the page before the app is torn down. */
const QUIT_GRACE_MS = 900

/** Route and auth services are provided by the Web composition this UI lives in. */
export const inject = ['webServer', 'connection']

/**
 * Whether this Host is the Node-mode child of the Electron desktop shell.
 * The desktop profile is the authoritative marker; the executable check keeps
 * a development Electron profile on the same path.
 *
 * @returns {boolean} true when the parent is the desktop app process.
 */
function isDesktopHost() {
  if (typeof process.versions.electron !== 'string') return false
  if (process.env.DSH_PROFILE === 'desktop') return true
  return /deepseek[ -]harness/i.test(posix.basename(process.execPath.replaceAll('\\', '/')))
}

/** Tear down the process that owns this Host, with a fallback for non-desktop. */
function quitApplication() {
  if (isDesktopHost() && Number.isInteger(process.ppid) && process.ppid > 1) {
    try {
      process.kill(process.ppid, 'SIGTERM')
    } catch (error) {
      console.error('[nuke-baby] could not stop the desktop shell:', error)
    }
    // If the shell did not take this child down with it, still leave the Host.
    setTimeout(() => process.exit(0), 1500)
    return
  }
  process.exit(0)
}

/**
 * Register the authenticated quit route for the lifetime of the plugin.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - Host plugin context.
 */
export function apply(ctx) {
  let shuttingDown = false

  /**
   * One detonation request: authenticate, answer, then schedule the teardown.
   *
   * @param {import('node:http').IncomingMessage} req - request.
   * @param {import('node:http').ServerResponse} res - response.
   */
  const handleQuit = (req, res) => {
    // A harmless, unauthenticated probe while the animation is being tuned.
    // It reports the safety switch without accepting a quit.
    if (req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify({ ok: true, quitEnabled: QUIT_ENABLED, mode: QUIT_ENABLED ? 'live' : 'demo' }))
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(405, { allow: 'GET, POST', 'content-type': 'application/json; charset=utf-8' })
      res.end('{"ok":false,"error":"method-not-allowed"}')
      return
    }
    if (req.headers[QUIT_HEADER] !== QUIT_TOKEN) {
      res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
      res.end('{"ok":false,"error":"bad-request"}')
      return
    }

    const rejection = ctx.connection.requestRejection({ headers: req.headers })
    if (rejection !== undefined) {
      res.writeHead(rejection, { 'content-type': 'application/json; charset=utf-8' })
      res.end(`{"ok":false,"error":"${rejection === 401 ? 'unauthenticated' : 'forbidden'}"}`)
      return
    }

    req.resume()
    if (!QUIT_ENABLED) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end('{"ok":true,"quit":false,"mode":"demo"}')
      return
    }
    if (shuttingDown) {
      res.writeHead(202, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end('{"ok":true,"already":true}')
      return
    }

    shuttingDown = true
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end('{"ok":true}')
    setTimeout(quitApplication, QUIT_GRACE_MS)
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: QUIT_ROUTE, handler: handleQuit }),
    'nuke-baby: authenticated quit route',
  )
}
