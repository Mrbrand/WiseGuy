//hello master

Array.prototype.query = function (field, operator, value) { 
    
    if (operator=="contains"){
        value = value.toLowerCase();
		return this.filter(function (item){ 	
		 	var fields = field.replace(/\s/g, '',"").split(","); //rensa på mellanslag innan
			var passed = false;	      
			fields.forEach(function(field) { 
				if (item[field].toLowerCase().indexOf(value) != -1) passed = true;
			});
			return passed;
		 	//return item[field].toLowerCase().indexOf(value) !== -1; 	
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
