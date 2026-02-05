import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
    },
    responseConfig: {
        type: String,
        required: true,
    },
    currentConfig: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("Prompt", PromptSchema);