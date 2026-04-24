import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export async function exportElementToPNG(element: HTMLElement, filename = 'reporte.png') {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, filename)
  })
}

export async function exportElementToPDF(element: HTMLElement, filename = 'reporte.pdf') {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'pt', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = 0
  let heightLeft = imgHeight

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    pdf.addPage()
    position = heightLeft - imgHeight
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

export function exportObjectsToExcel(sheets: { name: string, rows: any[] }[], filename = 'reporte.xlsx') {
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, rows }) => {
    const safeName = name.substring(0, 31) || 'Hoja'
    const sheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, sheet, safeName)
  })
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, filename)
}

export function exportFilteredExcel(rows: any[], filename = 'reporte.xlsx', sheetName = 'Resultados') {
  const workbook = XLSX.utils.book_new()
  const safeName = sheetName.substring(0, 31) || 'Hoja'
  const ws = XLSX.utils.json_to_sheet(rows || [])

  const range = ws['!ref'] || 'A1'
  ws['!autofilter'] = { ref: range }

  // Ajuste simple de anchos para legibilidad
  const headers = rows && rows.length > 0 ? Object.keys(rows[0]) : []
  ws['!cols'] = headers.map((h) => ({ wch: Math.min(45, Math.max(12, String(h).length + 2)) }))

  XLSX.utils.book_append_sheet(workbook, ws, safeName)
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, filename)
}

export function exportCoordinatorReportExcel(rows: any[], filename = 'reporte-coordinador.xlsx') {
  const workbook = XLSX.utils.book_new()
  const safeRows = Array.isArray(rows) ? rows : []

  const preferredColumns = [
    'DOCENTE',
    'ASIGNATURA',
    'GRUPO',
    'ESTUDIANTES',
    'ESTUDIANTES_EVALUADORES',
    'SABER_ESPECIFICO',
    'METODOLOGIA_DE_ENSEÑANZA',
    'METODOLOGÍA_DE_ENSEÑANZA',
    'METODOLOGIA',
    'EVALUACION',
    'EVALUACIÓN',
    'RELACION_CON_LOS_ESTUDIANTES',
    'RELACIÓN_CON_LOS_ESTUDIANTES',
    'PROMEDIO'
  ]

  const allKeys = Array.from(new Set(safeRows.flatMap((row) => Object.keys(row || {}))))
  const columns = [
    ...preferredColumns.filter((col) => allKeys.includes(col)),
    ...allKeys.filter((col) => !preferredColumns.includes(col))
  ]

  const displayHeader = (key: string) => key
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const dataRows = safeRows.map((row) => columns.map((col) => row?.[col] ?? ''))
  const dataSheet = XLSX.utils.aoa_to_sheet([
    columns.map(displayHeader),
    ...dataRows
  ])
  const dataLastCol = XLSX.utils.encode_col(Math.max(columns.length - 1, 0))
  const dataLastRow = Math.max(1, dataRows.length + 1)
  dataSheet['!autofilter'] = { ref: `A1:${dataLastCol}${dataLastRow}` }
  dataSheet['!cols'] = columns.map((col) => {
    const maxContent = Math.max(
      displayHeader(col).length,
      ...safeRows.slice(0, 100).map((row) => String(row?.[col] ?? '').length)
    )
    return { wch: Math.min(42, Math.max(12, maxContent + 2)) }
  })

  const docentes = Array.from(new Set(safeRows.map((row) => String(row?.DOCENTE || '').trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'es'))
  const docentesSheet = XLSX.utils.aoa_to_sheet([
    ['DOCENTE'],
    ...docentes.map((d) => [d])
  ])
  docentesSheet['!cols'] = [{ wch: 42 }]

  const consultaAoa: any[][] = [
    [],
    ['', 'Conciencia Academica - Evaluacion Temprana Docente'],
    [],
    [],
    ['', 'Docente', '', 'Escribe o pega el nombre exacto del docente en la celda C5'],
    [],
    ['', 'Tip', 'Puedes consultar la hoja "Docentes" para copiar el nombre exacto.'],
    [],
    [],
    [],
    [],
    ['', ...columns.map(displayHeader)],
  ]

  const ws = XLSX.utils.aoa_to_sheet(consultaAoa)
  const lastColumn = XLSX.utils.encode_col(columns.length)
  const dataRange = `Datos!A2:${dataLastCol}${dataLastRow}`
  const docenteRange = `Datos!A2:A${dataLastRow}`
  ws['B13'] = {
    t: 's',
    f: `IF($C$5="","Escribe un docente en C5",FILTER(${dataRange},${docenteRange}=$C$5,"Sin resultados para ese docente"))`
  }

  ws['!merges'] = [
    { s: { r: 1, c: 1 }, e: { r: 2, c: Math.max(8, columns.length) } },
    { s: { r: 4, c: 3 }, e: { r: 4, c: Math.max(6, Math.min(columns.length, 7)) } }
  ]
  ws['!freeze'] = { xSplit: 0, ySplit: 12 }
  ws['!cols'] = [
    { wch: 4 },
    ...columns.map((col) => {
      const maxContent = Math.max(
        displayHeader(col).length,
        ...safeRows.slice(0, 100).map((row) => String(row?.[col] ?? '').length)
      )
      return { wch: Math.min(42, Math.max(12, maxContent + 2)) }
    })
  ]

  XLSX.utils.book_append_sheet(workbook, ws, 'Resultados')
  XLSX.utils.book_append_sheet(workbook, docentesSheet, 'Docentes')
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Datos')
  if (!workbook.Workbook) workbook.Workbook = { Sheets: [] }
  workbook.Workbook.Sheets = workbook.SheetNames.map((name) => ({
    name,
    Hidden: name === 'Datos' ? 1 : 0
  }))
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, filename)
}


