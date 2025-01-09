// const generateVerificationEmail = (verificationCode: string): string => {
//     return `<!DOCTYPE html>
// <html>
// <head>
//   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Verification code to confirm your email address</title>
// </head>
// <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
//   <table role="presentation"
//     style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
//     <tbody>
//       <tr>
//         <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
//           <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
//             <tbody>
//               <tr>
//                 <td style="padding: 40px 0px 0px;">
//                   <div style="text-align: left;">
//                     <div style="padding-bottom: 20px;"><img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div>
//                   </div>
//                   <div style="padding: 20px; background-color: rgb(255, 255, 255);">
//                     <div style="color: rgb(0, 0, 0); text-align: left;">
//                       <h1 style="margin: 1rem 0">Account Verification Code</h1>
//                       <p style="padding-bottom: 16px">Please use the verification code below to verify your MailReadReceipts account:</p>
//                       <p style="padding-bottom: 16px"><span style="text-align: center;display: block;"><strong
//                             style="font-size: 130%">${verificationCode}</strong></span></p>
//                       <p style="padding-bottom: 16px">In case you did not request this email, chill!!</p>
//                       <p style="padding-bottom: 16px">Thanks</p>
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </td>
//       </tr>
//     </tbody>
//   </table>
// </body>
// </html>
//     `;
//   };

  
const generateVerificationEmail = (verificationCode: string) => {
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
                <div style="font-size:24px">Verify your account </div>
              </div>
              <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:left">withtahmid received a request to use this email to create an Account. <br>
                <br>Use this code to verify your account: <br>
                <div style="text-align:center;font-size:36px;margin-top:20px;line-height:44px">${verificationCode}</div>
                <br>This code will expire in 10 minutes. <br>
                <br>If you did not requested an account, you can safely ignore this email.
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
  `
}

import nodemailer from 'nodemailer';
import { UserModelSchema } from '../models/User';
import { generateSixDigitCode } from '../utils/verificationCodes';
import { accountVerificationCodeExpiresAt, canResendVerificationCodeAt } from '../config';
  
export const sendAccountVerificationCode = async (user: UserModelSchema) => {
    const recipient = user.email;
    const verificationCode = generateSixDigitCode();
    user.verificationUtil = {
        currecntVerification: "account-verification",
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
        subject: 'MailReadReceipts Account Verification',
        html: generateVerificationEmail(verificationCode),
    };
  
    try {
      await Promise.all([ transporter.sendMail(mailOptions), user.save() ])
      return { message: `Email sent to ${recipient}` };
    } catch (error) {
        return { error: `Failed to sent email to ${recipient}` };
    }
};
