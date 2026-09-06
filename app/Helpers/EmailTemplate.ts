import Configuracion from 'App/Models/Configuracion'

interface EmailTemplateOptions {
  title: string
  bodyHtml: string
  preheader?: string
}

/** Envuelve el contenido de un correo con la identidad del hotel (logo, nombre, datos de
 * contacto tomados de `Configuracion`) y el pie de marca de HotelApp/ZenLorLabs, para que
 * todos los correos salientes de la app compartan el mismo diseño. */
export async function renderEmailTemplate({ title, bodyHtml, preheader }: EmailTemplateOptions): Promise<string> {
  const configuracion = await Configuracion.actual()
  const nombreHotel = configuracion.nombreHotel || 'HotelApp'
  const backendUrl = (process.env.BACKEND_URL || '').replace(/\/$/, '')
  const logoUrl = configuracion.logoPath && backendUrl ? `${backendUrl}/uploads/${configuracion.logoPath}` : null

  const datosContacto = [configuracion.direccion, configuracion.telefono, configuracion.correo]
    .filter(Boolean)
    .join(' &nbsp;&bull;&nbsp; ')

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f2f3f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f3f5; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="background-color:#111827; padding:24px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    ${logoUrl ? `
                    <td width="44" valign="middle" style="padding-right:12px;">
                      <img src="${logoUrl}" alt="${nombreHotel}" width="40" height="40" style="display:block; border-radius:8px; object-fit:cover;" />
                    </td>` : ''}
                    <td valign="middle">
                      <span style="color:#ffffff; font-size:18px; font-weight:600; letter-spacing:0.2px;">${nombreHotel}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px; color:#1f2328; font-size:14.5px; line-height:1.65;">
                ${bodyHtml}
              </td>
            </tr>
            ${datosContacto ? `
            <tr>
              <td style="padding:0 28px 24px 28px;">
                <hr style="border:none; border-top:1px solid #edeef0; margin:0 0 16px 0;" />
                <p style="margin:0; font-size:12.5px; color:#8a8f98;">${datosContacto}</p>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:16px 28px; background-color:#fafafa; border-top:1px solid #edeef0;">
                <p style="margin:0; font-size:11.5px; color:#a3a8b0; text-align:center;">
                  Enviado por <strong style="color:#8a8f98;">HotelApp</strong> &mdash; una aplicación de <strong style="color:#8a8f98;">ZenLorLabs</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}
