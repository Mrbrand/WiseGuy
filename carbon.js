// Carbon (Konstruktör)
function Carbon(key){
    this.itemArray = []; //lagrar projektdata
    this.storageKey =  key;
    
    //ladda från local storage
    var local_storage = window.localStorage.getItem(key);
        
    //om det finns värden i local storage 
    if (local_storage) {
        this.itemArray = JSON.parse(window.localStorage.getItem(key));
    }
}


// get_all
Carbon.prototype.get_all = function() {
    return this.itemArray;
    console.log("get_all");
};


// save
Carbon.prototype.save = function() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
};


// add_item
Carbon.prototype.add_item = function(item) {
    item["id"] = this.last_id()+1;
    item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
    item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
    
    console.log(item);
    this.itemArray.push(item);
    this.save();
};

//remove_item
Carbon.prototype.remove_item = function(id) {
    for(var i in this.itemArray){
		if(this.itemArray[i].id==id){
            var parent_id = this.get_item(id).parent_id
			this.itemArray.splice(i,1);
            break;
			}
	}
	window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
};


// get_item
Carbon.prototype.get_item = function(id) {
	return this.itemArray.filter(function (item){
		return item.id == id;
	})[0];
};

  
// last_id
Carbon.prototype.last_id = function() {
	last_id = Math.max.apply(Math,this.itemArray.map(function(item){return item.id;}));
    if (last_id=="-Infinity") last_id=0; //om inget objekt är skapat ännu
    return last_id;
};

// Clear all
Carbon.prototype.clear = function() {
    this.itemArray = []; //lagrar projektdata
    this.save();
};

// Copy
Carbon.prototype.copy = function(id) {
    var item = JSON.parse(JSON.stringify(this.get_item(id)));
    
    item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
    item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
	item["id"] = this.last_id()+1;
    
	this.add_item(item);
    return item;
};


// add from form
Carbon.prototype.add_from_form = function(form_id) {
	//skapa objekt av formdata
    var form_object = $( form_id ).serializeObject();
	this.add_item(form_object);
    console.log("add_from_form");
};
	
    
// edit from form
Carbon.prototype.edit_from_form = function(form_id) {
    
    //skapa object från formulär
    var form_object = $( form_id ).serializeObject();
    console.log(form_object);
    
    // om item med detta id finns
    if(this.get_item(form_object.id)){
        var item = JSON.parse(JSON.stringify(this.get_item(form_object.id)));
        
        jQuery.extend(item, form_object);
        
        item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //byta ut objekt i listan
    	this.remove_item(item.id);
        this.itemArray.push(item);
        this.save();
        
        return item;
    }
    else return false;
};


Carbon.prototype.set_item_field = function(id, field, value) {
    for(var i in this.itemArray){
		if(this.itemArray[i].id==id){
			this.itemArray[i][field] = value;
            break;
	    }
	}
	this.save();
};



/* ******************************************************************/
/* Serialize Object     http://jsfiddle.net/sxGtM/3/                */
/********************************************************************/
$.prototype.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};



