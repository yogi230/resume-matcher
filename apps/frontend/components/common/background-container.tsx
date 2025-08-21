import { cn } from '@/lib/utils';

/**
 * BackgroundContainer Component
 *
 * Provides a full-screen section with a gradient background,
 * a dark inner container with rounded corners.
 * It accepts children elements to render inside the inner container.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the container.
 * @param {string} [props.className] - Optional additional class names for the section element.
 * @param {string} [props.innerClassName] - Optional additional class names for the inner div element.
 * @returns {JSX.Element} The rendered BackgroundContainer component.
 */

interface BackgroundContainerProps {
	children: React.ReactNode;
	className?: string;
	innerClassName?: string;
}

const BackgroundContainer = ({
	children,
	className,
	innerClassName,
}: BackgroundContainerProps) => {
	return (
		<section
			className={cn(
				'relative flex h-screen items-center justify-center overflow-hidden p-2 bg-gradient-to-br from-pink-600 via-orange-400 to-purple-700',
				className,
			)}
		>
			{/* Inner container with dark background, padding, and rounded corners */}
			<div
				className={cn(
					'relative z-10 flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-8 rounded-2xl',
					innerClassName, // Allow overriding or extending inner div styles
				)}
			>
				{/* Render children content */}
				<div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
					{children}
				</div>
			</div>
		</section>
	);
};

export default BackgroundContainer;
