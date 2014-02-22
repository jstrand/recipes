
Recipes = new Meteor.Collection("recipes")

if (Meteor.isClient) {
  Session.setDefault('edit_list', false)
  Session.setDefault('recipe', null)
  Session.setDefault('showing_recipe', false)

  Template.main.editing_recipe = function() {
    return Session.get('recipe') != null && !Session.get('showing_recipe')
  }

  Template.main.showing_recipe = function() {
    return Session.get('recipe') != null && Session.get('showing_recipe')
  }

  Template.main.events = {

    'click #add': function(evt) {
      Session.set('recipe', {content: '# Titel\n## Ingredienser\n* \n## Instruktioner\n1. \n2. \n'})
      Session.set('new_recipe', true)
    },

    'click #turn_editing_on': function(evt) {
      Session.set('edit_list', !Session.get('edit_list'))
    }
  }

  Template.main.editing_active = function() {
    return Session.get('edit_list') ? " active" : ""
  }

  Template.recipes.recipes = function() {
    return Recipes.find({deleted: {$ne: true}});
  }

  Template.recipes.edit_list = function() {
    return Session.get('edit_list')
  }

  Template.recipes.title = function() {
    var trimmed_content = this.content.trim()

    var pattern = /\s*#\s*(.*)/
    var matches = pattern.exec(trimmed_content)
    if (matches == null) {
      var first_line_pattern = /(.*)/
      var first_line_matches = first_line_pattern.exec(trimmed_content)
      if (first_line_matches == null) {
        return trimmed_content
      }
      return first_line_matches[1]
    }
    return matches[1]
  }

  Template.recipes.events = {
    
    'click .show-recipe': function(evt) {
      Session.set('recipe', this)
      Session.set('showing_recipe', true)
    },

    'click .edit': function(evt) {
      Session.set('recipe', this)
      Session.set('new_recipe', false)

      evt.stopPropagation()
    },

    'click .remove': function(evt) {
      Recipes.update(this._id, {$set: {deleted: true}})

      evt.stopPropagation()
    }

  }

  Template.edit_recipe.content = function() {
    return Session.get('recipe').content;
  }

  Template.edit_recipe.rendered = function() {
    $('#edit_recipe textarea').focus()
  }

  Template.edit_recipe.events = {

    'click #save': function(evt) {

      var entered_value = $('#recipe_content_input').val()

      if (Session.get('new_recipe')) {
        Recipes.insert({content: entered_value})
      }
      else {
        var old_id = Session.get('recipe')._id

        Recipes.insert({content: entered_value, replaces: old_id})
        // If it was an edit, mark the old recipe deleted
        Recipes.update(old_id, {$set: {deleted: true}})
      }
      Session.set('recipe', null)
    },

    'click #cancel': function(evt) {
      Session.set('recipe', null)
      Session.set('new_recipe', false)
    }
  }

  Template.show_recipe.content = Template.edit_recipe.content

  Template.show_recipe.events = {
    
    'click #close': function(evt) {
      Session.set('recipe', null)
      Session.set('showing_recipe', false)
    }

  }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
