/* eslint-disable react/no-unknown-property */
export default function Placeholder(props) {
    return (
        <mesh {...props}>
            <boxGeometry args={[2, 3, 2, 2, 2, 2]} />
            <meshBasicMaterial wireframe color={'red'} />
        </mesh>
    );
}