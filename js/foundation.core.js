!function($) {
  // Polyfill to get the name of a function in IE9
  if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
    Object.defineProperty(Function.prototype, 'name', {
      get: function() {
        var funcNameRegex = /function\s([^(]{1,})\(/;
        var results = (funcNameRegex).exec((this).toString());
        return (results && results.length > 1) ? results[1].trim() : "";
      },
      set: function(value) {}
    });
  }

  var Foundation = {
    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {String} name - Formal name of the component.
     * @param {String} attr - Data attribute used to find instances of this plugin. It's usually the same as the plugin name, but it may be different.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function(name, plugin) {
      // Add to the Foundation object
      this[Toggler.prototype.constructor.name] = plugin;
      // Add to the plugins list (for reflowing)
      this._plugins[name] = plugin;
    },

    /**
     * Return the instance of a plugin initialized on an element, or `null` if the element has no Foundation plugins.
     * @param {Object} element - CSS selector, DOM element, or jQuery object to check.
     */
    getPlugin: function(element) {
      return $(element).eq(0).data('zf-plugin') || null;
    },

    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function(elem, plugins) {
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      } else if (typeof plugins === 'string') {
        plugins = [plugins];
      }

      var _this = this;

      $.each(plugins, function(i, name) {
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-'+name+']').addBack('*');

        // For each plugin found, initialize it
        $elem.each(function() {
          // Don't double-dip on plugins
          if ($(this).attr('zf-plugin')) {
            console.warn("Tried to initialize "+name+" on an element that already has a Foundation plugin.");
            return;
          }

          // Take every setting in the plugin's options variable, and look for a data attribute that matches
          // So data-thing plugin.options.thing
          var options = {};
          for (var prop in plugin.defaults) {
            var dataOption = $(this).data(prop.toLowerCase());
            if (typeof dataOption !== 'undefined')
              options[prop] = dataOption;
          }

          // Initialize the plugin with the found options, and drop it in the "data-zf-plugin" attribute so it can be fetched later
          $(this).data('zf-plugin', new plugin($(this), options));
        });
      });
    }
  }

  var foundation = function(method) {
    var type = typeof method;

    if (type === 'undefined') {
      Foundation.reflow(this);
    } else if (type === 'object') {
      // Set plugin settings
      Foundation.reflow(this);
    } else if (type === 'string' || type === 'array') {
      Foundation.reflow(this, method);
    }

    return this;
  }

  window.Foundation = Foundation;
  $.fn.foundation = foundation;
}(jQuery)