//hello master

Array.prototype.query = function (field, operator, value) { 
    
    if (operator=="contains"){
        value = value.toLowerCase();
		return this.filter(function (item){
		 	return item[field].toLowerCase().indexOf(value) !== -1; 	
		});
	}
	
	else if(operator == "==") {
		return this.filter(function (item){
			 	return item[field] == value;
		});
	}
    
    else if(operator == "!=") {
    	return this.filter(function (item){
			 	return item[field] != value;
		});
	}
    
    else if(operator == ">") {
        return this.filter(function (item){
			 	return item[field] > value;
		});
	}
    
    
    else if(operator == "<") {
        return this.filter(function (item){
    		 	return item[field] < value;
		});
	}
    
}