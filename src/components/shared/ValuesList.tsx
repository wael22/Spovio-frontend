import { motion } from "framer-motion";
import { ABOUT_VALUES } from "@/lib/constants";

interface ValuesListProps {
    limit?: number;
    className?: string;
}

export const ValuesList = ({ limit, className = "" }: ValuesListProps) => {
    const displayValues = limit ? ABOUT_VALUES.slice(0, limit) : ABOUT_VALUES;

    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}>
            {displayValues.map((value, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-3">
                        {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                        {value.description}
                    </p>
                </motion.div>
            ))}
        </div>
    );
};
