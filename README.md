**Experimenting D3**

[Github3D library in action](https://bbrassart.github.io/experimenting-d3/index.html)

This example was created to show the GithubD3 Javascript library in action.

It uses all the default options of this library, except for the 
`ajaxSuccessCallback`, `ajaxInactiveCallback` and `ajaxFailCallback` options 
that are used to manipulate the DOM of the page. 

For the rest, this example 
uses only default options, meaning  that it will behave as follows:

- It currently will display a tooltip with the details of the Github project the user is 
hovering.

Note that this can be extended using the optional 
callbacks `options.onMouseover` and `options.onMouseout` (to manipulate the DOM for example)
