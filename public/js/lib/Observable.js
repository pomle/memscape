var Observable = function()
{
	var events = {};

	this.bind = function(event, callback)
	{
		if (!callback) {
			return false;
		}
		if (!events[event]) {
			events[event] = [];
		}
		events[event].push(callback);
	}

	this.trigger = function(event)
	{
		var args = Array.prototype.slice.call(arguments);
		args = args.splice(1);
		if (events[event]) {
			for(i in events[event]) {
				events[event][i].apply(this, args);
			}
		}
	}

	this.unbind = function(event, callback)
	{
		if (events[event]) {
			if (callback) {
				for(i in events[event]) {
					if (callback === events[event][i]) {
						events[event].splice(i, 1);
						break;
					}
				}
			}
			else {
				events[event] = [];
			}
		}
	}
}