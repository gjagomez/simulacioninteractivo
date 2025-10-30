// Simulación de Potencial Eléctrico
class PotentialSimulation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.charges = [];
        this.equipotentialSurfaces = [];
        this.fieldVectors = [];
        this.heatmapPlane = null;
        this.pointMarker = null;

        this.placementMode = false; // Modo de colocación de cargas (inicialmente desactivado)
        this.currentChargeType = 1;
        this.chargeMagnitude = 5;
        this.equipotentialLevels = 10;
        this.showEquipotential = true;
        this.showHeatmap = true;
        this.showFieldVectors = false;
        this.showGrid = false;
        this.grid = null;

        this.heatmapCanvas = null;
        this.heatmapContext = null;

        this.init();
        this.setupEventListeners();
        this.initHeatmapCanvas();
        this.animate();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);

        // Configurar cámara
        const container = document.getElementById('canvas-container-potential');
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        // Controles
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

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
        const toggleBtn = document.getElementById('toggle-placement-mode-2');
        toggleBtn.addEventListener('click', () => {
            this.placementMode = !this.placementMode;
            this.updatePlacementMode();
        });

        // Tipo de carga
        document.getElementById('positive-charge-2').addEventListener('click', () => {
            this.currentChargeType = 1;
            document.getElementById('positive-charge-2').classList.add('active');
            document.getElementById('negative-charge-2').classList.remove('active');
        });

        document.getElementById('negative-charge-2').addEventListener('click', () => {
            this.currentChargeType = -1;
            document.getElementById('negative-charge-2').classList.add('active');
            document.getElementById('positive-charge-2').classList.remove('active');
        });

        // Magnitud de carga
        const magnitudeSlider = document.getElementById('charge-magnitude-2');
        magnitudeSlider.addEventListener('input', (e) => {
            this.chargeMagnitude = parseInt(e.target.value);
            document.getElementById('magnitude-value-2').textContent = this.chargeMagnitude;
        });

        // Niveles de equipotencial
        const levelsSlider = document.getElementById('equipotential-levels');
        levelsSlider.addEventListener('input', (e) => {
            this.equipotentialLevels = parseInt(e.target.value);
            document.getElementById('levels-value').textContent = this.equipotentialLevels;
            this.updateEquipotentials();
        });

        // Opciones de visualización
        document.getElementById('show-equipotential').addEventListener('change', (e) => {
            this.showEquipotential = e.target.checked;
            this.updateEquipotentials();
        });

        document.getElementById('show-heatmap').addEventListener('change', (e) => {
            this.showHeatmap = e.target.checked;
            this.updateHeatmap();
        });

        document.getElementById('show-field-vectors').addEventListener('change', (e) => {
            this.showFieldVectors = e.target.checked;
            this.updateFieldVectors();
        });

        document.getElementById('show-grid-2').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.grid.visible = this.showGrid;
        });

        // Ejemplos predefinidos
        document.getElementById('dipole-example-2').addEventListener('click', () => this.loadDipoleExample());
        document.getElementById('two-positive-2').addEventListener('click', () => this.loadTwoPositiveExample());
        document.getElementById('square-charges').addEventListener('click', () => this.loadSquareExample());

        // Calcular potencial
        document.getElementById('calculate-potential').addEventListener('click', () => this.calculatePotentialAtPoint());

        // Botones de acción
        document.getElementById('clear-all-2').addEventListener('click', () => this.clearAll());
        document.getElementById('reset-camera-2').addEventListener('click', () => this.resetCamera());
    }

    initHeatmapCanvas() {
        this.heatmapCanvas = document.getElementById('heatmap-canvas');
        this.heatmapContext = this.heatmapCanvas.getContext('2d');

        // Configurar tamaño
        const rect = this.heatmapCanvas.getBoundingClientRect();
        this.heatmapCanvas.width = rect.width * window.devicePixelRatio;
        this.heatmapCanvas.height = rect.height * window.devicePixelRatio;
        this.heatmapContext.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Click en heatmap para calcular potencial
        this.heatmapCanvas.addEventListener('click', (e) => this.onHeatmapClick(e));
    }

    onCanvasClick(event) {
        // Solo colocar cargas si el modo de colocación está activo
        if (!this.placementMode) return;

        if (this.controls.enabled === false) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeY, intersectPoint);

        if (intersectPoint) {
            this.addCharge(intersectPoint, this.currentChargeType, this.chargeMagnitude);
        }
    }

    updatePlacementMode() {
        const toggleBtn = document.getElementById('toggle-placement-mode-2');
        const container = document.getElementById('canvas-container-potential');
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

    onHeatmapClick(event) {
        const rect = this.heatmapCanvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 20 - 10;
        const z = ((event.clientY - rect.top) / rect.height) * 20 - 10;

        document.getElementById('point-x-2').value = x.toFixed(2);
        document.getElementById('point-y-2').value = 0;
        document.getElementById('point-z-2').value = z.toFixed(2);

        this.calculatePotentialAtPoint();
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

        // Glow
        const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: type > 0 ? 0xef4444 : 0x3b82f6,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        charge.mesh.add(glow);

        // Signo
        this.addChargeSign(charge.mesh, type);

        this.scene.add(charge.mesh);
        this.charges.push(charge);

        this.updateChargesList();
        this.updateEquipotentials();
        this.updateHeatmap();
        this.updateFieldVectors();
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

    calculatePotential(position) {
        let potential = 0;
        const k = 1; // Constante de Coulomb simplificada

        this.charges.forEach(charge => {
            const r = position.distanceTo(charge.position);
            if (r < 0.1) return; // Evitar singularidad
            potential += k * charge.type * charge.magnitude / r;
        });

        return potential;
    }

    calculateElectricField(position) {
        const field = new THREE.Vector3(0, 0, 0);
        const k = 1;

        this.charges.forEach(charge => {
            const r = new THREE.Vector3().subVectors(position, charge.position);
            const distance = r.length();
            if (distance < 0.1) return;

            const magnitude = k * charge.type * charge.magnitude / (distance * distance);
            r.normalize().multiplyScalar(magnitude);
            field.add(r);
        });

        return field;
    }

    updateEquipotentials() {
        // Limpiar superficies anteriores
        this.equipotentialSurfaces.forEach(surface => this.scene.remove(surface));
        this.equipotentialSurfaces = [];

        if (!this.showEquipotential || this.charges.length === 0) return;

        // Encontrar rango de potencial
        let minV = Infinity;
        let maxV = -Infinity;

        for (let x = -10; x <= 10; x += 2) {
            for (let y = -10; y <= 10; y += 2) {
                for (let z = -10; z <= 10; z += 2) {
                    const V = this.calculatePotential(new THREE.Vector3(x, y, z));
                    if (Math.abs(V) < 100) { // Ignorar valores muy altos cerca de cargas
                        minV = Math.min(minV, V);
                        maxV = Math.max(maxV, V);
                    }
                }
            }
        }

        // Crear anillos equipotenciales en el plano Y=0
        const levels = this.equipotentialLevels;
        for (let i = 1; i <= levels; i++) {
            const V = minV + (maxV - minV) * i / (levels + 1);
            this.createEquipotentialRing(V);
        }
    }

    createEquipotentialRing(targetV) {
        const points = [];
        const resolution = 100;
        const maxRadius = 15;

        for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI * 2 / resolution) {
            // Buscar radio donde V = targetV
            let r = 0.5;
            for (; r < maxRadius; r += 0.2) {
                const x = r * Math.cos(angle);
                const z = r * Math.sin(angle);
                const V = this.calculatePotential(new THREE.Vector3(x, 0, z));

                if ((targetV > 0 && V <= targetV) || (targetV < 0 && V >= targetV)) {
                    points.push(new THREE.Vector3(x, 0, z));
                    break;
                }
            }
        }

        if (points.length > 10) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const color = targetV > 0 ? 0xff6b6b : 0x4dabf7;
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.6,
                linewidth: 2
            });

            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.equipotentialSurfaces.push(line);
        }
    }

    updateHeatmap() {
        if (!this.showHeatmap) {
            if (this.heatmapPlane) {
                this.heatmapPlane.visible = false;
            }
            return;
        }

        // Crear/actualizar plano con textura de potencial
        if (this.charges.length === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(256, 256);

        // Calcular rango de potencial
        let minV = Infinity;
        let maxV = -Infinity;

        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {
                const x = (i / 256) * 20 - 10;
                const z = (j / 256) * 20 - 10;
                const V = this.calculatePotential(new THREE.Vector3(x, 0, z));
                minV = Math.min(minV, V);
                maxV = Math.max(maxV, V);
            }
        }

        // Generar imagen
        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {
                const x = (i / 256) * 20 - 10;
                const z = (j / 256) * 20 - 10;
                const V = this.calculatePotential(new THREE.Vector3(x, 0, z));

                const normalized = (V - minV) / (maxV - minV);
                const color = this.getHeatmapColor(normalized);

                const idx = (j * 256 + i) * 4;
                imageData.data[idx] = color.r;
                imageData.data[idx + 1] = color.g;
                imageData.data[idx + 2] = color.b;
                imageData.data[idx + 3] = 200; // Alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Actualizar textura 3D
        if (this.heatmapPlane) {
            this.scene.remove(this.heatmapPlane);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        this.heatmapPlane = new THREE.Mesh(geometry, material);
        this.heatmapPlane.rotation.x = -Math.PI / 2;
        this.heatmapPlane.position.y = -0.1;
        this.scene.add(this.heatmapPlane);

        // Actualizar canvas 2D
        this.updateHeatmapCanvas(minV, maxV);
    }

    updateHeatmapCanvas(minV, maxV) {
        const ctx = this.heatmapContext;
        const width = this.heatmapCanvas.width / window.devicePixelRatio;
        const height = this.heatmapCanvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, width, height);

        if (this.charges.length === 0) return;

        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const x = (i / width) * 20 - 10;
                const z = (j / height) * 20 - 10;
                const V = this.calculatePotential(new THREE.Vector3(x, 0, z));

                const normalized = (V - minV) / (maxV - minV);
                const color = this.getHeatmapColor(normalized);

                const idx = (j * width + i) * 4;
                imageData.data[idx] = color.r;
                imageData.data[idx + 1] = color.g;
                imageData.data[idx + 2] = color.b;
                imageData.data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Dibujar cargas
        ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
        this.charges.forEach(charge => {
            const screenX = (charge.position.x + 10) / 20 * width;
            const screenZ = (charge.position.z + 10) / 20 * height;

            ctx.beginPath();
            ctx.arc(screenX, screenZ, 5, 0, Math.PI * 2);
            ctx.fillStyle = charge.type > 0 ? '#ef4444' : '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    getHeatmapColor(value) {
        // Color map: azul -> cyan -> verde -> amarillo -> rojo
        value = Math.max(0, Math.min(1, value));

        let r, g, b;

        if (value < 0.25) {
            const t = value / 0.25;
            r = 0;
            g = Math.floor(t * 255);
            b = 255;
        } else if (value < 0.5) {
            const t = (value - 0.25) / 0.25;
            r = 0;
            g = 255;
            b = Math.floor((1 - t) * 255);
        } else if (value < 0.75) {
            const t = (value - 0.5) / 0.25;
            r = Math.floor(t * 255);
            g = 255;
            b = 0;
        } else {
            const t = (value - 0.75) / 0.25;
            r = 255;
            g = Math.floor((1 - t) * 255);
            b = 0;
        }

        return { r, g, b };
    }

    updateFieldVectors() {
        // Limpiar vectores anteriores
        this.fieldVectors.forEach(vector => this.scene.remove(vector));
        this.fieldVectors = [];

        if (!this.showFieldVectors || this.charges.length === 0) return;

        const gridSize = 8;
        const spacing = 2;

        for (let x = -gridSize; x <= gridSize; x += spacing) {
            for (let z = -gridSize; z <= gridSize; z += spacing) {
                const pos = new THREE.Vector3(x, 0, z);

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

                const length = Math.min(field.length() * 0.3, 1.5);
                const dir = field.clone().normalize();
                const color = field.length() > 1 ? 0xffd700 : 0x9ca3af;

                const arrow = new THREE.ArrowHelper(dir, pos, length, color, 0.2, 0.15);
                arrow.line.material.transparent = true;
                arrow.line.material.opacity = 0.6;
                arrow.cone.material.transparent = true;
                arrow.cone.material.opacity = 0.6;

                this.scene.add(arrow);
                this.fieldVectors.push(arrow);
            }
        }
    }

    calculatePotentialAtPoint() {
        const x = parseFloat(document.getElementById('point-x-2').value);
        const y = parseFloat(document.getElementById('point-y-2').value);
        const z = parseFloat(document.getElementById('point-z-2').value);

        const point = new THREE.Vector3(x, y, z);
        const V = this.calculatePotential(point);
        const E = this.calculateElectricField(point);

        this.showPointMarker(point, E);

        const resultDiv = document.getElementById('potential-result');
        resultDiv.classList.add('active');

        resultDiv.innerHTML = `
            <h4>Potencial en P(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})</h4>
            <div class="result-data">
                <strong>Potencial V:</strong><br>
                V = <span class="highlight">${V.toFixed(4)}</span> V<br>
                <br>
                <strong>Campo Eléctrico E = -∇V:</strong><br>
                Ex = <span class="highlight">${E.x.toFixed(4)}</span> N/C<br>
                Ey = <span class="highlight">${E.y.toFixed(4)}</span> N/C<br>
                Ez = <span class="highlight">${E.z.toFixed(4)}</span> N/C<br>
                |E| = <span class="highlight">${E.length().toFixed(4)}</span> N/C<br>
                <br>
                <strong>Nota:</strong> k = 1 (unidades simplificadas)
            </div>
        `;
    }

    showPointMarker(position, field) {
        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
        }

        this.pointMarker = new THREE.Group();

        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.pointMarker.add(sphere);

        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.pointMarker.add(glow);

        if (field.length() > 0.01) {
            const dir = field.clone().normalize();
            const length = Math.min(field.length() * 0.8, 5);
            const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), length, 0xfbbf24, 0.5, 0.3);
            this.pointMarker.add(arrow);
        }

        this.pointMarker.position.copy(position);
        this.scene.add(this.pointMarker);
    }

    updateChargesList() {
        const chargesList = document.getElementById('charges-list-2');
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
        this.updateEquipotentials();
        this.updateHeatmap();
        this.updateFieldVectors();
    }

    clearAll() {
        this.charges.forEach(charge => this.scene.remove(charge.mesh));
        this.charges = [];

        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
            this.pointMarker = null;
        }

        this.updateChargesList();
        this.updateEquipotentials();
        this.updateHeatmap();
        this.updateFieldVectors();
    }

    // Ejemplos predefinidos
    loadDipoleExample() {
        this.clearAll();
        this.addCharge(new THREE.Vector3(-1, 0, 0), 1, 5);
        this.addCharge(new THREE.Vector3(1, 0, 0), -1, 5);

        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);

        document.getElementById('point-x-2').value = 0;
        document.getElementById('point-y-2').value = 1;
        document.getElementById('point-z-2').value = 0;
    }

    loadTwoPositiveExample() {
        this.clearAll();
        this.addCharge(new THREE.Vector3(-2, 0, 0), 1, 5);
        this.addCharge(new THREE.Vector3(2, 0, 0), 1, 5);

        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
    }

    loadSquareExample() {
        this.clearAll();
        const r = 3;
        this.addCharge(new THREE.Vector3(r, 0, r), 1, 5);
        this.addCharge(new THREE.Vector3(-r, 0, r), -1, 5);
        this.addCharge(new THREE.Vector3(-r, 0, -r), 1, 5);
        this.addCharge(new THREE.Vector3(r, 0, -r), -1, 5);

        this.camera.position.set(0, 20, 15);
        this.camera.lookAt(0, 0, 0);
    }

    resetCamera() {
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    onWindowResize() {
        const container = document.getElementById('canvas-container-potential');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

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
    // Esperar un momento para que el tab system se inicialice
    setTimeout(() => {
        window.potentialSim = new PotentialSimulation();
    }, 100);
});
