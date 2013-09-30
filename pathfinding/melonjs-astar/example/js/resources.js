game.resources = [

	/* Graphics.
	 * @example
	 * {name: "example", type:"image", src: "data/img/example.png"},
	 */
	 // our level tilesets
    {name: "crystal_tiles",  type:"image", src: "data/img/map/crystal_tiles.png"},
    {name: "metatiles",  type:"image", src: "data/img/map/metatiles32x32.png"},

    // the main player spritesheet
    {name: "main_player",  type:"image", src: "data/img/sprite/main_character.png"},
    // the parallax background
    {name: "fog_bkg0",         type:"image", src: "data/img/fog_bkg0.png"},



	/* Atlases
	 * @example
	 * {name: "example_tps", type: "tps", src: "data/img/example_tps.json"},
	 */

	/* Maps.
	 * @example
	 * {name: "example01", type: "tmx", src: "data/map/example01.tmx"},
	 * {name: "example01", type: "tmx", src: "data/map/example01.json"},
 	 */
 	 {name: "area01", type: "tmx", src: "data/map/area01.tmx"}

	/* Background music.
	 * @example
	 * {name: "example_bgm", type: "audio", src: "data/bgm/", channel : 1},
	 */

	/* Sound effects.
	 * @example
	 * {name: "example_sfx", type: "audio", src: "data/sfx/", channel : 2}
	 */
];
