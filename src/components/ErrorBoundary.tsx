import React from "react";

type Props = { fallback: React.ReactNode; children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: any, info: any) {
		console.error("Background ErrorBoundary caught: ", error, info);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
} 