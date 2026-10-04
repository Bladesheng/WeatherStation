import type {ReactNode} from 'react';

export function StatCard({
	title,
	body,
	secondaryText,
	icon,
}: {
	title: string;
	body: string;
	secondaryText?: ReactNode;
	icon: string;
}) {
	return (
		<div className="flex grow items-center justify-between gap-4 rounded border border-base-content/10 bg-base-200 p-2">
			<div className="flex flex-col">
				<div className="text-xs">{title}</div>

				<div className="text-xl font-bold">{body}</div>

				{secondaryText && (
					<div className="flex items-center gap-2 text-xs tabular-nums opacity-70">
						{secondaryText}
					</div>
				)}
			</div>

			<span className={`${icon} text-3xl text-secondary`}></span>
		</div>
	);
}
