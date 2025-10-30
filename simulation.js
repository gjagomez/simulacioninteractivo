// Configuración de la simulación
class ElectricFieldSimulation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.charges = [];
        this.fieldLines = [];
        this.vectors = [];
        this.pointMarker = null; // Marcador para punto de cálculo
        this.placementMode = false; // Modo de colocación de cargas (inicialmente desactivado)
        this.currentChargeType = 1; // 1 = positiva, -1 = negativa
        this.chargeMagnitude = 5;
        this.fieldDensity = 12;
        this.showFieldLines = true;
        this.showVectors = true;
        this.showGrid = false;
        this.grid = null;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);

        // Añadir niebla para profundidad
        this.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);

        // Configurar cámara
        const container = document.getElementById('canvas-container-field');
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Controles de órbita
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.8);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x6366f1, 0.5);
        pointLight2.position.set(-10, -10, -10);
        this.scene.add(pointLight2);

        // Plano de referencia sutil
        const planeGeometry = new THREE.PlaneGeometry(30, 30);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2;
        plane.position.y = -5;
        this.scene.add(plane);

        // Grid opcional
        this.grid = new THREE.GridHelper(30, 30, 0x667eea, 0x444466);
        this.grid.position.y = -5;
        this.grid.visible = false;
        this.scene.add(this.grid);

        // Responsive
        window.addEventListener('resize', () => this.onWindowResize());

        // Click para añadir cargas
        this.renderer.domElement.addEventListener('click', (event) => this.onCanvasClick(event));
    }

    setupEventListeners() {
        // Modo de colocación de cargas
        const toggleBtn = document.getElementById('toggle-placement-mode');
        toggleBtn.addEventListener('click', () => {
            this.placementMode = !this.placementMode;
            this.updatePlacementMode();
        });

        // Tipo de carga
        document.getElementById('positive-charge').addEventListener('click', () => {
            this.currentChargeType = 1;
            document.getElementById('positive-charge').classList.add('active');
            document.getElementById('negative-charge').classList.remove('active');
        });

        document.getElementById('negative-charge').addEventListener('click', () => {
            this.currentChargeType = -1;
            document.getElementById('negative-charge').classList.add('active');
            document.getElementById('positive-charge').classList.remove('active');
        });

        // Magnitud de carga
        const magnitudeSlider = document.getElementById('charge-magnitude');
        magnitudeSlider.addEventListener('input', (e) => {
            this.chargeMagnitude = parseInt(e.target.value);
            document.getElementById('magnitude-value').textContent = this.chargeMagnitude;
        });

        // Densidad de líneas
        const densitySlider = document.getElementById('field-density');
        densitySlider.addEventListener('input', (e) => {
            this.fieldDensity = parseInt(e.target.value);
            document.getElementById('density-value').textContent = this.fieldDensity;
            this.updateFieldLines();
        });

        // Opciones de visualización
        document.getElementById('show-field-lines').addEventListener('change', (e) => {
            this.showFieldLines = e.target.checked;
            this.updateFieldLines();
        });

        document.getElementById('show-vectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
            this.updateVectors();
        });

        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.grid.visible = this.showGrid;
        });

        // Botones de acción
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        document.getElementById('reset-camera').addEventListener('click', () => this.resetCamera());

        // Ejemplos predefinidos
        document.getElementById('dipole-example').addEventListener('click', () => this.loadDipoleExample());
        document.getElementById('two-positive').addEventListener('click', () => this.loadTwoPositiveExample());
        document.getElementById('triangle-charges').addEventListener('click', () => this.loadTriangleExample());

        // Calcular campo eléctrico
        document.getElementById('calculate-field').addEventListener('click', () => this.calculateFieldAtPoint());
    }

    onCanvasClick(event) {
        // Solo colocar cargas si el modo de colocación está activo
        if (!this.placementMode) return;

        // Evitar añadir carga si se está arrastrando
        if (this.controls.enabled === false) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Crear un plano invisible en y=0 para determinar posición
        const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeY, intersectPoint);

        if (intersectPoint) {
            this.addCharge(intersectPoint, this.currentChargeType, this.chargeMagnitude);
        }
    }

    updatePlacementMode() {
        const toggleBtn = document.getElementById('toggle-placement-mode');
        const container = document.getElementById('canvas-container-field');
        const statusText = toggleBtn.querySelector('.mode-status');
        const hintText = toggleBtn.querySelector('.mode-hint');
        const icon = toggleBtn.querySelector('.mode-icon');

        if (this.placementMode) {
            toggleBtn.classList.add('active');
            container.classList.add('placement-mode');
            statusText.textContent = 'Modo: Colocar Cargas';
            hintText.textContent = 'Click en el espacio 3D para añadir';
            icon.textContent = '⚡';
        } else {
            toggleBtn.classList.remove('active');
            container.classList.remove('placement-mode');
            statusText.textContent = 'Modo: Rotar Vista';
            hintText.textContent = 'Click para cambiar a colocar cargas';
            icon.textContent = '🖱️';
        }
    }

    addCharge(position, type, magnitude) {
        const charge = {
            position: position.clone(),
            type: type,
            magnitude: magnitude,
            mesh: null
        };

        // Crear geometría de la carga
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: type > 0 ? 0xef4444 : 0x3b82f6,
            emissive: type > 0 ? 0xef4444 : 0x3b82f6,
            emissiveIntensity: 0.5,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        charge.mesh = new THREE.Mesh(geometry, material);
        charge.mesh.position.copy(position);
        charge.mesh.castShadow = true;

        // Añadir glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: type > 0 ? 0xef4444 : 0x3b82f6,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        charge.mesh.add(glow);

        // Añadir signo
        this.addChargeSign(charge.mesh, type);

        this.scene.add(charge.mesh);
        this.charges.push(charge);

        // Actualizar UI
        this.updateChargesList();
        this.updateFieldLines();
        this.updateVectors();
    }

    addChargeSign(mesh, type) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type > 0 ? '+' : '−', 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 1, 1);
        mesh.add(sprite);
    }

    updateFieldLines() {
        // Limpiar líneas anteriores
        this.fieldLines.forEach(line => this.scene.remove(line));
        this.fieldLines = [];

        if (!this.showFieldLines || this.charges.length === 0) return;

        // Generar líneas de campo para cada carga
        this.charges.forEach(charge => {
            const numLines = this.fieldDensity;

            for (let i = 0; i < numLines; i++) {
                const angle1 = (i / numLines) * Math.PI * 2;
                for (let j = 0; j < numLines / 2; j++) {
                    const angle2 = (j / (numLines / 2)) * Math.PI;

                    const direction = new THREE.Vector3(
                        Math.sin(angle2) * Math.cos(angle1),
                        Math.cos(angle2),
                        Math.sin(angle2) * Math.sin(angle1)
                    );

                    const line = this.createFieldLine(charge, direction);
                    if (line) {
                        this.scene.add(line);
                        this.fieldLines.push(line);
                    }
                }
            }
        });
    }

    createFieldLine(startCharge, initialDirection) {
        const points = [];
        const maxSteps = 200;
        const stepSize = 0.1;
        let currentPos = startCharge.position.clone().add(initialDirection.clone().multiplyScalar(0.6));

        for (let step = 0; step < maxSteps; step++) {
            points.push(currentPos.clone());

            // Calcular campo eléctrico en la posición actual
            const field = this.calculateElectricField(currentPos);

            if (field.length() < 0.01) break;

            // Normalizar y avanzar
            field.normalize().multiplyScalar(stepSize * (startCharge.type > 0 ? 1 : -1));
            currentPos.add(field);

            // Verificar límites
            if (currentPos.length() > 20) break;

            // Verificar colisión con otras cargas
            let collision = false;
            for (let charge of this.charges) {
                if (currentPos.distanceTo(charge.position) < 0.5) {
                    collision = true;
                    break;
                }
            }
            if (collision) break;
        }

        if (points.length < 2) return null;

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: startCharge.type > 0 ? 0xff6b6b : 0x4dabf7,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });

        return new THREE.Line(geometry, material);
    }

    calculateElectricField(position) {
        const field = new THREE.Vector3(0, 0, 0);
        const k = 1; // Constante de Coulomb simplificada

        this.charges.forEach(charge => {
            const r = new THREE.Vector3().subVectors(position, charge.position);
            const distance = r.length();

            if (distance < 0.1) return; // Evitar singularidad

            const magnitude = k * charge.type * charge.magnitude / (distance * distance);
            r.normalize().multiplyScalar(magnitude);
            field.add(r);
        });

        return field;
    }

    updateVectors() {
        // Limpiar vectores anteriores
        this.vectors.forEach(vector => this.scene.remove(vector));
        this.vectors = [];

        if (!this.showVectors || this.charges.length === 0) return;

        // Crear grid de vectores
        const gridSize = 10;
        const spacing = 2;

        for (let x = -gridSize; x <= gridSize; x += spacing) {
            for (let y = -gridSize; y <= gridSize; y += spacing) {
                for (let z = -gridSize; z <= gridSize; z += spacing) {
                    const pos = new THREE.Vector3(x, y, z);

                    // No dibujar vectores muy cerca de las cargas
                    let tooClose = false;
                    for (let charge of this.charges) {
                        if (pos.distanceTo(charge.position) < 1.5) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (tooClose) continue;

                    const field = this.calculateElectricField(pos);
                    if (field.length() < 0.01) continue;

                    const arrow = this.createArrow(pos, field);
                    if (arrow) {
                        this.scene.add(arrow);
                        this.vectors.push(arrow);
                    }
                }
            }
        }
    }

    createArrow(position, field) {
        const length = Math.min(field.length() * 0.5, 2);
        if (length < 0.1) return null;

        const dir = field.clone().normalize();
        const origin = position;
        const color = field.length() > 1 ? 0xffd700 : 0x9ca3af;

        const arrow = new THREE.ArrowHelper(dir, origin, length, color, 0.3, 0.2);
        arrow.line.material.transparent = true;
        arrow.line.material.opacity = 0.5;
        arrow.cone.material.transparent = true;
        arrow.cone.material.opacity = 0.5;

        return arrow;
    }

    updateChargesList() {
        const chargesList = document.getElementById('charges-list');
        chargesList.innerHTML = '';

        if (this.charges.length === 0) {
            chargesList.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 10px;">No hay cargas</div>';
            return;
        }

        this.charges.forEach((charge, index) => {
            const item = document.createElement('div');
            item.className = `charge-item ${charge.type > 0 ? 'positive' : 'negative'}`;

            const info = document.createElement('div');
            info.className = 'charge-info';
            info.innerHTML = `
                <strong>${charge.type > 0 ? '+' : '−'}${charge.magnitude} µC</strong><br>
                <small>Pos: (${charge.position.x.toFixed(1)}, ${charge.position.y.toFixed(1)}, ${charge.position.z.toFixed(1)})</small>
            `;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-charge';
            removeBtn.textContent = 'Eliminar';
            removeBtn.addEventListener('click', () => this.removeCharge(index));

            item.appendChild(info);
            item.appendChild(removeBtn);
            chargesList.appendChild(item);
        });
    }

    removeCharge(index) {
        const charge = this.charges[index];
        this.scene.remove(charge.mesh);
        this.charges.splice(index, 1);

        this.updateChargesList();
        this.updateFieldLines();
        this.updateVectors();
    }

    clearAll() {
        this.charges.forEach(charge => this.scene.remove(charge.mesh));
        this.charges = [];

        // Limpiar marker de punto si existe
        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
            this.pointMarker = null;
        }

        this.updateChargesList();
        this.updateFieldLines();
        this.updateVectors();
    }

    // Ejemplos predefinidos
    loadDipoleExample() {
        this.clearAll();

        // Dipolo: +q en (-1, 0, 0) y -q en (+1, 0, 0)
        this.addCharge(new THREE.Vector3(-1, 0, 0), 1, 5);  // Carga positiva
        this.addCharge(new THREE.Vector3(1, 0, 0), -1, 5);  // Carga negativa

        // Resetear cámara para mejor vista
        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // Pre-cargar punto de cálculo (0, 1, 0)
        document.getElementById('point-x').value = 0;
        document.getElementById('point-y').value = 1;
        document.getElementById('point-z').value = 0;
    }

    loadTwoPositiveExample() {
        this.clearAll();

        // Dos cargas positivas
        this.addCharge(new THREE.Vector3(-2, 0, 0), 1, 5);
        this.addCharge(new THREE.Vector3(2, 0, 0), 1, 5);

        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(0, 0, 0);
    }

    loadTriangleExample() {
        this.clearAll();

        // Tres cargas en triángulo
        const r = 3;
        this.addCharge(new THREE.Vector3(r, 0, 0), 1, 5);
        this.addCharge(new THREE.Vector3(-r/2, 0, r*Math.sqrt(3)/2), -1, 5);
        this.addCharge(new THREE.Vector3(-r/2, 0, -r*Math.sqrt(3)/2), 1, 5);

        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
    }

    // Calcular campo eléctrico en un punto específico
    calculateFieldAtPoint() {
        const x = parseFloat(document.getElementById('point-x').value);
        const y = parseFloat(document.getElementById('point-y').value);
        const z = parseFloat(document.getElementById('point-z').value);

        const point = new THREE.Vector3(x, y, z);

        // Calcular campo eléctrico
        const field = this.calculateElectricField(point);

        // Mostrar marcador visual del punto
        this.showPointMarker(point, field);

        // Mostrar resultados
        const resultDiv = document.getElementById('field-result');
        resultDiv.classList.add('active');

        const magnitude = field.length();

        resultDiv.innerHTML = `
            <h4>Campo Eléctrico en P(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})</h4>
            <div class="result-data">
                <strong>Vector E:</strong><br>
                Ex = <span class="highlight">${field.x.toFixed(4)}</span> N/C<br>
                Ey = <span class="highlight">${field.y.toFixed(4)}</span> N/C<br>
                Ez = <span class="highlight">${field.z.toFixed(4)}</span> N/C<br>
                <br>
                <strong>Magnitud:</strong><br>
                |E| = <span class="highlight">${magnitude.toFixed(4)}</span> N/C<br>
                <br>
                <strong>Nota:</strong> k = 1 (unidades simplificadas)
            </div>
        `;
    }

    showPointMarker(position, field) {
        // Eliminar marcador anterior si existe
        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
        }

        // Crear grupo para el marcador
        this.pointMarker = new THREE.Group();

        // Esfera del punto
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.pointMarker.add(sphere);

        // Glow exterior
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.pointMarker.add(glow);

        // Vector del campo eléctrico en ese punto
        if (field.length() > 0.01) {
            const dir = field.clone().normalize();
            const length = Math.min(field.length() * 0.8, 5);
            const arrow = new THREE.ArrowHelper(
                dir,
                new THREE.Vector3(0, 0, 0),
                length,
                0xfbbf24,
                0.5,
                0.3
            );
            arrow.line.material.linewidth = 3;
            this.pointMarker.add(arrow);
        }

        this.pointMarker.position.copy(position);
        this.scene.add(this.pointMarker);
    }

    resetCamera() {
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    onWindowResize() {
        const container = document.getElementById('canvas-container-field');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Animar cargas (rotación suave del glow)
        this.charges.forEach(charge => {
            if (charge.mesh.children[0]) {
                charge.mesh.children[0].rotation.y += 0.01;
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Iniciar simulación cuando se carga la página
window.addEventListener('DOMContentLoaded', () => {
    new ElectricFieldSimulation();
});
