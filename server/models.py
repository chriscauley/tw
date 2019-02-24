from unrest.models import JsonModel


class Sheet(JsonModel):
    json_fields = ['id', 'data']

    def __str__(self):
        return self.data.get("name", "Sheet #: {}".format(self.id))


class Sprite(JsonModel):
    json_fields = ['id', 'data']

    def __str__(self):
        return self.data.get("name", "Sprite #: {}".format(self.id))


class CompositeSprite(JsonModel):
    json_fields = ['id', 'data']

    def __str__(self):
        return self.data.get("name", "CompositeSprite #: {}".format(self.id))
