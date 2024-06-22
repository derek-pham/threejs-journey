import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import particlesVertexShader from '../shaders/morphing/vertex.glsl'
import particlesFragmentShader from '../shaders/morphing/fragment.glsl'
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';

const ParticlesMorphingLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
        };

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }
        // GUI
        const gui = new GUI();

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Loaders
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('./draco/')
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        // Camera
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 0, 8)
        scene.add(camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)


        // Models     
        let particles = null;

        gltfLoader.load('/models/models.glb', (gltf) => {
            particles = {}
            particles.index = 0

            // Positions
            const positions = gltf.scene.children.map((child) => {
                return (child.geometry.attributes.position)
            })
            particles.maxCount = 0
            for (const position of positions) {
                if (position.count > particles.maxCount) {
                    particles.maxCount = position.count
                }
            }
            particles.position = []
            for (const position of positions) {
                const originalArray = position.array
                const newArray = new Float32Array(particles.maxCount * 3)

                for (let i = 0; i < particles.maxCount; i++) {
                    const i3 = i * 3

                    if (i3 < originalArray.length) {
                        newArray[i3] = originalArray[i3]
                        newArray[i3 + 1] = originalArray[i3 + 1]
                        newArray[i3 + 2] = originalArray[i3 + 2]
                    }
                    else {
                        const randomIndex = Math.floor(position.count * Math.random()) * 3
                        newArray[i3] = originalArray[randomIndex + 0]
                        newArray[i3 + 1] = originalArray[randomIndex + 1]
                        newArray[i3 + 2] = originalArray[randomIndex + 2]
                    }
                }
                particles.position.push(new THREE.Float32BufferAttribute(newArray, 3))
            }

            // Geometry
            const sizesArray = new Float32Array(particles.maxCount)
            for (let i = 0; i < sizesArray.length; i++) {
                sizesArray[i] = Math.random()
            }
            particles.geometry = new THREE.BufferGeometry()
            particles.geometry.setAttribute('position', particles.position[particles.index])
            particles.geometry.setAttribute('aPositionTarget', particles.position[3])
            particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))
            // particles.geometry.setIndex(null)

            // Material
            particles.colorA = '#ff7300'
            particles.colorB = '#0091ff'
            particles.material = new THREE.ShaderMaterial({
                vertexShader: particlesVertexShader,
                fragmentShader: particlesFragmentShader,
                uniforms:
                {
                    uSize: new THREE.Uniform(0.15),
                    uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                    uProgress: new THREE.Uniform(0),
                    uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
                    uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
                },
                blending: THREE.AdditiveBlending,
                depthWrite: false,

            })

            // Mesh Object
            const sphere = new THREE.Points(particles.geometry, particles.material)
            scene.add(sphere)

            particles.morph = (index) => {

                particles.geometry.attributes.position = particles.position[particles.index]
                particles.geometry.attributes.aPositionTarget = particles.position[index]

                gsap.fromTo(particles.material.uniforms.uProgress,
                    { value: 0 },
                    { value: 1, duration: 3, ease: 'linear' },
                )

                particles.index = index
            }

            particles.morph0 = () => { particles.morph(0) }
            particles.morph1 = () => { particles.morph(1) }
            particles.morph2 = () => { particles.morph(2) }
            particles.morph3 = () => { particles.morph(3) }

            gui.addColor(particles, 'colorA').onChange(() => {
                particles.material.uniforms.uColorA.value.set(particles.colorA)
            })
            gui.addColor(particles, 'colorB').onChange(() => {
                particles.material.uniforms.uColorB.value.set(particles.colorB)
            })

            gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.01).name('uProgress').listen()
            gui.add(particles, 'morph0')
            gui.add(particles, 'morph1')
            gui.add(particles, 'morph2')
            gui.add(particles, 'morph3')




        })

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

            // Materials
            if (particles) {
                particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
            }


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

export default ParticlesMorphingLesson