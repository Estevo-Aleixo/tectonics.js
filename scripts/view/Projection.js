
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var vertexShaders = {};
vertexShaders.equirectangular = _multiline(function() {/**   
	const float PI = 3.14;
	const float OCEAN = 0.0;
	const float LAND = 0.01;
	const float NONE = -0.01;
	const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;
	uniform float index;

	float lon(vec3 pos) {
		return atan(-pos.z, pos.x) + PI;
	}
	float lat(vec3 pos) {
		return asin(pos.y / length(pos));
	}

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );
		
		vec4 modelPos = modelMatrix * vec4( position, 1.0 );
		float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
		
		float index_offset = INDEX_SPACING * index;
		float focus = lon(cameraPosition) + index_offset;
		float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
		float lat_focused = lat(modelPos.xyz); //+ (index*PI);

		vec4 displaced = vec4(
			lon_focused,
			lat(modelPos.xyz), //+ (index*PI), 
			height, 
			1);
		mat4 scaleMatrix = mat4(1);
		scaleMatrix[3] = viewMatrix[3];
		gl_Position = projectionMatrix * scaleMatrix * displaced;
	}

**/});
vertexShaders.texture = _multiline(function() {/**
	const float PI = 3.14;
	const float OCEAN = 0.0;
	const float LAND = 0.01;
	const float NONE = -0.01;
	const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;
	uniform float index;

	float lon(vec3 pos) {
		return atan(-pos.z, pos.x) + PI;
	}
	float lat(vec3 pos) {
		return asin(pos.y / length(pos));
	}

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );
		
		vec4 modelPos = modelMatrix * vec4( position, 1.0 );
		
		float index_offset = INDEX_SPACING * index;
		float focus = lon(cameraPosition) + index_offset;
		float lon_focused = mod(lon(modelPos.xyz) - focus, 2.*PI) - PI + index_offset;
		float lat_focused = lat(modelPos.xyz); //+ (index*PI);

		float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
		gl_Position = vec4(
            lon_focused / PI,
			lat_focused / (PI/2.), 
			-height, 
			1);
	}
**/})
vertexShaders.orthographic = _multiline(function() {/**   

	const float OCEAN = 0.0;
	const float LAND = 0.01;
	const float NONE = -0.01;
	
	attribute float displacement;
	varying float vDisplacement;
	varying vec4 vPosition;
	uniform float sealevel;

	void main() {
		vDisplacement = displacement;
		vPosition = modelMatrix * vec4( position, 1.0 );
		
		float height = displacement > sealevel? LAND : displacement > 1.0? OCEAN : NONE;
		vec4 displaced = vec4( position * (1.+height), 1.0 );
		gl_Position = projectionMatrix * modelViewMatrix * displaced;
	}
**/});