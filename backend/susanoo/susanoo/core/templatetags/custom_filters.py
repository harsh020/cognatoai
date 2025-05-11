# susanoo/templatetags/custom_filters.py
from django import template

register = template.Library()


@register.filter(name='snake_to_title')
def snake_to_title_filter(value):
    """
    Converts a snake_case string to Title Case.
    Example:  "python_assessment" -> "Python Assessment"
    """
    if not value:
        return ""  # Handle empty strings gracefully
    return value.replace("_", " ").title()