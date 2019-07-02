import cookie from 'cookie'
import objectHash from 'object-hash'
import riot from 'riot'
import uR from 'unrest.io'

export const observer = riot.observable()

const { Model, Int, String, Field, APIManager } = uR.db

export class TestResult extends Model {
  static slug = 'uc.TestResult'
  static fields = {
    id: Int(),
    results: Field(),
    result_hash: String(),
    params: Field(),
    param_hash: String(),
    //commit_hash
  }
  __str__() {
    if (typeof this.params !== 'object') {
      return `${this.params}`
    }
    return Object.entries(this.params || {})
      .map(entry => entry.join(': '))
      .join(' | ')
  }
  static validate({ params, results }) {
    if (!uR.auth.user) {
      return
    }
    const param_hash = objectHash(params)
    const obj = this.objects.filter({ param_hash }).find(Boolean)
    if (obj) {
      return Promise.resolve(obj.validate(results))
    }
    return this.objects
      .create({
        param_hash,
        params,
        results,
      })
      .then(obj => obj.validate(results))
  }
  validate(results) {
    if (!uR.auth.user) {
      return
    }
    const new_hash = objectHash(results)
    this.last_run = new Date()
    if (!this.result_hash) {
      this.result_hash = new_hash
      this.results = results
      this.GIT_HASH = cookie.parse(document.cookie).GIT_HASH
      this.constructor.objects.create(this)
      this.status = 'new'
    } else if (new_hash !== this.result_hash) {
      this.status = 'fail'
      this.failed_results = results
    } else {
      this.status = 'pass'
    }
    observer.trigger('update')
  }
  accept(results) {
    this.result_hash = objectHash(results)
    this.results = results
    return this.constructor.objects.create(this)
  }
}
new APIManager(TestResult)

uR.db.ready(() => {
  TestResult.validate({
    params: 'Empty Object',
    results: {},
  })
})
