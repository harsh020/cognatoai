from django.contrib import admin

from susanoo.waitlist.actions import send_beta_invite
from susanoo.waitlist.models import Waitlist


@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    model = Waitlist
    actions = [send_beta_invite,]
    list_display = ('id', 'email')
