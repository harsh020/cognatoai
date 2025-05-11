from import_export import resources, fields
from import_export import admin as exim_admin
from import_export.widgets import ForeignKeyWidget

from django.contrib import admin

from susanoo.core.models import Country, State, City, Address, ContactUs


class CountryResource(resources.ModelResource):
    class Meta:
        model = Country
        import_id_fields = ()
        # exclude = ('id', 'is_active', 'is_deleted', 'created', 'modified')


class StateResource(resources.ModelResource):
    country = fields.Field(column_name='country', attribute='country', widget=ForeignKeyWidget(Country, 'id'))

    class Meta:
        model = State

class CityResource(resources.ModelResource):
    state = fields.Field(column_name='state', attribute='state', widget=ForeignKeyWidget(State, 'id'))

    class Meta:
        model = City


@admin.register(Country)
class CountryAdmin(exim_admin.ImportExportModelAdmin):
    resource_class = CountryResource


@admin.register(State)
class StateAdmin(exim_admin.ImportExportModelAdmin):
    resource_class = StateResource


@admin.register(City)
class CityAdmin(exim_admin.ImportExportModelAdmin):
    resource_class = CityResource


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    model = Address


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    model = ContactUs
    list_display = ('id', 'name', 'email', 'created')