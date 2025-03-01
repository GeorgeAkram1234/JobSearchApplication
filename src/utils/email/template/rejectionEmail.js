export const rejectionEmailTemplate = ({ username, jobTitle }) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: red;">Dear ${username},</h2>
        <p>Thank you for your interest in the position.</p>
        <p>After careful consideration, we regret to inform you that we have decided to proceed with other candidates at this time.</p>
        <p>We appreciate the time you took to apply, and we encourage you to apply for future opportunities with us.</p>
        <br>
        <p style="font-size: 14px; color: #555;">Best wishes,<br>HR Team</p>
    </div>
`;
