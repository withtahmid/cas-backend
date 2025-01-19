    import { Document, model, Schema, Types } from "mongoose";

    interface InvokeSchema { time: number;
        browser: string;
    };

    export interface ReceiptEmailSchema {
        _id: string; 
        label: string;
        createTime: number;
        invokes: InvokeSchema[];
        newInvokeCount: number;
    }


    export interface ReceiptEmailModel extends Omit<ReceiptEmailSchema, "_id">, Document {
        _id: Types.ObjectId;
        user_id: Types.ObjectId;
    }
    const emailModel = new Schema<ReceiptEmailModel>({
        user_id: { type: Schema.Types.ObjectId, index: true },
        label: { type: String, required: true },
        createTime: { type: Number, required: true, default: Date.now },
        invokes: [{ time:{ type: Number, require: true }, browser: { type: String, required: true } } ],
        newInvokeCount: { type: Number, required: true, default: 0 },
    });
    const ReceiptEmail = model("ReceiptEmail", emailModel);
    export default ReceiptEmail;