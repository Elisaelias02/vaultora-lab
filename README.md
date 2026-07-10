# Vaultora Lab — Race Conditions

Lab vulnerable diseñado para demostrar ataques de Race Condition usando el Single-Packet Attack.

## Vulnerabilidades

### Escenario 1 — Limit Overrun
**Endpoint:** `POST /api/credits/redeem`

El endpoint de canje de créditos de prueba no implementa operaciones atómicas. Un atacante puede enviar múltiples requests simultáneos antes de que el servidor actualice el estado, obteniendo créditos ilimitados.

**Impacto:** Obtención de recursos gratuitos de forma ilimitada.

### Escenario 2 — Authentication Bypass
**Endpoint:** `POST /api/auth/verify`

El endpoint de verificación de token de un solo uso tiene una race window entre el check y el update. Un atacante puede reutilizar el mismo token múltiples veces simultáneamente, generando múltiples sesiones válidas.

**Impacto:** Bypass completo de autenticación de dos factores.

## Referencias
- OWASP: Race Conditions
- PortSwigger Research: Smashing the State Machine
- MITRE: CWE-362 Concurrent Execution using Shared Resource with Improper Synchronization

## Setup

```bash
git clone https://github.com/Elisaelias02/vaultora-lab
cd vaultora-lab
npm install
node server.js
```

## Credenciales de prueba

| Campo | Valor |
|-------|-------|
| Email | victim@vaultora.io |
| Password | Password123! |

## Endpoints

| Método | Endpoint | Descripción | Vulnerable |
|--------|----------|-------------|------------|
| POST | /api/auth/login | Login | No |
| POST | /api/auth/verify | Verificar token | Si |
| GET | /api/credits/balance | Ver créditos | No |
| POST | /api/credits/redeem | Canjear trial | Si |

## Herramientas

- Burp Suite Pro
- Turbo Intruder (BApp Store)
- curl

## Mitigaciones

- Operaciones atómicas en base de datos
- Transacciones con locks exclusivos
- Idempotency keys en APIs

## Disclaimer

Este lab es exclusivamente para fines educativos.
Solo úsalo en entornos controlados con autorización explícita.
No atacar sistemas sin permiso explícito del propietario.

## Autor

**Elisa Elias — Cinn4mor0ll**
- Instagram: @Elisa_elias__
- YouTube: Elisa Elias
- GitHub: github.com/Elisaelias02
