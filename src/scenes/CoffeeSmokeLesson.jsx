import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import coffeeSmokeVertexShaders from '../shaders/coffeesmoke/vertex.glsl'
import coffeeSmokeFragmentShaders from '../shaders/coffeesmoke/fragment.glsl'


const CoffeeSmokeLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
    let rotationTrigger = false;
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            toggleRotation: () => {
                if (rotationTrigger) {
                    rotationTrigger = false;
                    rotation = 0.003;
                } else {
                    rotationTrigger = true;
                    rotation = 0;
                }
            }
        };

        //Texture loader 
        const textureLoader = new THREE.TextureLoader()

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // GLTF LOADER
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        let mixer = null

        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        gltfLoader.load('/models/bakedModel.glb',
            (gltf) => {
                scene.add(gltf.scene)
            }
        )

        // SMOKE
        const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
        smokeGeometry.translate(0, 0.5, 0) // Changes origin of geometry form centre to the bottom due to it moving up
        smokeGeometry.scale(1.5, 6, 1.5)

        const perlinTexture = textureLoader.load('/perlin.png')
        perlinTexture.wrapS = THREE.RepeatWrapping
        perlinTexture.wrapT = THREE.RepeatWrapping

        const smokeMaterial = new THREE.ShaderMaterial({
            vertexShader: coffeeSmokeVertexShaders,
            fragmentShader: coffeeSmokeFragmentShaders,
            side: THREE.DoubleSide,
            // wireframe: true,
            uniforms: {
                uTime: new THREE.Uniform(0),
                uPerlinTexture: new THREE.Uniform(perlinTexture)
            },
            transparent: true,
            depthWrite: false
        })

        const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
        smoke.position.y = 1.83
        scene.add(smoke)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(1, 3, 3)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)


        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.target.set(0, 3.2, 0)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true

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

            //Update 
            if (mixer != null) {
                mixer.update(deltaTime)
            }

            smokeMaterial.uniforms.uTime.value = elapsedTime;

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

export default CoffeeSmokeLesson