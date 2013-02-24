function removeDuplicateFaces(geometry){
  for(var i=0; i<geometry.faces.length; i++){
    var tri = geometry.faces[i];
    var inds = [tri.a, tri.b, tri.c, tri.d].sort();
    for(var j=0; j<i; j++){
      var tri_2 = geometry.faces[j];
      if( tri_2 !== undefined ){
        var inds_2 = [tri_2.a, tri_2.b, tri_2.c, tri_2.d].sort();
        if( isSame( inds, inds_2 ) ){
          delete geometry.faces[i];
          delete geometry.faces[j];
        }
      }
    }
  }
  geometry.faces = geometry.faces.map( function(a){ if(a===undefined){ return false; } else {return a}})
  geometry.faces = _.compact( geometry.faces );
  return geometry;
}