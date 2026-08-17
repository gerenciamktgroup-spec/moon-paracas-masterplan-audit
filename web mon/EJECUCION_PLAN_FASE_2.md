# Ejecución del plan de mejora — Fase 2

Fecha: 15 de julio de 2026  
Estado: implementado y verificado en local. No desplegado a producción.

## Resultado

Esta fase convierte las recomendaciones de la auditoría en capacidades concretas de adquisición, evaluación y seguimiento. Se priorizó todo lo que puede implementarse sin inventar identidad legal, documentos, credenciales productivas o condiciones comerciales.

## 1. Medición y atribución

- Web Analytics y Speed Insights integrados bajo consentimiento explícito.
- La opción `Solo esencial` impide cargar los módulos de medición.
- La URL se limpia antes de enviarse: no salen parámetros UTM, favoritos ni fragmentos.
- El visitante puede revocar su elección desde el pie de página.
- Atribución de primera visita almacenada localmente: fuente, medio, campaña, contenido, término, página de llegada y dominio de referencia.
- Los formularios, DNI, correo y teléfono nunca se incluyen en eventos analíticos.

### Eventos implementados

| Evento | Propósito |
|---|---|
| `select_intent` | Identificar motivación de entrada |
| `select_typology` | Medir interés por tipología |
| `compare_typologies` | Medir uso del comparador |
| `view_documents` | Medir intención de debida diligencia |
| `view_lot` | Medir evaluación de inventario |
| `shortlist_add` / `shortlist_remove` | Medir selección de alternativas |
| `shortlist_share` | Medir intención compartida |
| `start_reservation` | Inicio del flujo de separación |
| `submit_lead` / `lead_submitted` | Intento y confirmación de contacto |
| `payment_result` | Resultado general del flujo de pago, sin datos financieros |

## 2. Preparación comercial y CRM

- El lead ahora registra intención: disponibilidad, documentos, visita o separación.
- También registra ventana preferida de contacto.
- Cada lead nuevo parte en etapa `new` con objetivo de atención de 15 minutos.
- Deduplicación por correo, teléfono y hora.
- Conector CRM opcional mediante `CRM_WEBHOOK_URL`.
- Cada payload CRM se firma con HMAC-SHA256 en `X-Moon-Signature`.
- Timeout de cinco segundos y estado de entrega guardado como `delivered`, `failed` o `not_configured`.
- Un fallo del CRM no pierde el lead ya registrado.

Variables pendientes:

```text
CRM_WEBHOOK_URL=
CRM_WEBHOOK_SECRET=
```

## 3. Observabilidad

Las APIs de leads, pagos y webhook generan logs JSON estructurados con:

- ruta y método;
- ID de solicitud;
- estado HTTP;
- duración;
- mensaje de error sin datos personales.

Esto permite filtrar fallos y latencia desde Vercel Runtime Logs. Para producción falta activar Web Analytics y Speed Insights en el panel de Vercel y decidir si se configura un drain externo.

## 4. Centro documental

Nueva ruta `/documentos` con tres estados explícitos:

- `Guía publicada`: existe una matriz web de revisión, no un documento oficial.
- `Solicitar vigencia`: debe pedirse un documento actual al emisor correspondiente.
- `Pendiente de publicar`: el portal no ofrece evidencia suficiente.

La página evita convertir renders, capturas o textos comerciales en evidencia contractual.

## 5. Comparador de tipologías

El visitante puede comparar hasta tres tipologías mediante:

- perfil de uso;
- relación con el conjunto;
- foco de diseño;
- aspecto que debe verificar antes de decidir.

No se presentan precios rígidos en el comparador porque el área y la lista comercial deben confirmarse por lote.

## 6. Favoritos compartibles

- Hasta cinco lotes guardados localmente.
- No requiere cuenta ni envía datos personales.
- El enlace utiliza `?favoritos=LOTE-1,LOTE-2`.
- Compatible con compartir nativo o copiar al portapapeles.
- Al abrir el enlace se reconstruye la selección.

## 7. Limpieza de confianza

Se retiraron del simulador:

- elevaciones aleatorias presentadas como topografía;
- la afirmación `Inmune a Maremotos`;
- rendimiento solar generado por fórmula ficticia;
- cargo mensual de pasarela del 5% no respaldado;
- afirmaciones absolutas de acceso oficial.

La experiencia de antecedentes fue reescrita para distinguir declaraciones del promotor y evidencia comprobable. También se eliminaron once componentes heredados sin uso que conservaban promesas no demostradas.

## 8. Verificación

- TypeScript: aprobado.
- Build de producción: aprobado.
- Diez rutas: HTTP 200, un H1 y sin overflow horizontal.
- Consola: cero errores.
- Errores de página: cero.
- Solicitudes fallidas: cero.
- LCP local indicativo: 936 ms escritorio y 1,260 ms móvil.
- Video de portada: no solicitado en móvil.
- Comparador: visible.
- Favoritos: persistencia, URL y acción de compartir verificadas.
- Frases técnicas no respaldadas: ausentes del simulador.
- Orígenes maliciosos: leads y pagos responden 403.
- Webhook sin secreto: responde 503 y no procesa.
- Logs estructurados: comprobados en las tres APIs.

## 9. Acciones externas todavía necesarias

1. Completar identidad legal, revisar privacidad y aprobar contratos.
2. Rotar cualquier secreto que haya usado prefijo `VITE_`.
3. Configurar Firebase Admin, desplegar reglas y poblar inventario desde una fuente aprobada.
4. Configurar y probar Mercado Pago en sandbox y producción.
5. Elegir CRM, proporcionar endpoint/secreto y validar el mapeo de etapas.
6. Activar Analytics y Speed Insights en Vercel.
7. Conciliar áreas, precios, tipologías y estacionamientos con el plano maestro.
8. Publicar únicamente documentos aprobados, versionados y con responsable.

