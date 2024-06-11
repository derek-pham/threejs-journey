import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
const TexturesLesson = () => {
    const canvasRef = useRef();

    useEffect(() => {
        // GUI
        const gui = new GUI()

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Textures
        const loadingManager = new THREE.LoadingManager() // Create Loading Manager and then PASS into textureLoader
        loadingManager.onStart = () => console.log('onStart')
        loadingManager.onProgress = () => console.log('onProgress')
        loadingManager.onLoad = () => console.log('onLoad')

        const textureLoader = new THREE.TextureLoader(loadingManager) // Created a TextureLoader. Can reuse to load multiple textures
        const colorTexture = textureLoader.load(imageColorSource) // Use TextureLoader to load texture source   
        colorTexture.colorSpace = THREE.SRGBColorSpace // Fix colors !important!
        const checkerboard1024Texture = textureLoader.load(checkerboard1024) // Use TextureLoader to load texture source   
        const checkerboard8Texture = textureLoader.load(checkerboard8) // Use TextureLoader to load texture source   
        const minecraftTexture = textureLoader.load(minecraft) // Use TextureLoader to load texture source   
        minecraftTexture.colorSpace = THREE.SRGBColorSpace
        const normalTexture = textureLoader.load(imageNormalSource) // Use TextureLoader to load texture source   
        const roughnessTexture = textureLoader.load(imageRoughnessSource) // Use TextureLoader to load texture source   
        const ambOccTexture = textureLoader.load(imageAmbOccSource) // Use TextureLoader to load texture source   

        colorTexture.repeat.x = 1
        colorTexture.repeat.y = 1
        gui.add(colorTexture.repeat, 'y').min(1).max(6).step(0.1).name('Repeat y')
        gui.add(colorTexture.repeat, 'x').min(1).max(6).step(0.1).name('Repeat x')
        colorTexture.wrapS = THREE.RepeatWrapping
        colorTexture.wrapT = THREE.RepeatWrapping

        gui.add(colorTexture.offset, 'y').min(1).max(6).step(0.1).name('Offset y')
        gui.add(colorTexture.offset, 'x').min(1).max(6).step(0.1).name('Offset x')

        colorTexture.center.x = 0.5 // Center the pivot point of rotation
        colorTexture.center.y = 0.5
        gui.add(colorTexture, 'rotation').min(0).max(Math.PI * 2).step(0.1).name('Rotate Texture')

        // checkerboard8Texture.minFilter = THREE.NearestFilter
        checkerboard8Texture.magFilter = THREE.NearestFilter

        minecraftTexture.minFilter = THREE.NearestFilter
        minecraftTexture.magFilter = THREE.NearestFilter

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        console.log(geometry.attributes.uv)

        // Material
        const material = new THREE.MeshBasicMaterial({ map: minecraftTexture })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.render(scene, camera) // Initiate rendering the scene

        // Resize
        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            //Update Camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            //Update Renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        // --------- Animate function ---------
        const animate = () => {
            // mesh.rotation.y += 0.003
            // colorTexture.rotation += 0.001

            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            renderer.dispose();
        };

    }, [])

    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default TexturesLesson