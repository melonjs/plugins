/* game namespace */
var game = {
    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init("screen", 640, 480, true, 'auto')) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function () {
                me.plugin.register.defer(debugPanel, "debug");
            });
        }
        // Plugin: AStar pathfinding
        me.plugin.register(aStarPlugin, "astar");

        // debug: render collision map/grid
        // me.debug.renderCollisionMap = true;
        // me.debug.renderCollisionGrid = true;

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);

        // Load the resources.
        me.loader.preload(game.resources);

        // Initialize melonJS and display a loading screen.
        me.state.change(me.state.LOADING);
    },



    // Run on game resources loaded.
    "loaded" : function () {
        me.sys.gravity = 0; // globally set gravity

        

        me.state.set(me.state.PLAY, new game.PlayScreen());


        // add our player entity in the entity pool
         me.entityPool.add("mainPlayer", game.PlayerEntity);
         me.entityPool.add("chaser", game.ChaserEntity);
         //me.entityPool.add("chaser2", game.ChaserEntity);
         //me.entityPool.add("chaser3", game.ChaserEntity);

         // enable the keyboard
         me.input.bindKey(me.input.KEY.LEFT,  "left");
         me.input.bindKey(me.input.KEY.RIGHT, "right");
         me.input.bindKey(me.input.KEY.UP, "up");
         me.input.bindKey(me.input.KEY.DOWN, "down");
         // me.input.bindKey(me.input.KEY.X,     "jump", true);
        // Start the game.
        me.state.change(me.state.PLAY);
    }
};