from server.models import AbstractModel


class TestResult(AbstractModel):
  def __str__(self):
    params = self.data.get('params', {})
    if hasattr(params, 'items'):
      return " | ".join(
        sorted([': '.join([k, repr(v)]) for k, v in params.items()])
      )
    return '"{}"'.format(params)
