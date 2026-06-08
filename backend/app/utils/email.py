import os

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@studyflow.app")


async def send_verification_email(to_email: str, token: str, base_url: str) -> bool:
    verify_url = f"{base_url}/api/auth/verify-email?token={token}"

    if not RESEND_API_KEY:
        # Dev mode: print link to console so it can be tested without an email service
        print(f"\n[email] VERIFICATION LINK for {to_email}:\n  {verify_url}\n")
        return True

    import httpx
    html = (
        f"<h2>Welcome to StudyFlow!</h2>"
        f"<p>Click the link below to verify your email address:</p>"
        f'<p><a href="{verify_url}">Verify my account</a></p>'
        f"<p>This link expires in 24 hours.</p>"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={"from": FROM_EMAIL, "to": to_email, "subject": "Verify your StudyFlow account", "html": html},
        )
    return resp.status_code == 200
