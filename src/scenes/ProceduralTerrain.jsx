import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import proceduralVertexShader from '../shaders/procedural/vertex.glsl'
import proceduralFragmentShader from '../shaders/procedural/fragment.glsl'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

const ProceduralTerrain = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            colorWaterDeep: '#002b3d',
            colorWaterSurface: '#66a8ff',
            colorSand: '#ffe984',
            colorGrass: '#85d534',
            colorSnow: '#ffffff',
            colorRock: '#bfbd8d',
        };

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI();

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();
        const rgbeLoader = new RGBELoader()

        rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping

            scene.background = environmentMap
            scene.backgroundBlurriness = 0.5
            scene.environment = environmentMap
        })

        // Geometry
        const geometry = new THREE.PlaneGeometry(10, 10, 500, 500)
        geometry.rotateX(-Math.PI / 2)
        geometry.deleteAttribute('uv')
        geometry.deleteAttribute('normal')

        // Uniforms
        const uniforms = {
            uPositionFrequency: new THREE.Uniform(0.2),
            uStrength: new THREE.Uniform(2.5),
            uWarpedFrequency: new THREE.Uniform(5.0),
            uWarpedStrength: new THREE.Uniform(0.5),
            uTime: new THREE.Uniform(0),

            uColorWaterDeep: new THREE.Uniform(new THREE.Color(settingsObj.colorWaterDeep)),
            uColorWaterSurface: new THREE.Uniform(new THREE.Color(settingsObj.colorWaterSurface)),
            uColorSand: new THREE.Uniform(new THREE.Color(settingsObj.colorSand)),
            uColorGrass: new THREE.Uniform(new THREE.Color(settingsObj.colorGrass)),
            uColorSnow: new THREE.Uniform(new THREE.Color(settingsObj.colorSnow)),
            uColorRock: new THREE.Uniform(new THREE.Color(settingsObj.colorRock)),
        }
        gui.add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency')
        gui.add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength')
        gui.add(uniforms.uWarpedFrequency, 'value', 0, 10, 0.001).name('uWarpedFrequency')
        gui.add(uniforms.uWarpedStrength, 'value', 0, 1, 0.001).name('uWarpedStrength')

        gui.addColor(settingsObj,'colorWaterDeep').onChange(()=> uniforms.uColorWaterDeep.value.set(settingsObj.colorWaterDeep))
        gui.addColor(settingsObj,'colorWaterSurface').onChange(()=> uniforms.uColorWaterSurface.value.set(settingsObj.colorWaterSurface))
        gui.addColor(settingsObj,'colorSand').onChange(()=> uniforms.uColorSand.value.set(settingsObj.colorSand))
        gui.addColor(settingsObj,'colorGrass').onChange(()=> uniforms.uColorGrass.value.set(settingsObj.colorGrass))
        gui.addColor(settingsObj,'colorSnow').onChange(()=> uniforms.uColorSnow.value.set(settingsObj.colorSnow))
        gui.addColor(settingsObj,'colorRock').onChange(()=> uniforms.uColorRock.value.set(settingsObj.colorRock))

        // Material
        const material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshStandardMaterial,
            vertexShader: proceduralVertexShader,
            fragmentShader: proceduralFragmentShader,
            uniforms: uniforms,
            silent: true,
            metalness: 0,
            roughness: 0.5,
            color: '#85d534',
        })

        const depthMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshDepthMaterial,
            vertexShader: proceduralVertexShader,
            uniforms: uniforms,
            silent: true,
            depthPacking: THREE.RGBADepthPacking,
        })


        //Mesh Object
        //Terrain
        const terrain = new THREE.Mesh(geometry, material)
        terrain.receiveShadow = true
        terrain.castShadow = true
        terrain.customDepthMaterial = depthMaterial
        scene.add(terrain)

        const water = new THREE.Mesh(
            new THREE.PlaneGeometry(10,10,1,1),
            new THREE.MeshPhysicalMaterial({
                transmission:1,
                roughness: 0.3
            })
        )
        water.rotation.x = -Math.PI/2
        water.position.y = -0.1
        scene.add(water)

        // Board
        const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11))
        const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10))
        // boardHole.position.y = 1.2
        // boardHole.updateMatrixWorld()

        // Evaluate (ONLY ONE LIKE THE TEXTURELOADER)
        const evaluate = new Evaluator()
        const board = evaluate.evaluate(boardFill, boardHole, SUBTRACTION)
        board.geometry.clearGroups()
        board.material = new THREE.MeshStandardMaterial({
            metalness: 0,
            roughness: 0.3
        })
        board.castShadow = true
        board.receiveShadow = true
        scene.add(board)

        // Camera
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(-2 + 3, 1 + 3, 2 + 3)
        scene.add(camera)

        // Lighting
        const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
        directionalLight.position.set(6.25, 3, 4)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.near = 0.1
        directionalLight.shadow.camera.far = 30
        directionalLight.shadow.camera.top = 8
        directionalLight.shadow.camera.right = 8
        directionalLight.shadow.camera.bottom = -8
        directionalLight.shadow.camera.left = -8
        scene.add(directionalLight)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

        // Resize
        const handleResize = () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update Camera
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            // Update Renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // --------- Animate function ---------
        const animate = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
            uniforms.uTime.value = elapsedTime

            controls.update()
            renderer.render(scene, camera)
            animateId = window.requestAnimationFrame(animate);
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            window.cancelAnimationFrame(animateId);
            renderer.dispose();
            gui.destroy();
            window.removeEventListener('resize', handleResize);
        };

    }, [])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default ProceduralTerrain