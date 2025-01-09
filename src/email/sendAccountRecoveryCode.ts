const generateVerificationEmail = (verificationCode: string): string => {
    return `
!<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
</head>
<body>
  <table>
      <tbody>
        <tr>
          <td width="8" style="width:8px"></td>
          <td>
            <div style="border-style:solid;border-width:thin;border-color:#dadce0;border-radius:8px;padding:40px 20px" align="center" class="m_-8190886736499175479mdv2rw">
              <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;border-bottom:thin solid #dadce0;color:rgba(0,0,0,0.87);line-height:32px;padding-bottom:24px;text-align:center;word-break:break-word">
                <div style="font-size:24px">Recover your account </div>
              </div>
              <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:left">withtahmid received a request to recover account associated with this email.<br>
                <br>Use this code to recover your account: <br>
                <div style="text-align:center;font-size:36px;margin-top:20px;line-height:44px">${verificationCode}</div>
                <br>This code will expire in 10 minutes. <br>
                <br>If you did not requested an account recovery, you can safely ignore this email.
              </div>
            </div>
            <div style="text-align:left">
              <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">
                <div>You received this email to let you know about important changes to your Account and services.</div>
              </div>
            </div>
          </td>
          <td width="8" style="width:8px"></td>
        </tr>
      </tbody>
  </table>
</body>
</html>

    `;
  };

  

import nodemailer from 'nodemailer';
import { UserModelSchema } from '../models/User';
import { generateSixDigitCode } from '../utils/verificationCodes';
import { accountVerificationCodeExpiresAt, canResendVerificationCodeAt } from '../config';
  
export const sendAccountRecoveryCode = async (user: UserModelSchema) => {
    const recipient = user.email;
    const verificationCode = generateSixDigitCode();
    user.verificationUtil = {
        currecntVerification: "account-recovery",
        verificationCode: verificationCode,
        expiresAt: Date.now() + accountVerificationCodeExpiresAt,
        canResendAt: Date.now() + canResendVerificationCodeAt,
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });
  
    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: recipient,
        subject: 'MailReadReceipts Account Recovery',
        html: generateVerificationEmail(verificationCode),
    };
  
    try {
        await Promise.all([ transporter.sendMail(mailOptions), user.save() ])
        return { message: `Email sent to ${recipient}` };
    } catch (error) {
        return { error: `Failed to sent email to ${recipient}` };
    }
};
  
  