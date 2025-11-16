import { redirect } from 'next/navigation';

// Temporary shim route: if someone lands on /menu/[categoryId],
// redirect them to the main /menu page with a query param so the
// page can highlight the category via client-side logic.
export default function CategoryRedirect({ params }: { params: { categoryId: string } }) {
	const cid = params?.categoryId ?? '';
	redirect(`/menu?c=${encodeURIComponent(cid)}`);
}

