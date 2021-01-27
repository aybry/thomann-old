from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
# from rest_framework.parsers import JSONParser

from . import models, serialisers, forms

class HomeView(TemplateView):
    template_name = 'lookup_hub/home.html'


class HubView(LoginRequiredMixin, TemplateView):
    template_name = 'lookup_hub/hub.html'

    def get_context_data(self, **kwargs):
        hub_dictionary = models.Dictionary.objects.get(name='hub')
        dictionary_data = serialisers.CategorySerialiser(
                            models.Category.objects.filter(dictionary=hub_dictionary),
                            many=True)
        return {
            'show_connected_tab': True,
            'dictionary_data': dictionary_data.data,
        }


class SandboxView(TemplateView):
    template_name = 'lookup_hub/hub.html'

    def get_context_data(self, **kwargs):
        sandbox_dictionary = models.Dictionary.objects.get(name='sandbox')
        dictionary_data = serialisers.CategorySerialiser(
                            models.Category.objects.filter(dictionary=sandbox_dictionary),
                            many=True)
        return {
            'show_connected_tab': True,
            'dictionary_data': dictionary_data.data,
        }


class GuideView(TemplateView):
    template_name = 'lookup_hub/guide.html'

