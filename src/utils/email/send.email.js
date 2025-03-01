import nodemailer from 'nodemailer'

export const sendEmail = async (
    {
        to = "",
        subject = "social media App",
        html = "",
        text = "",
        attachments = []
    }) => {


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        from: `"George Akram" <${process.env.GMAIL_EMAIL}>`,
        to,
        text,
        html,
        subject
    });
    return info

}

        // cc: "mention another email",
        // bcc: "blind mail",
        // attachments: [
        //     {
        //         filename: "data.txt",
        //         content: "jjjjj"
        //     },
        //     {
        //         filename: "data2.txt",
        //         path: path.resolve("./notes.txt")
        //     },
        //     {
        //         filename: "content.pdf",
        //         path: path.resolve("./Sweden-ForeignTradeProject.pdf"),
        //         contentType: 'application/pdf'
        //     },
        // ]