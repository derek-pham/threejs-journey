import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

const IntroAndLoadLesson = () => {
    const canvasRef = useRef();
    const loadingBarRef = useRef(null);
    const [isEnded, setIsEnded] = useState(false);
    let rotation = 0.003;
    let rotationTrigger = false; let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const debugObject = {}

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI();
        const loadingBarElement = loadingBarRef.current;
        console.log(loadingBarElement)
        const loadingManager = new THREE.LoadingManager(
            //Loaded
            () => {
                setTimeout(() => {
                    gsap.to(overlayMaterial.uniforms.uAlpha, {
                        value: 0,
                        duration: 2
                    })
                    setIsEnded(true);
                    loadingBarElement.style.transform = ``
                }, 500)

            },

            //Progress
            (itemUrl, itemsLoaded, itemsTotal) => {
                const progressRatio = itemsLoaded / itemsTotal
                loadingBarElement.style.transform = `scaleX(${progressRatio})`
            },
        )
        const gltfLoader = new GLTFLoader(loadingManager)
        const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Environment Map
        const environmentMap = cubeTextureLoader.load([
            '/environmentMaps/0/px.jpg',
            '/environmentMaps/0/nx.jpg',
            '/environmentMaps/0/py.jpg',
            '/environmentMaps/0/ny.jpg',
            '/environmentMaps/0/pz.jpg',
            '/environmentMaps/0/nz.jpg'
        ])
        environmentMap.colorSpace = THREE.SRGBColorSpace

        scene.background = environmentMap
        scene.environment = environmentMap

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })

        //Mesh Object
        const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        const overlayMaterial = new THREE.ShaderMaterial({
            transparent: true,
            color: 0xff0000,
            uniforms: {
                uAlpha: new THREE.Uniform(1)
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position,1.0);

                }
            `,
            fragmentShader: `
            uniform float uAlpha;

                void main() {
                    gl_FragColor = vec4(0.3,0.1,0.6,uAlpha);
                }
            `
        })
        const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial)
        scene.add(overlayMesh)

        const updateAllMaterials = () => {
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    // child.material.envMap = environmentMap
                    child.material.envMapIntenksity = debugObject.envMapIntensity
                    child.material.needsUpdate = true
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }

        gltfLoader.load(
            '/models/FlightHelmet/glTF/FlightHelmet.gltf',
            (gltf) => {
                gltf.scene.scale.set(10, 10, 10)
                gltf.scene.position.set(0, - 4, 0)
                gltf.scene.rotation.y = Math.PI * 0.5
                scene.add(gltf.scene)

                updateAllMaterials()
            }
        )

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
        camera.position.set(4, 1, - 4)
        scene.add(camera)

        // Lights
        const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
        directionalLight.castShadow = true
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(0.25, 3, - 2.25)
        scene.add(directionalLight)


        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        })
        renderer.toneMapping = THREE.ReinhardToneMapping
        renderer.toneMappingExposure = 3
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
            <div ref={loadingBarRef} className={`loading-bar ${isEnded ? 'ended' : ''}`}></div>
        </>
    )
}

export default IntroAndLoadLesson