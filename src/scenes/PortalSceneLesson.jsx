import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const PortalSceneLesson = () => {
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
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)
        const textureLoader = new THREE.TextureLoader()

        //TEXTURE
        const bakedTexture = textureLoader.load('portal/baked3-final.jpg')
        bakedTexture.flipY = false
        bakedTexture.colorSpace = THREE.SRGBColorSpace

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })
        const bakedMaterial = new THREE.MeshBasicMaterial({
            map: bakedTexture
        })

        const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
        const portalMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

        //Mesh Object
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = -1
        // scene.add(plane)

        gltfLoader.load('/portal/Portal4.glb', (gltf) => {
            const mergedMesh = gltf.scene.children.find(child =>  child.name === 'mergedObject')
            const poleLightAMesh = gltf.scene.children.find(child =>  child.name === 'poleLightA')
            const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')
            const portalMesh = gltf.scene.children.find(child => child.name === 'Portal')
            
            mergedMesh.material = bakedMaterial
            poleLightAMesh.material = poleLightMaterial
            poleLightBMesh.material = poleLightMaterial
            portalMesh.material = portalMaterial

            scene.add(gltf.scene)
        })

        // Camera
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 1, 2)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)


        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

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

export default PortalSceneLesson