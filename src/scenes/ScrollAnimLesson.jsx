import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

const ScrollAnimLesson = () => {
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
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Texture
        const textureLoader = new THREE.TextureLoader()
        const toonTexture = textureLoader.load('/textures/gradients/3.jpg')
        toonTexture.magFilter = THREE.NearestFilter

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        // scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        // gui.addColor(meshDebug, 'color').name("Colour")
        //     .onChange(() => mesh.material.color.set(meshDebug.color))

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.rotation.x = Math.PI / 2
        plane.rotation.y = Math.PI
        plane.position.y = -1
        // scene.add(plane)
        const objectMaterial = new THREE.MeshToonMaterial({ color: 'pink', gradientMap: toonTexture })
        gui.addColor(meshDebug, 'color').name("ToonMesh Colour")
            .onChange(() => objectMaterial.color.set(meshDebug.color))

        const object1 = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.4, 16, 69),
            objectMaterial
        )
        const object2 = new THREE.Mesh(
            new THREE.ConeGeometry(1, 2, 32),
            objectMaterial
        )
        const object3 = new THREE.Mesh(
            new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
            objectMaterial
        )
        scene.add(object1, object2, object3)

        const objectsDistance = 4
        object1.position.y = - objectsDistance * 0
        object2.position.y = - objectsDistance * 1
        object3.position.y = - objectsDistance * 2

        object1.position.x = 2
        object2.position.x = - 2
        object3.position.x = 2


        const sectionObjects = [object1, object2, object3]

        // Particles
        const particleCount = 800
        const positions = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 10
            positions[i * 3 + 1] = objectsDistance * 0.6 - Math.random() * objectsDistance * sectionObjects.length
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10
        }

        const particleGeometry = new THREE.BufferGeometry()
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const particleMaterial = new THREE.PointsMaterial({
            color: 'pink',
            sizeAttenuation: true,
            size: 0.02
        })

        const particles = new THREE.Points(particleGeometry, particleMaterial)
        scene.add(particles)


        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        // scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        directionalLight.position.set(1, 1, 0)
        scene.add(directionalLight)


        // Controls
        // const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true
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

        // Clock
        const clock = new THREE.Clock()
        let previousTime = 0

        //  Scroll
        let scrollY = window.scrollY
        let currentSection = 0

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY

            const newSection = Math.round(scrollY / sizes.height)
            // console.log(newSection)
            if (newSection != currentSection) {
                currentSection = newSection
                // console.log('changed', currentSection)
                gsap.to(sectionObjects[currentSection].rotation, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: '+=6',
                    y: '+=3',
                    z: '+=1.5',
                })
            }
        })

        // Cursor
        const cursor = {
            x: 0,
            y: 0
        }

        window.addEventListener('mousemove', (event) => {
            cursor.x = event.clientX / sizes.width - 0.5
            cursor.y = event.clientY / sizes.height - 0.5

            // console.log(cursor)
        })

        const cameraGroup = new THREE.Group()
        cameraGroup.add(camera)
        scene.add(cameraGroup)

        // --------- Animate function ---------
        const animate = () => {
            mesh.rotation.y += rotation
            mesh.rotation.x -= rotation / 2

            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - previousTime
            previousTime = elapsedTime

            // Animate Camera
            // Positive value makes the camera move UP which makes objects move DOWN
            camera.position.y = - scrollY / sizes.height * objectsDistance

            const parallaxX = cursor.x * 0.75
            const parallaxY = - cursor.y * 0.75

            cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime * 1.3
            cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime * 1.3

            //Animate objects
            for (const object of sectionObjects) {
                object.rotation.x += - deltaTime * 0.2
                object.rotation.y += deltaTime * 0.13
            }

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
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />
        </>
    )
}

export default ScrollAnimLesson