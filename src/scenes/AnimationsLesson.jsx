import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const AnimationsLesson = () => {
    const canvasRef = useRef();

    useEffect(() => {
        // Check if canvas is available
        // useEffect implemented to prevent the canvasRef from referencing a null value
        // The issue you're experiencing with the canvas not always loading is likely due to the fact that the canvas reference (canvasRef.current) might not be initialized when you first access it. This is because canvasRef.current is initially null and is only set after the first render.
        if (!canvasRef.current) return;

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Material
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Mesh Object
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Camera
        const sizes = { width: 800, height: 600 };
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
        camera.position.set(0, 0, 2);
        scene.add(camera);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
        });
        renderer.setSize(sizes.width, sizes.height);

        // Clock
        const clock = new THREE.Clock();

        // GSAP
        gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 })
        gsap.to(mesh.position, { x: 0, duration: 1, delay: 2 })

        // Animations
        const tick = () => {
            // Clock
            const elapsedTime = clock.getElapsedTime();

            // Update objects
            // mesh.position.x = Math.sin(elapsedTime);
            // mesh.position.y = Math.cos(elapsedTime);k
            // mesh.rotation.y = elapsedTime;
            // mesh.rotation.z += 0.002 * elapsedTime;

            // Updating the rendered scene
            renderer.render(scene, camera);

            // Request next frame
            window.requestAnimationFrame(tick);
        };
        renderer.render(scene, camera);
        tick();

        // Clean up function
        return () => {
            renderer.dispose();
        };
    }, []);

    return (
        <>
            <canvas ref={canvasRef} />
        </>
    );
};

export default AnimationsLesson;