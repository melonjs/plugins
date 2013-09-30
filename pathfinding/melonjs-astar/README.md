melonjs-astar
=============

MelonJS plugin implementing the AStar algorithm.

Official repository : https://github.com/swmuron/melonjs-astar

Credit: http://github.com/bgrins/javascript-astar

License: MIT

Usage
=====

- Add melonjs-astar.js to your plugins directory and include it on your game page.
- Register it in your game.js:
`me.plugin.register(aStarPlugin, "astar");`
- Call me.astar.search(x0,y0,x1,y0) from your entity code.
- me.astar.search will return an array of GraphNodes
- Uses the collision layer to determine walkable areas.

Sample
======

For conveinence, a basic node server script is included with the sample.

Control with the arrow keys. The chaser entity will recalcuate its route occasionally and switch pathing logic when it gets close enough to you. Feel free to experiment or use the code.

TODO List
==========

- Refactor the code so we can use existing tile objects instead of separate GraphNode objects. This will allow us to factor in tile changes as well.
- Similarly, refactor the code so we can pass in me.Rect objects instead of having to specify the coordinates manually.
- Allow for weighted nodes through some mechanism.
- Allow specific entities to affect pathfinding.
- Allow for more than one instance for two-tier algorithms
- Implement some advanced A* speedup such as RSR or JPS