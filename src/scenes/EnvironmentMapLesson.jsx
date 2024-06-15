import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { GroundedSkybox } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const EnvironmentMapLesson = () => {
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

        // GLTF Loader
        const gltfLoader = new GLTFLoader()
        const exrLoader = new EXRLoader()
        const cubeTextureLoader = new THREE.CubeTextureLoader()
        const textureLoader = new THREE.TextureLoader()

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Environment Map
        // const environmentMap = cubeTextureLoader.load([
        //     '/environmentMaps/0/px.png',
        //     '/environmentMaps/0/nx.png',
        //     '/environmentMaps/0/py.png',
        //     '/environmentMaps/0/ny.png',
        //     '/environmentMaps/0/pz.png',
        //     '/environmentMaps/0/nz.png',
        // ])

        // scene.environment = environmentMap
        // scene.background = environmentMap

        // HDR RGBE equirectangular
        const rgbeLoader = new RGBELoader()
        // rgbeLoader.load('/environmentMaps/blender-2k.hdr', (environmentMap) => {
        //     environmentMap.mapping = THREE.EquirectangularReflectionMapping
        //     scene.environment = environmentMap
        //     scene.background = environmentMap
        // })

        // exrLoader.load('/environmentMaps/nvidiaCanvas-4k.exr', (environmentMap) => {
        //     environmentMap.mapping = THREE.EquirectangularReflectionMapping
        //     scene.environment = environmentMap
        //     scene.background = environmentMap
        // })

        // const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg')
        // environmentMap.mapping = THREE.EquirectangularReflectionMapping
        // environmentMap.colorSpace = THREE.SRGBColorSpace
        // scene.background = environmentMap
        // scene.environment = environmentMap

        // rgbeLoader.load('/environmentMaps/1/2k.hdr', (environmentMap) => {
        //     environmentMap.mapping = THREE.EquirectangularReflectionMapping
        //     const skybox = new GroundedSkybox(environmentMap, 15, 70)
        //     skybox.position.y = 15
        //     scene.add(skybox)
        //     // scene.environment = environmentMap
        //     // scene.background = environmentMap
        // })

        // Real-time environment map
        const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
        environmentMap.mapping = THREE.EquirectangularReflectionMapping
        environmentMap.colorSpace = THREE.SRGBColorSpace
        // scene.background = environmentMap


        scene.backgroundIntensity = 1
        scene.backgroundBlurriness = 0
        // scene.environmentRotation
        scene.environmentIntensity = 3
        gui.add(scene, 'environmentIntensity').min(1).max(10).step(0.01)
        gui.add(scene, 'backgroundIntensity').min(1).max(10).step(0.01)
        gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
        gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('backgroundRotationY')
        gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('environmentRotationY')

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        // scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = 0
        // scene.add(plane)

        const torusKnot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
            new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
        )
        torusKnot.position.x = -4
        torusKnot.position.y = 2
        scene.add(torusKnot)

        const holyDonut = new THREE.Mesh(
            new THREE.TorusGeometry(8, 0.5),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
        )
        holyDonut.position.y = 3.5
        scene.add(holyDonut)
        holyDonut.layers.enable(1)

        //Cube Render target
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            type: THREE.HalfFloatType
        })


        scene.environment = cubeRenderTarget.texture
        scene.background = cubeRenderTarget.texture

        const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
        cubeCamera.layers.set(1)

        // LOADING MODELS
        gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
            gltf.scene.scale.set(5, 5, 5)
            scene.add(gltf.scene)
        })

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 4, 4)
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
        if (holyDonut) {
            cubeCamera.update(renderer, scene)
        }
        // --------- Animate function ---------
        const animate = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
            mesh.rotation.y += rotation
            mesh.rotation.x -= rotation / 2

            if (holyDonut) {
                holyDonut.rotation.x = elapsedTime
                // cubeCamera.update(renderer, scene)
            }

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

export default EnvironmentMapLesson