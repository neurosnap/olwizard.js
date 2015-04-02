(function($) {
  "use strict";

  $.fn.olWizard = function(options) {
    if (this.length === 0) throw("DOM Element not found.");
    var that = this;
    this.opts = $.extend({
      title: ".olwiz-title",
      content: ".olwiz-content",
      next: ".olwiz-next",
      prev: ".olwiz-prev",
      passed: "olwiz-passed",
      failed: "olwiz-failed",
      active: "olwiz-active",
      validate: {},
      animate: true
    }, options);

    this._done = false;
    this.lilwiz = {};

    this.find(this.opts.content).hide();

    this.gotoStep = function(step_id, animate) {
      if (typeof animate === "undefined") {
        animate = this.opts.animate;
      }
      var step = this.getStep(step_id);
      if (typeof step === "undefined") {
        return;
      };

      if (step.isFirst()) {
        step.find(this.opts.prev).prop("disabled", true);
      } else {
        step.find(this.opts.prev).prop("disabled", false);
      }

      this.children("li").removeClass(that.opts.active);
      step.addClass(that.opts.active);
      step.find(this.opts.content).show();
      if (!this._done) {
        step.trigger("olwizStep", step);
      }

      if (animate) {
        $('html, body').animate({
          scrollTop: step.offset().top
        }, 600);
      }

      return this;
    };

    this.eachStep = function(callback) {
      for (var key in this.lilwiz) {
        var step = this.lilwiz[key];
        $.proxy(callback, step, key)();
      }
    };

    this.getStep = function(step_id) {
      var step;
      this.eachStep(function(index) {
        if (step_id == this.getStepNumber()) {
          step = this;
          return;
        } else if (step_id == this.opts.name) {
          step = this;
          return;
        }
      });
      if (step) return step;

      var $steps = this.children("li");
      var lilwiz;
      $steps.each(function(index) {
        var step_num = index + 1;
        if (step_id == step_num) {
          that.lilwiz[step_num] = $(this).lilWizard(that);
          lilwiz = that.lilwiz[step_num];
          return;
        }
        if (step_id == $(this).attr("name")) {
          that.lilwiz[step_num] = $(this).lilWizard(that);
          lilwiz = that.lilwiz[step_num];
          return;
        }
      });
      return lilwiz;
    };

    this.getActiveStep = function() {
      for (var step_id in this.lilwiz) {
        var lilwiz = this.lilwiz[step_id];
        if (lilwiz.hasClass(this.opts.active)) {
          return lilwiz;
        }
      }
      return;
    };

    this.next = function(step) {
      if (typeof step === "undefined") {
        var step = this.getActiveStep();
      }
      if (!step) return;
      if (step._disable_actions) return;
      if (!step.hasClass(that.opts.active)) return;

      if (!this._done) {
        var validated = step._validate();
        if (validated !== true) {
          return;
        }

        if (step.isLast()) {
          this._done = true;
          step.passed(false);
          step.removeClass(this.opts.active);
          step.trigger("olwizDone");
          return;
        }
      }

      return this.gotoStep(step.getStepNumber() + 1);
    };

    this.prev = function(step) {
      if (typeof step === "undefined") {
        var step = this.getActiveStep();
      }
      if (!step) return;
      if (step._disable_actions) return;
      if (!step.hasClass(that.opts.active)) return;

      return this.gotoStep(step.index());
    };

    return this;
  };

  $.fn.lilWizard = function(olwiz, options) {
    var that = this;
    this.olwiz = olwiz;
    this.opts = $.extend({
      name: this.attr("name")
    }, options);

    this._data = {};
    this._disable_actions = false;
    this.validator;
    _events(this);

    this.getStepNumber = function() {
      return this.index() + 1;
    };

    this.getTitle = function() {
      return this.find(this.find(this.olwiz.opts.title));
    };

    this.getContent = function() {
      return this.find(this.find(this.olwiz.opts.content));
    };

    this.isFirst = function() {
      return this[0] === this.olwiz.children("li").first()[0];
    };

    this.isLast = function() {
      return this[0] === this.olwiz.children("li").last()[0];
    };

    this.data = function(data) {
      if (typeof data === "undefined") {
        return this._data;
      }
      this._data = data;
      return this;
    };

    this.disable_actions = function() {
      $(this).find(this.olwiz.opts.prev).prop("disabled", true);
      $(this).find(this.olwiz.opts.next).prop("disabled", true);
      this._disable_actions = true;
    };

    this.enable_actions = function() {
      if (!this.isFirst()) {
        this.find(this.olwiz.opts.prev).prop("disabled", false);
      }
      this.find(this.olwiz.opts.next).prop("disabled", false);
      this._disable_actions = false;
    };

    this.passed = function(next_step) {
      this
        .removeClass(this.olwiz.opts.failed)
        .addClass(this.olwiz.opts.passed);

      this.enable_actions();
      this.trigger("olwizStepPassed", this);

      if (typeof next_step === "undefined") {
        next_step = true;
      }

      if (next_step) {
        this.olwiz.gotoStep(this.getStepNumber() + 1);
      }

      return this;
    };

    this.failed = function(data) {
      if (typeof data !== "undefined") {
        this.data(data);
      }

      this
        .removeClass(this.olwiz.opts.passed)
        .addClass(this.olwiz.opts.failed);

      this.enable_actions();
      this.trigger("olwizStepFailed", this);

      return this;
    };

    this.validate = function(callback) {
      this.validator = callback;
      return this;
    };

    this._validate = function() {
      var step_num = this.getStepNumber();
      var validated = true;

      this.disable_actions();

      if (typeof this.validator !== "undefined") {
        validated = this.validator(this);
      }

      if (validated === true) {
        this.passed(false);
        return true;
      } else if (validated === false) {
        this.failed();
        return false;
      } else {
        this.enable_actions();
        return;
      }
    };

    function _events(self) {
      self.on("click", self.olwiz.opts.next, function() {
        self.olwiz.next();
      });

      self.on("click", self.olwiz.opts.prev, function() {
        self.olwiz.prev();
      });

      self.on("click", self.olwiz.opts.title, function() {
        if (self.hasClass(self.olwiz.opts.passed)
            || self.hasClass(self.olwiz.opts.failed)) {
              return self.olwiz.gotoStep(that.getStepNumber());
        }
        return;
      });
    }

    return this;
  };

} (jQuery));
