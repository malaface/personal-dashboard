# Reset de Base de Datos y Configuración de Email

**Fecha:** 2025-12-14
**Acción:** Limpieza completa de base de datos + Configuración de Resend

---

## ✅ Cambios Realizados

### 1. Base de Datos Limpiada Completamente

Se eliminaron TODOS los datos de todas las tablas:

```sql
✅ Usuarios eliminados: 4
✅ Audit logs eliminados: 3
✅ Verification tokens eliminados: 1
✅ Todas las demás tablas vaciadas
```

**Estado actual:** Base de datos completamente vacía y lista para nuevos registros.

---

### 2. Configuración de Resend Corregida

**Problema identificado:**
```
RESEND_FROM_EMAIL="freebadface@gmail.com"  ❌ Email no verificado en Resend
```

**Solución aplicada:**
```
RESEND_FROM_EMAIL="onboarding@resend.dev"  ✅ Email por defecto de Resend
```

**Ubicación:** `code/.env.local` línea 20

**Nota:** El email `onboarding@resend.dev` es el dominio por defecto de Resend que funciona sin necesidad de verificación de dominio. Es perfecto para desarrollo y testing.

---

### 3. Servidor Reiniciado

- ✅ Servidor de Next.js reiniciado con nuevas variables de entorno
- ✅ Configuración de Resend cargada correctamente
- ✅ API Key: `re_2hbAs7Hg_***` (verificada)
- ✅ From Email: `onboarding@resend.dev`

---

## 🧪 Instrucciones para Probar

### Paso 1: Registrar Nuevo Usuario

1. **Ir a:** http://localhost:3000/register

2. **Llenar el formulario:**
   - Name: Tu nombre
   - Email: TU EMAIL REAL (necesitas recibir el correo)
   - Password: Mínimo 8 caracteres

3. **Click en "Register"**

---

### Paso 2: Verificar Email

Deberías recibir un email de **`onboarding@resend.dev`** con:

**Asunto:** "Verify your email address - Personal Dashboard"

**Contenido:**
- Botón azul "Verify Email Address"
- Link de verificación alternativo
- Mensaje de expiración (24 horas)

**Click en el botón** o copia el link al navegador.

---

### Paso 3: Login

Después de verificar el email:

1. Serás redirigido a: http://localhost:3000/login
2. Verás mensaje verde: "✅ Email verified successfully! You can now login."
3. Ingresa tus credenciales (email + password)
4. Click en "Sign In"
5. Serás redirigido al dashboard: http://localhost:3000/dashboard

---

## 📧 ¿Qué Esperar del Email?

### Email de Verificación (Resend)

```
De: Personal Dashboard <onboarding@resend.dev>
Para: tu-email@ejemplo.com
Asunto: Verify your email address - Personal Dashboard

┌─────────────────────────────────────────┐
│  🔐 Verify Your Email Address           │
├─────────────────────────────────────────┤
│                                          │
│  Welcome to Personal Dashboard!         │
│                                          │
│  Thank you for registering. Please      │
│  verify your email address by clicking  │
│  the button below:                      │
│                                          │
│     [ Verify Email Address ]            │
│                                          │
│  Or copy this link:                     │
│  http://localhost:3000/verify-email?... │
│                                          │
│  This link will expire in 24 hours      │
│                                          │
│  Security Note: If you didn't create    │
│  an account, you can safely ignore      │
│  this email.                            │
└─────────────────────────────────────────┘
```

---

## 🔍 Verificación de Logs

Para ver los logs del servidor en tiempo real:

```bash
tail -f /tmp/nextjs-dev.log
```

**Logs esperados al registrar usuario:**

```
✅ User registered: tu-email@ejemplo.com
✅ Verification email sent to: tu-email@ejemplo.com
[AUDIT:xxxxxxxx] REGISTER { ipAddress: '::1...', metadata: { email: '...', emailSent: true } }
```

**Logs esperados al verificar email:**

```
✅ Email verified successfully: tu-email@ejemplo.com
[AUDIT:xxxxxxxx] EMAIL_VERIFIED { success: true, email: '...' }
```

**Logs esperados al hacer login:**

```
✅ User logged in: tu-email@ejemplo.com
[AUDIT:xxxxxxxx] LOGIN { email: '...' }
```

---

## ⚠️ Solución de Problemas

### Problema: No recibo el email

**Soluciones:**

1. **Verificar carpeta de Spam/Junk**
   - Los emails de `onboarding@resend.dev` a veces van a spam

2. **Verificar que usaste un email REAL**
   - No usar emails temporales o falsos
   - Usar Gmail, Outlook, etc.

3. **Verificar logs del servidor**
   ```bash
   tail -f /tmp/nextjs-dev.log | grep -i email
   ```
   - Debe mostrar: "✅ Verification email sent to: ..."

4. **Verificar API Key de Resend**
   - API Key debe estar activa en https://resend.com/api-keys
   - No debe estar expirada o revocada

---

### Problema: Error al registrar

**Verificar en logs:**
```bash
tail -f /tmp/nextjs-dev.log | grep -i error
```

**Errores comunes:**

1. **"User already exists"**
   - Email ya registrado
   - Solución: Usar otro email o eliminar usuario existente

2. **"Password must be at least 8 characters"**
   - Contraseña muy corta
   - Solución: Usar mínimo 8 caracteres

3. **Error de Resend API**
   - API Key incorrecta o expirada
   - Solución: Verificar API Key en Resend dashboard

---

### Problema: "Please verify your email before logging in"

**Esto es CORRECTO - es la nueva seguridad implementada**

**Solución:**
1. Verificar que recibiste el email
2. Click en el link de verificación
3. Esperar mensaje verde de confirmación
4. Intentar login nuevamente

---

## 📊 Estado de la Base de Datos

### Tablas Principales

```sql
-- Ver usuarios registrados
SELECT email, "emailVerified", role, "createdAt"
FROM users
ORDER BY "createdAt" DESC;

-- Ver tokens de verificación pendientes
SELECT identifier, expires
FROM verification_tokens
ORDER BY expires DESC;

-- Ver audit logs
SELECT action, "userId", metadata, "createdAt"
FROM audit_logs
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 🎯 Criterios de Éxito

**El sistema funciona correctamente cuando:**

✅ Usuario puede registrarse sin errores
✅ Email de verificación llega (verificar spam)
✅ Link de verificación funciona
✅ Mensaje verde aparece en login
✅ Login funciona después de verificar
✅ Dashboard es accesible
✅ Audit logs registran todos los eventos

---

## 📝 Notas Importantes

1. **Email de Desarrollo:** `onboarding@resend.dev` es solo para testing
   - Para producción, debes verificar tu propio dominio en Resend
   - Gratis hasta 3000 emails/mes

2. **Tokens de Verificación:**
   - Expiran en 24 horas
   - Se eliminan automáticamente después de uso
   - Están hasheados en la base de datos (seguridad)

3. **Audit Logs:**
   - Todos los eventos se registran
   - Accesible en: http://localhost:3000/dashboard/admin/audit-logs
   - Solo usuarios con role='ADMIN' pueden acceder

4. **Primera Cuenta:**
   - El primer usuario que registres NO será admin
   - Para hacer un usuario admin:
     ```sql
     UPDATE users SET role='ADMIN' WHERE email='tu-email@ejemplo.com';
     ```

---

## 🚀 Listo para Probar

**Estado:** ✅ Todo configurado y listo

**URLs para probar:**
- Registro: http://localhost:3000/register
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

**Servidor:** ✅ Corriendo en http://localhost:3000

**Base de Datos:** ✅ Limpia y lista

**Email Service:** ✅ Configurado con Resend

---

**¡Puedes empezar a probar el registro ahora!**
