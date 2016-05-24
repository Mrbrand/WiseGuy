var itemList = {
    itemArray: [], //lagrar projektdata
    storageKey: "",
    counter:0,
    
    exampledata : function() {   
  
        var data = '[{"title":"","prio":"6","type":"13","notes":"Root item - inte ändra!","parent_id":"-1","status":"open","id":"0","finish_date":"","path":"/","postpone":""}]';
        
        window.localStorage.setItem(this.storageKey, data);    
    },
	
	init : function(key) {     
		var local_storage = window.localStorage.getItem(key);
		this.storageKey = key;
        
        //om local storage är udefinierat
        if (local_storage==undefined) itemList.exampledata();
		else if(local_storage=="undefined") itemList.exampledata();
        else if(local_storage==null) itemList.exampledata();
        else if(local_storage=="") itemList.exampledata();
        
        array_from_storage = JSON.parse(window.localStorage.getItem(key));
        
        this.itemArray = array_from_storage;
        
        
    //loop för odefinerade värden    
        for (var index = 0, len = this.itemArray.length; index < len; index++) {
            //item = this.itemArray[index];
            //if(item.prio==6) item.prio = "6";            //item.path = this.get_path(item.parent_id);
            //item.prio = 6;
            //item.order = 6 - item.prio;
            //this.set_subitems(item.id); 
            /*if(item.type=="2") item.type = "6";
            if(item.type=="9") item.type = "6";
            if(item.type=="10") item.type = "6";
            if(item.type=="11") item.type = "6";
            if(item.type=="12") item.type = "6";
            if(item.type=="14") item.type = "6";*/
            
            
            //if(item.postpone==undefined) item.postpone = "";
            //if(item.path==undefined) item.path = "";
            //if(item.finish_date==undefined) item.finish_date = "";
            //if(moment(item.postpone, 'YYYY-MM-DD ddd') < moment()) item.postpone ="";  
            //if(!item.update_date) item.update_date = moment().format('YYYY-MM-DD HH:mm:ss');  
        }
	},
    
    child_tree : function(id){
        var subitems = itemList.get_subitems(id);
        var all_items = [];
        all_items = all_items.concat(subitems); 
           // console.log(subitems);
        
        subitems.forEach(function(item) {
            
            all_items = all_items.concat(itemList.child_tree(item.id)); 
            //console.log(all_items);
        });
        return all_items;
    },
    
    
    update_postpone : function() {     
        postponed_items = itemList.get_all_items().query("postpone","!=","");
        //console.log(postponed_items);
        postponed_items.forEach(function(item) {
          //console.log(item.postpone);
          //console.log(moment());
          if(moment(item.postpone, 'YYYY-MM-DD') < moment()) item.postpone =""; 
        });
	},
    
    set_subitems: function (id){
        item = this.get_item(id);
        
        var subitems = this.get_next_action(item.id);
        //inte ta med allt (sub-sub)
        var subitems_clean = [];
        subitems.forEach(function(item) {
            subitems_clean.push({title: item.title, type: item.type, postpone: item.postpone, prio: item.prio, icon: item.icon});
        }); 
        
        item.subitems = subitems_clean;
        
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
    },
    
    get_quicklist: function (){
		var quicklist = [];
		var open_items = this.get_all_items().query("finish_date","==","");
		open_items.forEach(function(item) {
			quicklist.push(item.title+" #"+item.id);
		}); 
    	return quicklist;
    }, 
    
	get_item : function(item_id){
		return this.itemArray.filter(function (item){
			return item.id == item_id;
		})[0];
	},

    copy_item : function(item_id){
    	var item = {};
        var item_to_copy = this.get_item(item_id);
        
        //lägga till startdate till objektet
        item["start_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
        //sätta update_date
        item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
        
		//lägga till id till objektet
		item["id"] = itemList.get_last_id()+1;
        
        //item["status"] = item_to_copy["status"];
        item["title"] = item_to_copy["title"];
        item["path"] = item_to_copy["path"];
        item["notes"] = item_to_copy["notes"];
        item["prio"] = item_to_copy["prio"];
        item["type"] = item_to_copy["type"];
        item["order"] = item_to_copy["order"];
        item["repeat"] = item_to_copy["repeat"];
        item["parent_id"] = item_to_copy["parent_id"];
        item["icon"] = item_to_copy["icon"];
        item["finish_date"] = "";
        
        //lägga till objekt i listan
		this.add_item(item);
        
        return item;
	},
	
	get_last_id : function(){
		last_id = Math.max.apply(Math,this.itemArray.map(function(item){return item.id;}));
		if (last_id=="-Infinity") last_id=0; //om inget objekt är skapat ännu
		return last_id;
	},
    
    get_min_order : function(id){
    	var subitems = this.get_subitems(id);
        if (subitems[0] == undefined) return 0;
        else return parseInt(subitems[0].order);
	},
    
    get_next_action : function(id){
        var item = this.get_item(id);
        var subitems = this.get_subitems(id);
        
        //om category
        if(item.type=="13") subitems = subitems.query("type","==","7"); //bara visa projekt
        //om projekt
        if(item.type=="7") subitems = subitems.query("type","==","6"); //bara visa tasks
        //om task
        if(item.type=="6") subitems = subitems.query("type","==","4"); //bara visa ideas
              
        var next_action = [];
        if (subitems[0] != undefined) next_action.push(subitems[0]);
        return next_action;
	},
	

	add_item : function(item){
		this.itemArray.push(item);
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
    
    save_to_storage : function(item){
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
	

	add_from_form : function(form_id){
		//skapa objekt av formdata
		var temp = $( form_id ).serializeArray();
		var item = {};
		for(var i = 0; i <temp.length;i++){
			temp2 = temp[i];
			item[temp2["name"]] = temp2["value"];
		}
		
		//lägga till startdate till objektet
		item['start_date'] = moment().format('YYYY-MM-DD HH:mm:ss');
		item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
    	
		//lägga till id till objektet
		item["id"] = this.get_last_id()+1;
		
		item["path"] = this.get_path(item["parent_id"]);
        
        item["finish_date"] = "";
        
        
        
        //lägga till objekt i listan
		this.add_item(item);
        
        this.set_subitems(item.parent_id); 
        
	},
	
	
	edit_from_form : function(form_id){
		//skapa objekt av formdata
		var temp = $( form_id ).serializeArray();
		var item = {};
		for(var i = 0; i <temp.length;i++){
			temp2 = temp[i];
			item[temp2["name"]] = temp2["value"];
		}
        
		item["path"] = this.get_path(item["parent_id"]);
		item["update_date"] = moment().format('YYYY-MM-DD HH:mm:ss');
    	
        //byta ut objekt i listan
		this.remove_item(item.id);
        
		this.add_item(item);
        
        this.set_subitems(item.parent_id); 
        this.set_subitems(item.id); 
	},
	
	
	remove_item : function(id){
		for(var i in this.itemArray){
			if(this.itemArray[i].id==id){
                var parent_id = this.get_item(id).parent_id
				this.itemArray.splice(i,1);
				this.set_subitems(parent_id);
                break;
				}
		}
         
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
        
	},
	
	
	finish_item : function(id){
		for(var i in this.itemArray){
			if(this.itemArray[i].id==id){
				this.itemArray[i]['finish_date'] = moment().format('YYYY-MM-DD HH:mm:ss');
                this.set_subitems(this.get_item(id).parent_id);
				break;
				}
		}
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
	
    
    
    
    set_item_field : function(id, field, value){
        for(var i in this.itemArray){
			if(this.itemArray[i].id==id){
				this.itemArray[i][field] = value;
                this.set_subitems(this.get_item(id).parent_id);
                break;
				}
		}
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.itemArray));
	},
    
    
    
    get_all_items : function(){
        return this.itemArray;
	},

    
    
    get_subitems : function(id){
    		//filtrera på parent_id och finished
        	var subitems = this.itemArray.filter(function (item){
				return item.parent_id == id & item.finish_date === "";
			});
		
        //sortera 
        subitems.sort(
	 			firstBy(function (v1, v2) { return v1.order - v2.order; })
        		.thenBy(function (v1, v2) { return v1.title<v2.title ? -1 : v1.title>v2.title ? 1 : 0; })
	    );  
       return subitems;
	},
	
	
	
	get_path : function(id){
			var path = "/";
			var item = this.get_item(id); 
			while(item!==undefined){
				//hämta parent om det finns
				path = "/" + item.title + path;
				item = this.get_item(item.parent_id);				
			}
			return path;
	},
	
	
}


/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();
