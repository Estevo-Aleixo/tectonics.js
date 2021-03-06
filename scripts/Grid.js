'use strict';

function Grid(template, voronoi){
	this.template = template;
	
	//Precompute neighbors for O(1) lookups
	var neighbors = this.template.vertices.map(function(vertex) { return new buckets.Set()});
	for(var i=0, il = this.template.faces.length, faces = this.template.faces; i<il; i++){
		var face = faces[i];
		neighbors[face.a].add(face.b);
		neighbors[face.a].add(face.c);
		neighbors[face.b].add(face.a);
		neighbors[face.b].add(face.c);
		neighbors[face.c].add(face.a);
		neighbors[face.c].add(face.b);
	}
	this._neighbors = neighbors.map(function(set) { return set.toArray(); });
	
	//Feed locations into a kdtree for O(logN) lookups
	var points = [];
	for(var i=0, il = this.template.vertices.length, vertices = this.template.vertices; i<il; i++){
		var vertex = vertices[i];
		points.push({x:vertex.x, y:vertex.y, z:vertex.z, i:i});
	}
	this.getDistance = function(a,b) { return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2); };
	this._kdtree = new kdTree(points, this.getDistance, ["x","y","z"]);
	
	//Now feed that kdtree into a Voronoi diagram for O(1) lookups
	//If cached voronoi is already provided, use that
	//If this seems like overkill, trust me - it's not
	if (voronoi){
		this._voronoi = voronoi;
	} else {
		this._voronoi = new VoronoiSphere(this.template.vertices.length, this._kdtree);
	}
	
	//TODO: R-tree from https://github.com/mourner/rbush for astroblemes and the like
}

Grid.prototype.getVoronoi = function() {
	//Now feed that kdtree into a Voronoi diagram for O(1) lookups
	return new VoronoiSphere(this._kdtree, this.template.vertices.length);
}

Grid.prototype.getNearestId = function(vertex) { 
	return this._voronoi.getNearestId(vertex); 
	return this._kdtree.nearest({x:vertex.x, y:vertex.y, z: vertex.z}, 1)[0][0].i;
}

Grid.prototype.getNeighborIds = function(id) {
	return this._neighbors[id];
}