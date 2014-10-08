var ImageStream = function(origin, scene)
{
	var _self = this;
	_self.images = [];

	var imageSpacing = 200;
	var xJitter = 50;
	var yJitter = 300;
	var zJitter = 300;

	var lastPos = new THREE.Vector3();
	var offsetPos = new THREE.Vector3();

	this.addImage = function(ImageEntity)
	{
		var p = ImageEntity.ImageModel.model.position;
		offsetPos.x = (lastPos.x + imageSpacing) + (xJitter * Math.random() - (xJitter/2));
		offsetPos.y = (yJitter * Math.random() - (yJitter/2));
		offsetPos.z = (zJitter * Math.random() - (zJitter/2));
		lastPos.x = p.x = origin.x + offsetPos.x;
		p.y = origin.y + offsetPos.y;
		p.z = origin.z + offsetPos.z;
		scene.add(ImageEntity.ImageModel.model);
		_self.images.push(ImageEntity);
	}
}