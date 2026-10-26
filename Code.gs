/**
 * Zona Pet — Web App de Google Apps Script
 * Recibe envíos del formulario de contacto y los guarda en Google Sheets.
 *
 * Deploy: Implementar → Aplicación web → Ejecutar como: Yo → Acceso: Cualquier usuario
 */

// ── Configuración editable ──
const SPREADSHEET_ID = "1o-baq5q8XttBdnxXq1q2W9Xv-IjC-D7dzY6266OXeUA";
const SHEET_NAME     = "Registro_ZonaPet";

/**
 * Preflight CORS — el navegador envía OPTIONS antes del POST con JSON.
 * Respuesta vacía; Google Apps Script añade los headers CORS al desplegar
 * como "Cualquier usuario" (Access-Control-Allow-Origin: *, etc.).
 */
function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Punto de entrada POST desde el formulario (fetch).
 */
function doPost(e) {
  try {
    // Validar que llegó cuerpo JSON
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse({
        success: false,
        error: "Campos requeridos incompletos"
      });
    }

    const payload = JSON.parse(e.postData.contents);

    // Extraer y normalizar campos
    const nombre       = String(payload.nombre       || "").trim();
    const tipo_interes = String(payload.tipo_interes || "").trim();
    const telefono     = String(payload.telefono     || "").trim();
    const email        = String(payload.email        || "").trim();
    const zona         = String(payload.zona         || "").trim();
    const mensaje      = String(payload.mensaje      || "").trim();

    // Validar campos requeridos
    if (!nombre || !tipo_interes || !telefono || !email || !zona) {
      return buildResponse({
        success: false,
        error: "Campos requeridos incompletos"
      });
    }

    // Abrir la hoja de cálculo privada
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("No se encontró la pestaña: Registro_ZonaPet");
    }

    // Timestamp legible (usa la zona horaria del proyecto Apps Script)
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm:ss"
    );

    // Agregar fila: A=Timestamp … G=Mensaje
    sheet.appendRow([
      timestamp,
      nombre,
      tipo_interes,
      telefono,
      email,
      zona,
      mensaje
    ]);

    return buildResponse({ success: true });

  } catch (err) {
    console.error("Error en doPost:", err);
    return buildResponse({
      success: false,
      error: err.message
    });
  }
}

/**
 * Construye la respuesta JSON para el frontend.
 * Headers CORS requeridos (añadidos automáticamente por Google al desplegar
 * la Web App con acceso "Cualquier usuario"):
 *   Access-Control-Allow-Origin: *
 *   Access-Control-Allow-Methods: POST, OPTIONS
 *   Access-Control-Allow-Headers: Content-Type
 */
function buildResponse(data) {
  const output = typeof data === "string"
    ? data
    : JSON.stringify(data);

  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
