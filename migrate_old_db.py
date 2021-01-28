import json
from lookup_hub import models


def main():
    dictionary_fp = '/home/samuelob/dictionary.jsonl'
    languages = ['en', 'de', 'nl']

    expect_category = False
    cat_counter = 0
    row_counter = 0
    category = None

    with open(dictionary_fp, 'r') as dict_f:
        for line in dict_f.readlines():
            row = json.loads(line)
            print(row)
            if expect_category or row['en'].get('colour') == '#0600CE':
                if all([(row[lang]['text'] is None or
                      row[lang]['text'].strip() == '') for lang in languages]):
                    continue
                text = row['de']['text']
                print(f'\ntext: {text}')
                feedback = input(f'Does this look like a category?\n')
                if feedback != 'y':
                    print(json.dumps(row, indent=2))
                    language = input('Enter language or \'s\' to skip a row:')
                    if language == 's':
                        skip = True
                    else:
                        skip = False
                        text = row[language]['text']

                if not skip:
                    category = models.Category(name=text, order=cat_counter)
                    category.save()
                    cat_counter += 1
                    row_counter = 0

            if all([(row[lang]['text'] is None or
                      row[lang]['text'].strip() == '')
                     for lang in languages]):
                expect_category = True
                continue
            else:
                expect_category = False

            row_instance = models.Row(order=row_counter)
            row_instance.save()

            for lang in languages:
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
