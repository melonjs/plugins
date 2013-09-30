// MelonJS-AStar
// By Sean Muron (swmuron@github)
// See readme.md for documentation
// Freely distributable under the MIT License.

// Uses code from:
// javascript-astar 
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Includes Binary Heap (with modifications) from Marijn Haverbeke. 
// http://eloquentjavascript.net/appendix2.html

(function($) {

	// TODO - use collision engine settings for this
	var GraphNodeType = { 
	    OPEN: 1, 
	    WALL: 0 
	};
	function GraphNode(x,y,px,py,rect,type) {
	    this.data = { };
	    this.x = x;
	    this.y = y;
	    this.rect = rect;
	    this.pos = {
	        x: px, 
	        y: py
	    };
	    this.type = type;
	}

	GraphNode.prototype.toString = function() {
	    return "[" + this.x + " " + this.y + "]";
	};

	GraphNode.prototype.isWall = function() {
	    return this.type == GraphNodeType.WALL;
	};

	function BinaryHeap(scoreFunction){
	    this.content = [];
	    this.scoreFunction = scoreFunction;
	}

	BinaryHeap.prototype = {
	    push: function(element) {
	        // Add the new element to the end of the array.
	        this.content.push(element);

	        // Allow it to sink down.
	        this.sinkDown(this.content.length - 1);
	    },
	    pop: function() {
	        // Store the first element so we can return it later.
	        var result = this.content[0];
	        // Get the element at the end of the array.
	        var end = this.content.pop();
	        // If there are any elements left, put the end element at the
	        // start, and let it bubble up.
	        if (this.content.length > 0) {
	             this.content[0] = end;
	             this.bubbleUp(0);
	        }
	        return result;
	    },
	    remove: function(node) {
	        var i = this.content.indexOf(node);
	    
	        // When it is found, the process seen in 'pop' is repeated
	        // to fill up the hole.
	        var end = this.content.pop();

	        if (i !== this.content.length - 1) {
	            this.content[i] = end;
	            
	            if (this.scoreFunction(end) < this.scoreFunction(node)) {
	                this.sinkDown(i);
	            }
	            else {
	                this.bubbleUp(i);
	            }
	        }
	    },
	    size: function() {
	        return this.content.length;
	    },
	    rescoreElement: function(node) {
	        this.sinkDown(this.content.indexOf(node));
	    },
	    sinkDown: function(n) {
	        // Fetch the element that has to be sunk.
	        var element = this.content[n];

	        // When at 0, an element can not sink any further.
	        while (n > 0) {

	            // Compute the parent element's index, and fetch it.
	            var parentN = ((n + 1) >> 1) - 1,
	                parent = this.content[parentN];
	            // Swap the elements if the parent is greater.
	            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
	                this.content[parentN] = element;
	                this.content[n] = parent;
	                // Update 'n' to continue at the new position.
	                n = parentN;
	            }

	            // Found a parent that is less, no need to sink any further.
	            else {
	                break;
	            }
	        }
	    },
	    bubbleUp: function(n) {
	        // Look up the target element and its score.
	        var length = this.content.length,
	            element = this.content[n],
	            elemScore = this.scoreFunction(element);
	        
	        while(true) {
	            // Compute the indices of the child elements.
	            var child2N = (n + 1) << 1, child1N = child2N - 1;
	            // This is used to store the new position of the element,
	            // if any.
	            var swap = null;
	            // If the first child exists (is inside the array)...
	            if (child1N < length) {
	            // Look it up and compute its score.
	            var child1 = this.content[child1N],
	                child1Score = this.scoreFunction(child1);

	            // If the score is less than our element's, we need to swap.
	            if (child1Score < elemScore)
	                swap = child1N;
	            }

	            // Do the same checks for the other child.
	            if (child2N < length) {
	                var child2 = this.content[child2N],
	                    child2Score = this.scoreFunction(child2);
	                if (child2Score < (swap === null ? elemScore : child1Score)) {
	                    swap = child2N;
	                }
	            }

	            // If the element needs to be moved, swap it, and continue.
	            if (swap !== null) {
	                this.content[n] = this.content[swap];
	                this.content[swap] = element;
	                n = swap;
	            }

	            // Otherwise, we are done.
	            else {
	                break;
	            }
	        }
	    }
	};


	var astar = {
	    init: function(grid) {
	        for(var x = 0, xl = grid.length; x < xl; x++) {
	            for(var y = 0, yl = grid[x].length; y < yl; y++) {
	                var node = grid[x][y];
	                node.f = 0;
	                node.g = 0;
	                node.h = 0;
	                node.cost = node.type;
	                node.visited = false;
	                node.closed = false;
	                node.parent = null;
	            }
	        }
	    },
	    heap: function() {
	        return new BinaryHeap(function(node) { 
	            return node.f; 
	        });
	    },
	    search: function(grid, start, end, diagonal, heuristic) {
	    		console.time('astar');
	        astar.init(grid);
	        //heuristic = heuristic || astar.manhattan;
	        heuristic = heuristic || astar.chessboard;
	        diagonal = !!diagonal;

	        var openHeap = astar.heap();

	        openHeap.push(start);

	        while(openHeap.size() > 0) {

	            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
	            var currentNode = openHeap.pop();

	            // End case -- result has been found, return the traced path.
	            if(currentNode === end) {
	                var curr = currentNode;
	                var ret = [];
	                while(curr.parent) {
	                    ret.push(curr);
	                    curr = curr.parent;
	                }
	                console.timeEnd('astar');
	                return ret;
	            }

	            // Normal case -- move currentNode from open to closed, process each of its neighbors.
	            currentNode.closed = true;

	            // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
	            var neighbors = astar.neighbors(grid, currentNode, diagonal);

	            for(var i=0, il = neighbors.length; i < il; i++) {
	                var neighbor = neighbors[i];

	                if(neighbor.closed || neighbor.isWall()) {
	                    // Not a valid node to process, skip to next neighbor.
	                    continue;
	                }

	                // The g score is the shortest distance from start to current node.
	                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
	                var gScore = currentNode.g + neighbor.cost;
	                var beenVisited = neighbor.visited;

	                if(!beenVisited || gScore < neighbor.g) {

	                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
	                    neighbor.visited = true;
	                    neighbor.parent = currentNode;
	                    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
	                    neighbor.g = gScore;
	                    neighbor.f = neighbor.g + neighbor.h;

	                    if (!beenVisited) {
	                        // Pushing to heap will put it in proper place based on the 'f' value.
	                        openHeap.push(neighbor);
	                    }
	                    else {
	                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
	                        openHeap.rescoreElement(neighbor);
	                    }
	                }
	            }
	        }

	        // No result was found - empty array signifies failure to find path.
	        console.timeEnd('astar');
	        return [];
	    },
	    chessboard: function(pos0, pos1) {
	        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

	        var d1 = Math.abs (pos1.x - pos0.x);
	        var d2 = Math.abs (pos1.y - pos0.y);
	        return Math.max(d1,d2);
	    },
	    manhattan: function(pos0, pos1) {
	        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

	        var d1 = Math.abs (pos1.x - pos0.x);
	        var d2 = Math.abs (pos1.y - pos0.y);
	        return d1 + d2;
	    },
	    neighbors: function(grid, node, diagonals) {
	        var ret = [];
	        var x = node.x;
	        var y = node.y;

	        // West
	        if(grid[x-1] && grid[x-1][y]) {
	            ret.push(grid[x-1][y]);
	        }

	        // East
	        if(grid[x+1] && grid[x+1][y]) {
	            ret.push(grid[x+1][y]);
	        }

	        // South
	        if(grid[x] && grid[x][y-1]) {
	            ret.push(grid[x][y-1]);
	        }

	        // North
	        if(grid[x] && grid[x][y+1]) {
	            ret.push(grid[x][y+1]);
	        }

	        if (diagonals) {

	            // Southwest
	            if(grid[x-1] && grid[x-1][y-1]) {
	                ret.push(grid[x-1][y-1]);
	            }

	            // Southeast
	            if(grid[x+1] && grid[x+1][y-1]) {
	                ret.push(grid[x+1][y-1]);
	            }

	            // Northwest
	            if(grid[x-1] && grid[x-1][y+1]) {
	                ret.push(grid[x-1][y+1]);
	            }

	            // Northeast
	            if(grid[x+1] && grid[x+1][y+1]) {
	                ret.push(grid[x+1][y+1]);
	            }

	        }

	        return ret;
	    }
	};

	var AStarInstance = function() { };
	AStarInstance.prototype.init = function() {
		if (me.game.collisionMap == null) {
			return; // nothing to do
		}
		console.log(me.game);
		// hook into level data to generate the graph
		// Get the collision layer reference.
		
		var collisionLayer = me.game.collisionMap
		  , layerData = collisionLayer.layerData
		  , tilesets = collisionLayer.tilesets
		  , tile = null;
		 // Tilesize info
		var grid = [];
		this.tw = collisionLayer.tilewidth;
		this.th = collisionLayer.tileheight;
		// create our graph nodes
		// TODO really should not create new objects if possible
		// TODO micro optimize if needed
		// TODO - two tier. If we have larger / complex maps astar suckksss
		for (var x = 0, xx = layerData.length; x < xx; x+=1) {
			grid[x] = [];
			for (var y = 0, yy = layerData[x].length; y < yy; y+=1) {
				if (layerData[x][y] == null) {
					//console.log(x,y,"null","Open");
					grid[x][y] = new GraphNode(x,y,x*this.tw,y*this.th,new me.Rect({x: x*this.tw, y: y*this.th}, this.tw, this.th),GraphNodeType.OPEN);
					continue;
				}
				tile = layerData[x][y];
				// figure out which tileset this tile is in
				if (!this.collisionTileset || !this.collisionTileset.contains(tile.tileId)) {
					this.collisionTileset = tilesets.getTilesetByGid(tile.tileId);
				}
				// now we can get isSolid
				// TODO - assign weights if needed
				
				if (this.collisionTileset.TileProperties[tile.tileId].isSolid) {
					//console.log(x,y,tile,"Solid");
					grid[x][y] = new GraphNode(x,y,x*this.tw,y*this.th,tile,GraphNodeType.WALL);
				} else {
					//console.log(x,y,tile,"Open");
					grid[x][y] = new GraphNode(x,y,x*this.tw,y*this.th,tile,GraphNodeType.OPEN);
				}
				
			}
		}
		this.grid = grid;
		//console.log(grid);
		// now we have A* grid arrays, so init astar
		// TODO: should really instance astar so we can have two-tier
		
		//console.log(aStarPlugin);
		//console.log(this);
		// debug
		//console.log(this.graph);
		//console.log( astar.search(this.graph.nodes, this.graph.nodes[3][3], this.graph.nodes[22][17]) );
		/*if (!me.game.getEntityByName("me.astar")[0]) {
			me.game.add(this, 99);
			me.game.sort();
		}*/
	};
	AStarInstance.prototype.search = function(x0,y0,x1,y1) {
		//console.log(this.graph.nodes[~~(x0/this.tw)][~~(y0/this.th)],this.graph.nodes[~~(x1/this.tw)][~~(y1/this.th)]);
		return astar.search(this.grid,this.grid[~~(x0/this.tw)][~~(y0/this.th)],this.grid[~~(x1/this.tw)][~~(y1/this.th)],true);
	}
	
	aStarPlugin = me.plugin.Base.extend({
		/** @scope me.astar.prototype */
		version : "0.9.8",
		
		init: function() {
			// call parent constructor
			this.parent();
			this.GUID = "astar-"+me.utils.createGUID();
			this.name = "me.astar";
			this.isPersistent = true;
			me.event.subscribe(me.event.LEVEL_LOADED, this.refresh);
		},
		refresh: function() {
			if (me.astar != null) {
				// alternatively, just update the nodes?
				me.astar = null;
			}
			me.astar = new AStarInstance();
			me.astar.init();
		}

	});


})(window);