const colors = {
    teal: "#2DA18C",
    magenta: "#C310CE",
    purple: "#7B2CBF",
    dark: "#171717",
    light: "#F1F2F1",
    white: "#FFFFFF",
    muted: "#666666"
};

const baseTemplate = ({ title, content, buttonText, buttonUrl }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background-color:${colors.light};
    font-family:Arial, Helvetica, sans-serif;
    color:${colors.dark};
">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background-color:${colors.light}; padding:30px 10px;">

    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="
                   max-width:600px;
                   background-color:${colors.white};
                   border-radius:12px;
                   overflow:hidden;
                   box-shadow:0 3px 15px rgba(0,0,0,0.08);
                   ">

                <!-- HEADER -->
                <tr>
                    <td align="center"
                        style="
                        padding:30px 20px;
                        background-color:${colors.white};
                        border-bottom:1px solid #eeeeee;
                        ">

                        <div style="
                            font-size:28px;
                            font-weight:bold;
                            color:${colors.purple};
                        ">
                            Mind of God
                        </div>

                        <div style="
                            margin-top:4px;
                            font-size:13px;
                            font-weight:bold;
                            letter-spacing:1px;
                            color:${colors.magenta};
                        ">
                            MINISTERS
                        </div>

                    </td>
                </tr>

                <!-- TITLE -->
                <tr>
                    <td align="center"
                        style="padding:35px 30px 10px;">

                        <h1 style="
                            margin:0;
                            font-size:28px;
                            line-height:36px;
                            color:${colors.teal};
                        ">
                            ${title}
                        </h1>

                    </td>
                </tr>

                <!-- CONTENT -->
                <tr>
                    <td style="
                        padding:20px 35px;
                        font-size:16px;
                        line-height:26px;
                        color:#333333;
                    ">

                        ${content}

                    </td>
                </tr>

                <!-- BUTTON -->
                ${
                    buttonUrl
                        ? `
                        <tr>
                            <td align="center" style="padding:10px 30px 35px;">

                                <a href="${buttonUrl}"
                                   style="
                                   display:inline-block;
                                   padding:15px 30px;
                                   background-color:${colors.magenta};
                                   color:#ffffff;
                                   text-decoration:none;
                                   font-size:16px;
                                   font-weight:bold;
                                   border-radius:7px;
                                   ">
                                    ${buttonText}
                                </a>

                            </td>
                        </tr>
                        `
                        : ""
                }

                <!-- FOOTER -->
                <tr>
                    <td align="center"
                        style="
                        padding:25px 20px;
                        background-color:#fafafa;
                        border-top:1px solid #eeeeee;
                        ">

                        <p style="
                            margin:0;
                            font-size:13px;
                            color:${colors.muted};
                            line-height:20px;
                        ">
                            This is an automated email. Please do not reply
                            directly to this message.
                        </p>

                        <p style="
                            margin:8px 0 0;
                            font-size:12px;
                            color:#999999;
                        ">
                            Mind of God Ministers 
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>

</table>

</body>
</html>
`;
};


/*
========================================
ACCOUNT CREATED
========================================
*/

const accountCreatedTemplate = (username) => {

    return baseTemplate({
        title: "Account Created",

        content: `
            <p>
                Hello <strong>${username}</strong>,
            </p>

            <p>
                Your account has been successfully created.
                You can now access your account using your registered
                email address and password.
            </p>

            <div style="
                margin:25px 0;
                padding:18px;
                border-left:4px solid ${colors.teal};
                background-color:#f5faf9;
            ">
                <strong>Welcome to the community.</strong>
                <br>
                We are glad to have you with us.
            </div>

            <p>
                If you did not create this account, please ignore.
            </p>
        `
    });

};


/*
========================================
FORGOT PASSWORD
========================================
*/

const forgotPasswordTemplate = (username, resetLink) => {

    return baseTemplate({
        title: "Reset Your Password",

        content: `
            <p>
                Hello <strong>${username}</strong>,
            </p>

            <p>
                We received a request to reset the password associated
                with your account.
            </p>

            <p>
                Click the button below to create a new password.
            </p>

            <div style="
                margin:25px 0;
                padding:18px;
                border-left:4px solid ${colors.magenta};
                background-color:#fff5ff;
            ">
                <strong>This password reset link expires in 1 hour.</strong>
            </div>

            <p>
                If you did not request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
            </p>
        `,

        buttonText: "Reset Password",
        buttonUrl: resetLink
    });

};


/*
========================================
PASSWORD RESET CONFIRMATION
========================================
*/

const passwordResetConfirmationTemplate = (username) => {

    return baseTemplate({
        title: "Password Reset Successful",

        content: `
            <p>
                Hello <strong>${username}</strong>,
            </p>

            <p>
                Your password has been successfully changed.
            </p>

            <div style="
                margin:25px 0;
                padding:18px;
                border-left:4px solid ${colors.teal};
                background-color:#f5faf9;
            ">
                <strong>Your account is now secured with your new password.</strong>
            </div>

            <p>
                If you did not make this change, please ignore this email.
            </p>
        `
    });

};


module.exports = {
    accountCreatedTemplate,
    forgotPasswordTemplate,
    passwordResetConfirmationTemplate
};