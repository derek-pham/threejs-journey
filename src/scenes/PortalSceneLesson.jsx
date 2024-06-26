import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import fireflyVertexShader from '../shaders/portal/fireflies/vertex.glsl'
import fireflyFragmentShader from '../shaders/portal/fireflies/fragment.glsl'
import portalVertexShader from '../shaders/portal/vertex.glsl'
import portalFragmentShader from '../shaders/portal/fragment.glsl'

const PortalSceneLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            clearColor: '#13203f',
            uColorStart: new THREE.Color(0xbdbdff),
            uColorEnd: new THREE.Color(0xffe0ee),
        };

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI()

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

        // FIREFLIES
        const firefliesGeometry = new THREE.BufferGeometry()
        const firefliesCount = 30
        const positionArray = new Float32Array(firefliesCount * 3)
        const scaleArray = new Float32Array(firefliesCount)

        for (let i = 0; i < firefliesCount; i++) {
            let i3 = i * 3

            positionArray[i3 + 0] = (Math.random() - 0.5) * 4
            positionArray[i3 + 1] = Math.random() * 3
            positionArray[i3 + 2] = (Math.random() - 0.5) * 4

            scaleArray[i] = Math.random()
        }

        firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
        firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })
        const bakedMaterial = new THREE.MeshBasicMaterial({
            map: bakedTexture
        })

        const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
        const portalMaterial = new THREE.ShaderMaterial({
            vertexShader: portalVertexShader,
            fragmentShader: portalFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColorStart: { value: settingsObj.uColorStart },
                uColorEnd: { value: settingsObj.uColorEnd },
            },

        })

        gui.addColor(settingsObj, 'uColorStart').onChange(() => {
            portalMaterial.uniforms.uColorStart.value.set(settingsObj.uColorStart)
        })
        gui.addColor(settingsObj, 'uColorEnd').onChange(() => {
            portalMaterial.uniforms.uColorEnd.value.set(settingsObj.uColorEnd)

        })
        const fireflyMaterial = new THREE.ShaderMaterial({
            vertexShader: fireflyVertexShader,
            fragmentShader: fireflyFragmentShader,
            uniforms: {
                uPixelRatio: { value: sizes.pixelRatio },
                uSize: { value: 100 },
                uTime: { value: 0 },
            },
            size: 0.1,
            sizeAttenuation: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        gui.add(fireflyMaterial.uniforms.uSize, 'value', 0, 500, 1).name("fireflySize")


        //Mesh Object
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = -1
        // scene.add(plane)

        const fireflies = new THREE.Points(firefliesGeometry, fireflyMaterial)
        scene.add(fireflies)

        gltfLoader.load('/portal/Portal4.glb', (gltf) => {
            const mergedMesh = gltf.scene.children.find(child => child.name === 'mergedObject')
            const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
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
        renderer.setClearColor(settingsObj.clearColor)
        gui.addColor(settingsObj, 'clearColor').onChange(() => {
            renderer.setClearColor(settingsObj.clearColor)
        })
        renderer.shadowMap.enabled = true

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

        // Resize
        const handleResize = () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update materials
            fireflyMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)

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

            fireflyMaterial.uniforms.uTime.value = elapsedTime
            portalMaterial.uniforms.uTime.value = elapsedTime

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