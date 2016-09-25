import "../util/DrawingUtils"
import Point from "./point"
import Polygon from "./polygon";
import BoundingBox from "./boundingBox";
import Rectangle from "./rectangle";
import Line from "./line";

export default class PolygonGrid{
	
	public _polygons:Array<Polygon>;
	public _clipRect:BoundingBox;
	public _normalizedPolygons:Array<Polygon>;
	public _normalizedClipRect:BoundingBox;

	constructor(){
		this._polygons = [];
		this._clipRect = new BoundingBox();
		this._normalizedPolygons = [];
		this._normalizedClipRect = new BoundingBox();
	}

	public addPolygon(polygon:Polygon): void{
		this._polygons.push(polygon);
	}

	public get size(){
		return this._polygons.length;
	}

	public deletePolyUnderPoint(point:Point):Polygon | void{
		var poly = this.polygonUnder(point);
		if(poly){
			var index = this._polygons.indexOf(poly);
			if(index > -1){this._polygons.splice(index, 1);}
			return poly
		}
		return null;
	}

	public get first():Polygon{
		return this._polygons[0];
	}

	public closestEdge(pt:Point):Line{
		var closest = null;
		var min_dist = Number.MAX_SAFE_INTEGER;
		for(var i = 0; i < this._polygons.length; ++i){
			var edge = this._polygons[i].closest_edge(pt);
			if(edge){
				var dist_from = edge.distanceToPoint(pt);
				if(dist_from < min_dist){
					closest = edge;
					min_dist = dist_from;
				}
			}

		}
		return closest;
	}

	public polygonUnder(pt:Point):Polygon{
		for(var i = 0; i < this._polygons.length; ++i){
			if(this._polygons[i].contains(pt)){
				return this._polygons[i];
			}
		}
		return null;
	}

	public set clipRect(rect:Rectangle){
		this._clipRect = rect.copy();
	}

	public isEmpty():boolean{
		return this._polygons.length <= 0;
	}

	public draw(context:CanvasRenderingContext2D):void{
		
		context.strokeStyle = DrawingUtils.grey(0);
		context.fillStyle = DrawingUtils.grey(255);
		for(var i = 0; i < this._polygons.length; ++i){
			this._polygons[i].draw(context, true);
		}
		
	}

	public normalize(newBounds: Rectangle):void{
		this._clipRect = newBounds;
		this._normalizedClipRect = this._clipRect.normalize();

		this._normalizedPolygons = [];
		for(var i = 0; i < this._polygons.length; ++i){
			if(this._polygons[i].inside(this._clipRect)){
				this._normalizedPolygons.push(this._polygons[i].normalizedPointArray(this._clipRect));
			}
		}
	}

	public toJSON():string{

		var polygons_out = [];
		for(var i = 0; i < this._polygons.length; ++i){
			polygons_out.push(this._polygons[i].to_vertex_position_array());
		}

		var norm_polygons_out = [];
		for(i = 0; i < this._normalizedPolygons.length; ++i){
			norm_polygons_out.push(this._normalizedPolygons[i]);
		}

		var out = {
			polygons: polygons_out,
			bounds: this._clipRect,
			normalized_clipRect: this._normalizedClipRect,
			normalized_polygons: norm_polygons_out
		};

		return JSON.stringify(out);
	}
}