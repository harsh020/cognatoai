from django.urls import path

from izanagi.organization.api.v1.views import OrganizationCreateView, OrganizationListView, \
    OrganizationRetrieveUpdateDestroyView, MemberListView

app_name = "organization"
urlpatterns = [
    # path("", view=OrganizationCreateView.as_view(), name="org-create"),
    path("", view=OrganizationListView.as_view(), name="list"),
    path("<uuid:id>/", view=OrganizationRetrieveUpdateDestroyView.as_view(), name="retrieve-update-delete"),
    path("<uuid:id>/members/", view=MemberListView.as_view(), name="member-list"),
]
