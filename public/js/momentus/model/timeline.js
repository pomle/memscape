var TimelineModel = function(scenea)
{
	var _self = this;
	var scene = scenea;

	var lineThickness = .15;
	var referenceDate;

	_self.geometry = new THREE.Geometry();
	var baseline = new THREE.PlaneGeometry(100, lineThickness);
	console.log(baseline);
	var stick = new THREE.PlaneGeometry(lineThickness, 20);
	_self.geometry.merge(baseline);
	_self.geometry.merge(stick);

	var material = new THREE.MeshBasicMaterial({
		'color': 'white'
	});

	var number = 1;

	_self.addDate = function(date)
	{
		var geometry = new THREE.TextGeometry(number++, {
			'curveSegments': 2,
			'font': 'helvetiker',
			'size': 10,
			'height': 0,
			'weight': 'bold'
		});

		_self.geometry.merge(geometry);
		_self.geometry.verticesNeedUpdate = true;
		_self.geometry.uvsNeedUpdate = true;
		_self.geometry.elementsNeedUpdate = true;
	}

	_self.model = new THREE.Mesh(_self.geometry, material);
}