# Personal Dashboard - Especificaciones para Desarrollo Android

**Versión:** 1.0
**Fecha:** 2026-01-20
**Proyecto Base:** Personal Dashboard (Next.js 15 + PostgreSQL)
**Objetivo:** Desarrollar una aplicación Android nativa que replique todas las funcionalidades del dashboard web

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Equipo de Desarrollo Requerido](#2-equipo-de-desarrollo-requerido)
3. [Stack Tecnológico Recomendado](#3-stack-tecnológico-recomendado)
4. [Arquitectura de la Aplicación](#4-arquitectura-de-la-aplicación)
5. [Módulos y Funcionalidades](#5-módulos-y-funcionalidades)
6. [Modelos de Datos](#6-modelos-de-datos)
7. [Integración con API Backend](#7-integración-con-api-backend)
8. [Autenticación y Seguridad](#8-autenticación-y-seguridad)
9. [Integración con IA](#9-integración-con-ia)
10. [UI/UX Guidelines](#10-uiux-guidelines)
11. [Offline Support y Sincronización](#11-offline-support-y-sincronización)
12. [Testing Strategy](#12-testing-strategy)
13. [Cronograma Sugerido](#13-cronograma-sugerido)
14. [Anexos Técnicos](#14-anexos-técnicos)

---

## 1. Resumen Ejecutivo

### 1.1 Descripción del Proyecto

Personal Dashboard es un sistema de gestión personal multi-módulo que permite a los usuarios:

- **Gym Training:** Registro de entrenamientos, ejercicios, progreso y templates
- **Finance:** Control de transacciones, inversiones y presupuestos
- **Nutrition:** Seguimiento de comidas, macronutrientes y metas nutricionales
- **Family CRM:** Gestión de relaciones familiares, eventos y recordatorios
- **AI Integration:** Análisis inteligente con múltiples proveedores de IA

### 1.2 Backend Existente

La aplicación Android consumirá el backend existente:

| Servicio | URL Producción | Descripción |
|----------|----------------|-------------|
| API Principal | `https://dashboard.malacaran8n.uk` | Next.js 15 App Router |
| Base de Datos | PostgreSQL 15 (vía API) | 23 tablas relacionales |
| Cache | Redis 7.2.3 | Rate limiting y sesiones |
| AI Workflows | n8n + Flowise | Orquestación de IA |
| Vector DB | Qdrant 1.7.4 | Búsqueda semántica |

### 1.3 Alcance del Desarrollo Android

- Aplicación nativa Android (Kotlin)
- Compatibilidad: Android 8.0+ (API 26+)
- Soporte offline con sincronización
- Material Design 3
- Dark mode completo
- Internacionalización (Español/Inglés)

---

## 2. Equipo de Desarrollo Requerido

### 2.1 Roles Necesarios

| Rol | Cantidad | Responsabilidades | Justificación |
|-----|----------|-------------------|---------------|
| **Android Lead Developer** | 1 | Arquitectura, decisiones técnicas, code review, integración | Se requiere experiencia sólida en arquitectura Android moderna (MVVM, Clean Architecture) para establecer las bases del proyecto |
| **Android Developer Mid-Senior** | 2 | Desarrollo de features, UI/UX implementation, testing | La aplicación tiene 4 módulos complejos que requieren desarrollo paralelo para cumplir tiempos |
| **Backend/API Integration Specialist** | 1 | Integración con API REST, autenticación JWT, manejo de errores | El backend existente tiene 30+ endpoints con lógica compleja de autenticación y rate limiting |
| **UI/UX Designer (Mobile)** | 1 | Diseño de interfaces, prototipos, design system Android | Se necesita adaptar el diseño web a patrones móviles nativos manteniendo consistencia |
| **QA Engineer (Mobile)** | 1 | Testing manual y automatizado, regression testing | 4 módulos + IA requieren testing exhaustivo de flujos y edge cases |

### 2.2 Justificación Detallada por Rol

#### Android Lead Developer
**Por qué es necesario:**
- Definirá la arquitectura base (Clean Architecture + MVVM)
- Establecerá patrones de código y guías de estilo
- Tomará decisiones críticas sobre librerías y dependencias
- Implementará la capa de datos y repositorios
- Coordinará al equipo técnico
- Realizará code reviews para mantener calidad

**Skills requeridos:**
- 5+ años de experiencia en Android nativo
- Kotlin avanzado (Coroutines, Flow, StateFlow)
- Jetpack Compose
- Clean Architecture, MVVM, Repository Pattern
- Retrofit, Room, Hilt/Koin
- Testing (JUnit, Mockito, Espresso)

#### Android Developers (2)
**Por qué se necesitan 2:**
- Cada uno puede enfocarse en 2 módulos simultáneamente
- Developer 1: Gym Training + Nutrition (datos similares, listas con items)
- Developer 2: Finance + Family CRM (transacciones, CRUD complejo)
- Permite desarrollo paralelo y entrega más rápida

**Skills requeridos:**
- 3+ años de experiencia Android
- Kotlin, Jetpack Compose
- Consumo de APIs REST
- Room Database
- Manejo de estados y navegación

#### Backend/API Integration Specialist
**Por qué es necesario (especialista separado):**
- El backend usa NextAuth.js con JWT - requiere implementación específica
- Rate limiting con Redis necesita manejo de 429 responses
- 30+ endpoints con diferentes formatos de request/response
- Integración con IA tiene timeouts de 30 segundos
- Sincronización offline requiere estrategia de resolución de conflictos
- Auditoría y logging de requests

**Skills requeridos:**
- Experiencia en integración de APIs REST complejas
- Manejo de autenticación JWT
- Retrofit avanzado (interceptors, authenticators)
- Estrategias de retry y backoff exponencial
- Manejo de errores y mapeo a UI

#### UI/UX Designer (Mobile)
**Por qué es necesario:**
- El diseño web actual usa TailwindCSS + shadcn/ui
- Necesita adaptarse a Material Design 3 guidelines
- 4 módulos con interfaces diferentes requieren consistencia
- Formularios complejos (workouts con múltiples ejercicios)
- Gráficas y visualizaciones de analytics
- Dark mode y temas personalizados

**Entregables esperados:**
- Design System en Figma
- Componentes reutilizables
- Prototipos interactivos
- Guía de estilos (colores, tipografía, spacing)
- Iconografía y assets

#### QA Engineer
**Por qué es necesario:**
- 23 tablas de base de datos = múltiples flujos de datos
- Integración con IA tiene edge cases (rate limits, timeouts, credenciales inválidas)
- Sincronización offline puede generar conflictos
- Formularios complejos necesitan validación exhaustiva
- Múltiples dispositivos y versiones Android

**Responsabilidades:**
- Test plans por módulo
- Automated UI testing (Espresso)
- API contract testing
- Performance testing
- Regression testing

### 2.3 Estructura del Equipo

```
┌─────────────────────────────────────────┐
│           Product Owner                  │
│    (Define prioridades y features)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Android Lead Developer            │
│   (Arquitectura + Coordinación técnica)  │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼────┐  ┌────▼─────┐
│Dev 1  │  │ Dev 2   │  │API Spec  │
│Gym +  │  │Finance +│  │Backend   │
│Nutri  │  │Family   │  │Integration│
└───────┘  └─────────┘  └──────────┘

┌─────────┐  ┌─────────┐
│UI/UX   │  │   QA    │
│Designer│  │Engineer │
└─────────┘  └─────────┘
```

---

## 3. Stack Tecnológico Recomendado

### 3.1 Core

| Categoría | Tecnología | Versión | Justificación |
|-----------|------------|---------|---------------|
| **Lenguaje** | Kotlin | 1.9+ | Oficial de Android, null-safety, coroutines |
| **UI Framework** | Jetpack Compose | 1.5+ | UI moderna, declarativa, recomendada por Google |
| **Min SDK** | API 26 | Android 8.0 | Balance entre features modernas y cobertura (95%+) |
| **Target SDK** | API 34 | Android 14 | Últimas optimizaciones y requisitos de Play Store |

### 3.2 Arquitectura

| Componente | Librería | Justificación |
|------------|----------|---------------|
| **Architecture** | Clean Architecture + MVVM | Separación de concerns, testabilidad |
| **DI** | Hilt | Oficial de Android, integración con ViewModels |
| **Navigation** | Navigation Compose | Navegación type-safe, deep links |
| **State** | StateFlow/SharedFlow | Manejo reactivo de estados |

### 3.3 Networking

| Componente | Librería | Justificación |
|------------|----------|---------------|
| **HTTP Client** | Retrofit 2.9+ | Estándar de la industria, type-safe |
| **JSON Parser** | Kotlinx Serialization | Kotlin-first, mejor performance |
| **Image Loading** | Coil | Kotlin-first, Compose integration |

### 3.4 Persistencia Local

| Componente | Librería | Justificación |
|------------|----------|---------------|
| **Database** | Room 2.6+ | ORM oficial, soporte Flow |
| **Preferences** | DataStore | Reemplazo moderno de SharedPreferences |
| **Encryption** | EncryptedSharedPreferences | Para tokens y datos sensibles |

### 3.5 Testing

| Tipo | Librería |
|------|----------|
| **Unit Testing** | JUnit 5, Mockito-Kotlin |
| **UI Testing** | Compose Testing, Espresso |
| **Integration** | Hilt Testing |

### 3.6 Dependencias build.gradle (ejemplo)

```kotlin
// build.gradle.kts (app)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.malacaran.personaldashboard"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.malacaran.personaldashboard"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.01.00")
    implementation(composeBom)

    // Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    ksp("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Charts
    implementation("com.patrykandpatrick.vico:compose-m3:1.13.1")

    // Coil
    implementation("io.coil-kt:coil-compose:2.5.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

---

## 4. Arquitectura de la Aplicación

### 4.1 Clean Architecture + MVVM

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     UI (Compose)                        ││
│  │  Screens, Components, Navigation                        ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                    ViewModels                           ││
│  │  State management, UI logic, Use Cases invocation       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Use Cases                            ││
│  │  Business logic, orchestration                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Domain Models                           ││
│  │  Pure Kotlin data classes                               ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Repository Interfaces                      ││
│  │  Abstractions for data access                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Repository Implementations                 ││
│  │  Data source coordination, caching strategy             ││
│  └────────────────────┬───────────────┬────────────────────┘│
│                       │               │                      │
│  ┌────────────────────▼───┐  ┌────────▼────────────────────┐│
│  │    Remote Data Source  │  │   Local Data Source         ││
│  │    (Retrofit + API)    │  │   (Room Database)           ││
│  └────────────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Estructura de Paquetes

```
com.malacaran.personaldashboard/
├── app/
│   ├── PersonalDashboardApp.kt          # Application class
│   └── di/                              # Hilt modules
│       ├── AppModule.kt
│       ├── NetworkModule.kt
│       ├── DatabaseModule.kt
│       └── RepositoryModule.kt
│
├── core/
│   ├── common/
│   │   ├── Result.kt                    # Sealed class for results
│   │   ├── Resource.kt                  # Loading states
│   │   └── Extensions.kt
│   ├── network/
│   │   ├── ApiService.kt
│   │   ├── AuthInterceptor.kt
│   │   ├── TokenManager.kt
│   │   └── NetworkError.kt
│   └── database/
│       ├── AppDatabase.kt
│       └── Converters.kt
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── remote/
│   │   │   │   ├── AuthApi.kt
│   │   │   │   └── dto/
│   │   │   ├── local/
│   │   │   │   └── AuthPreferences.kt
│   │   │   └── repository/
│   │   │       └── AuthRepositoryImpl.kt
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   └── User.kt
│   │   │   ├── repository/
│   │   │   │   └── AuthRepository.kt
│   │   │   └── usecase/
│   │   │       ├── LoginUseCase.kt
│   │   │       ├── RegisterUseCase.kt
│   │   │       └── LogoutUseCase.kt
│   │   └── presentation/
│   │       ├── login/
│   │       │   ├── LoginScreen.kt
│   │       │   └── LoginViewModel.kt
│   │       └── register/
│   │           ├── RegisterScreen.kt
│   │           └── RegisterViewModel.kt
│   │
│   ├── workouts/                        # Gym Training module
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── finance/                         # Finance module
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── nutrition/                       # Nutrition module
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── family/                          # Family CRM module
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── analytics/                       # Analytics & Charts
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   ├── ai/                              # AI Integration
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   └── settings/                        # Settings & Profile
│       ├── data/
│       ├── domain/
│       └── presentation/
│
├── ui/
│   ├── theme/
│   │   ├── Theme.kt
│   │   ├── Color.kt
│   │   ├── Typography.kt
│   │   └── Shape.kt
│   ├── components/                      # Reusable components
│   │   ├── LoadingIndicator.kt
│   │   ├── ErrorMessage.kt
│   │   ├── SmartCombobox.kt
│   │   ├── CategorySelector.kt
│   │   ├── DatePicker.kt
│   │   └── Charts/
│   └── navigation/
│       ├── NavGraph.kt
│       ├── BottomNavigation.kt
│       └── Routes.kt
│
└── utils/
    ├── DateUtils.kt
    ├── NumberUtils.kt
    └── ValidationUtils.kt
```

### 4.3 Patrón de Flujo de Datos

```
User Action (UI)
      │
      ▼
ViewModel.onEvent(Event)
      │
      ▼
UseCase.invoke(params)
      │
      ▼
Repository.getData()
      │
      ├─────────────────────┐
      ▼                     ▼
RemoteDataSource      LocalDataSource
(API Call)            (Room Query)
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
        Repository returns
        Flow<Resource<T>>
                 │
                 ▼
        ViewModel collects
        and updates State
                 │
                 ▼
        UI recomposes with
        new state
```

---

## 5. Módulos y Funcionalidades

### 5.1 Módulo de Autenticación

#### Funcionalidades
- [x] Registro de usuario (nombre, email, contraseña)
- [x] Login con email y contraseña
- [x] Verificación de email
- [x] Recuperación de contraseña
- [x] Logout
- [x] Persistencia de sesión (30 días)
- [x] Manejo de token JWT

#### Pantallas
1. **SplashScreen** - Verificar sesión existente
2. **LoginScreen** - Formulario de login
3. **RegisterScreen** - Formulario de registro
4. **VerifyEmailScreen** - Instrucciones y input de código
5. **ForgotPasswordScreen** - Recuperación de contraseña

#### Validaciones
```kotlin
// Email validation
val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$".toRegex()

// Password validation
val passwordMinLength = 8
```

---

### 5.2 Módulo Gym Training

#### Funcionalidades
- [x] Listar entrenamientos con paginación
- [x] Crear nuevo entrenamiento
- [x] Editar entrenamiento existente
- [x] Eliminar entrenamiento
- [x] Agregar múltiples ejercicios por entrenamiento
- [x] Seleccionar tipo de ejercicio (desde catálogo)
- [x] Seleccionar grupo muscular (desde catálogo)
- [x] Seleccionar equipamiento (desde catálogo)
- [x] Registrar sets, reps, peso
- [x] Ver historial de progreso
- [x] Templates de entrenamientos (públicos y privados)
- [x] Cargar template como nuevo entrenamiento
- [x] Búsqueda y filtrado

#### Pantallas
1. **WorkoutsListScreen** - Lista de entrenamientos
2. **WorkoutDetailScreen** - Detalle con ejercicios
3. **WorkoutFormScreen** - Crear/Editar entrenamiento
4. **WorkoutTemplatesScreen** - Galería de templates
5. **TemplateDetailScreen** - Ver template
6. **ExerciseHistoryScreen** - Progreso de ejercicio

#### Modelo de Datos (Domain)
```kotlin
data class Workout(
    val id: String,
    val name: String,
    val date: LocalDate,
    val duration: Int?, // minutos
    val notes: String?,
    val exercises: List<Exercise>
)

data class Exercise(
    val id: String,
    val exerciseType: CatalogItem?,
    val muscleGroup: CatalogItem?,
    val equipment: CatalogItem?,
    val sets: Int,
    val reps: Int,
    val weight: Float?,
    val notes: String?
)

data class WorkoutTemplate(
    val id: String,
    val name: String,
    val description: String?,
    val difficulty: Difficulty?,
    val isPublic: Boolean,
    val tags: List<String>,
    val exercises: List<TemplateExercise>
)
```

---

### 5.3 Módulo Finance

#### Funcionalidades
- [x] Listar transacciones con paginación
- [x] Filtrar por tipo (ingreso/gasto) y categoría
- [x] Crear nueva transacción
- [x] Editar transacción existente
- [x] Eliminar transacción
- [x] Categorías jerárquicas (Catálogo)
- [x] Gestión de inversiones (portafolio)
- [x] Gestión de presupuestos mensuales
- [x] Tracking de presupuesto vs gastos reales
- [x] Historial de auditoría de transacciones

#### Pantallas
1. **TransactionsListScreen** - Lista de transacciones
2. **TransactionDetailScreen** - Detalle de transacción
3. **TransactionFormScreen** - Crear/Editar
4. **InvestmentsScreen** - Portafolio de inversiones
5. **InvestmentFormScreen** - Crear/Editar inversión
6. **BudgetsScreen** - Presupuestos mensuales
7. **BudgetFormScreen** - Crear/Editar presupuesto

#### Modelo de Datos (Domain)
```kotlin
data class Transaction(
    val id: String,
    val type: CatalogItem, // Income/Expense
    val category: CatalogItem,
    val amount: Double,
    val description: String?,
    val date: LocalDate
)

data class Investment(
    val id: String,
    val name: String,
    val type: CatalogItem, // Stock, Crypto, Bond, etc.
    val amount: Double,
    val currentValue: Double?,
    val purchaseDate: LocalDate,
    val notes: String?,
    val returnPercentage: Double? // Calculado
)

data class Budget(
    val id: String,
    val category: CatalogItem,
    val limit: Double,
    val spent: Double,
    val month: YearMonth,
    val remainingPercentage: Double // Calculado
)
```

---

### 5.4 Módulo Nutrition

#### Funcionalidades
- [x] Listar comidas por fecha
- [x] Crear nueva comida
- [x] Editar comida existente
- [x] Eliminar comida
- [x] Agregar múltiples alimentos por comida
- [x] Tipo de comida (Desayuno, Almuerzo, Cena, Snack)
- [x] Tracking de macronutrientes (calorías, proteína, carbos, grasas)
- [x] Metas nutricionales diarias
- [x] Templates de comidas
- [x] Totales diarios calculados

#### Pantallas
1. **MealsListScreen** - Comidas del día/rango
2. **MealDetailScreen** - Detalle con alimentos
3. **MealFormScreen** - Crear/Editar comida
4. **NutritionGoalsScreen** - Configurar metas diarias
5. **MealTemplatesScreen** - Galería de templates
6. **DailySummaryScreen** - Resumen nutricional del día

#### Modelo de Datos (Domain)
```kotlin
data class Meal(
    val id: String,
    val name: String,
    val mealType: MealType,
    val date: LocalDate,
    val notes: String?,
    val foodItems: List<FoodItem>,
    val totalCalories: Double, // Calculado
    val totalProtein: Double,
    val totalCarbs: Double,
    val totalFats: Double
)

enum class MealType {
    BREAKFAST, LUNCH, DINNER, SNACK
}

data class FoodItem(
    val id: String,
    val name: String,
    val quantity: Double,
    val unit: String,
    val calories: Double?,
    val protein: Double?,
    val carbs: Double?,
    val fats: Double?
)

data class NutritionGoal(
    val id: String,
    val date: LocalDate,
    val calories: Double,
    val protein: Double,
    val carbs: Double,
    val fats: Double
)
```

---

### 5.5 Módulo Family CRM

#### Funcionalidades
- [x] Listar miembros de familia
- [x] Crear nuevo miembro
- [x] Editar miembro existente
- [x] Eliminar miembro
- [x] Tipo de relación (desde catálogo)
- [x] Registro de tiempo con miembros
- [x] Calendario de eventos
- [x] Sistema de recordatorios
- [x] Notificaciones de cumpleaños

#### Pantallas
1. **FamilyMembersListScreen** - Lista de miembros
2. **FamilyMemberDetailScreen** - Perfil del miembro
3. **FamilyMemberFormScreen** - Crear/Editar
4. **TimeLogsScreen** - Historial de tiempo
5. **TimeLogFormScreen** - Registrar tiempo
6. **EventsCalendarScreen** - Calendario de eventos
7. **EventFormScreen** - Crear/Editar evento
8. **RemindersScreen** - Lista de recordatorios
9. **ReminderFormScreen** - Crear/Editar recordatorio

#### Modelo de Datos (Domain)
```kotlin
data class FamilyMember(
    val id: String,
    val name: String,
    val relationshipType: CatalogItem,
    val birthday: LocalDate?,
    val email: String?,
    val phone: String?,
    val notes: String?,
    val upcomingBirthday: Int? // Días hasta cumpleaños
)

data class TimeLog(
    val id: String,
    val familyMember: FamilyMember?,
    val activityType: CatalogItem?,
    val duration: Int, // minutos
    val date: LocalDate,
    val notes: String?
)

data class Event(
    val id: String,
    val title: String,
    val description: String?,
    val category: CatalogItem?,
    val familyMember: FamilyMember?,
    val date: LocalDateTime,
    val location: String?
)

data class Reminder(
    val id: String,
    val title: String,
    val description: String?,
    val category: CatalogItem?,
    val dueDate: LocalDateTime,
    val priority: Priority,
    val completed: Boolean
)

enum class Priority {
    LOW, MEDIUM, HIGH
}
```

---

### 5.6 Módulo Analytics

#### Funcionalidades
- [x] Volumen de entrenamiento (tendencia 30 días)
- [x] Distribución de grupos musculares
- [x] Uso de equipamiento
- [x] Distribución de gastos por categoría
- [x] Asignación del portafolio
- [x] Tendencia de macronutrientes
- [x] Tiempo con familia por miembro
- [x] Filtros por rango de fechas

#### Pantallas
1. **AnalyticsDashboardScreen** - Overview general
2. **GymAnalyticsScreen** - Métricas de gym
3. **FinanceAnalyticsScreen** - Métricas financieras
4. **NutritionAnalyticsScreen** - Métricas nutricionales
5. **FamilyAnalyticsScreen** - Métricas de familia

#### Endpoints de Analytics
```
GET /api/analytics/gym-volume
GET /api/analytics/gym-muscle-distribution
GET /api/analytics/gym-equipment-usage
GET /api/analytics/finance-category-usage
GET /api/analytics/finance-spending-distribution
GET /api/analytics/portfolio-allocation
GET /api/analytics/nutrition-macros
GET /api/analytics/family-time
```

---

### 5.7 Módulo AI Integration

#### Funcionalidades
- [x] Chat con IA por módulo (gym, finance, nutrition, family)
- [x] Insights y recomendaciones personalizadas
- [x] Múltiples proveedores (Gemini, OpenAI, Claude, HuggingFace)
- [x] Gestión de credenciales de IA
- [x] Validación de API keys
- [x] Rate limiting (30 req/hora, 100 req/día)

#### Pantallas
1. **AIChatScreen** - Interfaz de chat por módulo
2. **AICredentialsScreen** - Gestión de API keys
3. **AddCredentialScreen** - Agregar nueva credencial

#### Modelo de Datos (Domain)
```kotlin
data class AICredential(
    val id: String,
    val provider: AIProvider,
    val maskedApiKey: String,
    val label: String?,
    val isActive: Boolean,
    val isValid: Boolean,
    val usageCount: Int,
    val lastUsedAt: LocalDateTime?
)

enum class AIProvider {
    GEMINI, OPENAI, CLAUDE, HUGGINGFACE
}

data class AIMessage(
    val role: MessageRole,
    val content: String,
    val timestamp: LocalDateTime
)

enum class MessageRole {
    USER, ASSISTANT
}

data class AIResponse(
    val message: String,
    val insights: List<AIInsight>,
    val recommendations: List<String>,
    val metrics: Map<String, Double>
)

data class AIInsight(
    val title: String,
    val description: String,
    val priority: String
)
```

---

### 5.8 Módulo Settings

#### Funcionalidades
- [x] Ver y editar perfil de usuario
- [x] Cambiar contraseña
- [x] Gestionar credenciales de IA
- [x] Crear categorías personalizadas (catálogo)
- [x] Cambiar tema (Light/Dark)
- [x] Cambiar idioma (Español/Inglés)
- [x] Ver información de la sesión
- [x] Logout

#### Pantallas
1. **SettingsScreen** - Lista de opciones
2. **ProfileScreen** - Editar perfil
3. **ChangePasswordScreen** - Cambiar contraseña
4. **AICredentialsScreen** - (compartida con AI module)
5. **CatalogManagerScreen** - Gestionar categorías
6. **AboutScreen** - Info de la app

---

## 6. Modelos de Datos

### 6.1 Sistema de Catálogo (Centralizado)

El sistema usa un catálogo jerárquico para todas las categorías:

```kotlin
data class CatalogItem(
    val id: String,
    val catalogType: CatalogType,
    val name: String,
    val slug: String,
    val description: String?,
    val parentId: String?,
    val level: Int, // 0-3
    val isSystem: Boolean,
    val icon: String?,
    val color: String?,
    val children: List<CatalogItem>? = null,
    val breadcrumbs: List<String>? = null
)

enum class CatalogType {
    // Finance
    TRANSACTION_CATEGORY,
    INVESTMENT_TYPE,
    BUDGET_CATEGORY,

    // Gym
    EXERCISE_CATEGORY,
    EQUIPMENT_TYPE,
    MUSCLE_GROUP,

    // Nutrition
    MEAL_TYPE,
    FOOD_CATEGORY,
    UNIT_TYPE,
    NUTRITION_GOAL_TYPE,

    // Family
    RELATIONSHIP_TYPE,
    EVENT_CATEGORY,
    REMINDER_CATEGORY,
    ACTIVITY_TYPE,
    SOCIAL_CIRCLE
}
```

### 6.2 DTOs para API

```kotlin
// Auth DTOs
@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val user: UserDto,
    val token: String? = null
)

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val name: String?,
    val emailVerified: String?
)

// Workout DTOs
@Serializable
data class WorkoutRequest(
    val name: String,
    val date: String, // ISO format
    val duration: Int?,
    val notes: String?,
    val exercises: List<ExerciseRequest>
)

@Serializable
data class ExerciseRequest(
    val exerciseTypeId: String?,
    val muscleGroupId: String?,
    val equipmentId: String?,
    val sets: Int,
    val reps: Int,
    val weight: Float?,
    val notes: String?
)

// Transaction DTOs
@Serializable
data class TransactionRequest(
    val typeId: String,
    val categoryId: String,
    val amount: Double,
    val description: String?,
    val date: String
)

// Meal DTOs
@Serializable
data class MealRequest(
    val name: String,
    val mealType: String, // BREAKFAST, LUNCH, etc.
    val date: String,
    val notes: String?,
    val foodItems: List<FoodItemRequest>
)

@Serializable
data class FoodItemRequest(
    val name: String,
    val quantity: Double,
    val unit: String,
    val calories: Double?,
    val protein: Double?,
    val carbs: Double?,
    val fats: Double?
)

// AI DTOs
@Serializable
data class AIChatRequest(
    val module: String,
    val period: String,
    val query: String,
    val conversationId: String?
)

@Serializable
data class AIChatResponse(
    val success: Boolean,
    val message: String,
    val insights: List<InsightDto>,
    val recommendations: List<String>,
    val metrics: Map<String, Double>,
    val conversationId: String
)
```

### 6.3 Entidades Room (Local)

```kotlin
@Entity(tableName = "workouts")
data class WorkoutEntity(
    @PrimaryKey val id: String,
    val name: String,
    val date: Long, // epoch millis
    val duration: Int?,
    val notes: String?,
    val userId: String,
    val createdAt: Long,
    val updatedAt: Long,
    val syncStatus: SyncStatus = SyncStatus.SYNCED
)

@Entity(
    tableName = "exercises",
    foreignKeys = [
        ForeignKey(
            entity = WorkoutEntity::class,
            parentColumns = ["id"],
            childColumns = ["workoutId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("workoutId")]
)
data class ExerciseEntity(
    @PrimaryKey val id: String,
    val workoutId: String,
    val exerciseTypeId: String?,
    val muscleGroupId: String?,
    val equipmentId: String?,
    val sets: Int,
    val reps: Int,
    val weight: Float?,
    val notes: String?
)

enum class SyncStatus {
    SYNCED,
    PENDING_CREATE,
    PENDING_UPDATE,
    PENDING_DELETE
}

// Similar entities for Transaction, Meal, FamilyMember, etc.
```

---

## 7. Integración con API Backend

### 7.1 Configuración de Retrofit

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS) // 60s para AI requests
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(
                Json.asConverterFactory("application/json".toMediaType())
            )
            .build()
    }
}
```

### 7.2 Auth Interceptor

```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Skip auth for login/register endpoints
        if (originalRequest.url.encodedPath.contains("/auth/")) {
            return chain.proceed(originalRequest)
        }

        val token = tokenManager.getAccessToken()

        val newRequest = if (token != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(newRequest)

        // Handle 401 - Token expired
        if (response.code == 401) {
            tokenManager.clearToken()
            // Trigger re-login flow
        }

        // Handle 429 - Rate limit
        if (response.code == 429) {
            val retryAfter = response.header("Retry-After")?.toLongOrNull() ?: 60
            // Implement retry logic or notify user
        }

        return response
    }
}
```

### 7.3 Token Manager

```kotlin
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        encryptedPrefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getAccessToken(): String? {
        return encryptedPrefs.getString(KEY_TOKEN, null)
    }

    fun clearToken() {
        encryptedPrefs.edit().remove(KEY_TOKEN).apply()
    }

    fun isLoggedIn(): Boolean = getAccessToken() != null

    companion object {
        private const val KEY_TOKEN = "jwt_token"
    }
}
```

### 7.4 API Interfaces

```kotlin
interface AuthApi {
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/callback/credentials")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/verify-email")
    suspend fun verifyEmail(@Body request: VerifyEmailRequest): Response<Unit>

    @POST("api/auth/signout")
    suspend fun logout(): Response<Unit>
}

interface WorkoutsApi {
    @GET("api/workouts")
    suspend fun getWorkouts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<WorkoutDto>>

    @GET("api/workouts/{id}")
    suspend fun getWorkout(@Path("id") id: String): Response<WorkoutDto>

    @POST("api/workouts")
    suspend fun createWorkout(@Body workout: WorkoutRequest): Response<WorkoutDto>

    @PUT("api/workouts/{id}")
    suspend fun updateWorkout(
        @Path("id") id: String,
        @Body workout: WorkoutRequest
    ): Response<WorkoutDto>

    @DELETE("api/workouts/{id}")
    suspend fun deleteWorkout(@Path("id") id: String): Response<Unit>
}

interface AnalyticsApi {
    @GET("api/analytics/gym-volume")
    suspend fun getGymVolume(
        @Query("startDate") startDate: String?,
        @Query("endDate") endDate: String?
    ): Response<GymVolumeResponse>

    @GET("api/analytics/nutrition-macros")
    suspend fun getNutritionMacros(
        @Query("startDate") startDate: String?,
        @Query("endDate") endDate: String?
    ): Response<NutritionMacrosResponse>

    // ... other analytics endpoints
}

interface AIApi {
    @POST("api/ai/chat")
    suspend fun chat(@Body request: AIChatRequest): Response<AIChatResponse>

    @GET("api/ai/credentials")
    suspend fun getCredentials(): Response<AICredentialsResponse>

    @POST("api/ai/credentials")
    suspend fun addCredential(@Body request: AddCredentialRequest): Response<AICredentialDto>

    @DELETE("api/ai/credentials/{id}")
    suspend fun deleteCredential(@Path("id") id: String): Response<Unit>
}
```

### 7.5 Manejo de Errores

```kotlin
sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(
        val code: Int,
        val message: String,
        val retryAfter: Long? = null
    ) : NetworkResult<Nothing>()
    data object Loading : NetworkResult<Nothing>()
}

suspend fun <T> safeApiCall(
    apiCall: suspend () -> Response<T>
): NetworkResult<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful) {
            NetworkResult.Success(response.body()!!)
        } else {
            val retryAfter = response.headers()["Retry-After"]?.toLongOrNull()
            NetworkResult.Error(
                code = response.code(),
                message = parseErrorMessage(response.errorBody()),
                retryAfter = retryAfter
            )
        }
    } catch (e: IOException) {
        NetworkResult.Error(code = -1, message = "Sin conexión a internet")
    } catch (e: Exception) {
        NetworkResult.Error(code = -1, message = e.message ?: "Error desconocido")
    }
}
```

---

## 8. Autenticación y Seguridad

### 8.1 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                     SPLASH SCREEN                            │
│                          │                                   │
│              Check TokenManager.isLoggedIn()                 │
│                          │                                   │
│              ┌───────────┴───────────┐                       │
│              │                       │                       │
│              ▼                       ▼                       │
│        Token Exists            No Token                      │
│              │                       │                       │
│              ▼                       ▼                       │
│     Validate with API          LOGIN SCREEN                  │
│              │                       │                       │
│      ┌───────┴───────┐              │                       │
│      │               │              │                       │
│      ▼               ▼              ▼                       │
│   Valid          Invalid       Enter credentials             │
│      │               │              │                       │
│      ▼               ▼              ▼                       │
│   DASHBOARD      Clear token    POST /api/auth/callback      │
│                  → LOGIN             │                       │
│                                      ▼                       │
│                               Save JWT token                 │
│                                      │                       │
│                                      ▼                       │
│                                 DASHBOARD                    │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Almacenamiento Seguro

```kotlin
// Usar EncryptedSharedPreferences para:
// - JWT Token
// - Refresh Token (si se implementa)
// - User ID

// Usar DataStore para:
// - Preferencias de usuario (tema, idioma)
// - Cache de configuración no sensible

// Usar Room con SQLCipher para:
// - Datos offline (opcional, si se requiere máxima seguridad)
```

### 8.3 Validaciones de Entrada

```kotlin
object ValidationUtils {

    fun validateEmail(email: String): ValidationResult {
        return when {
            email.isBlank() -> ValidationResult.Error("Email requerido")
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() ->
                ValidationResult.Error("Email inválido")
            else -> ValidationResult.Success
        }
    }

    fun validatePassword(password: String): ValidationResult {
        return when {
            password.isBlank() -> ValidationResult.Error("Contraseña requerida")
            password.length < 8 ->
                ValidationResult.Error("Mínimo 8 caracteres")
            else -> ValidationResult.Success
        }
    }

    fun validateAmount(amount: String): ValidationResult {
        val value = amount.toDoubleOrNull()
        return when {
            value == null -> ValidationResult.Error("Monto inválido")
            value <= 0 -> ValidationResult.Error("Debe ser mayor a 0")
            else -> ValidationResult.Success
        }
    }
}

sealed class ValidationResult {
    data object Success : ValidationResult()
    data class Error(val message: String) : ValidationResult()
}
```

---

## 9. Integración con IA

### 9.1 Manejo de Rate Limiting

```kotlin
class AIRateLimitManager @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private val requestsThisHour = mutableStateOf(0)
    private val requestsToday = mutableStateOf(0)

    companion object {
        const val HOURLY_LIMIT = 30
        const val DAILY_LIMIT = 100
    }

    suspend fun canMakeRequest(): Boolean {
        val hourlyCount = getHourlyCount()
        val dailyCount = getDailyCount()

        return hourlyCount < HOURLY_LIMIT && dailyCount < DAILY_LIMIT
    }

    suspend fun recordRequest() {
        incrementHourlyCount()
        incrementDailyCount()
    }

    fun getRemainingHourly(): Int = HOURLY_LIMIT - requestsThisHour.value
    fun getRemainingDaily(): Int = DAILY_LIMIT - requestsToday.value
}
```

### 9.2 AI Chat Repository

```kotlin
class AIRepositoryImpl @Inject constructor(
    private val api: AIApi,
    private val rateLimitManager: AIRateLimitManager
) : AIRepository {

    override fun sendMessage(
        module: String,
        query: String,
        conversationId: String?
    ): Flow<NetworkResult<AIResponse>> = flow {
        emit(NetworkResult.Loading)

        // Check rate limit
        if (!rateLimitManager.canMakeRequest()) {
            emit(NetworkResult.Error(
                code = 429,
                message = "Límite de requests alcanzado",
                retryAfter = calculateRetryTime()
            ))
            return@flow
        }

        val result = safeApiCall {
            api.chat(AIChatRequest(
                module = module,
                period = "30days",
                query = query,
                conversationId = conversationId
            ))
        }

        if (result is NetworkResult.Success) {
            rateLimitManager.recordRequest()
        }

        emit(result.map { it.toDomain() })
    }
}
```

### 9.3 UI de Chat

```kotlin
@Composable
fun AIChatScreen(
    module: String,
    viewModel: AIChatViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Chat messages list
        LazyColumn(
            modifier = Modifier.weight(1f),
            reverseLayout = true
        ) {
            items(state.messages) { message ->
                ChatBubble(
                    message = message,
                    isUser = message.role == MessageRole.USER
                )
            }

            if (state.isLoading) {
                item {
                    TypingIndicator()
                }
            }
        }

        // Rate limit warning
        if (state.remainingRequests < 5) {
            RateLimitWarning(remaining = state.remainingRequests)
        }

        // Input field
        ChatInput(
            value = state.inputText,
            onValueChange = viewModel::onInputChange,
            onSend = viewModel::sendMessage,
            enabled = !state.isLoading && state.remainingRequests > 0
        )
    }
}
```

---

## 10. UI/UX Guidelines

### 10.1 Design System

#### Colores (Material 3)

```kotlin
// Light Theme
val md_theme_light_primary = Color(0xFF0066CC)        // Azul principal
val md_theme_light_secondary = Color(0xFF10B981)      // Verde (Gym)
val md_theme_light_tertiary = Color(0xFFF59E0B)       // Naranja (Finance)
val md_theme_light_error = Color(0xFFEF4444)
val md_theme_light_background = Color(0xFFFAFAFA)
val md_theme_light_surface = Color(0xFFFFFFFF)

// Dark Theme
val md_theme_dark_primary = Color(0xFF3B82F6)
val md_theme_dark_secondary = Color(0xFF34D399)
val md_theme_dark_tertiary = Color(0xFFFBBF24)
val md_theme_dark_error = Color(0xFFF87171)
val md_theme_dark_background = Color(0xFF121212)
val md_theme_dark_surface = Color(0xFF1E1E1E)

// Module Colors
val GymColor = Color(0xFF10B981)       // Green
val FinanceColor = Color(0xFFF59E0B)   // Orange
val NutritionColor = Color(0xFF3B82F6) // Blue
val FamilyColor = Color(0xFF8B5CF6)    // Purple
```

#### Tipografía

```kotlin
val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp
    ),
    headlineLarge = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp
    ),
    titleLarge = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 20.sp
    ),
    bodyLarge = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp
    ),
    bodyMedium = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp
    ),
    labelLarge = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp
    )
)
```

### 10.2 Componentes Reutilizables

```kotlin
// Loading State
@Composable
fun LoadingScreen() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

// Error State
@Composable
fun ErrorMessage(
    message: String,
    onRetry: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Error,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = message)
        onRetry?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = it) {
                Text("Reintentar")
            }
        }
    }
}

// Empty State
@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    description: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        actionLabel?.let { label ->
            Spacer(modifier = Modifier.height(24.dp))
            Button(onClick = { onAction?.invoke() }) {
                Text(label)
            }
        }
    }
}
```

### 10.3 Navegación

```kotlin
sealed class Screen(val route: String) {
    // Auth
    data object Splash : Screen("splash")
    data object Login : Screen("login")
    data object Register : Screen("register")

    // Main
    data object Dashboard : Screen("dashboard")

    // Workouts
    data object Workouts : Screen("workouts")
    data object WorkoutDetail : Screen("workouts/{id}") {
        fun createRoute(id: String) = "workouts/$id"
    }
    data object WorkoutForm : Screen("workouts/form?id={id}") {
        fun createRoute(id: String? = null) = "workouts/form?id=${id ?: ""}"
    }

    // Finance
    data object Finance : Screen("finance")
    data object TransactionForm : Screen("finance/transaction?id={id}")

    // Nutrition
    data object Nutrition : Screen("nutrition")
    data object MealForm : Screen("nutrition/meal?id={id}")

    // Family
    data object Family : Screen("family")
    data object FamilyMemberForm : Screen("family/member?id={id}")

    // AI
    data object AIChat : Screen("ai/{module}")

    // Settings
    data object Settings : Screen("settings")
}

@Composable
fun MainNavigation(
    navController: NavHostController,
    startDestination: String
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController)
        }
        // ... more destinations
    }
}
```

### 10.4 Bottom Navigation

```kotlin
@Composable
fun BottomNavBar(
    navController: NavController,
    currentRoute: String?
) {
    val items = listOf(
        BottomNavItem(
            route = Screen.Dashboard.route,
            icon = Icons.Default.Dashboard,
            label = "Inicio"
        ),
        BottomNavItem(
            route = Screen.Workouts.route,
            icon = Icons.Default.FitnessCenter,
            label = "Gym"
        ),
        BottomNavItem(
            route = Screen.Finance.route,
            icon = Icons.Default.AccountBalance,
            label = "Finanzas"
        ),
        BottomNavItem(
            route = Screen.Nutrition.route,
            icon = Icons.Default.Restaurant,
            label = "Nutrición"
        ),
        BottomNavItem(
            route = Screen.Family.route,
            icon = Icons.Default.People,
            label = "Familia"
        )
    )

    NavigationBar {
        items.forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.route,
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(Screen.Dashboard.route)
                        launchSingleTop = true
                    }
                },
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) }
            )
        }
    }
}
```

---

## 11. Offline Support y Sincronización

### 11.1 Estrategia de Sincronización

```
┌─────────────────────────────────────────────────────────────┐
│                   SYNC STRATEGY                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. OFFLINE-FIRST APPROACH                                  │
│     - All reads from local Room database                    │
│     - Background sync with server                           │
│     - Optimistic UI updates                                 │
│                                                              │
│  2. CONFLICT RESOLUTION                                     │
│     - Server wins (simplest)                                │
│     - Last-write-wins based on updatedAt                    │
│     - Manual resolution for critical data                   │
│                                                              │
│  3. SYNC TRIGGERS                                           │
│     - App launch                                            │
│     - Pull-to-refresh                                       │
│     - Network reconnection                                  │
│     - Background WorkManager (every 15 min)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Implementación

```kotlin
// SyncStatus enum para tracking
enum class SyncStatus {
    SYNCED,           // Sincronizado con servidor
    PENDING_CREATE,   // Creado offline, pendiente subir
    PENDING_UPDATE,   // Modificado offline, pendiente subir
    PENDING_DELETE,   // Eliminado offline, pendiente confirmar
    CONFLICT          // Conflicto detectado
}

// Repository con offline support
class WorkoutRepositoryImpl @Inject constructor(
    private val remoteDataSource: WorkoutsApi,
    private val localDataSource: WorkoutDao,
    private val networkMonitor: NetworkMonitor
) : WorkoutRepository {

    override fun getWorkouts(): Flow<List<Workout>> {
        return localDataSource.getAllWorkouts()
            .map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun createWorkout(workout: Workout): Result<Workout> {
        // 1. Save locally first
        val entity = workout.toEntity(syncStatus = SyncStatus.PENDING_CREATE)
        localDataSource.insert(entity)

        // 2. Try to sync if online
        if (networkMonitor.isOnline()) {
            return syncWorkout(entity)
        }

        return Result.success(workout)
    }

    override suspend fun syncPendingChanges() {
        val pending = localDataSource.getPendingSync()

        pending.forEach { entity ->
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val result = safeApiCall {
                        remoteDataSource.createWorkout(entity.toRequest())
                    }
                    if (result is NetworkResult.Success) {
                        localDataSource.updateSyncStatus(entity.id, SyncStatus.SYNCED)
                    }
                }
                SyncStatus.PENDING_UPDATE -> { /* Similar logic */ }
                SyncStatus.PENDING_DELETE -> { /* Similar logic */ }
                else -> { }
            }
        }
    }
}

// WorkManager para sync en background
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val workoutRepository: WorkoutRepository,
    private val transactionRepository: TransactionRepository,
    private val mealRepository: MealRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            workoutRepository.syncPendingChanges()
            transactionRepository.syncPendingChanges()
            mealRepository.syncPendingChanges()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

### 11.3 Network Monitor

```kotlin
class NetworkMonitor @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    val isOnline: StateFlow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }

            override fun onLost(network: Network) {
                trySend(false)
            }
        }

        connectivityManager.registerDefaultNetworkCallback(callback)

        // Initial state
        trySend(connectivityManager.activeNetwork != null)

        awaitClose {
            connectivityManager.unregisterNetworkCallback(callback)
        }
    }.stateIn(
        scope = CoroutineScope(Dispatchers.IO),
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = false
    )

    fun isOnline(): Boolean = isOnline.value
}
```

---

## 12. Testing Strategy

### 12.1 Pirámide de Testing

```
              ┌───────────┐
              │    E2E    │  10% - Flujos críticos completos
              │  Tests    │
              └─────┬─────┘
             ┌──────┴──────┐
             │ Integration │  20% - Repository, API integration
             │    Tests    │
             └──────┬──────┘
        ┌──────────┴──────────┐
        │      Unit Tests     │  70% - ViewModels, UseCases, Utils
        │                     │
        └─────────────────────┘
```

### 12.2 Unit Tests

```kotlin
// ViewModel Test
@ExperimentalCoroutinesApi
class LoginViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: LoginViewModel
    private lateinit var loginUseCase: LoginUseCase

    @Before
    fun setup() {
        loginUseCase = mockk()
        viewModel = LoginViewModel(loginUseCase)
    }

    @Test
    fun `login with valid credentials updates state to success`() = runTest {
        // Given
        val email = "test@example.com"
        val password = "password123"
        coEvery { loginUseCase(email, password) } returns Result.success(mockUser)

        // When
        viewModel.onEmailChange(email)
        viewModel.onPasswordChange(password)
        viewModel.onLoginClick()

        // Then
        val state = viewModel.state.value
        assertTrue(state.isLoggedIn)
        assertNull(state.error)
    }

    @Test
    fun `login with invalid email shows error`() = runTest {
        // Given
        val invalidEmail = "invalid-email"

        // When
        viewModel.onEmailChange(invalidEmail)
        viewModel.onLoginClick()

        // Then
        val state = viewModel.state.value
        assertNotNull(state.emailError)
        assertEquals("Email inválido", state.emailError)
    }
}

// UseCase Test
class CreateWorkoutUseCaseTest {

    private lateinit var useCase: CreateWorkoutUseCase
    private lateinit var repository: WorkoutRepository

    @Before
    fun setup() {
        repository = mockk()
        useCase = CreateWorkoutUseCase(repository)
    }

    @Test
    fun `create workout with exercises succeeds`() = runTest {
        // Given
        val workout = createTestWorkout()
        coEvery { repository.createWorkout(any()) } returns Result.success(workout)

        // When
        val result = useCase(workout)

        // Then
        assertTrue(result.isSuccess)
        assertEquals(workout.id, result.getOrNull()?.id)
    }
}
```

### 12.3 Integration Tests

```kotlin
@HiltAndroidTest
class WorkoutRepositoryIntegrationTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var repository: WorkoutRepository

    @Inject
    lateinit var database: AppDatabase

    @Before
    fun setup() {
        hiltRule.inject()
    }

    @After
    fun tearDown() {
        database.clearAllTables()
    }

    @Test
    fun `offline created workout syncs when online`() = runTest {
        // Given - Create workout offline
        val workout = createTestWorkout()
        repository.createWorkout(workout)

        // Verify local storage
        val localWorkouts = repository.getWorkouts().first()
        assertEquals(1, localWorkouts.size)
        assertEquals(SyncStatus.PENDING_CREATE, localWorkouts[0].syncStatus)

        // When - Sync
        repository.syncPendingChanges()

        // Then - Verify synced
        val syncedWorkouts = repository.getWorkouts().first()
        assertEquals(SyncStatus.SYNCED, syncedWorkouts[0].syncStatus)
    }
}
```

### 12.4 UI Tests

```kotlin
@HiltAndroidTest
class LoginScreenTest {

    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun loginScreen_displaysCorrectly() {
        composeRule.onNodeWithText("Email").assertIsDisplayed()
        composeRule.onNodeWithText("Contraseña").assertIsDisplayed()
        composeRule.onNodeWithText("Iniciar sesión").assertIsDisplayed()
    }

    @Test
    fun loginScreen_showsErrorOnInvalidEmail() {
        composeRule.onNodeWithText("Email")
            .performTextInput("invalid-email")

        composeRule.onNodeWithText("Iniciar sesión").performClick()

        composeRule.onNodeWithText("Email inválido").assertIsDisplayed()
    }

    @Test
    fun loginScreen_navigatesToDashboardOnSuccess() {
        // Arrange - Mock successful login

        composeRule.onNodeWithText("Email")
            .performTextInput("test@example.com")
        composeRule.onNodeWithText("Contraseña")
            .performTextInput("password123")

        composeRule.onNodeWithText("Iniciar sesión").performClick()

        // Assert - Navigated to dashboard
        composeRule.onNodeWithText("Dashboard").assertIsDisplayed()
    }
}
```

---

## 13. Cronograma Sugerido

### 13.1 Fases de Desarrollo

| Fase | Duración | Entregables |
|------|----------|-------------|
| **Fase 0: Setup** | 2 semanas | Arquitectura base, CI/CD, Design System inicial |
| **Fase 1: Auth + Core** | 3 semanas | Login, Register, Navigation, Base components |
| **Fase 2: Gym Module** | 3 semanas | CRUD Workouts, Templates, Progress |
| **Fase 3: Finance Module** | 3 semanas | Transactions, Investments, Budgets |
| **Fase 4: Nutrition Module** | 2 semanas | Meals, Food items, Goals |
| **Fase 5: Family Module** | 2 semanas | Members, Time logs, Events, Reminders |
| **Fase 6: Analytics** | 2 semanas | Charts, Dashboards, Reports |
| **Fase 7: AI Integration** | 2 semanas | Chat, Credentials, Rate limiting |
| **Fase 8: Polish & Testing** | 3 semanas | QA, Bug fixes, Performance, Beta |
| **Total Estimado** | ~22 semanas | ~5-6 meses |

### 13.2 Milestones

1. **M1 (Semana 5):** Auth funcional + navegación base
2. **M2 (Semana 8):** Gym module completo
3. **M3 (Semana 11):** Finance module completo
4. **M4 (Semana 15):** Todos los módulos CRUD
5. **M5 (Semana 19):** AI + Analytics integrados
6. **M6 (Semana 22):** Release Beta

### 13.3 Dependencias Críticas

```
Auth ──────┬──► Gym Module ──────┐
           │                      │
           ├──► Finance Module ───┼──► Analytics
           │                      │
           ├──► Nutrition Module ─┤
           │                      │
           └──► Family Module ────┘
                                  │
                                  └──► AI Integration
```

---

## 14. Anexos Técnicos

### 14.1 Códigos de Error de API

| Código | Significado | Acción en App |
|--------|-------------|---------------|
| 200 | OK | Procesar respuesta |
| 201 | Creado | Actualizar local + UI |
| 400 | Bad Request | Mostrar validación |
| 401 | No autorizado | Redirect a login |
| 403 | Prohibido | Mostrar error |
| 404 | No encontrado | Mostrar vacío/error |
| 409 | Conflicto | Email ya existe |
| 429 | Rate limit | Mostrar retry timer |
| 500 | Server error | Retry + error genérico |

### 14.2 Constantes de Configuración

```kotlin
object Config {
    // API
    const val API_BASE_URL_PROD = "https://dashboard.malacaran8n.uk/"
    const val API_BASE_URL_DEV = "http://10.0.2.2:3000/" // Emulator localhost

    // Timeouts
    const val CONNECT_TIMEOUT_SECONDS = 30L
    const val READ_TIMEOUT_SECONDS = 60L // AI requests need more time
    const val WRITE_TIMEOUT_SECONDS = 30L

    // Rate Limiting
    const val AI_HOURLY_LIMIT = 30
    const val AI_DAILY_LIMIT = 100

    // Session
    const val SESSION_DURATION_DAYS = 30

    // Sync
    const val SYNC_INTERVAL_MINUTES = 15L

    // Pagination
    const val DEFAULT_PAGE_SIZE = 20
}
```

### 14.3 Recursos Adicionales

- **Material Design 3 Guidelines:** https://m3.material.io/
- **Jetpack Compose Documentation:** https://developer.android.com/jetpack/compose
- **Kotlin Coroutines Guide:** https://kotlinlang.org/docs/coroutines-guide.html
- **Room Database:** https://developer.android.com/training/data-storage/room
- **Hilt Dependency Injection:** https://developer.android.com/training/dependency-injection/hilt-android

### 14.4 Checklist Pre-Release

- [ ] Todos los módulos funcionales
- [ ] Offline mode funcionando
- [ ] Sincronización verificada
- [ ] AI integration con rate limiting
- [ ] Dark mode completo
- [ ] Internacionalización (ES/EN)
- [ ] Unit tests > 70% coverage
- [ ] UI tests en flujos críticos
- [ ] Performance profiling
- [ ] Memory leaks verificados
- [ ] ProGuard/R8 configurado
- [ ] Signing keys configurados
- [ ] Play Store assets preparados

---

## Contacto y Soporte

**Backend API Documentation:** Este documento + código fuente en `/home/badfaceserverlap/personal-dashboard/`

**Ambiente de Testing:**
- API Dev: `http://localhost:3000`
- API Prod: `https://dashboard.malacaran8n.uk`

**Credenciales de Prueba:** Crear cuenta nueva vía registro

---

*Documento generado el 2026-01-20*
*Versión del backend: Next.js 15.0.3 + Prisma 5.22.0*
*Autor: Claude Code*
