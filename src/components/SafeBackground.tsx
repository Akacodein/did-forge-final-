import React, { Suspense, lazy, useEffect, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

const LazyThreeBackground = lazy(() => import("./ThreeBackground").then(m => ({ default: m.ThreeBackground })));

function supportsWebGL2(): boolean {
	try {
		const canvas = document.createElement("canvas");
		return !!(canvas.getContext && canvas.getContext("webgl2"));
	} catch {
		return false;
	}
}

const CssFallback: React.FC = () => (
	<div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
		<svg className="absolute inset-0 h-full w-full opacity-[0.1] animate-spin-slower" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="grid-fallback" width="42" height="42" patternUnits="userSpaceOnUse">
					<path d="M 42 0 L 0 0 0 42" fill="none" stroke="currentColor" strokeWidth="0.6" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid-fallback)" />
		</svg>
	</div>
);

export const SafeBackground: React.FC = () => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const disable3D = String(import.meta.env.VITE_DISABLE_3D || "false").toLowerCase() === "true";
		if (disable3D) {
			setEnabled(false);
			return;
		}
		setEnabled(supportsWebGL2());
	}, []);

	if (!enabled) return <CssFallback />;
	return (
		<ErrorBoundary fallback={<CssFallback />}>
			<Suspense fallback={<CssFallback />}>
				<LazyThreeBackground />
			</Suspense>
		</ErrorBoundary>
	);
}; 