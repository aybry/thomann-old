import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from . import models, serialisers, forms


class HubConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.dictionary_name = [elem for elem in self.scope['path'].split('/')
                                if len(elem) > 0][-1]

        async_to_sync(self.channel_layer.group_add)(
            self.dictionary_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.dictionary_name,
            self.channel_name,
        )

    def receive(self, text_data):
        data_json = json.loads(text_data)

        print(data_json)

        method = getattr(self, data_json['method'])
        result = method(*data_json.get('args', []), **data_json.get('kwargs', {}))

        if data_json['method'] in ('fetch_row_data',):
            self.send(json.dumps(result))
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.dictionary_name,
                {
                    'type': 'send_json',
                    'result': result,
                }
            )

    def append_row(self, cat_id):
        cat = models.Category.objects.get(pk=cat_id)
        last_row = models.Row.objects.filter(category=cat).last()
        try:
            order = last_row.order + 1
        except AttributeError:
            # No other rows in table
            order = 0

        row = models.Row(category=cat,
                         order=order)
        row.save()
        row_srl = serialisers.RowSerialiser(row)

        return {
            'action': 'insert_row',
            'row_data': row_srl.data,
            'neighbours': row.get_neighbour_ids(),
        }

    def insert_new_row(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        category = getattr(row, 'category')
        row_prev, _ = row.get_neighbours()
        if row_prev is None:
            new_order = row.order - 0.11
        else:
            new_order = (row.order + row_prev.order) / 2
        new_row = models.Row(
            order=new_order,
            category=category,
        )

        new_row.save()
        new_row_srl = serialisers.RowSerialiser(new_row)

        return {
            'action': 'insert_row',
            'row_data': new_row_srl.data,
            'neighbours': new_row.get_neighbour_ids(),
        }

    def update_row(self, row_id, row_data):
        row = models.Row.objects.get(pk=row_id)

        for language, cell_data in row_data.items():
            cell_id = row_data[language].pop('id')
            if row_data[language]['colour'] == '#000000':
                row_data[language]['colour'] = ''
            if cell_id != '':
                cell = models.Cell.objects.get(id=cell_id)
                cell.text = row_data[language]['text']
                cell.comment = row_data[language]['comment']
                cell.colour = row_data[language]['colour']
            else:
                cell = models.Cell(row=row,
                                **row_data[language])

            cell.save()

        return {
            'action': 'updated_row',
            'row_data': serialisers.RowSerialiser(row).data,
            'neighbours': row.get_neighbour_ids(),
        }

    def delete_row(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        row.delete()

        return {
            'action': 'remove_row',
            'row_id': row_id
        }

    def fetch_row_data(self, row_id):
        row = models.Row.objects.get(pk=row_id)
        row_srl = serialisers.RowSerialiser(row)

        return {
            'action': 'fetched_row_data',
            'row_data': row_srl.data,
        }

    def send_json(self, data):
        self.send(json.dumps(data['result']))
