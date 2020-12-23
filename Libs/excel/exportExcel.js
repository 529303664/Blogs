import XLSX from 'xlsx';

export const downloadBlob = (blob, name) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = name || `export-${Date.now}.xlsx`;
  a.href = blobUrl;
  a.click();
  setTimeout(() => {
    a.remove();
  }, 500);
};

/**
 * 从table数据导出Excel
 * @param {*} table
 * @param {*} header
 * @param {*} name
 * @param {*} sheetname
 */
export const exportTable = (table, header, name, sheetname = 'file') => {
  const workbook = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(table, {
    header,
    skipHeader: true,
  });

  XLSX.utils.book_append_sheet(workbook, ws, sheetname);

  const wData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wData], { type: 'application/octet-stream' });
  downloadBlob(blob, name + '.xlsx');
};

const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const numberToExcelHeader = index => {
  index -= 1;
  const quotient = Math.floor(index / 26);
  if (quotient > 0) {
    return numberToExcelHeader(quotient) + chars[index % 26];
  }
  return chars[index % 26];
};

/**
 * 从数据源导出到Excel
 * @param {Object[]} dataSource - The data source of Excel sheet.
 * @param {Object[]} columns - The columns of Excel sheet [{title: 'ID', dataKey: 'id}, {title: '', dataKey: 'userName}].
 * @param {string} columns[].title - The Column Title.
 * @param {string} columns[].dataKey - The Column data key in dataSource[].item.
 * @param {String} name - The file name of export Excel.
 * @param {String} sheetname - The export sheetname
 */
export const exportExcel = (dataSource, columns, name, sheetname) => {
  const table = [];
  console.info(columns);
  const excelHeaders = columns.map((_, i) => numberToExcelHeader(i + 1));

  const headerRow = columns.reduce((hRow, col, i) => {
    hRow[excelHeaders[i]] = col.title || col.dataKey;
    return hRow;
  }, {});

  table.push(headerRow);
  console.log('excel sheet header', headerRow);

  dataSource.forEach(item => {
    const dataRow = columns.reduce((dRow, col, i) => {
      dRow[excelHeaders[i]] = item[col.dataKey];
      return dRow;
    }, {});
    table.push(dataRow);
  });

  exportTable(table, excelHeaders, name, sheetname);
};
