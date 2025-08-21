import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const ParticleBeam: React.FC = () => {
	const pointsRef = useRef<THREE.Points>(null!);
	const { positions, colors, count } = useMemo(() => {
		const rings = 100;
		const perRing = 160;
		const total = rings * perRing;
		const pos = new Float32Array(total * 3);
		const col = new Float32Array(total * 3);
		const radiusBase = 0.9;
		for (let i = 0; i < rings; i++) {
			const t = i / (rings - 1);
			const radius = radiusBase + Math.sin(t * Math.PI) * 2.4;
			const y = (t - 0.2) * 9.4;
			for (let j = 0; j < perRing; j++) {
				const idx = i * perRing + j;
				const a = (j / perRing) * Math.PI * 2.0 + t * 2.2;
				const x = Math.cos(a) * radius;
				const z = Math.sin(a) * radius;
				pos[idx * 3 + 0] = x;
				pos[idx * 3 + 1] = y;
				pos[idx * 3 + 2] = z;
				const c1 = new THREE.Color(0x9b7aff);
				const c2 = new THREE.Color(0x6476ff);
				const c = c1.clone().lerp(c2, t);
				col[idx * 3 + 0] = c.r;
				col[idx * 3 + 1] = c.g;
				col[idx * 3 + 2] = c.b;
			}
		}
		return { positions: pos, colors: col, count: total };
	}, []);

	const geometry = useMemo(() => new THREE.BufferGeometry(), []);
	const material = useMemo(() => new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: 16.0 },
		},
		vertexShader: `
			uniform float uTime;
			uniform float uSize;
			attribute vec3 color;
			varying vec3 vColor;
			void main() {
				vColor = color;
				vec3 p = position;
				float r = length(p.xz);
				p.y += sin(r * 1.25 - uTime * 1.6) * 0.18;
				p.xz *= (1.0 + sin(uTime * 0.45 + r * 0.65) * 0.035);
				vec4 mv = modelViewMatrix * vec4(p, 1.0);
				gl_Position = projectionMatrix * mv;
				gl_PointSize = uSize * (1.0 / -mv.z);
			}
		`,
		fragmentShader: `
			precision highp float;
			varying vec3 vColor;
			void main() {
				vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
				float d = dot(uv, uv);
				float alpha = smoothstep(1.0, 0.2, d);
				vec3 col = vColor * 1.9;
				gl_FragColor = vec4(col, alpha * 0.95);
			}
		`,
	}), []);

	useMemo(() => {
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
	}, [geometry, positions, colors]);

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		(material.uniforms.uTime as THREE.IUniform).value = t;
		if (pointsRef.current) {
			pointsRef.current.rotation.y = Math.sin(t * 0.1) * 0.15;
		}
	});

	return <points ref={pointsRef} geometry={geometry} material={material} />;
}; 