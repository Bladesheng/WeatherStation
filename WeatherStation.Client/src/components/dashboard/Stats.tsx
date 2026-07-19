export function Stats({title, body, icon}: {title: string; body: string; icon: string}) {
	return (
		<div className="flex grow items-center justify-between gap-4 rounded bg-base-200 p-2">
			<div className="flex flex-col">
				<div className="text-xs">{title}</div>

				<div className="text-xl font-bold">{body}</div>
			</div>

			<span className={`${icon} text-3xl text-secondary`}></span>
		</div>
	);
}
