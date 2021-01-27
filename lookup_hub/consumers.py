import json

from channels.generic.websocket import JsonWebsocketConsumer
from . import models, serialisers


class HubConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)

        print(data_json)

        method = getattr(self, data_json['method'])
        new_row = method(*data_json.get('args', []),
               **data_json.get('kwargs', {}),)

    def insert_new_row(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        category = getattr(row, 'category')
        row_prev, _ = row.get_neighbours()
        if row_prev is None:
            new_order = row.order - 0.11
        else:
            new_order = (row.order + row_prev.order) / 2
        print(f'making new row at position {new_order}')
        new_row = models.Row(
            order=new_order,
            category=category,
        )

        new_row.save()
        new_row_srl = serialisers.RowSerialiser(new_row)
        self.send_json(content=new_row_srl.data)
        print('Sent!')

    def delete_row(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        row.delete()

    def fetch_row_data(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        print(row)
        row_srl = serialisers.RowSerialiser(row)
        print(row_srl)
        self.send_json(content=row_srl)
