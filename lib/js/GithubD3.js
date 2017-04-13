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
 *  ajaxSuccessCallback: function() {
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
   * @param {boolean} [options.tooltip] Optional - By defaut, tooltip is enabled
   * Setting this options to false will remove the tooltip on mouseover
   *
   * @param {function} [options.ajaxSuccessCallback] Optional - If the ajax
   * request is successful, this function will then be executed
   *
   * @param {function} [options.ajaxFailCallback] Optional - If the ajax
   * request throws an error, this function will then be executed
   *
   * @param {function} [options.ajaxInactiveCallback] Optional - If the ajax
   * request is successful but the user does not own any repo, this function
   * will then be executed.
   *
   * @param {function} [options.onMouseover] Optional - Callback executed on
   * mouseover. Can be used to manipulate the DOM. Gets the D3 data as arg.
   *
   * @param {function} [options.onMouseout] Optional - Callback executed on
   * mouseout. Can be used to manipulate the DOM. Gets the D3 data as arg.
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

  /**
   * This function is used to see if the callback function is defined and is
   * a function.
   * If so, we execute it, if not, nothing happens.
   *
   * @param {function} [callback] Optional - A function that needs to be executed async
   *
   */
  this.tryCallback = function(callback) {
    if (callback && typeof callback === "function") {
      callback();
    }
  };

  this.performAjaxRequest = function() {
    $.ajax({
      url: 'https://api.github.com/users/' + this.options.githubUser + '/repos',
      context: this
    }).done(function(repos) {
      if (repos.length > 0) {
        this.drawD3(repos, this);
        this.tryCallback(this.options.ajaxSuccessCallback);
      } else {
        this.tryCallback(this.options.ajaxInactiveCallback);
      }
    }).fail(function() {
      this.tryCallback(this.options.ajaxFailCallback);
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
   *
   * @param {object} options - An object containing all the options needed to
   * draw the donut
   *
   * @param {string} options.targetId - The target ID where the D3 document
   * will be drawn.
   *
   * @param {boolean} [options.tooltip] Optional - By defaut, tooltip is enabled
   * Setting this options to false will remove the tooltip on mouseover
   *
   * @param {function} [options.onMouseover] Optional - Callback executed on
   * mouseover. Can be used to manipulate the DOM. Gets the D3 data as arg.
   *
   * @param {function} [options.onMouseout] Optional - Callback executed on
   * mouseout. Can be used to manipulate the DOM. Gets the D3 data as arg.
   *
   * @param {number} [options.height=600] optional - Thickness of the different
   * g composing the donut
   *
   * @param {number} [options.width=600] optional - Thickness of the different
   * g composing the donut
   *
   */
  this.drawDonut = function(repos, options) {
    var legendRectSize = 18;
    var legendSpacing = 4;
    var donutWidth = 75;
    var width = options.width || 600;
    var height = options.height ||600;
    var onMouseover = options.onMouseover || null;
    var onMouseout = options.onMouseout || null;
    var tooltip = (options.tooltip === undefined) ? true : false;
    var radius = Math.min(width, height) / 2;

    // The enabled prop will be used to animate donut
    repos.forEach(function(repo) {
      repo.enabled = true;
    });

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select(options.targetId)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('preserveAspectRatio', 'xMidYMid meet')
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
      .append("a")
      .attr("href", function(d) {
        return d.data.html_url
      })
      .attr("target", "blank")
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
      .text(function(d) {
        if (d) {
          return d;
        } else {
          return 'Misc';
        }
      });

    //Tooltip creation
    if (tooltip) {
      var tooltip = d3.select(options.targetId)
        .append('div')
        .attr('class', 'tooltip');

      path.on('mouseover', function(d) {
        var total = d3.sum(repos.map(function(repo) {
          return (repo.enabled) ? repo.language : 0;
        }));

        var percent = Math.round(1000 * d.data.language / total) / 10;
        tooltip.select('.language').html(d.data.language || 'Misc');
        tooltip.select('.percent').html(percent + '%');
        tooltip.select('.name').html(d.data.name);
        tooltip.style('display', 'block');
      });

      tooltip.append('div')
        .attr('class', 'language');

      tooltip.append('div')
        .attr('class', 'name');

      path.on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
          .style('left', (d3.event.layerX + 10) + 'px');
      });

      path.on('mouseout', function(d) {
        tooltip.style('display', 'none');
      });
    }

    if (onMouseover) {
      path.on('mouseover', function(d) {
        onMouseover(d);
      });
    }

    if (onMouseout) {
      path.on('mouseout', function(d) {
        onMouseout(d);
      });
    }
  };
};
