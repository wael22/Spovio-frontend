
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PlayerInterestForm from "@/components/PlayerInterestForm";

const PlayerInterest = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 px-4 container mx-auto">
                <PlayerInterestForm />
            </main>
            <Footer />
        </div>
    );
};

export default PlayerInterest;
