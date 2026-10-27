/**
 * 3D Sign Builder - Google Apps Script web app
 * Serves Index.html. All previewing happens in the visitor's browser:
 * uploaded images and videos never leave their computer.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('3D Sign Builder')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // lets you embed it in Google Sites
}
