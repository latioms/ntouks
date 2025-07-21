import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string) {
    try {
        await resend.emails.send({
            from: 'Ntouks Assist Auto <support@updates.reachdem.cc>',
            to,
            subject,
            html: body,
        })

        return {
            success: true,
            message: `Email ${subject} sent successfully to ${to}`,
        };
    } catch (error) {
        console.error(`Error sending email receipt: ${error}`);
        return { error: 'Failed to send email receipt' }
    }
}