var InstagramUserImagePool = function(INSTAGRAM_TOKEN, instagramUserName)
{
	var _self = this;

	var overlap = 5;
	var instagramUserId;
	_self.images = [];
	var currentIndex = -1;
	var lastResponse;
	var hasMore = true;
	var callbackStack = [];
	var xhr;
	_self.onReady = function() {};

	$.ajax({
		'url': 'https://api.instagram.com/v1/users/search',
		'data': {
			'q': instagramUserName,
			'client_id': INSTAGRAM_TOKEN
		},
		'async': false,
		'dataType': 'jsonp',
		'success': function(response) {
			instagramUserId = response.data[0].id;
			console.log('Resolved', instagramUserName, 'to', instagramUserId);
			_self.onReady();
		}
	});

	_self.populateMore = function(callback)
	{
		if (!instagramUserId) {
			console.log('Instagram User ID not resolved yet')
			return;
		}

		if (callback) {
			callbackStack.push(callback);
		}
		if (xhr) {
			return;
		}
		if (lastResponse) {
			url = lastResponse['pagination']['next_url'];
		}
		else {
			url = 'https://api.instagram.com/v1/users/' + instagramUserId + '/media/recent/?client_id=' + INSTAGRAM_TOKEN;
		}

		xhr = $.ajax({
			'url': url,
			'dataType': 'jsonp',
			'success': function(response) {
				var item;
				lastResponse = response;
				for (i in response.data) {
					item = response.data[i];
					var imageModel = new ImageModel(item);
					var imageEntity = new ImageEntity(imageModel, new Date(item.created_time * 1000));
					imageEntity.metadata = item;
					_self.images.push(imageEntity);
				}
				var callback;
				while (callback = callbackStack.pop()) {
					callback();
				}
				xhr = null;
			}
		});
	}

	this.getImage = function()
	{
		return _self.images[currentIndex];
	}

	this.next = function() {
		if (currentIndex < _self.images.length -1) {
			currentIndex++;
			return true;
		}
		return false;

	}

	this.prev = function() {
		if (currentIndex > 0) {
			currentIndex--;
			return true;
		}
		return false;
	}
}