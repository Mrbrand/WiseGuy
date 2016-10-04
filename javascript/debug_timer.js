// Class för att mäta exekveringstider
function Timer(){
  this.title = "";
  this.start =0;  
  this.comments = []; //lagrar projektdata
}

Timer.prototype.begin = function(title) {
    this.title = title;
    this.start = Date.now();
	this.comments = []; //lagrar projektdata
};

Timer.prototype.comment = function(comment) {
    var diff = Date.now() - this.start; 
    this.comments.push({diff:diff, comment:comment})
};

Timer.prototype.stop = function() {
    var output = this.title+":\n\n"; 
    var diff = Date.now() - this.start; 
    this.comments.push({diff:diff, comment:"Finished"})
    
    this.comments.forEach(function(comment) {
      output += comment.comment +": "+comment.diff+"\n";
    });
  alert(output);
};
