# Simulación Interactiva de Campos Eléctricos 3D

Una simulación moderna e interactiva de campos eléctricos en 3D usando Three.js, HTML y JavaScript.

## 🎯 Dos Simulaciones en Una

Esta aplicación incluye **dos modos completos** accesibles mediante tabs:

### 📊 Tab 1: Líneas de Campo Eléctrico
- **Visualización 3D** de cargas eléctricas positivas y negativas
- **Líneas de campo eléctrico** dibujadas dinámicamente
- **Vectores de campo** en cuadrícula 3D
- **Calculadora de campo E** en puntos específicos
- Visualización del comportamiento del campo

### ⚡ Tab 2: Potencial Eléctrico
- **Superficies equipotenciales** en 3D
- **Mapa de calor** del potencial (3D y 2D)
- **Calculadora de potencial V** y campo E
- Vista 2D interactiva con heat map
- Visualización de la relación E = -∇V

## Características Generales

- **Sistema de pestañas** para cambiar entre simulaciones
- **Modo de interacción dual** 🖱️ Rotar Vista / ⚡ Colocar Cargas
- **Sin clicks accidentales** - Controla cuándo añades cargas
- **Ejemplos predefinidos** (dipolo, cargas múltiples)
- **Interfaz moderna** con controles intuitivos
- **Rotación, zoom y panorámica** de la cámara 3D
- **Efectos visuales** con iluminación y glow
- **Marcadores interactivos** para cálculos
- **Responsive** adaptable a diferentes pantallas

## Cómo usar

### Instalación

1. Descarga todos los archivos en una carpeta
2. Abre `index.html` en tu navegador web moderno (Chrome, Firefox, Edge)
3. ¡Listo! No se requiere instalación de servidor

### Navegación por Tabs

En la parte superior de la aplicación encontrarás dos pestañas:

1. **📊 Líneas de Campo** - Visualización de líneas de fuerza y vectores de campo
2. **⚡ Potencial Eléctrico** - Mapas de calor y superficies equipotenciales

Haz clic en cualquier pestaña para cambiar entre simulaciones. Cada una tiene su propio conjunto de controles y características.

### Controles

#### Modo de Interacción (NUEVO)
Por defecto, la simulación está en **"Modo: Rotar Vista"** 🖱️ para evitar clicks accidentales.

**Para añadir cargas:**
1. Haz click en el botón **"Modo de Interacción"** en el panel
2. El botón se pondrá verde: **"Modo: Colocar Cargas"** ⚡
3. Ahora sí puedes hacer click en el espacio 3D para colocar cargas
4. Cuando termines, vuelve a hacer click para regresar a modo rotar

**Ventajas:**
- ✅ Puedes rotar libremente sin añadir cargas por accidente
- ✅ Cursor cambia a cruz (✚) cuando puedes colocar
- ✅ Banner verde indica que el modo está activo

#### Añadir cargas:
- Activa el **Modo Colocar Cargas** ⚡
- Selecciona el tipo de carga (Positiva o Negativa) en el panel de control
- Ajusta la magnitud de la carga con el slider
- Haz clic en el espacio 3D para colocar la carga
- (Opcional) Desactiva el modo para solo rotar

#### Controles de cámara:
- **Click derecho + arrastrar**: Rotar la vista
- **Rueda del ratón**: Zoom in/out
- **Click medio + arrastrar**: Mover la vista lateralmente

#### Panel de control:
- **Tipo de Carga**: Selecciona entre carga positiva (+) o negativa (−)
- **Magnitud de Carga**: Ajusta la intensidad de 1 a 10 µC
- **Densidad de Líneas de Campo**: Controla cuántas líneas se dibujan
- **Opciones de Visualización**:
  - Mostrar/ocultar líneas de campo
  - Mostrar/ocultar vectores de campo
  - Mostrar/ocultar cuadrícula de referencia
- **Ejemplos Predefinidos**:
  - **Dipolo Eléctrico**: +q en (-1,0,0) y -q en (+1,0,0)
  - **Dos Cargas Positivas**: Configuración de repulsión
  - **Tres Cargas**: Disposición triangular
- **Calculadora de Campo**:
  - Ingresa coordenadas (X, Y, Z)
  - Calcula y visualiza el campo eléctrico
  - Muestra vector y magnitud del campo
- **Lista de Cargas**: Ver y eliminar cargas individuales
- **Limpiar Todo**: Eliminar todas las cargas
- **Resetear Cámara**: Volver a la vista inicial

#### Ejemplo del Dipolo:
1. Haz clic en "Dipolo Eléctrico"
2. Las cargas se colocan en (-1,0,0) y (+1,0,0)
3. Ingresa el punto (0, 1, 0) en la calculadora
4. Haz clic en "Calcular Campo"
5. **Resultado esperado**: E ≈ (0.7071, 0, 0) con |E| ≈ 0.7071 N/C
6. Observa el marcador amarillo y el vector en el punto

## Conceptos Físicos

### Líneas de Campo Eléctrico
Las líneas de campo eléctrico:
- Salen de las cargas positivas (rojas)
- Entran a las cargas negativas (azules)
- Nunca se cruzan entre sí
- La densidad indica la intensidad del campo

### Vectores de Campo
Los vectores muestran:
- Dirección del campo en cada punto del espacio
- Magnitud representada por el tamaño del vector
- Color dorado para campos intensos

## Tecnologías Utilizadas

- **Three.js**: Librería 3D para WebGL



## Requisitos

- Navegador web moderno con soporte para WebGL
- Conexión a internet (para cargar Three.js desde CDN)

## Créditos

Simulación creada con fines educativos para visualizar conceptos de electrostática y campos eléctricos.

---

**Nota**: Esta simulación es una representación visual simplificada. Para cálculos precisos, consulta literatura científica especializada.
