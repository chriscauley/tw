import uR from "unrest.io"
import { observer, TestResult } from '../models'
const diff = require("diff")

uR.auth.ready(() => {
  uR.element.create("uc-toggle",{ parent: document.body }, {})
})

<uc-toggle>
  <div if={fails} class="{css.btn.cancel} badge badge-danger" data-badge={fails}
       onclick={open}>!</div>
  <div class="{css.btn.link} {badge: total}" data-badge={total} onclick={open}>
    <i class="fa fa-gg" />
  </div>
<script>
this.mixin(uR.css.Mixin)
this.on('mount', () => {
  observer.on('update', () => this.update())
})
this.on("update", () => {
  const tests = TestResult.objects.all().filter(t => t.status)
  this.total = tests.length
  this.fails = tests.filter(t => t.status === "fail").length
})
open() {
  uR.element.alert("uc-viewer",{},{})
}
</script>
</uc-toggle>

<uc-viewer>
  <div class={theme.outer}>
    <div class={theme.content}>
      <uc-list if={!active_test} />
      <uc-detail if={active_test} active_test={active_test}/>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
activate(e) {
  this.active_test = e.item.test
  this.update()
}
</script>
</uc-viewer>

<uc-list>
  <div each={test in ran}>
    <div class={css.btn.link} onclick={parent.parent.activate}>
      <i class={icon[test.status]} />
      {test}
    </div>
  </div>

<script>
this.mixin(uR.css.ThemeMixin)
this.bg = {
  pass: 'bg-success',
  "new": 'bg-warning',
  fail: 'bg-error',
}
this.icon = {
  pass: 'fa fa-check text-success',
  "new": 'fa fa-new text-warning',
  fail: 'fa fa-exclamation-triangle text-error'
}
this.on("update",() => {
  this.all = TestResult.objects.all()
  this.ran = this.all.filter(t => t.status)
  const section = (slug) => ({
    slug,
    name: slug,
    items: this.ran.filter(t => t.status === "slug")
  })
  this.sections = [
    section("new"),
    section("fail"),
    section("pass"),
  ]
})
this.on('mount',() => this.update())
</script>
</uc-list>

<uc-detail>
  <div>
    <h3>
      {test}
      <div if={status === "fail"} class="float-right btn btn-primary"
           onclick={accept}>Accept</div>
    </h3>
    <div each={block in blocks} class={getClass(block)} onclick={toggle}>
      <pre each={line in block.lines}>{line}</pre>
    </div>
  </div>
<script>
this.on("mount", () => {
  const test = this.test = this.opts.active_test
  this.status = this.test.status
  const a = JSON.stringify(test.results,null,2)
  const b = JSON.stringify(test.failed_results,null,2)
  this.blocks = diff.diffJson(test.results, test.failed_results)
  this.blocks.forEach(block => {
    block.lines = block.value.replace(/\n$/,'').split("\n")
   })
  this.update()
})
getClass(block) {
  if (block.added) {
    return "added"
  }
  if (block.removed) {
    return 'removed'
  }
  return `unchanged ${block.active? "" : "closed"}`
}

toggle(e) {
  e.item.block.active = !e.item.block.active
  this.update()
}

accept() {
  this.test.accept(this.test.failed_results)
}
</script>
<style>
.added { background: #CFC }
pre:before { content: "  " }
.added pre:before { content: "+ " }
.removed pre:before { content: "- " }

.removed { background: #FCC }

pre {
  margin: 0;
  overflow: hidden;
  transition: 0.25s;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1px;
}

.unchanged:hover pre {
  cursor: pointer;
  border-bottom: 1px solid #ccf;
}

.unchanged.closed pre {
  max-height: 0px;
}

.unchanged pre,
.unchanged.closed pre:first-child,
.unchanged.closed pre:last-child {
  max-height: 1.5em;
}
</style>
</uc-detail>