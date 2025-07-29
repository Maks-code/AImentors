import os
from email.message import EmailMessage
import aiosmtplib
from dotenv import load_dotenv

load_dotenv()

# 📬 Сброс пароля
async def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = to_email
    msg["Subject"] = "Password Reset"
    msg.set_content(f"Click the link to reset your password: {reset_link}")

    await aiosmtplib.send(
        msg,
        hostname=os.getenv("MAIL_SERVER"),
        port=int(os.getenv("MAIL_PORT")),
        start_tls=True,
        username=os.getenv("MAIL_USERNAME"),
        password=os.getenv("MAIL_PASSWORD"),
    )

# 📧 Подтверждение email
async def send_verification_email(to_email: str, verify_link: str):
    msg = EmailMessage()
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = to_email
    msg["Subject"] = "Email Verification"
    msg.set_content(f"Click the link to verify your email: {verify_link}")

    await aiosmtplib.send(
        msg,
        hostname=os.getenv("MAIL_SERVER"),
        port=int(os.getenv("MAIL_PORT")),
        start_tls=True,
        username=os.getenv("MAIL_USERNAME"),
        password=os.getenv("MAIL_PASSWORD"),
    )