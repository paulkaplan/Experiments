var editables = [];


var Editable = function(obj){
  this.original_scale = obj.scale.clone();

}

function addEditableObject(obj){

  obj.original_scale = obj.scale.clone();
  obj.current_scale = obj.scale.clone();

  obj.original_scale_scalar = 1;
  obj.current_scale_scalar = 1;

  editables.push( obj );
}

window.editables = editables;
