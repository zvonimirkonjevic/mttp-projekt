import PresentationView from "../components/PresentationView";

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
    // We don't strictly need the ID for the UI yet, but we have it.
    const { id } = await params;

    return (
        <div className="font-sans">
            <PresentationView id={id} />
        </div>
    );
}
