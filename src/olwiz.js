'use strict';

export default class olWizard {
  constructor(
    selector, {
    title='.olwiz-title',
    content='.olwiz-content',
    next='.olwiz-next',
    prev='.olwiz-prev',
    passed='olwiz-passed',
    failed='olwiz-failed',
    active='olwiz-active',
    validate=undefined
  }) {
    this.selector = selector;
    this.title = title;
    this.content = content;
    this.next = next;
    this.prev = prev;
    this.passed = passed;
    this.failed = failed;
    this.active = active;
    this.validate = validate;

    this.current = Proxy.create({
      get: function(proxy, name) {
        console.log(proxy, name);
        return proxy[name];
      },
      set: proxy, name, value => {
        console.log(proxy, name, value);
        proxy[name] =  this.goto(value);
      }
    });

  }

  step(step_id) {

  }

  goto(step_id) {

  }
}

class lilWizard {
  constructor() {

  }
}