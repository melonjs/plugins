game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
        // stuff to reset on state change
        // load a level

        

        var loadFog = function() {
            var ScrollingBackgroundLayer = me.ImageLayer.extend({
                init: function(image, speed) {
                    var name = image;
                    var width = 640;
                    var height = 480;
                    var z = 1000;
                    var ratio = 0;
                    this.speed = speed;
                    this.parent(name, width, height, image, z, ratio);
                },

                update: function() {
                    // recalibrate image position
                    if (this.pos.x >= this.imagewidth) {
                        this.pos.x = 0;
                    };
                    // increment horizontal background position
                    this.pos.x += this.speed;
                    return true;
                }
            });

        me.game.add(new ScrollingBackgroundLayer("fog_bkg0", 0.3), 3);
        };
        me.event.subscribe(me.event.LEVEL_LOADED, loadFog);
        me.levelDirector.loadLevel("area01");

    },

    /* ---

    action to perform when game is finished (state change)

    --- */
    onDestroyEvent: function() {
    }
});
