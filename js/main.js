var Interface = new function() {

  this.listen = function() {
    $("#validateUserInput").on('click', function() {
      if ($('#githubUserInput').val().length > 0) {
        $("#graph").html('');

        var donutOptions = {
          height: 500,
          width: 500,
          errorCallback: function() {
            $('#errorMessage').show();
            $('#mainButton').hide();
          },
          githubUser: $('#githubUserInput').val(),
          successCallback: function() {
            $('#graph').show();
            $('#mainButton').show();
            $('#errorMessage').hide();
          }
        };

        D3Donut.init(donutOptions);

      } else {
        $('#errorMessage').show();
        $('#mainButton').hide();
      }
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


Interface.listen();
