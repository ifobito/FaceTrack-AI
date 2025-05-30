from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, FaceDataViewSet
from .views import RegistrationAPIView
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'face_data', FaceDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 