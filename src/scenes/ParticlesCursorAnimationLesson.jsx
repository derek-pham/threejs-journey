import { createElement, useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import particlesVertexShader from '../shaders/particles/vertex.glsl'
import particlesFragmentShader from '../shaders/particles/fragment.glsl'

const ParticlesCursorAnimationLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {

        };

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio
        }

        // GUI
        const gui = new GUI();
        const textureLoader = new THREE.TextureLoader()
        const dogTexture = textureLoader.load('picture-1.png')

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.PlaneGeometry(10, 10, 128, 128)
        geometry.setIndex(null)
        geometry.deleteAttribute('normal')

        // Material


        const displacement = {
            canvas: document.createElement('canvas')
        }
        displacement.canvas.width = 128
        displacement.canvas.height = 128
        displacement.canvas.style.position = 'fixed'
        displacement.canvas.style.width = '256px'
        displacement.canvas.style.height = '256px'
        displacement.canvas.style.top = 0
        displacement.canvas.style.left = 0
        displacement.canvas.style.zIndex = 4
        document.body.append(displacement.canvas)
        displacement.context = displacement.canvas.getContext('2d')
        displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)
        displacement.glowImage = new Image()
        displacement.glowImage.src = '/glow.png'

        displacement.interactivePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
        )
        displacement.interactivePlane.visible = false
        scene.add(displacement.interactivePlane)
        displacement.raycaster = new THREE.Raycaster()
        displacement.screenCursor = new THREE.Vector2(9999, 9999)
        displacement.canvasCursor = new THREE.Vector2(9999, 9999)
        displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999)

        displacement.texture = new THREE.CanvasTexture(displacement.canvas)

        const intensitiesArray = new Float32Array(geometry.attributes.position.count)
        const anglesArray = new Float32Array(geometry.attributes.position.count)

        for (let i = 0; i < geometry.attributes.position.count; i++) {
            intensitiesArray[i] = Math.random()
            anglesArray[i] = Math.random() * Math.PI * 2
        }
        geometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
        geometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

        const material = new THREE.ShaderMaterial({
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms: {
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio,)),
                uPictureTexture: new THREE.Uniform(dogTexture),
                uDisplacementTexture: new THREE.Uniform(displacement.texture)

            }
            // blending: THREE.AdditiveBlending
        })

        //PARTICLES Object
        const plane = new THREE.Points(geometry, material)
        scene.add(plane)

        const cube = new THREE.Mesh(geometry, material)
        // scene.add(cube)

        // Camera
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 4)
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

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true
        renderer.setPixelRatio(sizes.pixelRatio)

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

        function handlePointerMove(event) {
            displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
            displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1
        }
        window.addEventListener('pointermove', handlePointerMove)

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

            displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
            const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)

            if (intersections.length) {
                const uv = intersections[0].uv
                displacement.canvasCursor.x = uv.x * displacement.canvas.width
                displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
            }

            displacement.context.globalCompositeOperation = 'source-over'
            displacement.context.globalAlpha = 0.02
            displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

            const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)
            displacement.canvasCursorPrevious.copy(displacement.canvasCursor)
            const alpha = Math.min(cursorDistance * 0.1, 1.0)

            const glowSize = displacement.canvas.width * 0.25
            displacement.context.globalCompositeOperation = 'lighten'
            displacement.context.globalAlpha = alpha
            displacement.context.drawImage(
                displacement.glowImage,
                displacement.canvasCursor.x - glowSize * 0.5,
                displacement.canvasCursor.y - glowSize * 0.5,
                glowSize,
                glowSize
            )
            displacement.texture.needsUpdate = true

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
            window.removeEventListener('pointermove', handlePointerMove);
            displacement.canvas.remove();
        };

    }, [])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default ParticlesCursorAnimationLesson