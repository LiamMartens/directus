define(function(require, exports, module) {

  "use strict";

  var app = require('app'),
      UIModel = require('./UIModel'),
      RelationshipModel = require('./RelationshipModel');

  module.exports = Backbone.Model.extend({

      parse: function(result) {
        var ui = result.ui;
        var tableName = '';

        if (_.isEmpty(ui)) {
          throw new Error("Column '"+ result.id + "' in table '" + tableName + "' does not have a UI");
        }


        // Can this be done elsewhere so we can break the app dependency?
        /*if (!app.uiManager.hasUI(ui)) {
          throw new Error("The UI '" + ui + "', set for the column '" + result.id + "' in the table '" + tableName + "' does not exist!");
        }*/

        // make sure that the structure is the right kind for the UI
        // @todo: move this to options instead so it doesn't need to change
        //this.structure = app.uiSettings[ui].schema;

        // this.structure = new ColumnsCollection(uiStructure, {parse: true});
        // initialize UI
        var options = result.options || {};
        options.id = result.ui;
        this.options = new UIModel(options);
        this.options.parent = this;

        delete result.options;

        if (result.relationship) {
          this.relationship = new RelationshipModel(result.relationship);
          this.relationship.parent = this;
          delete result.relationship;
        }

        if (result.master) result.header = true;
        result.header = (result.header === "true" || result.header === true || result.header === 1 || result.header === "1") ? true : false;

        return result;
      },

      getOptions: function() {
        return this.options.get(this.attributes.ui);
      },

      getRelated: function() {
        return this.relationship.get('table_related');
      },

      getTable: function() {
        return this.collection.table;
      },

      getRelationshipType: function() {
        if (!this.hasRelated()) return;
        return this.relationship.get('type');
      },

      hasRelated: function() {
        return this.relationship !== undefined;
      },

      isNullable: function() {
        return this.get('is_nullable') === 'YES';
      },

      isRequired: function() {
        return this.get('required') || !this.isNullable();
      },

      toJSON: function(options) {
        if (options && options.columns) {
          return _.pick(this.attributes, options.columns);
        }
        return _.clone(this.attributes);
      }
  });

});