# Guía de Potencial Eléctrico

## Conceptos Físicos

### Potencial Eléctrico (V)

El potencial eléctrico es la energía potencial eléctrica por unidad de carga. Se mide en voltios (V).

**Fórmula para una carga puntual:**
```
V(r) = k * q / r

donde:
- V = potencial eléctrico
- k = constante de Coulomb (1 en nuestra simulación)
- q = magnitud y signo de la carga
- r = distancia a la carga
```

**Para múltiples cargas (Principio de Superposición):**
```
V_total = V₁ + V₂ + V₃ + ... = Σ (k * qᵢ / rᵢ)
```

### Relación entre Campo y Potencial

El campo eléctrico es el gradiente negativo del potencial:

```
E = -∇V = -(∂V/∂x, ∂V/∂y, ∂V/∂z)
```

Esto significa:
- El campo apunta en la dirección de **mayor disminución** del potencial
- Las cargas positivas se mueven hacia potenciales más bajos
- Las cargas negativas se mueven hacia potenciales más altos

### Superficies Equipotenciales

Son superficies donde el potencial tiene el mismo valor en todos sus puntos.

**Propiedades:**
- Son perpendiculares a las líneas de campo eléctrico
- No se cruzan entre sí
- Las cargas se mueven libremente sobre ellas (sin trabajo)
- Más densas donde el campo es más intenso

## Cómo Usar la Simulación

### 1. Acceder al Tab de Potencial

- Haz clic en la pestaña **"Potencial Eléctrico"** en la parte superior
- La interfaz se actualizará para mostrar las herramientas de potencial

### 2. Colocar Cargas

1. Selecciona el tipo de carga (Positiva o Negativa)
2. Ajusta la magnitud (1-10 µC)
3. Haz clic en el espacio 3D para colocar la carga
4. Las visualizaciones se actualizarán automáticamente

### 3. Visualizaciones Disponibles

#### a) Superficies Equipotenciales (3D)
- **Qué muestra:** Anillos en el plano Y=0 donde V es constante
- **Color:**
  - Rojo: Potenciales positivos
  - Azul: Potenciales negativos
- **Densidad:** Ajusta el número de niveles (5-20)

#### b) Mapa de Calor (3D y 2D)
- **Qué muestra:** Intensidad del potencial mediante colores
- **Escala de color:**
  - 🔵 Azul: Potencial muy negativo (bajo)
  - 🔷 Cyan: Potencial negativo moderado
  - 🟢 Verde: Potencial neutro
  - 🟡 Amarillo: Potencial positivo moderado
  - 🔴 Rojo: Potencial muy positivo (alto)

#### c) Vectores de Campo E
- **Qué muestra:** Dirección del campo eléctrico en varios puntos
- **Recuerda:** E = -∇V (apunta donde V disminuye)

### 4. Vista 2D Interactiva

En el panel de control encontrarás un canvas 2D que muestra:
- **Mapa de calor** del potencial en el plano Z=0
- **Cargas** representadas como círculos
- **Interacción:** Haz clic en el canvas para calcular el potencial en ese punto

### 5. Calculadora de Potencial

1. Ingresa las coordenadas (X, Y, Z) del punto de interés
2. Haz clic en "Calcular Potencial"
3. Verás:
   - Valor del potencial V
   - Vector del campo eléctrico E
   - Magnitud del campo |E|
   - Marcador visual en 3D

## Ejemplos Predefinidos

### 1. Dipolo Eléctrico

**Configuración:**
- +5 µC en (-1, 0, 0)
- -5 µC en (+1, 0, 0)

**Características:**
- Potencial V=0 en el punto medio (0, 0, 0)
- Equipotenciales forman patrones circulares
- Campo apunta de + hacia -

**Cálculo en (0, 1, 0):**
- V ≈ 0 (por simetría)
- Ex ≈ 0.7071 N/C
- Campo horizontal

### 2. Dos Cargas Positivas

**Configuración:**
- +5 µC en (-2, 0, 0)
- +5 µC en (+2, 0, 0)

**Características:**
- Potencial siempre positivo
- Equipotenciales rodean ambas cargas
- En el centro: V es alto, E ≈ 0

### 3. Cuatro Cargas (Cuadrado)

**Configuración:**
- Cargas alternadas (+/-) en las esquinas de un cuadrado

**Características:**
- Patrón de potencial complejo
- Equipotenciales con simetría de 4 ejes
- Ideal para estudiar superposición

## Interpretación de Resultados

### Signo del Potencial

- **V > 0:** Predominan cargas positivas cercanas
- **V < 0:** Predominan cargas negativas cercanas
- **V = 0:** Balance o punto lejano

### Magnitud del Potencial

- **|V| grande:** Cerca de cargas o campo intenso
- **|V| pequeño:** Lejos de cargas o región de equilibrio

### Gradiente del Potencial

- **∇V grande:** Campo eléctrico intenso
- **∇V = 0:** No hay campo (equilibrio)

## Ejercicios Propuestos

### Ejercicio 1: Verificar E = -∇V
1. Carga el dipolo
2. Calcula V en (0, 1, 0)
3. Calcula V en (0.1, 1, 0)
4. Verifica que (V₂ - V₁) / 0.1 ≈ -Ex

### Ejercicio 2: Superficies Equipotenciales
1. Carga "Dos Cargas Positivas"
2. Observa las equipotenciales
3. Verifica que son perpendiculares a los vectores E

### Ejercicio 3: Trabajo Eléctrico
1. Carga cualquier configuración
2. Calcula V en dos puntos A y B
3. El trabajo para mover 1 C de A a B es: W = V_B - V_A

## Fórmulas Útiles

### Potencial de múltiples cargas
```
V(x,y,z) = k Σ (qᵢ / √[(x-xᵢ)² + (y-yᵢ)² + (z-zᵢ)²])
```

### Componentes del campo
```
Ex = -∂V/∂x
Ey = -∂V/∂y
Ez = -∂V/∂z
```

### Energía potencial de una carga q en el potencial V
```
U = q * V
```

### Diferencia de potencial y trabajo
```
W = q * (V_B - V_A)
```

## Tips de Visualización

### Para mejor comprensión:

1. **Combina visualizaciones:**
   - Activa equipotenciales + mapa de calor
   - Compara con vectores de campo E

2. **Usa el mapa 2D:**
   - Mejor para identificar patrones
   - Click para explorar valores específicos

3. **Varía el número de niveles:**
   - Pocos niveles: vista general
   - Muchos niveles: detalles finos

4. **Rota la vista 3D:**
   - Observa la simetría
   - Verifica perpendicularidad E⊥equipotenciales

## Diferencias con Líneas de Campo

| Aspecto | Líneas de Campo | Equipotenciales |
|---------|----------------|-----------------|
| Dirección | Tangentes a E | Perpendiculares a E |
| Significado | Trayectoria de carga + | Lugares de igual V |
| Cruces | Nunca se cruzan | Nunca se cruzan |
| Densidad | ∝ |E| | ∝ |∇V| |

## Aplicaciones Reales

### Condensadores
- Dos placas con V diferente
- Campo uniforme entre ellas
- Equipotenciales = planos paralelos

### Jaula de Faraday
- V constante en el interior
- E = 0 adentro

### Rayos
- Diferencia de potencial enorme
- Camino de menor resistencia

---

**Nota:** Esta simulación usa k=1 para simplificación. En el SI real: k ≈ 8.99×10⁹ N·m²/C².
