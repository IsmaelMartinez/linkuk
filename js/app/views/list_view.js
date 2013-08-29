/* globals window */
var Backbone     = require('backbone'),
    $            = require('jquery'),
    Query        = require('lib/query'),
    _            = require('underscore'),
    facilities   = require('collections/facilities').instance,
    searchParams = ["fr"],
    parseParams  = require('lib/query_param_parser');

function generateQueryParams(queryString) {
  var params       = parseParams(queryString),
      categories   = _.compact((params.categories || '').split(',')),
      demographics = _.compact((params.demographics || '').split(',')),
      gender       = params.gender || null,
      search       = decodeURIComponent(params.search || ''),
      sort         = params.sort,
      queryParams  = { search: search },
      filterParams = {};

  if (categories.length > 0) {
    filterParams.categories = categories;
  }

  if (demographics.length > 0) {
    filterParams.age = demographics;
  }

  if (params.gender && params.gender !== 'A') {
    filterParams.gender = params.gender;
  }

  if (params.sort) {
    queryParams.sort = params.sort;
  }

  queryParams.filter = filterParams;

  return queryParams;
}

function validCategory(category) {
  return category && (/[a-z]+/).test(category.toString());
}

function getData($elements, dataAttrName) {
  var result = [];
  $elements.each(function(n, el) {
    result.push($(el).data(dataAttrName));
  });
  return result;
}

var ListView = Backbone.View.extend({
  categories: require('lib/categories'),
  template: require('templates/list'),

  events: {
    "click #filter-button": 'goToFilter',
    "click #load-more":     'loadMore'
  },

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },

  reset: function() {
    this.offset = this.hideMore = null;
  },

  loadMore: function() {
    $('#loading-spinner').show();
    $('#load-more-container').hide();

    Query.submit(this.getFilterParams()).done(function(results) {
      $('#loading-spinner').hide();

      this.offset = results.offset;
      this.hideMore = (results.data.length < 10);

      this.collection.add(results.data);
      this.render();
    }.bind(this));
  },

  goToFilter: function() {
    var router = require('routers/router').instance;
    router.navigate("filter", {trigger: true});
  },

  generateQueryParams: generateQueryParams,

  getFilterParams: function () {
    var queryString  = window.location.hash.substring(window.location.hash.indexOf('?')+1),
        queryParams  = generateQueryParams(queryString);

    queryParams.offset = this.offset;

    this.options.categories = queryParams.filter.categories || [];

    return queryParams;
  },

  performQuery: function(params) {
    return Query.submit(params).done(function(results) {
      searchParams = params;
      // populate with results
      facilities.reset(results.data);
      this.offset = results.offset;
    }.bind(this));
  },

  resetFilters: function() {
    this.$(".query .selected").removeClass("selected");
    var self = this;

    this.options.categories.forEach(function(category) {
      self.$categoryOption(category).addClass("selected");
    });

    this.$(".query-option-gender [data-value='A']").addClass('selected');
  },

  $categoryOption: function(category) {
    if(validCategory(category)) {
      return this.$(".query-option-category [data-value=" + category + "]").addClass("selected");
    } else {
      return $();
    }

  },

  render: function() {
    var deepJson = this.deepToJson(this.collection);
    var templateJson = this.flattenServices(deepJson);

    // replace with template
    this.$el.html(this.template({
      facilities: templateJson,
      categories: this.categories,
      searchParams: this.filterSelectCategories(this.options.categories),
      navButtons: [
        {class: 'left', id: 'backNav-button', text: 'Back'},
        {class: 'right', id: 'filter-button', text: 'Filter'}
      ]
    }));
    this.$('.query').hide();
    this.$('.option-group-exclusive .query-option').click(function() {
      $(this).closest(".option-group-exclusive").find(".query-option").removeClass("selected");
      $(this).toggleClass("selected");
    });

    this.$('.option-group .query-option').click(function() {
      $(this).toggleClass("selected");
    });
    this.$('#backNav-button').click(function(){
      require('routers/router').instance.back();
    });

    if ( !this.hideMore ) {
      this.$('#load-more-container').show();
    }

    this.resetFilters();
    return this;
  },

  deepToJson: function(collection) {
    var json = [],
        modelJson;

    json = collection.models.map(function(model) {
      modelJson = model.toJSON();
      modelJson.services = [];

      model.attributes.services.forEach(function(service) {
        modelJson.services.push(service.toJSON());
      });

      return modelJson;
    });

    return json;
  },

  filterSelectCategories: function(queryParams) {
    var match, selectedCategories = [];

    queryParams.forEach(function(queryName) {
      var match = _.find(this.categories, function(e){ return e.key == queryName; });
      if (!_.contains(selectedCategories, match)) {
        selectedCategories.push(match);
      }
    });

    return selectedCategories;
  },

  flattenServices: function(jsonArray) {
    var serviceCategories,
        allNotes,
        flattened = [],
        self = this;

    jsonArray.forEach(function(jsonModel) {
      serviceCategories = [];
      allNotes = [];

      jsonModel.services.forEach(function(jsonService) {
        serviceCategories.push(jsonService.category);
        allNotes.push(jsonService.notes);
      });

      jsonModel.serviceCategories = self.filterSelectCategories(serviceCategories);
      // jsonModel.serviceCategories = serviceCategories.join(', ');
      jsonModel.allNotes = allNotes.join(' ');
      flattened.push(jsonModel);
    });

    return flattened;
  }
});

module.exports = ListView;
