var InstagramStream = function(access_token)
{
	var _self = this;
	var lastResponse;
	var hasMore = true;
	var xhr;
	var lastCallback;
	var imageIndex = 0;

	_self.images = [];

	_self.loadImages = function(callback)
	{
		if (callback) {
			lastCallback = callback;
		}

		if (xhr) {
			return false;
		}

		if (lastResponse) {
			if (!lastResponse['pagination']['next_url']) {
				hasMore = false;
				return false;
			}
			url = lastResponse['pagination']['next_url'];
		}
		else {
			url = 'https://api.instagram.com/v1/users/self/media/recent?access_token=' + access_token;
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
					if (item.location && item.location.name) {
						imageEntity.description += item.location.name;
					}
					imageEntity.description += ' (' + item.filter + ')';
					_self.images.push(imageEntity);
				}
				if (lastCallback) {
					lastCallback();
				}
				xhr = null;
			}
		});

		return true;
	}

	_self.next = function()
	{
		if (imageIndex < _self.images.length - 1) {
			return _self.images[imageIndex++];
		}
		return false;
	}
}