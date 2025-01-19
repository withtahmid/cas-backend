import ReceiptEmail, { ReceiptEmailSchema } from "../../models/mailreadreceipts/ReceiptEmail";
import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { Response } from "../../types/response";
import { MailReadReceiptsCreateEmailResponse, MailReadReceiptsDeleteEmailResponse, MailReadReceiptsFetchAllResponse, MailReadReceiptsSeeEmailResponse } from "../../types/response/mailreadreceipts";
import { createErrorResponse, createPartialSuccessResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
const createOne = protectedProcedure
.input(z.object({ label: z.string().min(3).max(10) }))
.mutation(async ({ input, ctx }): Promise<Response<MailReadReceiptsCreateEmailResponse>> => {
    const { label } = input;
    const { ctx_user } = ctx;
    try {
        var receiptEmail = new ReceiptEmail({
            user_id: ctx_user._id,
            label: label,
            createTime: Date.now(),
            invokes: [],
            newInvokeCount: 0,
        });
        await receiptEmail.save();
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED]);
    }

    const email:ReceiptEmailSchema = {
        _id: receiptEmail._id.toString(),
        label: receiptEmail.label,
        createTime: receiptEmail.createTime,
        invokes: [],
        newInvokeCount: 0
    }
    return createSuccessResponse<MailReadReceiptsCreateEmailResponse>({ email: email }, `${label} is added`);
});

const deleteOne = protectedProcedure
.input(z.string().min(24).max(24))
.mutation(async({ input, ctx }): Promise<Response<MailReadReceiptsDeleteEmailResponse>> => {
    const _id  = input;
    const userId = ctx.ctx_user._id;

    try {
        var email = await ReceiptEmail.findById(_id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }

    if(!email){
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, ErrorMessages[ErrorCodes.RESOURCE_NOT_FOUND]);
    }
    if(email.user_id.toString() !== userId){
        return createPartialSuccessResponse(ErrorCodes.UNAUTHORIZED, ErrorMessages[ErrorCodes.UNAUTHORIZED]);
    }
    
    try {
        await email.deleteOne();
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED]);
    }
    return createSuccessResponse({}, `${email.label} is deleted`);
});

const seeOne = protectedProcedure
.input(z.string().min(24).max(24))
.mutation(async({ input, ctx }): Promise<Response<MailReadReceiptsSeeEmailResponse>> => {
    const _id  = input;
    const userId = ctx.ctx_user._id;

    try {
        var email = await ReceiptEmail.findById(_id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }

    if(!email){
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, ErrorMessages[ErrorCodes.RESOURCE_NOT_FOUND]);
    }
    if(email.user_id.toString() !== userId){
        return createPartialSuccessResponse(ErrorCodes.UNAUTHORIZED, ErrorMessages[ErrorCodes.UNAUTHORIZED]);
    }
    
    try {
        email.newInvokeCount = 0;
        await email.save();
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED]);
    }
    return createSuccessResponse({}, "Successfully cleared previous invokations");
});

const fetchAll = protectedProcedure
.query(async({ ctx }):Promise<Response<MailReadReceiptsFetchAllResponse>> => {
    const { _id } = ctx.ctx_user;

    try {
        var emailsRaw = await ReceiptEmail.find({ user_id: _id });
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }

    try {
        var emails:ReceiptEmailSchema[] = emailsRaw.map(({ _id, label, createTime, invokes, newInvokeCount }) => {
            return ({ _id:_id.toString(), label, createTime, invokes, newInvokeCount });
        })
    } catch (error) {
        return createErrorResponse(ErrorCodes.SERVER_ERROR, ErrorMessages[ErrorCodes.SERVER_ERROR]);
    }
    return createSuccessResponse<MailReadReceiptsFetchAllResponse>({ emails }, "Receipts fectch successfull");
})

const mailreadreceiptsRouter = router({
    fetchAll,
    createOne,
    deleteOne,
    seeOne
});

export default mailreadreceiptsRouter;