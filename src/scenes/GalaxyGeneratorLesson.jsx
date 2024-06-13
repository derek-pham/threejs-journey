import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const GalaxyGeneratorLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
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
        const cubegeometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })


        //Mesh Object
        const mesh = new THREE.Mesh(cubegeometry, material)


        // scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.rotation.x = Math.PI / 2
        plane.rotation.y = Math.PI
        plane.position.y = -1
        // scene.add(plane)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 3, 2)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)

        // Galaxy Function
        const parameters = {}
        parameters.count = 100000;
        parameters.size = 0.01
        parameters.radius = 6
        parameters.branches = 3
        parameters.spin = 1
        parameters.randomness = 0.02
        parameters.randomnessPower = 3
        parameters.insideColor = '#ff6030'
        parameters.outsideColor = '#1b3984'
        let geometry = null;
        let pointsMaterial = null;
        let points = null;

        const generateGalaxy = () => {
            // Reset Galaxy
            if (points !== null) {
                geometry.dispose()
                pointsMaterial.dispose()
                scene.remove(points)
            }
            geometry = new THREE.BufferGeometry()

            const positions = new Float32Array(parameters.count * 3)
            const colors = new Float32Array(parameters.count * 3)
            const colorInside = new THREE.Color(parameters.insideColor)
            const colorOutside = new THREE.Color(parameters.outsideColor)


            for (let i = 0; i < parameters.count; i++) {
                const startIndex = i * 3
                //Position
                const radius = Math.random() * parameters.radius
                const branchAngle = i % parameters.branches / parameters.branches * Math.PI * 2
                const spinAngle = radius * parameters.spin

                const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
                const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
                const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

                positions[startIndex] = Math.cos(branchAngle + spinAngle) * radius + randomX
                positions[startIndex + 1] = 0 + randomY
                positions[startIndex + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

                // Color
                const mixedColor = colorInside.clone()
                mixedColor.lerp(colorOutside, radius / parameters.radius + 0.2)

                colors[startIndex] = mixedColor.r
                colors[startIndex + 1] = mixedColor.g
                colors[startIndex + 2] = mixedColor.b


            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
            pointsMaterial = new THREE.PointsMaterial({
                size: parameters.size,
                sizeAttenuation: true,
                depthWrite: true,
                blending: THREE.AdditiveBlending,
                vertexColors: true
            })
            points = new THREE.Points(geometry, pointsMaterial)
            scene.add(points)
        }
        generateGalaxy()

        gui.add(parameters, 'count').min(100).max(10000).step(10).name('count').onFinishChange(generateGalaxy)
        gui.add(parameters, 'size').min(0.01).max(0.1).step(0.001).name('size').onFinishChange(generateGalaxy)
        gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).name('radius').onFinishChange(generateGalaxy)
        gui.add(parameters, 'branches').min(2).max(20).step(1).name('branches').onFinishChange(generateGalaxy)
        gui.add(parameters, 'spin').min(-5).max(5).step(0.01).name('spin').onFinishChange(generateGalaxy)
        gui.add(parameters, 'randomness').min(0).max(2).step(0.01).name('randomness').onFinishChange(generateGalaxy)
        gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('randomnessPower').onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'insideColor').name('insideColor').onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'outsideColor').name('outsideColor').onFinishChange(generateGalaxy)

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

        const clock = new THREE.Clock()
        const color = new THREE.Color

        // --------- Animate function ---------
        const animate = () => {
            mesh.rotation.y += rotation
            mesh.rotation.x -= rotation / 2

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

export default GalaxyGeneratorLesson