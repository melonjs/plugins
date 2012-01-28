/**
 * A simple dialog manager.
 * @class
 * @extends me.SpriteObject	 
 * @constructor
 * @param {int} x the x coordinates of the dialog box
 * @param {int} y the y coordinates of the dialog box
 * @param {record} an array of dialog records, each one with a {me.loader#getImage} background image, {String} phrase to be written, 		  
 *        {me.loader#getImage} optional avatar image, 
 * 		  {int} optional offsetAvatarX and {int} optional offsetAvatarY. 
 * 		  If not defined, it will use the offsets of the constructor (if defined). 
 * @param {int} width of the textbox
 * @param {int} height of the textbox
 * @param {int} x offset of the textbox inside the background image
 * @param {int} y offset of the textbox inside the background image
 * @param {me#Font} the font used to write the dialog
 * @param {String} tag of the key used to pass the dialog pages
 * @param {function} a callback function to be called when the dialog is done
 * @param {int} optional x offset of the avatar (if defined and not defined in record)
 * @param {int} optional y offset of the avatar (if defined and not defined in record) 
 * @example 
 * dialog = new DialogObject(10, 10, dialog, dialog[0].background.width - OFFSET_SIZE_TEXT_X, dialog[0].background.width - OFFSET_SIZE_TEXT_Y, OFFSET_DIALOG_X, OFFSET_DIALOG_Y, new me.Font("acmesa",20,"#880D0D", "center"), "enter", activateControls);
 */
var DialogObject = me.SpriteObject.extend(
{
    init: function(x, y, dialog, widthText, heightText, offsetTextX, offsetTextY, font, tagKey, callback, offsetAvatarX, offsetAvatarY) 
	{	
    	this.parent(x, y, dialog[0].background);    	
        this.font = font;
    	this.tagKey = tagKey;
    	this.widthText = widthText;
    	this.heightText = heightText;
    	this.rowCount = Math.floor(this.heightText / (this.font.height * 1.1));
    	this.offsetAvatarX = offsetAvatarX;
    	this.offsetAvatarY = offsetAvatarY;
    	this.offsetTextX = offsetTextX;
    	this.offsetTextY = offsetTextY;
		this.dialog = dialog;
		this.counter = 0;
		this.dialog[0].rows = this.getWords(this.dialog[0].phrase);
		this.currentRow = 0;
		this.callback = callback;
    },
    
    getWords : function(text)
    {	
    	var totalSize = 0;
    	var wordSize = 0;
    	var substrings = [];
    	var substringsCounter = 0;
    	var counter = 0;
    	var words = text.split(" ");
    	while(typeof(words[counter]) !== 'undefined')
		{
    		wordSize = this.font.measureText(me.video.getScreenFrameBuffer(), words[counter]).width;
    		if(counter != 0 && wordSize + totalSize > this.widthText)
			{
    			totalSize = wordSize;
    			substringsCounter++;
    			substrings[substringsCounter] = words[counter];
			}
    		else
    		{
    			totalSize += wordSize;
    			if(typeof(substrings[substringsCounter]) === 'undefined')
				{
    				substrings[substringsCounter] = words[counter];
				}
    			else
    			{
    				substrings[substringsCounter] += " " + words[counter];
    			}
    		}
    		counter++;
		}
    	return substrings;
    },
    
    update : function()
	{
		if (me.input.isKeyPressed(this.tagKey))
		{
			if(typeof(this.dialog[this.counter].rows[this.currentRow + this.rowCount]) !== 'undefined')
			{
				this.currentRow += this.rowCount;
			}
			else
			{
				this.currentRow = 0;
				this.counter++;
				if(typeof(this.dialog[this.counter]) === 'undefined')
				{
					if(typeof(this.callback) !== 'undefined' && this.callback != null)
					{
						this.callback();
					}
					me.game.remove.defer(this);					
				}
				else
				{
					this.dialog[this.counter].rows = this.getWords(this.dialog[this.counter].phrase);
				}
			}
			return true;
		}
		else
		{
			return false;
		}
	},

    /* -----

    draw the dialog

    ------ */
    draw: function(context) 
	{
    	if(typeof(this.dialog[this.counter]) !== 'undefined')
		{
    		context.drawImage(this.dialog[this.counter].background, this.pos.x, this.pos.y);
    		if(typeof(this.dialog[this.counter].avatar) !== 'undefined' && this.dialog[this.counter].avatar != null)
			{
    			if(typeof(this.dialog[this.counter].offsetAvatarX) !== 'undefined' && typeof(this.dialog[this.counter].offsetAvatarY) !== 'undefined')
    			{
					context.drawImage(this.dialog[this.counter].avatar, this.pos.x + this.dialog[this.counter].offsetAvatarX, this.pos.y + this.dialog[this.counter].offsetAvatarY);    		
    			}
    			else
    			{
    				context.drawImage(this.dialog[this.counter].avatar, this.pos.x + this.offsetAvatarX, this.pos.y + this.offsetAvatarY);
    			}
			}
    		var offset = 0;
    		for(var i = 0; i < this.rowCount; i++)
    		{
    			if(typeof(this.dialog[this.counter].rows[this.currentRow + i]) !== 'undefined')
    			{    				
    				this.font.draw(context, this.dialog[this.counter].rows[this.currentRow + i], this.pos.x + this.offsetTextX, this.pos.y + this.offsetTextY + offset);
    				offset += (this.font.height * 1.1);    				
    			}
    		}
		}
    }
});