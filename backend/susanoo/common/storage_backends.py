from django.conf import settings
from storages.backends.gcloud import GoogleCloudStorage
from google.cloud import storage as gcs_storage


class EmulatorGoogleCloudStorage(GoogleCloudStorage):
    """
    Points django-storages' GCS client at a local emulator during development.
    """

    def _get_gcs_connection(self):
        """
        Override the method that builds the google-cloud-storage client.
        """
        endpoint = getattr(settings, 'GCS_EMULATOR_ENDPOINT', None)
        print(endpoint)
        if endpoint:
            # supply our emulator URL to the client
            return gcs_storage.Client(
                project=self.project_id,
                client_options={"api_endpoint": endpoint}
            )


    @property
    def client(self):
        if self._client is None:
            self._client = self._get_gcs_connection()
        return self._client
