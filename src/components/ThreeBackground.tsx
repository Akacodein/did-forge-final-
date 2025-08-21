import React from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ParticleBeam } from "./backgrounds/ParticleBeam";

function Scene() {
	return (
		<>
			<fog attach="fog" args={[new THREE.Color(0x06111c), 10, 28]} />
			<ambientLight intensity={0.4} />
			<directionalLight position={[3, 4, 2]} intensity={0.45} />
			<group position={[0, -2.6, 0]}>
				<ParticleBeam />
			</group>
		</>
	);
}

export const ThreeBackground: React.FC = () => {
	return (
		<div className="pointer-events-none fixed inset-0 -z-20 mix-blend-screen">
			<Canvas
				camera={{ position: [0, 0, 9], fov: 45 }}
				gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
				onCreated={({ gl }) => {
					gl.toneMapping = THREE.ACESFilmicToneMapping;
					gl.toneMappingExposure = 1.3;
				}}
				dpr={[1, 1.75]}
			>
				<Scene />
				<EffectComposer>
					<Bloom intensity={1.35} luminanceThreshold={0.12} luminanceSmoothing={0.04} mipmapBlur radius={1.0} />
				</EffectComposer>
			</Canvas>
		</div>
	);
}; 