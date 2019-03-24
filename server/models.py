from unrest.models import JsonModel


class AbstractModel(JsonModel):
    class Meta:
        abstract = True
    json_fields = ['id', 'data']

    def __str__(self):
        return self.data.get(
            "name",
            "{} #: {}".format(self.__class__.__name__, self.id)
        )


class Sheet(AbstractModel):
    pass


class Sprite(AbstractModel):
    pass


class CompositeSprite(AbstractModel):
    pass


class PieceGenerator(AbstractModel):
    pass


class Board(AbstractModel):
    pass
