import { Building2, MapPin, User, Calendar, FileDown } from "lucide-react";

interface Club {
    id: number;
    name: string;
    location: string;
    signatory: string;
    signatoryRole: string;
    signatureDate: string;
    type: "padel" | "tennis";
    letterUrl: string;
}

const clubs: Club[] = [
    {
        id: 1,
        name: "YALLA PADEL",
        location: "Sousse",
        signatory: "Firas Ammar",
        signatoryRole: "Directeur d'exploitation",
        signatureDate: "26/01/2025",
        type: "padel",
        letterUrl: "/letters/yalla_padel_letter.jpg"
    },
    {
        id: 2,
        name: "CLUB TENNIS AKOUDA",
        location: "Akouda",
        signatory: "Sonia Mahmoud",
        signatoryRole: "Présidente",
        signatureDate: "31/01/2025",
        type: "tennis",
        letterUrl: "/letters/akouda_tennis_letter.jpg"
    },
    {
        id: 3,
        name: "PADEL CLUB KANTAOUI",
        location: "Hammam Sousse",
        signatory: "Mohamed Ali Handous",
        signatoryRole: "Fondateur & DG",
        signatureDate: "31/01/2025",
        type: "padel",
        letterUrl: "/letters/kantaoui_letter.jpg"
    },
    {
        id: 4,
        name: "STARS PADEL CLUB",
        location: "Sousse",
        signatory: "Ahmed Amine Souilem",
        signatoryRole: "Gérant",
        signatureDate: "31/01/2025",
        type: "padel",
        letterUrl: "/letters/stars_padel_letter.jpg"
    }
];

const PartnerClubs = () => {
    return (
        <div className="mt-12">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Clubs Partenaires
                </h2>
                <p className="text-gray-600">
                    Clubs ayant signé une lettre d'intérêt pour la solution SPOVIO / MySmash
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                    <div
                        key={club.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                    >
                        {/* Header avec icône */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${club.type === "padel" ? "bg-green-500" : "bg-orange-500"
                                    }`}>
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {club.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{club.location}</span>
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${club.type === "padel"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                    }`}
                            >
                                {club.type === "padel" ? "Padel" : "Tennis"}
                            </span>
                        </div>

                        {/* Signataire */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{club.signatory}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                                {club.signatoryRole}
                            </p>

                            <div className="flex items-center justify-between mt-4 ml-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Signé le {club.signatureDate}</span>
                                </div>

                                <a
                                    href={club.letterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                    download
                                >
                                    <FileDown className="w-4 h-4" />
                                    Voir la lettre
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Statistiques */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-600 font-medium">Total Clubs Partenaires</p>
                        <p className="text-2xl font-bold text-blue-900">{clubs.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-600">
                            {clubs.filter(c => c.type === "padel").length} Padel · {clubs.filter(c => c.type === "tennis").length} Tennis
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerClubs;
