import nodemailer from 'nodemailer';
interface EmailProps{
    recipient: string;
    subject: string;
    html: string;
}
export const sendEmail = async(prop: EmailProps) => {
    const { recipient, subject, html } = prop;
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
        subject: subject,
        html: html,
    };
    try {
        return transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
}