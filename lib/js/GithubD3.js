/**
 *
 * The GithubD3 Js library is a simple Javascript library to visualize
 * the repositories of an existing GitHub user via a Donut chart. It works
 * hands in hands with jQuery and D3.js.
 *
 * Code example to instantiate :
 *
 * var options = {
 *  targetId: "graph",
 *  githubuser: "bbrassart",
 *  width: 500,
 *  height: 500,
 *  successCallback: function() {
 *    $("#form").hide();
 *  }
 * }
 *
 * GithubD3.init(options);
 *
 */

var GithubD3 = new function() {

  /**
   * Call this method to initialize the creation process of a Donut Chart to
   * visualize GitHub repos
   *
   * @param {object} options - Here is a sum up of all the supported options :
   *
   * @param {targetId} options.targetId - The ID of the DOM where the D3 element
   * will be drawn
   *
   * @param {string} options.githubUser - The name of the Github user
   *
   * @param {function} [options.successCallback] Optional - If the ajax
   * request is successful, this function will then be executed
   *
   * @param {function} [options.failCallback] Optional - If the ajax
   * request throws an error, this function will then be executed
   *
   * @param {function} [options.inactiveCallback] Optional - If the ajax
   * request is successful but the user does not own any repo, this function
   * will then be executed.
   *
   * @param {string} [options.document="donut"] Optional - In the future, we'll
   * be able to draw different forms using this Github3D library.
   *
   * All those optional callbacks can be very handy to perform UI tasks like
   * removing buttons, changing the text of those buttons, etc...
   */
  this.init = function(options) {
    this.options = options;
    this.performAjaxRequest(this.drawD3);
  };

  this.performAjaxRequest = function() {
    $.ajax({
      url: 'https://api.github.com/users/' + this.options.githubUser + '/repos',
      context: this
    }).done(function(repos) {
      if (repos.length > 0) {
        this.drawD3(repos, this);
        this.options.successCallback ? this.options.successCallback() : null;
      } else {
        this.options.inactiveCallback ? this.options.inactiveCallback() : null;
      }
    }).fail(function() {
      this.options.failCallback ? this.options.failCallback() : null;
    });
  };

  /**
   * Based on the document options (default is 'donut'), you will be able in a
   * near future to draw different tyes of D3 object
   *
   * @param {array} repos - The full Github repos of a user, exposed as an array
   * @param {object} context - An object containing the options, the callbacks,
   * etc...
   *
   */
  this.drawD3 = function(repos, context) {
    switch (context.options.document) {
      default:
        return context.drawDonut(repos, context.options);
    }
  };

  /**
   *
   * @param {array} repos - The full Github repos of a user, exposed as an array
   * @param {object} options - An object containing all the options needed to
   * draw the donut
   * @param {string} options.targetId - The target ID where the D3 document
   * will be drawn.
   * @param {number} [options.width=360] optional - Width of the donut,
   * in pixels
   * @param {number} [options.height=360] optional - Height of the donut,
   * in pixels
   * etc...
   *
   */
  this.drawDonut = function(repos, options) {
    var legendRectSize = 18;
    var legendSpacing = 4;
    var donutWidth = 75;
    var width = options.width || 360;
    var height = options.height ||360;
    var radius = Math.min(width, height) / 2;

    // The enabled prop will be used to animate donut
    repos.forEach(function(repo) {
      repo.enabled = true;
    });

    var color = d3.scaleOrdinal(d3.schemeCategory20b);

    var svg = d3.select(options.targetId)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

    var arc = d3.arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);

    var pie = d3.pie()
      .value(function() { return repos.length; })
      .sort(null);

    var path = svg.selectAll('path')
      .data(pie(repos))
      .enter()
      .append('path')
      .attr("d", arc).style('stroke', 'white')
      .style('stroke-width', 5)
      .attr('fill', function(d) {
        return color(d.data.language);
      })
      .each(function(d) { this._current = d; });

    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color)
      .on('click', function(label) {
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(repos.map(function(d) {
          return (d.enabled) ? repos.length : 0;
        }));

        if (rect.attr('class') === 'disabled') {
          rect.attr('class', '');
        } else {
          if (totalEnabled < 2) return;
          rect.attr('class', 'disabled');
          enabled = false;
        }

        pie.value(function(d) {
          if (d.language === label) d.enabled = enabled;
          return (d.enabled) ? repos.length : 0;
        });

        path = path.data(pie(repos));

        path.transition()
          .duration(750)
          .attrTween('d', function(d) {
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
          });
      });

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d; });

    //Tooltip creation
    var tooltip = d3.select(options.targetId)
      .append('div')
      .attr('class', 'tooltip');

    tooltip.append('div')
      .attr('class', 'language');

    tooltip.append('div')
      .attr('class', 'name');



    path.on('mouseover', function(d) {
      var total = d3.sum(repos.map(function(repo) {
        return (repo.enabled) ? repo.language : 0;
      }));

      var percent = Math.round(1000 * d.data.language / total) / 10;
      tooltip.select('.language').html(d.data.language);
      tooltip.select('.percent').html(percent + '%');
      tooltip.select('.name').html(d.data.name);
      tooltip.style('display', 'block');
    });

    path.on('mouseout', function(d) {
      tooltip.style('display', 'none');
    });
  };
};