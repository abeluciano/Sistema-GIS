# Fase 20 - Comparaciones temporales y exportacion

## Objetivo

Permitir que el gestor contraste dos intervalos independientes y exporte el
resultado para analisis o inclusion en informes.

## Implementacion

- `GET /indicadores/comparacion-periodos`.
- `GET /export/comparacion-periodos.csv`.
- Seleccion de cuatro fechas: inicio y fin de los periodos A y B.
- Desglose por zona, categoria o estado.
- Aplicacion de filtros por categoria, zona, estado y urgencia.
- Totales A/B, diferencia absoluta y variacion porcentual.
- Manejo explicito de periodo base igual a cero.
- Interpretacion descriptiva sin inferencia causal.
- Grafico de barras comparativo en el dashboard.
- Exportacion CSV autenticada.

## Verificacion

Comparacion ejecutada sobre los datos actuales:

| Metrica | Resultado |
|---|---:|
| Periodo A, abril-mayo de 2026 | 13 reportes |
| Periodo B, junio-julio de 2026 | 1 reporte |
| Diferencia | -12 |
| Grupos territoriales devueltos | 6 |
| Lineas del CSV, incluida cabecera | 7 |

Pruebas:

- Backend Jest: 17/17.
- Dashboard Vitest: 12/12.
- Build del dashboard: correcto.
- Fechas invertidas: rechazadas antes de consultar la base.
- Variacion con base cero: devuelta como valor no calculable.

## Interpretacion

La comparacion informa cambios observados en el volumen de reportes. No atribuye
el cambio a intervenciones, decisiones municipales ni otros factores causales.
