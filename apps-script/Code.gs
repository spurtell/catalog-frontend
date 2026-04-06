/**
 * Code.gs - Application Entry Point
 * Serves the web app and provides HTML template inclusion
 */

/**
 * Entry point for the web app
 * @param {Object} e - Event object
 * @return {HtmlOutput} The rendered HTML page
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ACM Resource Catalog')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper function to include HTML files in templates
 * @param {string} filename - Name of the file to include
 * @return {string} The content of the file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
