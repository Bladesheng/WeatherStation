import {createFileRoute, redirect} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {Temporal} from 'temporal-polyfill';

export const Route = createFileRoute('/history/')({
	beforeLoad: () => {
		const now = Temporal.Now.plainDateISO();
		throw redirect({
			to: '/history/$year/$month',
			params: {
				year: now.year.toString(),
				month: now.month.toString(),
			},
		});
	},

	head: () => ({
		meta: [{title: pageTitle('History')}],
	}),
});
