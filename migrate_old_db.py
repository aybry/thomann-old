import json
import os
import numpy as np

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thomann.settings")

import django

django.setup()

from lookup_hub import models


def main():
    DICTIONARY_FP = '/home/aybry/dictionary.jsonl'
    LANGUAGES = ['en', 'de', 'nl']

    expect_category = False
    cat_counter = 0
    row_counter = 0
    category = None
    dictionary = models.Dictionary.objects.get(name='hub')
    categories = list(models.Category.objects.filter(dictionary=dictionary))[-1:]

    with open(DICTIONARY_FP, 'r') as dict_f:
        row_idx = 5024
        for line in dict_f.readlines()[row_idx:]:
            row_idx += 1

            row = json.loads(line)
            print(row)

            try:
                category = models.Category.objects.get(name=row['de']['text'],
                                                       order=categories[0].order,
                                                       dictionary=dictionary)
                if category == categories[0]:
                    try:
                        categories.pop(0)
                        row_counter = 0
                    except IndexError:
                        pass
                continue
            except (models.Category.DoesNotExist, IndexError):
                pass


                # if (row['en'].get('colour') == '#0600CE'
                #     or np.sum([
                #         [(row[lang]['text'] is None or
                #           row[lang]['text'].strip() == '') for lang in LANGUAGES]
                #         ]) == 2):
                #     if all([(row[lang]['text'] is None or
                #           row[lang]['text'].strip() == '') for lang in LANGUAGES]):
                #         continue
                #     print(f'\nen: {row["en"].get("text")}')
                #     print(f'de: {row["de"].get("text")}')
                #     print(f'nl: {row["nl"].get("text")}\n')
                #     text = row["de"]["text"]
                #     feedback = input(f'Does this look like a category?\n')

                #     save_cat = True
                #     save_row = False

                #     if feedback != 'y':
                #         print(json.dumps(row, indent=2))
                #         language = input('Enter language, \'r\' to save as row or \'s\' to skip:')
                #         if language == 's':
                #             save_cat = False
                #         elif language == 'r':
                #             save_cat = False
                #             save_row = True
                #         else:
                #             text = row[language]['text']

                #     if save_cat:
                #         category = models.Category(name=text,
                #                                    dictionary=dictionary,
                #                                    order=cat_counter)
                #         category.save()
                #         cat_counter += 1
                #         continue
                #     elif save_row:
                #         pass
                #     else:
                #         continue

            row_instance = models.Row(order=row_counter,
                                      category=category)
            row_instance.save()
            row_counter += 1

            for lang in LANGUAGES:
                if (row[lang]['text'] == ''
                    and row[lang].get('comment') is None
                    and row[lang].get('colour') in ['', None]):
                    continue
                else:
                    entry = models.Cell(
                        language=lang,
                        row=row_instance,
                        text=row[lang].get('text'),
                        comment=row[lang].get('comment'),
                        colour=row[lang].get('colour'),
                    )
                    entry.save()

main()
