/*-------------------
a player entity
-------------------------------- */
game.PlayerEntity = me.ObjectEntity.extend({
    /* -----
    constructor
    ------ */
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);

        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(0.35, 0.35);
        this.setMaxVelocity(3.5, 3.5);
        this.setFriction(0.05, 0.05);

        // adjust the bounding box
        // lower half SNES-RPG style
        this.updateColRect(0, 32, 32, 32);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

    },

    /* -----

    update the player pos

    ------ */
    update: function() {

        if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            // unflip the sprite
            this.flipX(false);

            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }

        if (me.input.isKeyPressed('up')) {
            // TODO - show up sprite
            
            // update the entity velocity
            this.vel.y -= this.accel.y * me.timer.tick;
        } else if (me.input.isKeyPressed('down')) {
            // TODO - show down sprite

            // update the entity velocity
            this.vel.y += this.accel.y * me.timer.tick;
        } else {
            this.vel.y = 0;
        }
        /*
        if (me.input.isKeyPressed('jump')) {
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
            }

        }
        */
        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }

});

game.ChaserEntity = me.ObjectEntity.extend({
    /* -----
    constructor
    ------ */
    target: null,
    myPath: [],
    dest: null,
    lastPos: {x: -1, y: -1},
    pathAge: 0,
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);

        // chase even when offscreen
        this.alwaysUpdate = true;
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(0.25, 0.25);
        this.setMaxVelocity(3, 3);
        this.setFriction(0.05, 0.05);

        // adjust the bounding box
        // lower half SNES-RPG style
        console.log(this.collisionBox);
        this.updateColRect(0, 32, 32, 32);


    },

    chessboard: function() {
        // return chessboard distance to target
        return Math.max( Math.abs(this.collisionBox.left - this.target.collisionBox.left), Math.abs(this.collisionBox.top - this.target.collisionBox.top));
    },

    /* -----

    update the player pos

    ------ */
    update: function() {
        var now = Date.now()
        this.updateColRect(0, 16, 16, 16);
        if (this.target == null) {
            // we should globally store this value
            this.target = me.game.getEntityByName('mainPlayer')[0];
        }
        
        var cbdist = this.chessboard();

        if (this.myPath.length < 1 || (cbdist >= 96 && this.pathAge+5000 < now)) {
            // not moving anywhere
            // friction takes over
            if (this.target != null) {
                this.myPath = me.astar.search(this.collisionBox.left,this.collisionBox.top,this.target.collisionBox.left,this.target.collisionBox.top);
                this.dest = this.myPath.pop();
                this.pathAge = now;
                //console.log(this.dest);
            }
        } else {
            if (this.chessboard() < 96) {
                // just go for it
                this.dest = this.target;
                this.pathAge = now-5000;
            } else if (this.collisionBox.overlaps(this.dest.rect) && this.myPath.length > 0) {
                // TODO - do this with non constant, add some fuzz factor
                //console.log("Reached "+this.dest.pos.x+","+this.dest.pos.y);
                this.dest = this.myPath.pop();

            }
            if (this.dest != null) {
                
                //console.log("@",this.collisionBox.pos.x,this.collisionBox.pos.y);
                //console.log("Moving toward ",this.dest.pos.x,this.dest.pos.y);
                // move based on next position


                var xdiff = this.dest.pos.x - this.collisionBox.left
                  , ydiff = this.dest.pos.y - this.collisionBox.top;


                if (xdiff < -2) {
                    this.vel.x -= this.accel.x * me.timer.tick;
                    this.lastPos.x = this.left;
                } else if (xdiff > 2) {
                    this.flipX(true);
                    this.vel.x += this.accel.x * me.timer.tick;
                    this.lastPos.x = this.left;
                }

                if (ydiff < -2) {
                    this.vel.y -= this.accel.y * me.timer.tick;
                    this.lastPos.y = this.collisionBox.pos.y;
                } else if (ydiff > 2) {
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.lastPos.y = this.collisionBox.pos.y;
                }
            }
        }
        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    },

    draw: function(context) {
        // draw the sprite if defined
            if (this.renderable) {
                // translate the renderable position (relative to the entity)
                // and keeps it in the entity defined bounds
                // anyway to optimize this ?
                var x = ~~(this.pos.x + (this.anchorPoint.x * (this.width - this.renderable.width)));
                var y = ~~(this.pos.y + (this.anchorPoint.y * (this.height - this.renderable.height)));
                context.translate(x, y);
                this.renderable.draw(context);
                context.translate(-x, -y);
            }
        // draw dest rect
        debugAStar = true;
        if (debugAStar && this.dest) {
            if (this.dest && this.dest.rect) {
                this.dest.rect.draw(context, "green");
            }   
            for (var i = 0, ii = this.myPath.length; i < ii; i+=1) {
                if (this.myPath[i] && this.myPath[i].rect) {
                    this.myPath[i].rect.draw(context, "red");
                }
            }
        }
    }

});