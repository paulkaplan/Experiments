module.exports = function(req, res){
  res.render('glass', { 
    title: 'Express',
    glass_id : req.params.glass_id,
    parent_id : req.query['parent']
  });
};