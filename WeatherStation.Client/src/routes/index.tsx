import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';

export const Route = createFileRoute('/')({
	component: Index,

	head: () => ({
		meta: [{title: pageTitle('Home')}],
	}),
});

export function Index() {
	return (
		<>
			<main className="m-4">xd</main>
		</>
	);
}
