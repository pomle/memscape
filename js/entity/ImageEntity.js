var ImageEntity = function(image_url, date)
{
	this.ImageModel = new ImageModel(image_url);
	this.date = date;
}