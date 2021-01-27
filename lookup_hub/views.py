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
        dictionary_data = serialisers.CategorySerialiser(
                            models.Category.objects.all(),
                            many=True)
        return {
            'dictionary_data': dictionary_data.data,
            'row_form': forms.RowForm,
            'cell_form': forms.CellForm,
        }


class SandboxView(TemplateView):
    template_name = 'lookup_hub/hub.html'

    def get_context_data(self, **kwargs):
        return {
            # 'dictionary_data': dummy_dictionary
        }


class GuideView(TemplateView):
    template_name = 'lookup_hub/guide.html'

