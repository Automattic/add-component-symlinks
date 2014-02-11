add-component-symlinks
======================
### Adds symlinks to the node_modules dir to fix component require() calls

Why? Cause there's some good, generic and reusable "component" code out there,
but the `require()` calls in component don't quite match up to the calls in
NodeJS.


Installation
------------

Install the `add-component-symlinks` executable via npm:

``` bash
$ npm install -g add-component-symlinks
```


CLI Examples
------------

The `add-component-symlinks` executable traverses the `node_modules` dir and looks
inside the installed modules for a `component.json` file. If a component.json file
is found, then a symlink with the component name is added inside the
`node_modules` directory.

``` bash
$ npm install

$ add-component-symlinks

$ ls -l node_modules/
total 4
drwxr-xr-x 11 nrajlich staff 374 Feb 10 16:26 component-matches-selector/
lrwxr-xr-x  1 nrajlich staff  26 Feb 10 16:33 matches-selector -> component-matches-selector/
```
