/**
 *
 * The D3Donut Js library is a simple Javascript library that visualize
 * the repositories of an existing GitHub user. It works hands in hands with
 * jQuery and D3.js
 *
 */

var D3Donut = new function() {

  this.init = function(options) {
    this.performAjaxRequest(this.initD3Graph, options);
  };

  this.performAjaxRequest = function(drawGraph, options) {
    $.ajax({
      url: 'https://api.github.com/users/' + options.githubUser + '/repos'
    }).done(function(repos) {
      if (repos.length > 0) {
        drawGraph(repos, options);
        options.successCallback ? options.successCallback() : null;
      } else {
        options.inactiveCallback ? options.inactiveCallback() : null;
      }
    }).fail(function() {
      options.errorCallback ? options.errorCallback() : null;
    });
  };

  // Options are optionals
  this.initD3Graph = function(repos, options) {
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

    var svg = d3.select('#graph')
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
      .attr('d', arc)
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
    var tooltip = d3.select('#graph')
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
