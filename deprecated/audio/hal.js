////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// HAL layer
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * MelonJS Game Engine
 * Copyright (C) 2011, Olivier BIOT / Shazz^TRSi
 * http://www.melonjs.org
 *
 */

(function($, undefined) {

	me.HALAudio = Object.extend(
	/** @scope me.HALAudio.prototype */
	{
	
		chromeAudioContext : null,
		chromeAudioNode : null,
		sink : null,
		mozillaAudio : null,
		mozillaIntervalID : null,
		mixerCallback : null,
	
		/** 
		 * @private
		 */	
		init : function()
		{
			//detect capability
			if(this.checkGoogleChrome())
			{
				this.chromeAudioContext = new webkitAudioContext();
				this.chromeAudioNode = this.chromeAudioContext.createJavaScriptNode(YmConst_BUFFER_SIZE);									
				console.log("Chrome Audio inited");
			}
			else if(this.checkMozillaFirefox())
			{
				this.mozillaAudio = new Audio();
				this.mozillaAudio.mozSetup(YmConst_CHANNELS, YmConst_PLAYER_FREQ);
				console.log("Mozilla Audio inited");

			}
			else
			{
				this.sink = new Sink();
				console.log("Sink Audio inited");
			}
		},
		
		/** 
		 * Clear audio callback
		 */		
		clearAudioCallback : function()
		{
			if(this.chromeAudioNode != null)
			{
				this.chromeAudioNode.onaudioprocess = null;
				console.log("Chrome Audio callback cleared");					
			}
			else if(this.mozillaAudio != null)
			{
				clearInterval(this.mozillaIntervalID);
				console.log("Mozilla Audio callback cleared");
			}
			else if(this.sink != null)
			{
				this.sink = null;
				console.log("Sink Audio callback cleared ?");
			}		
		},
		
		/** 
		 * @private
		 * Wrap Chrome audio callback to retrieve output buffers from event
		 */		
		wrapChromeAudioCallback : function(event)
		{
			this.mixerCallback.mixBuffer(event.outputBuffer.getChannelData(0), event.outputBuffer.getChannelData(1));				
		},
		
		/** 
		 * Setup audio callback for webkit, mozilal audio and sink
		 */		
		setupAudioCallback : function(callback, frequency, bufferSize, channels)
		{
			this.mixerCallback = callback;
			if(this.chromeAudioNode != null)
			{
				var _hal = this;
				this.chromeAudioNode.onaudioprocess = function (event) 
				{
					_hal.wrapChromeAudioCallback(event);
				}		
				console.log("Chrome Audio callback wrapper setup");					
			}
			else if(this.mozillaAudio != null)
			{
				var currentWritePosition = 0;
				var prebufferSize = frequency; // buffer 1000ms
				var tail = null, tailPosition;
				
				// arg... dunno how to do else...
				var audio = this.mozillaAudio;

				// The function called with regular interval to populate the audio output buffer.
				this.mozillaIntervalID = setInterval(function() 
				{
				  	var written;
				  	// Check if some data was not written in previous attempts.
					if(tail) 
				  	{
				    		written = audio.mozWriteAudio(tail.subarray(tailPosition));
				    		currentWritePosition += written;
				    		tailPosition += written;
				    		if(tailPosition < tail.length) 
				    		{
				      			// Not all the data was written, saving the tail...
				      			return; // ... and exit the function.
				    		}
				    		tail = null;
				 	 }
				 	 // Check if we need add some data to the audio output.
				  	 var currentPosition = audio.mozCurrentSampleOffset();
				 	 var available = currentPosition + prebufferSize - currentWritePosition;
					 if(available > 0) 
					 {
				    	 	// Request some sound data from the callback function.
				    		var soundData = new Float32Array(available);
				    		callback.mixBuffer(soundData);

				    		// Writting the data.
				    		written = audio.mozWriteAudio(soundData);
				   		if(written < soundData.length) 
				   		{
				      			// Not all the data was written, saving the tail.
				      			tail = soundData;
				     			tailPosition = written;

				    		}
				    		currentWritePosition += written;

				 	}

				}, 180); // magic value... lower, too fast, bigger too slow...
				console.log("Mozilla Audio callback setup");
			}
			else if(this.sink != null)
			{
				this.sink = Sink(function(buffer)
				{
					callback.mixBuffer(buffer);
				},
				channels ,
				bufferSize,
				frequency);
				this.sink.writeMode = 'sync';	
				console.log("Sink Audio callback setup");
			}
			
		},
		
		/** 
		 * Stop audio
		 */		
		stopAudio : function()
		{
			//TODO : flush buffers ?
			if(this.chromeAudioNode != null)
			{
				this.chromeAudioNode.disconnect();		
				console.log("Chrome Audio node disconected");						
			}		
		},
		
		/** 
		 * start audio
		 */		
		playAudio : function()
		{
			if(this.chromeAudioNode != null)
			{
				this.chromeAudioNode.connect(this.chromeAudioContext.destination);
				console.log("Chrome Audio node connected");				
			}									
		},

		/** 
		 * @private
		 * Detect audio API supported : webkit
		 */		
		checkGoogleChrome : function()
		{
			//return false;
			if(typeof(webkitAudioContext) != 'undefined') return true;
			else return false;
		},
		
		/** 
		 * @private
		 * Detect audio API supported : Mozilla Audio
		 */	
		checkMozillaFirefox : function()
		{
			if(typeof(Audio) != 'undefined') return true;
			else return false;
		},		

	});

})(window);