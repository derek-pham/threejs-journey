import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader, RGBELoader, DRACOLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const RealisticRender = () => {
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

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // GLTF Loader
        const gltfLoader = new GLTFLoader()
        const rgbeLoader = new RGBELoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        gltfLoader.setDRACOLoader(dracoLoader)

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Texture Loader
        const textureLoader = new THREE.TextureLoader()
        const brickAORoughnessMetalnessTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg')
        const brickTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg')
        const brickNormalTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg')
        brickTexture.colorSpace = THREE.SRGBColorSpace

        const woodTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg')
        const woodNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png')
        const woodAORoughnessMetalnessTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg')
        woodTexture.colorSpace = THREE.SRGBColorSpace

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
        plane.position.y = -1
        // scene.add(plane)

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            new THREE.MeshStandardMaterial({
                map: woodTexture,
                aoMap: woodAORoughnessMetalnessTexture,
                roughness: woodAORoughnessMetalnessTexture,
                metalnessMap: woodAORoughnessMetalnessTexture,
                normalMap: woodNormalTexture
            })
        )
        floor.rotation.x = -Math.PI / 2
        scene.add(floor)

        const brickWall = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            new THREE.MeshStandardMaterial({
                map: brickTexture,
                aoMap: brickAORoughnessMetalnessTexture,
                roughness: brickAORoughnessMetalnessTexture,
                metalnessMap: brickAORoughnessMetalnessTexture,
                normalMap: brickNormalTexture
            })
        )
        brickWall.position.y = 2.5
        brickWall.position.z = -2.5
        scene.add(brickWall)

        let flightHelmetModel
        // gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
        //     flightHelmetModel = gltf.scene
        //     flightHelmetModel.scale.set(4, 4, 4)
        //     // scene.add(flightHelmetModel)
        //     scene.traverse((child) => {
        //         if (child.isMesh && child.material.isMeshStandardMaterial) {

        //             child.castShadow = true
        //             child.receiveShadow = true
        //         }
        //     })
        // })

        let hamburgerModel
        gltfLoader.load('/models/Hamburger.gltf', (gltf) => {
            hamburgerModel = gltf.scene
            hamburgerModel.scale.set(0.4, 0.4, 0.4)
            scene.add(hamburgerModel)
            scene.traverse((child) => {
                if (child.isMesh && child.material.isMeshStandardMaterial) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        })

        // Environment Map
        rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping
            environmentMap.colorSpace = THREE.SRGBColorSpace
            scene.background = environmentMap
            scene.environment = environmentMap
        })
        // gui.add(scene, 'environmentIntensity').min(1).max(10).step(0.01)
        // gui.add(scene, 'backgroundIntensity').min(1).max(10).step(0.01)
        gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
        gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('backgroundRotationY')
        gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('environmentRotationY')

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        // scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 6)
        directionalLight.castShadow = true
        directionalLight.position.set(-4, 6.5, 2.5)
        directionalLight.target.position.set(0, 1, 0)
        directionalLight.target.updateWorldMatrix()
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.mapSize.set(512, 512)
        directionalLight.shadow.normalBias = 0.027
        directionalLight.shadow.bias = -0.004
        gui.add(directionalLight.shadow,'normalBias').min(-0.05).max(0.05).step(0.001)
        gui.add(directionalLight.shadow,'bias').min(-0.05).max(0.05).step(0.001)

        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLightintensity')
        gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.01).name('directionalLightX')
        gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.01).name('directionalLightY')
        gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.01).name('directionalLightZ')
        gui.add(directionalLight, 'castShadow')
        scene.add(directionalLight)

        const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
        scene.add(directionalLightHelper)


        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 3, 3)
        scene.add(camera)
        // camera.lookAt(0,1,0)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.target = new THREE.Vector3(0, 0.5, 0);

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // antialias: true
        })

        renderer.toneMapping = THREE.ReinhardToneMapping
        renderer.toneMappingExposure = 3
        gui.add(renderer, 'toneMappingExposure')
        gui.add(renderer, 'toneMapping', {
            No: THREE.NoToneMapping,
            Linear: THREE.LinearToneMapping,
            Reinhard: THREE.ReinhardToneMapping,
            Cineon: THREE.CineonToneMapping,
            ACESFilmic: THREE.ACESFilmicToneMapping,
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFShadowMap

        // Update All Material
        const updateAllMaterials = () => {
            scene.traverse((child) => {
                if (child.isMesh) {
                    // ...

                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }
        // updateAllMaterials()
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
            // updateAllMaterials()
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
            mesh.rotation.y += rotation
            mesh.rotation.x -= rotation / 2

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

export default RealisticRender