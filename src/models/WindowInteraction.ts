import { Document, model, Schema, Types } from "mongoose";

const WindowInteractionSchema = new Schema({
    interactionId: { type: String, required: true },
    nodeId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const WindowInteraction = model("WindowInteraction", WindowInteractionSchema);
export default WindowInteraction;
