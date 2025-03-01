export const acceptanceEmailTemplate = ({ username, jobTitle }) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: green;">Congratulations, ${username}!</h2>
        <p>We are pleased to inform you that your application for the position has been accepted.</p>
        <p>Our HR team will contact you soon with the next steps.</p>
        <p>Thank you for applying, and we look forward to welcoming you to our team!</p>
        <br>
        <p style="font-size: 14px; color: #555;">Best regards,<br>HR Team</p>
    </div>
`;
