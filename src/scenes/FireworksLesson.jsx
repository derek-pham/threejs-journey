import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import fireworksVertexShader from '../shaders/fireworks/vertex.glsl'
import fireworksFragmentShader from '../shaders/fireworks/fragment.glsl'
import gsap from 'gsap';
import { Sky } from 'three/examples/jsm/Addons.js';

const FireworksLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
    let rotationTrigger = false;
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
        };

        // GUI
        const gui = new GUI();

        // TextureLoader
        const textureLoader = new THREE.TextureLoader();

        const textures = [
            textureLoader.load('/particles/1.png'),
            textureLoader.load('/particles/2.png'),
            textureLoader.load('/particles/3.png'),
            textureLoader.load('/particles/4.png'),
            textureLoader.load('/particles/5.png'),
            textureLoader.load('/particles/6.png'),
            textureLoader.load('/particles/7.png'),
            textureLoader.load('/particles/8.png'),
            textureLoader.load('/particles/9.png'),
            textureLoader.load('/particles/10.png'),
            textureLoader.load('/particles/11.png'),
        ]

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        //Mesh Objects

        // Camera
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2.0)
        }
        sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 1.5)
        scene.add(camera)


        // -- FIREWORK FUNCTION --
        function generateFirework(count, position, size, texture, radius, color) {
            // Geometry
            const positionsArray = new Float32Array(count * 3)
            const sizesArray = new Float32Array(count)
            const timeMultipliersArray = new Float32Array(count)
            for (let i = 0; i < positionsArray.length; i++) {
                const i3 = i * 3

                const spherical = new THREE.Spherical(
                    radius * (0.75 + Math.random() * 0.25),
                    Math.random() * Math.PI,
                    Math.random() * Math.PI * 2,
                )
                const position = new THREE.Vector3()
                position.setFromSpherical(spherical)

                positionsArray[i3] = position.x
                positionsArray[i3 + 1] = position.y
                positionsArray[i3 + 2] = position.z

                sizesArray[i] = Math.random()
                timeMultipliersArray[i] = 1 + Math.random()
            }
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3))
            geometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1))
            geometry.setAttribute('aTimeMultiplier', new THREE.BufferAttribute(timeMultipliersArray, 1))

            texture.flipY = false;
            const material = new THREE.ShaderMaterial({
                vertexShader: fireworksVertexShader,
                fragmentShader: fireworksFragmentShader,
                uniforms: {
                    uSize: new THREE.Uniform(size),
                    uResolution: new THREE.Uniform(sizes.resolution),
                    uTexture: new THREE.Uniform(texture),
                    uColor: new THREE.Uniform(color),
                    uProgress: new THREE.Uniform(0.0),
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            const firework = new THREE.Points(geometry, material)
            firework.position.copy(position)
            scene.add(firework)

            // Destroy
            function destroy() {
                scene.remove(firework)
                geometry.dispose()
                material.dispose()
            }

            //Animate
            gsap.to(material.uniforms.uProgress, { value: 1, duration: 3, ease: 'linear', onComplete: destroy })
        }

        function createRandomFirework() {
            const count = Math.round(400 + Math.random() * 10000)

            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random(),
                (Math.random() - 0.5) * 2
            )
            const size = 0.1 + Math.random() * 0.1
            const texture = textures[Math.floor(Math.random() * textures.length)]
            const radius = 0.5 + Math.random()
            const color = new THREE.Color()
            color.setHSL(Math.random(), 1, 0.7)
            generateFirework(count, position, size, texture, radius, color)
        }

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.setPixelRatio(sizes.pixelRatio)
        renderer.shadowMap.enabled = true

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

        // Click event
        const handleClick = () => {
            createRandomFirework()
        };
        window.addEventListener('click', handleClick);

        // Resize
        const handleResize = () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            sizes.resolution.set(sizes.width, sizes.height)

            // Update Camera
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            // Update Renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // ----- Add Sky -----
        const sky = new Sky();
        sky.scale.setScalar(450000);
        scene.add(sky);

        const sun = new THREE.Vector3();

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: -2,
            azimuth: 180,
            exposure: renderer.toneMappingExposure
        };

        function guiChanged() {
            const uniforms = sky.material.uniforms;
            uniforms['turbidity'].value = effectController.turbidity;
            uniforms['rayleigh'].value = effectController.rayleigh;
            uniforms['mieCoefficient'].value = effectController.mieCoefficient;
            uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

            const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
            const theta = THREE.MathUtils.degToRad(effectController.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            uniforms['sunPosition'].value.copy(sun);

            renderer.toneMappingExposure = effectController.exposure;
            renderer.render(scene, camera);
        }

        gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
        gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
        gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
        gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
        gui.add(effectController, 'elevation', -3, 5, 0.001).onChange(guiChanged);
        gui.add(effectController, 'azimuth', - 180, 180, 0.1).onChange(guiChanged);
        gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

        guiChanged();

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

export default FireworksLesson