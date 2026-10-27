/**
 * 3D Sign Builder - Google Apps Script web app
 *
 * Serves Index.html and stores shared signs in Google Drive.
 * Previewing happens in the visitor's browser. Files leave the browser only
 * when someone presses Share: the sign settings and any uploaded images or
 * videos are saved to a folder in the Drive of the account that deployed the
 * web app ("Execute as: Me"). The share link opens the web app with
 * ?share=<id>, and the app loads that sign back through this script, so
 * viewers never need access to the Drive folder itself.
 */

// ---- Settings you can change -------------------------------------------
var SHARE_FOLDER_NAME = '3D Sign Builder Shares'; // created in your Drive on first share
var MAX_SHARE_MB = 100;                           // largest total upload per share
// -------------------------------------------------------------------------

var CHUNK_LIMIT_B64 = 6 * 1024 * 1024;            // one uploaded piece (base64 text)
var MAX_CHUNKS = 64;
var ID_RE = /^[a-f0-9]{16}$/;
var KEY_RE = /^(top|led|bot)(-back)?$/;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('3D Sign Builder')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // lets you embed it in Google Sites
}

/** Starts a share: saves the sign settings and returns its id and the web app URL. */
function createShare(settingsJson) {
  if (typeof settingsJson !== 'string' || settingsJson.length > 200000) throw new Error('Sign settings are missing or too large.');
  JSON.parse(settingsJson); // must be valid JSON
  var id = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  var folder = shareRoot_().createFolder(id);
  folder.createFile('settings.json', settingsJson, MimeType.PLAIN_TEXT);
  return { id: id, url: ScriptApp.getService().getUrl() };
}

/** Saves one piece of an uploaded file. Large videos arrive as several pieces. */
function putChunk(id, key, index, b64) {
  var folder = shareFolder_(id);
  if (!KEY_RE.test(key)) throw new Error('Unknown sign face.');
  if (index !== Math.floor(index) || index < 0 || index >= MAX_CHUNKS) throw new Error('Too many pieces.');
  if (typeof b64 !== 'string' || b64.length > CHUNK_LIMIT_B64) throw new Error('Upload piece too large.');
  var name = key + '.' + ('000' + index).slice(-3);
  var old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);
  folder.createFile(Utilities.newBlob(Utilities.base64Decode(b64), 'application/octet-stream', name));
  return true;
}

/** Finishes a share: records which files belong to it. */
function finishShare(id, manifestJson) {
  var folder = shareFolder_(id);
  var manifest = JSON.parse(manifestJson);
  var total = 0;
  Object.keys(manifest.media || {}).forEach(function (k) {
    if (!KEY_RE.test(k)) throw new Error('Unknown sign face.');
    total += Number(manifest.media[k].size) || 0;
  });
  if (total > MAX_SHARE_MB * 1024 * 1024) throw new Error('This share is larger than ' + MAX_SHARE_MB + ' MB.');
  folder.createFile('manifest.json', JSON.stringify(manifest), MimeType.PLAIN_TEXT);
  return true;
}

/** Returns a shared sign's settings and file list. */
function getShare(id) {
  var folder = shareFolder_(id);
  var m = folder.getFilesByName('manifest.json');
  if (!m.hasNext()) throw new Error('This share was not finished. Ask for a new link.');
  return {
    settings: folder.getFilesByName('settings.json').next().getBlob().getDataAsString(),
    manifest: m.next().getBlob().getDataAsString()
  };
}

/** Returns one piece of a shared file as base64. */
function getChunk(id, key, index) {
  if (!KEY_RE.test(key)) throw new Error('Unknown sign face.');
  var it = shareFolder_(id).getFilesByName(key + '.' + ('000' + index).slice(-3));
  if (!it.hasNext()) throw new Error('Part of this shared file is missing.');
  return Utilities.base64Encode(it.next().getBlob().getBytes());
}

/**
 * Optional clean-up: moves shares older than `days` to the Drive trash.
 * Run it by hand, or add a time-driven trigger (Triggers > Add trigger >
 * cleanUpOldShares > Time-driven > Week timer).
 */
function cleanUpOldShares(days) {
  days = Number(days) || 90;
  var cutoff = Date.now() - days * 24 * 3600 * 1000, n = 0;
  var it = shareRoot_().getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (ID_RE.test(f.getName()) && f.getDateCreated().getTime() < cutoff) { f.setTrashed(true); n++; }
  }
  return n;
}

function shareRoot_() {
  var it = DriveApp.getFoldersByName(SHARE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(SHARE_FOLDER_NAME);
}
function shareFolder_(id) {
  if (!ID_RE.test(String(id))) throw new Error('That share link is not valid.');
  var it = shareRoot_().getFoldersByName(id);
  if (!it.hasNext()) throw new Error('This shared sign no longer exists.');
  return it.next();
}
