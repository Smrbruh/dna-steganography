import re
def validate_dna_sequence(dna: str) -> bool:
    return bool(re.match(r'^[ACGT]+$', dna))
def validate_email(email: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))