import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const ShadowsLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.000;
    let rotationTrigger = false;

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

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Textures
        const textureLoader = new THREE.TextureLoader()
        const bakedShadow = textureLoader.load('/textures/shadows/bakedShadow.jpg')
        bakedShadow.colorSpace = THREE.SRGBColorSpace
        const simpleShadow = textureLoader.load('/textures/shadows/simpleShadow.jpg')
        simpleShadow.colorSpace = THREE.SRGBColorSpace


        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))
        mesh.castShadow = true

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.rotation.x = Math.PI / 2
        plane.rotation.y = Math.PI
        plane.position.y = -1
        plane.receiveShadow = true
        scene.add(plane)

        const meshShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1.5),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                alphaMap: simpleShadow
            })
        )
        meshShadow.rotation.x = -Math.PI / 2
        meshShadow.position.y = plane.position.y + 0.01
        scene.add(meshShadow)
        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 0.5)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)
        directionalLight.castShadow = true

        directionalLight.shadow.mapSize.width = 1024
        directionalLight.shadow.mapSize.height = 1024
        directionalLight.shadow.camera.top = 2
        directionalLight.shadow.camera.bottom = -2
        directionalLight.shadow.camera.left = 2
        directionalLight.shadow.camera.right = -2
        directionalLight.shadow.camera.near = 0.001
        directionalLight.shadow.camera.far = 4
        // directionalLight.shadow.radius = 4

        const directionalLightShadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
        directionalLightShadowCameraHelper.visible = false
        gui.add(directionalLightShadowCameraHelper, 'visible').name('directionalLightShadowCameraHelper')
        scene.add(directionalLightShadowCameraHelper)

        // SPOTLIGHT
        const spotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI * 0.3)
        spotLight.position.y = 1.8
        spotLight.position.x = 1.8
        spotLight.castShadow = true
        // spotLight.shadow.camera.near = 0.001
        spotLight.shadow.mapSize.width = 1024
        spotLight.shadow.mapSize.height = 1024
        spotLight.shadow.camera.fov = 40
        spotLight.shadow.camera.near = 1
        spotLight.shadow.camera.far = 6.5
        scene.add(spotLight)
        scene.add(spotLight.target)

        const spotLightShadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
        spotLightShadowCameraHelper.visible = false
        gui.add(spotLightShadowCameraHelper, 'visible').name('spotLightShadowCameraHelper')
        scene.add(spotLightShadowCameraHelper)

        //POINT LIGHT
        const pointLight = new THREE.PointLight(0xffffff, 50)
        pointLight.position.set(0, 3, -0.5)
        pointLight.castShadow = true
        pointLight.shadow.mapSize.set(1024, 1024)
        pointLight.shadow.camera.near = 2
        pointLight.shadow.camera.far = 4.25
        scene.add(pointLight)

        const pointLightShadowCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
        pointLightShadowCameraHelper.visible = false
        gui.add(pointLightShadowCameraHelper, 'visible').name('pointLightShadowCameraHelper')
        scene.add(pointLightShadowCameraHelper)


        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        // ENABLE SHADOWS
        // renderer.shadowMap.enabled = true
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap
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

        const clock = new THREE.Clock()

        // --------- Animate function ---------
        const animate = () => {
            const elapsedTime = clock.getElapsedTime()
            mesh.rotation.y += rotation
            mesh.rotation.x -= rotation / 2

            // Update Cube for shadow
            mesh.position.x = Math.sin(elapsedTime)
            mesh.position.z = Math.cos(elapsedTime)
            mesh.position.y = Math.abs(Math.sin(elapsedTime * 4))

            meshShadow.position.x = mesh.position.x
            meshShadow.position.z = mesh.position.z
            meshShadow.material.opacity = 1 - mesh.position.y

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

export default ShadowsLesson