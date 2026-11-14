def detect_suspicious_activity(event_type, failed_attempts):
    suspicious_events = [
        "suspicious_login",
        "unauthorized_access",
        "phishing_report",
    ]

    event = event_type.strip().lower()

    if failed_attempts >= 5:
        return True

    return event in suspicious_events
