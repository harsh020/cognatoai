from django.core.exceptions import ValidationError


def validate_fields(required_fields, metadata):
    if type(required_fields) is dict:
        if not set(required_fields.keys()).issubset(metadata.keys()):
            return False

        valid = True
        for key, value in required_fields.items():
            if value is None:
                continue
            valid = valid and validate_fields(value, metadata[key])
            if not valid:
                return False
    if type(required_fields) is set:
        if not set(required_fields.keys()).issubset(metadata.keys()):
            return False


def validate_job_metadata(metadata):
    required_fields = {
        'company': {'name', 'email', 'value', 'business'},
        'job': {'job_id', 'role', 'description'}
    }
    if not validate_fields(required_fields, metadata):
        raise ValidationError("Missing required fields in job metadata.")


def validate_pitch_metadata(metadata):
    required_fields = {
        'startup': {'name', 'founder', 'description'},
    }
    if not validate_fields(required_fields, metadata):
        raise ValidationError("Missing required fields in pitch metadata.")