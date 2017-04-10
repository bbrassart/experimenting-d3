/**
 *
 * The Interface object has only been created to connect this UI with the
 * D3Donut JS library.
 */

var Interface = new function() {

  /**
   *
   * This method is triggered on page load.
   * It listens to the text input. On submit, it will create a D3Donut
   * object to build the graph.
   */
  this.init = function() {

    $("#mainForm").on('submit', function() {
      event.preventDefault();
      $("#graph").html('');

      var donutOptions = {
        targetId: '#graph',
        // tooltip: false,
        githubUser: $('#githubUserInput').val(),

        successCallback: function () {
          $('#graph').show();
          $('#mainButton').show();
          $('#mainButton').text('Hide graph');
          $('#errorMessage').hide();
        },

        failCallback: function () {
          $('#errorMessage')
            .html('Sorry, it seems like this user does not exist')
            .show();
          $('#mainButton').hide();
        },

        inactiveCallback: function () {
          $('#errorMessage')
            .html('This user exists but does not have any active repos')
            .show();
          $('#mainButton').hide();
        }
      };

      GithubD3.init(donutOptions);
    });

    $('#mainButton').on('click', this.toggle.bind(this));
  };

  this.toggle = function() {
    $('#graph').toggle();
    $('#mainButton').text(function(i, text) {
      return text === 'Show graph' ? 'Hide graph' : 'Show graph';
    });
  };
};


Interface.init();
