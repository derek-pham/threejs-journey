import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/Addons.js';


const ParticlesLesson = () => {
    const canvasRef = useRef()

    useEffect(() => {
        // Canvas
        const canvas = canvasRef.current

        // Scene
        const scene = new THREE.Scene()

        //  Textures
        const textureLoader = new THREE.TextureLoader()
        const particleTexture = textureLoader.load('/textures/particles/2.png')
        // particleTexture.colorSpace = THREE.SRGBColorSpace

        // Particles
        const customGeometry = new THREE.BufferGeometry()
        const count = 5000
        const positions = new Float32Array(count * 3) // xyz, xyz, xyz, xyz, 
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2
        }
        const colors = new Float32Array(count * 3) // rgb, rgb, rgb, rgb, rgb,
        for (let i = 0; i < count * 3; i++) {
            colors[i] = Math.random()
        }
        customGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        customGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const particleGeometry = new THREE.SphereGeometry(1, 32, 32)
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.04,
            sizeAttenuation: true,
            // color: 'red',
            alphaMap: particleTexture,
            transparent: true,
            // alphaTest: 0.001,
            // depthTest: false,
            depthWrite: false,
            // blending: THREE.AdditiveBlending,
            vertexColors: true

        })
        console.log(particleGeometry)
        const particles = new THREE.Points(customGeometry, particleMaterial)
        scene.add(particles)

        // Meshes
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 'white' })
        )
        scene.add(cube)

        // Camera
        const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.render(scene, camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Clock
        const clock = new THREE.Clock()

        // --------- Animate function ---------
        function animate() {
            const elapsedTime = clock.getElapsedTime()

            // Update particles
            // particles.rotation.y = elapsedTime * 0.02
            for (let i = 0; i < count; i++) {
                const i3 = i * 3
                const x = customGeometry.attributes.position.array[i3];
                customGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
            }

            customGeometry.attributes.position.needsUpdate = true
            controls.update();
            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

        // Resize
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.render(scene, camera)
        })

        // --------- Clean up function ---------
        return () => {
            renderer.dispose();
        };

    }, [])

    return (
        <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
    )
}

export default ParticlesLesson