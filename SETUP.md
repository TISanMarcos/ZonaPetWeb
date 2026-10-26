# Zona Pet — Integración formulario → Google Sheets

Guía paso a paso para conectar el formulario de contacto (hosteado en IONOS) con una Google Sheet privada mediante Google Apps Script.

---

## Sección 1: Preparar la Google Sheet

1. Abre la hoja de cálculo:
   https://docs.google.com/spreadsheets/d/1o-baq5q8XttBdnxXq1q2W9Xv-IjC-D7dzY6266OXeUA/edit

2. Confirma que la pestaña se llama **exactamente** `Registro_ZonaPet` (mayúsculas, guion bajo y sin espacios extra).

3. Verifica que la **fila 1** tenga estos encabezados en orden:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | Timestamp | Nombre | Tipo de Interés | Teléfono/WhatsApp | Email | Zona | Mensaje |

4. La Sheet **NO** debe publicarse en la web. Debe permanecer **privada**; solo usuarios con permiso en Google Drive pueden verla.

---

## Sección 2: Crear y deployar el Apps Script

1. Ve a [drive.google.com](https://drive.google.com) → **Nuevo** → **Más** → **Google Apps Script**.

2. Nombra el proyecto: **ZonaPet Form Handler**.

3. Borra el contenido por defecto de `Code.gs`.

4. Copia y pega el contenido completo del archivo `Code.gs` de este repositorio.

5. Guarda con **Ctrl+S**.

6. Clic en **Implementar** → **Nueva implementación**.

7. Tipo: **Aplicación web**.

8. Configura exactamente:
   - **Descripción:** `ZonaPet v1`
   - **Ejecutar como:** Yo (tu cuenta Google)
   - **Quién tiene acceso:** Cualquier usuario

9. Clic en **Implementar**.

10. **IMPORTANTE:** Google pedirá autorizar permisos — acepta con tu cuenta Google.
    - Si aparece *"Esta app no está verificada"* → **Configuración avanzada** → **Continuar**.

11. Copia la **URL del Web App** generada (termina en `/exec`).

---

## Sección 3: Conectar el formulario

12. Abre el archivo `zona-pet-landing.html` en tu editor.

13. Busca la línea al inicio del bloque `<script>`:

    ```javascript
    const SCRIPT_URL = "PEGAR_URL_DEL_WEB_APP_AQUI";
    ```

14. Reemplaza `PEGAR_URL_DEL_WEB_APP_AQUI` con la URL copiada en el paso 11.

15. Guarda el archivo.

---

## Sección 4: Probar antes de subir a IONOS

16. Prueba el Web App desde terminal (reemplaza `URL_DEL_WEB_APP`):

    ```bash
    curl -L -X POST "URL_DEL_WEB_APP" \
      -H "Content-Type: application/json" \
      -d '{"nombre":"Test","tipo_interes":"Prueba","telefono":"5500000000","email":"test@test.com","zona":"CDMX","mensaje":"test"}'
    ```

    **Respuesta esperada:**

    ```json
    {"success":true}
    ```

17. Abre la Google Sheet y verifica que apareció una fila nueva con los datos de prueba.

---

## Sección 5: Subir a IONOS

18. Conecta a IONOS por **SFTP** (FileZilla, Cyberduck u otro cliente). Los datos de acceso están en el panel de IONOS → **Hosting → SFTP y SSH**; el puerto es **22**.

19. Sube **el contenido** de la carpeta `dist/` (no la carpeta `dist` en sí) a la carpeta de destino:
    - `index.html`, las imágenes `.png`
    - la carpeta `data/postal-codes/` completa (96 archivos `.json`) — sin ella el código postal no autocompleta.

    ⚠️ zonapet.mx es un WordPress. No subas `index.html` a la raíz del WordPress: reemplazaría la página de inicio. Usa una subcarpeta o un subdominio propio para la landing.

20. Abre la página web en el navegador y envía el formulario con datos reales.

21. Verifica la nueva fila en la Google Sheet.

---

## Sección 6: Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| El script no encuentra la pestaña | Verifica que el nombre sea exactamente `Registro_ZonaPet`. |
| Error de CORS en el navegador | Haz una **nueva implementación** del Apps Script (no edites la existente). |
| Los cambios del script no aplican | Siempre **Implementar → Nueva implementación**; no reutilices la URL anterior si creaste una versión nueva sin actualizar. |
| Google muestra "app no verificada" | Es normal para proyectos propios. Usa **Configuración avanzada → Continuar**. |
| `{"success":false,"error":"Campos requeridos incompletos"}` | Faltan campos obligatorios: nombre, tipo de interés, teléfono, email o zona. |
| El formulario muestra error pero curl funciona | Confirma que pegaste la URL `/exec` correcta en `SCRIPT_URL` dentro del HTML. |
| No llegan filas a la Sheet | Revisa que la cuenta que autorizó el script tenga permiso de **Editor** sobre la Sheet. |

---

## Arquitectura

```
[Formulario HTML en IONOS]
        │  fetch() POST JSON
        ▼
[Google Apps Script Web App]  ← Code.gs
        │
        ▼
[Google Sheet privada — Registro_ZonaPet]
```

## Campos del formulario

| Campo JSON | Input HTML | Requerido |
|------------|------------|-----------|
| `nombre` | Tu nombre completo | Sí |
| `tipo_interes` | Seleccionar tipo de interés | Sí |
| `telefono` | Teléfono / WhatsApp | Sí |
| `email` | Correo electrónico | Sí |
| `zona` | Código postal + Colonia (autocompletado desde `data/postal-codes/`). Se envía como `"01030, Florida, Álvaro Obregón, CDMX"` | Sí |
| `mensaje` | ¿Qué estás buscando? | No |
