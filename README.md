**Experimenting D3**

[Github3D library in action](https://bbrassart.github.io/experimenting-d3/index.html)

This example was created to show the GithubD3 Javascript library in action.

It uses all the default options of this library, except for the 
`ajaxSuccessCallback`, `ajaxInactiveCallback` and `ajaxFailCallback` options 
that are used to manipulate the DOM of the page. 

For the rest, this example 
uses only default options, meaning that it will behave as follows:

- It currently will display a tooltip with the details of the Github project the user currently hovers.

- This tooltip can be deactivated by passing the option `{tooltip: false}` to 
the `init` function.

- The Github3D library accepts optional `onMouseouver` and `onMouseout` callback functions, 
meaning that those functions, if present, will be executed every time the user hovers over a 
project (`mouseover`) and leaves the SVG g path of the project (`mouseout`).
