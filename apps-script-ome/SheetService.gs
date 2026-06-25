/**
 * SheetService.gs - Generic Data Access Layer
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

function requireEditor() {
  const ss = getSpreadsheet();
  const editorsSheet = ss.getSheetByName('Editors');
  if (!editorsSheet) return;
  const lastRow = editorsSheet.getLastRow();
  if (lastRow <= 1) return;

  const emails = editorsSheet.getRange(2, 1, lastRow - 1, 1).getValues()
    .map(function(r) { return r[0].toString().trim().toLowerCase(); })
    .filter(function(e) { return e !== ''; });
  if (emails.length === 0) return;

  const user = Session.getActiveUser().getEmail().toLowerCase();
  if (emails.indexOf(user) === -1) {
    throw new Error('You do not have edit access. Contact the app owner to request permissions.');
  }
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (error) {
    Logger.log('Error opening spreadsheet: ' + error.toString());
    throw new Error('Unable to access spreadsheet. Check SHEET_ID in SheetService.gs');
  }
}

function getSheet(tabName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    throw new Error('Tab "' + tabName + '" not found in spreadsheet');
  }
  return sheet;
}

function getSheetData(tabName) {
  try {
    const sheet = getSheet(tabName);
    const data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      return { success: true, data: { headers: [], rows: [] }, error: null };
    }

    const headers = data[0].map(function(h) { return h.toString().trim(); });

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = { _rowIndex: i + 1 };
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        row[headers[j]] = value !== undefined && value !== null ? value.toString() : '';
      }
      rows.push(row);
    }

    return { success: true, data: { headers: headers, rows: rows }, error: null };
  } catch (error) {
    Logger.log('Error getting data from ' + tabName + ': ' + error.toString());
    return { success: false, data: null, error: error.toString() };
  }
}

function getFilterOptions(tabName) {
  try {
    const sheet = getSheet(tabName);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, data: {}, error: null };
    }

    const headers = data[0].map(function(h) { return h.toString().trim(); });
    var options = {};

    for (var j = 0; j < headers.length; j++) {
      var uniqueSet = {};
      for (var i = 1; i < data.length; i++) {
        var cellValue = data[i][j];
        if (cellValue === undefined || cellValue === null || cellValue === '') continue;
        var valueStr = cellValue.toString().trim();
        if (valueStr) uniqueSet[valueStr] = true;
      }
      var sorted = Object.keys(uniqueSet);
      sorted.sort();
      options[headers[j]] = sorted;
    }

    return { success: true, data: options, error: null };
  } catch (error) {
    Logger.log('Error getting filter options from ' + tabName + ': ' + error.toString());
    return { success: false, data: null, error: error.toString() };
  }
}

function addRow(tabName, rowData) {
  try {
    requireEditor();
    const sheet = getSheet(tabName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(h) { return h.toString().trim(); });

    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var value = rowData[headers[i]];
      newRow.push(value !== undefined && value !== null ? value : '');
    }

    var newRowIndex = sheet.getLastRow() + 1;
    sheet.appendRow(newRow);

    return { success: true, data: { message: 'Row added successfully', rowIndex: newRowIndex }, error: null };
  } catch (error) {
    Logger.log('Error adding row to ' + tabName + ': ' + error.toString());
    return { success: false, data: null, error: error.message || error.toString() };
  }
}

function updateRow(tabName, rowIndex, rowData) {
  try {
    requireEditor();
    const sheet = getSheet(tabName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(h) { return h.toString().trim(); });

    var updatedRow = [];
    for (var i = 0; i < headers.length; i++) {
      var value = rowData[headers[i]];
      updatedRow.push(value !== undefined && value !== null ? value : '');
    }

    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);

    return { success: true, data: { message: 'Row updated successfully' }, error: null };
  } catch (error) {
    Logger.log('Error updating row in ' + tabName + ': ' + error.toString());
    return { success: false, data: null, error: error.message || error.toString() };
  }
}

function deleteRow(tabName, rowIndex) {
  try {
    requireEditor();
    const sheet = getSheet(tabName);
    sheet.deleteRow(rowIndex);

    return { success: true, data: { message: 'Row deleted successfully' }, error: null };
  } catch (error) {
    Logger.log('Error deleting row from ' + tabName + ': ' + error.message || error.toString());
    return { success: false, data: null, error: error.message || error.toString() };
  }
}

function getSheetNames() {
  try {
    const ss = getSpreadsheet();
    var names = ss.getSheets().map(function(s) { return s.getName(); });
    return { success: true, data: names, error: null };
  } catch (error) {
    Logger.log('Error getting sheet names: ' + error.toString());
    return { success: false, data: null, error: error.toString() };
  }
}
