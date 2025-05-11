from rest_framework import serializers

from susanoo.core.models import Country, State, City, Address, ContactUs, File


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        exclude = ('created', 'modified', 'is_active', 'is_deleted',)


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        exclude = ('created', 'modified', 'is_active', 'is_deleted',)


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        exclude = ('created', 'modified', 'is_active', 'is_deleted',)


class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()

    # city = CitySerializer()
    # state = StateSerializer()
    # country = CountrySerializer()

    def get_full_address(self, obj):
        return f'{obj.address_line_1}, {obj.address_line_2 or ""}, {obj.city.name}, {obj.state.name} - {obj.pincode}, {obj.country.name}'

    class Meta:
        model = Address
        fields = '__all__'


class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = '__all__'


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'