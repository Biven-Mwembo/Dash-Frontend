// src/Components/PageWrapper.jsx
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}