/*****************************************************************************/
/** Uppstart *****************************************************************/
/*****************************************************************************/

// deklkarera variabler
var current = {id:0, parent_id:0, title:"Alla"};
var view = "tree";
var id;
var edit_item_prio =  $("#edit-item-prio").msDropDown().data("dd");
var edit_item_type =  $("#edit-item-type").msDropDown().data("dd");
var new_item_prio =  $("#new-item-prio").msDropDown().data("dd");
var new_item_type =  $("#new-item-type").msDropDown().data("dd");
var preferences = {};
var scroll_position = 0;


// Initiera itemslista från local storage
itemList.init("wiseguy_items");
if (itemList.itemArray==undefined) itemList.exampledata();
else if(itemList.itemArray==null) itemList.exampledata();
//itemList.filtered("all","");

view_filter();   


// Initiera Inställningar från local storage  
var preferences = window.localStorage.getItem("wiseguy_preferences");
if (preferences == undefined | preferences == null | preferences == "") 
    window.localStorage.setItem("wiseguy_preferences",'{"slot1":"📝", "slot2":"📞", "slot3":"📐", "slot4":"💻", "slot5":"💳", "slot6":"💬","slot7":"🏠","slot8":"🎬", "background_color": "", "controls_color":""}');
preferences = window.localStorage.getItem("wiseguy_preferences");

set_preferences();

//awesomlete
var input_parent = document.getElementById("parent");
var awesomplete = new Awesomplete(input_parent);

var input_search = document.getElementById("quick_search");
var awesomplete2 = new Awesomplete(input_search);

awesomplete.list = itemList.get_quicklist();
awesomplete2.list = itemList.get_quicklist();


/*****************************************************************************/
/* Funktioner och bundna knappar *********************************************/
/*****************************************************************************/

// Manuell sortering av item i lista
var list = document.getElementById('open');
Sortable.create(list, {handle: '.subitem-right',onSort: function (evt) {
    //console.log(evt.oldIndex + ' -> ' + evt.newIndex);
    reorder(current.id, evt.oldIndex, evt.newIndex);
    itemList.set_subitems(current.id);
}});

window.addEventListener("awesomplete-selectcomplete", function(e){
    
    switch($(e.target)[0].id) 
        {
            //event via edit meny
            case "parent": 
               	str = $("#parent").val()
				pos = str.indexOf("#");
				id = parseInt(str.substr(pos+1));
				$(".item-parent-id").val(id);
                break;
            //event via tree meny   
            case "quick_search": 
               	str = $("#quick_search").val()
				pos = str.indexOf("#");
				id = parseInt(str.substr(pos+1));
				 view_item (id);
                break;
            default:
            console.log("miss");
         }
   
}, false);


$(document).on('focus', "#parent", function() {
 $("#parent").val("");


});


 
// . NEW BUTTON
$(document).on('click', ".new-button", function() {

    $(".menu-title").html("New: "+current.title); //titel i meny
    
    
    $('#new-item-form textarea[name="title"]').val(""); //title
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
    $('#new-item-form input[name="postpone"]').val(undefined); //postpone
    $('#new-item-form textarea[name="notes"]').val(""); //notes
    $('#new-item-form input[name="icon"]').val(""); //postpone
    
    $('#new-item-form input[name="parent_id"]').val(current.id); //parent_id
   
	$('#new-item-form input[name="id"]').val(current.id); //id (hidden)
   $('#new-item-form input[name="order"]').val(itemList.get_min_order(current.id)-1); //order (hidden)
    
    //type beroende på parent type	
    if (current.type == 6) new_item_type.setIndexByValue("4"); //task -> idé
    else if (current.type == 13) new_item_type.setIndexByValue("7"); //category -> project
    else new_item_type.setIndexByValue("6"); //task	
    	
    	
   	$(".context").empty();
    for (i = 1; i <= 8; i++) { 
    	icon = preferences['slot'+i];
		$(".context").append('<button onclick="set_context_icon(\'' +icon+'\');" type="button" style="margin-left:3px;">'+icon+'</button>');
	}
	
    	/*$("input.item-id").val(current.id);
    	$("#new-item-title").val("");
    	$("#new-item-notes").val("");
    	//$("#new-item-size").val("6");
    	$("#new-item-postpone").val(undefined);
    	$("#new-parent-id").val(current.id);
    	$("#new-order").val(itemList.get_min_order(current.id)-1);*/
		//$("#new-parent-id").val(current.id);
		
		//$('#new-item-form input:radio[value='+5+']').prop('checked', true);
		
		
    //drop down med bilder plugin
    //new_item_prio.setIndexByValue("6"); 
    
	//sätta type beroende på current.type
	
	
	
	$(".page").hide();
	$("#new").show();
	
    $("#new-item-title").focus();
  	window.scrollTo(0, 0);
 });


// EDIT  .subitem-left (edit-läge)
$(document).on('click', ".subitem-left", function() {
    
    var id = $(this).parent().find(".item_id").text();
    var edit_item = itemList.get_item(id);
    var edit_parent = itemList.get_item(edit_item.parent_id);
    var icon;
    
    scroll_position = $("body").scrollTop();
    
    $(".context").empty();
    for (i = 1; i <= 8; i++) { 
    	icon = preferences['slot'+i];
		$(".context").append('<button onclick="set_context_icon(\'' +icon+'\');" type="button" style="margin-left:2px;">'+icon+'</button>');
	}
        
    /*
      Buggar för icon/postpone och strular till det med radio buttons 2016-04-02  
    for (var key in edit_item) {
        $('#edit-item-form .input_'+key).val(edit_item[key]);
    }*/
    
    $(".menu-title").html("Edit: "+edit_item.title); //titel i meny
     
    $('#edit-item-form input[name="title"]').val(edit_item.title); //title
    $('#edit-item-form input:radio[value="'+edit_item.prio+'"]').prop('checked', true); // prio (css trick med bilder)
    $('#edit-item-form input:radio[value="'+edit_item.icon+'"]').prop('checked', true); // prio (css trick med bilder)
    edit_item_type.setIndexByValue(edit_item.type); // type (dropdown plugin)
    $('#edit-item-form input[name="postpone"]').val(edit_item.postpone); //postpone
    $('#edit-item-form textarea[name="notes"]').val(edit_item.notes); //notes
    
    $('#edit-item-form input[name="parent_id"]').val(edit_item.parent_id); //parent_id
     $("#parent").val(edit_parent.title+" #"+edit_parent.id); //parent med awesomplete
  	$('#edit-item-form input[name="repeat"]').val(edit_item.repeat); //repeat
    $('#edit-item-form input[name="icon"]').val(edit_item.icon); //icon
   
  	$('#edit-item-form input[name="start_date"]').val(edit_item.start_date); //start_date
   	$('#edit-item-form input[name="update_date"]').val(edit_item.update_date); //update_date
   	$('#edit-item-form input[name="finish_date"]').val(edit_item.finish_date); //finish_date
	
	 $('#edit-item-form input[name="id"]').val(edit_item.id); //id (hidden)
   	 $('#edit-item-form input[name="order"]').val(edit_item.order); //order (hidden)
   
	$(".page").hide();
	$("#edit").show();
	
	$('.more').hide();
	$('.more-button').show();
	
	window.scrollTo(0, 0);
 });
 
 
// .subitem-center (visa subitems)
$(document).on('click', ".subitem-center", function() {
	var current_id = $(this).parent().find(".item_id").text();
    $("#search-item").val("");
    /*
    if (view == "tree") view_item (current_id);
    else if (view == "filter") view_item (itemList.get_item(current_id).parent_id);
    */
    window.scrollTo(0, 0);
    view_item (current_id);
 });
 

// .add-button
$(document).on('click', ".add-button", function() {
    itemList.add_from_form("#new-item-form");
    awesomplete.list = itemList.get_quicklist();
    awesomplete2.list = itemList.get_quicklist();
	view_item(current.id);
 });


// .save-button
$(document).on('click', ".save-button", function() {
   itemList.edit_from_form("#edit-item-form");
   awesomplete.list = itemList.get_quicklist();
   awesomplete2.list = itemList.get_quicklist();
	if(view=="tree")	view_item(current.id);
	else view_filter();
    $("body").scrollTop(scroll_position);
 });


// .more-button
$(document).on('click', ".more-button", function() {
	$('.more').show();
	$('.more-button').hide();
 });

// .home-button
 $(document).on('click', ".home-button", function() {
	view_item(0);
    //$("#search-item").val("");
 });

// .back-button
 $(document).on('click', ".back-button", function() {
	view_item(current.parent_id);
    //$("#search-item").val("");
 });

// swipe back
$("#tree").on('swiperight',  function(){ 
	$("#search-item").val("");
    if(current.parent_id!=-1)
		view_item(current.parent_id);
});

// byta till search
$("#tree").on('swipeleft',  function(){ 
    view_filter();
});

// byt till tree
$("#search").on('swiperight',  function(){ 
    view_item(current.id);
});

function set_context_icon(icon){
	console.log(icon);
	$(".context-icon").val(icon);
}


// gear button (preferences)
$(document).on('click', ".pref-button", function(){ 
        
        var preferences = JSON.parse(window.localStorage.getItem("wiseguy_preferences"));
        
        $("#slot1").val(preferences.slot1); 
        $("#slot2").val(preferences.slot2); 
        $("#slot3").val(preferences.slot3); 
        $("#slot4").val(preferences.slot4); 
        $("#slot5").val(preferences.slot5); 
        $("#slot6").val(preferences.slot6); 
        $("#slot7").val(preferences.slot7); 
        $("#slot8").val(preferences.slot8); 
        
        $("#star_icon").val(preferences.star_icon); 
        
        $("#background_color").val(preferences.background_color); 
        $("#controls_color").val(preferences.controls_color); 
        
        var open_items = itemList.get_all_items().query("finish_date","==","");
        var finished_items = itemList.get_all_items().query("finish_date","!=","");
        var prio1 = open_items.query("prio","==","1");
        var prio2 = open_items.query("prio","==","2");
        var prio3 = open_items.query("prio","==","3");
        var prio4 = open_items.query("prio","==","4");
        var prio5 = open_items.query("prio","==","5");
        
        var projects = open_items.query("type","==","7");
        var tasks = open_items.query("type","==","6");
        var problems = open_items.query("type","==","5");
        var visions = open_items.query("type","==","15");
        var ideas = open_items.query("type","==","4");
        var categories = open_items.query("type","==","13");
        
        
        //console.log("Open:"+open_items.length+" Finished:"+finished_items.length);
        $("#statistics").empty();
        $("#statistics").append("<br/>Finished:"+finished_items.length);
        $("#statistics").append("<br/>Open:"+open_items.length);
        $("#statistics").append("<br/>Prio1:"+prio1.length);
        $("#statistics").append("<br/>Prio2:"+prio2.length);
        $("#statistics").append("<br/>Prio3:"+prio3.length);
        $("#statistics").append("<br/>Prio4:"+prio4.length);
        $("#statistics").append("<br/>Prio5:"+prio5.length);
        
        $("#statistics").append("<br/><br/>Projects:"+projects.length);
        $("#statistics").append("<br/>Tasks:"+tasks.length);
        $("#statistics").append("<br/>Problems:"+problems.length);
        $("#statistics").append("<br/>Visions:"+visions.length);
        $("#statistics").append("<br/>Ideas:"+ideas.length);
        $("#statistics").append("<br/>Categories:"+categories.length);
        
        //$("#statistics").append("<br/>Month: "+moment().format("M"));
        
        new_items = itemList.get_all_items().filter(function (item){
            return moment(item["start_date"],"YYYY-MM-DD").format("M") == 11; 	
	    });
		
        console.log(new_items);
        $("#statistics").append("<br/>New: "+new_items.length);
        
        $(".page").hide();
		$("#menu").show();
});

// .cancel-button
$(document).on('click', ".cancel-button", function() {
  	if(view=="tree")	view_item(current.id);
	else view_filter();
    $("body").scrollTop(scroll_position);
 });


// .delete-button
$(document).on('click', ".delete-button", function() {
	id = $(".item-id").val();
	if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
        
        var all_subitems = itemList.child_tree(id);  
        all_subitems.forEach(function(item){
            itemList.remove_item(item.id);
        });
        
        itemList.remove_item(id);
    	 
        if(view=="tree")	view_item(current.id);
    	else view_filter();
        $("body").scrollTop(scroll_position);
    }
 });
 
 // .finish-button
$(document).on('click', ".finish-button", function() {
        item = itemList.get_item($(".item-id").val());
        itemList.edit_from_form("#edit-item-form");
        
        if(item.repeat){
            var item_copy = itemList.copy_item(item.id);
            item_copy["postpone"] = moment().add( item.repeat, 'days').format('YYYY-MM-DD');      
        }
        
        itemList.finish_item(item.id);
	    
        if(view=="tree")	view_item(current.id);
	    else view_filter();
        
        $("body").scrollTop(scroll_position);
        
 });

$(document).on('change', "#edit-item-order", function() {
    $("#order").val($("#edit-item-order").val());

});

// .search-button
$(document).on('click', ".search-button", function() {
	view_filter();
 });

// .tree-button
$(document).on('click', ".tree-button", function() {
	view_item(current.id);
 });

// Reset filter buttot
$(document).on('click', ".reset-filter", function() {
    itemList.update_postpone();
    $('.search').val('');  
    $('.type-filter').val('');
    $('.status-filter').val('open');
    $('.path-filter').val(''); 
    $('.type-filter').val('');  
    $('.prio-filter').val('5'); 
    $('#controls-title').hide(); 
    view_filter();
});

function to_finished(){
    $(".search").val("");
    $(".path-filter").val(current.path+current.title);   
    $(".status-filter").val("finished");
    $(".type-filter").val("");
    $(".prio-filter").val("6");
    //$('.controls-extra').show();
    view_filter();    
}


function to_search(){
    $(".search").val("");
    $(".path-filter").val(current.path+current.title);   
    $(".status-filter").val("open");
    $(".prio-filter").val("6");  
    $(".type-filter").val("");
    view_filter();    
}

function togggleStatus(){
    if($(".status-filter").val()=="open")$(".status-filter").val("finished");
    else $(".status-filter").val("open");
    view_filter();       
}


function view_item (id) {
	view = "tree";
	current = itemList.get_item(id);
	
    // time measurements
    var timeInMs = Date.now();
    var diff;
    var output = "";
    
    //$(".menu-title").html(itemList.get_item(id).title);
    $("#quick_search").val(itemList.get_item(id).title);
	// var query = $("#search-item").val().toLowerCase();
    
    // gömma Back-knapp för Root item
	if(id == 0) {$("#tree>.controls>.back-button").hide(); $("#tree>.controls>.home-button").hide();} 
	else {$("#tree>.controls>.back-button").show(); $("#tree>.controls>.home-button").show();}
    //filtrera array med items
    open_items = itemList.get_all_items().query("finish_date","==","").query("parent_id", "==", id);
    /*open_items = open_items.filter(function (item){
     	return item["title"].toLowerCase().indexOf(query) !== -1 | item["notes"].toLowerCase().indexOf(query) !== -1; 	
	});*/
    
    finished_items = itemList.get_all_items().query("finish_date","!=","").query("parent_id", "==", id);
    
    // sortera array med items
	open_items.sort(
	 	firstBy(function (v1, v2) { return v1.order - v2.order; })
        .thenBy(function (v1, v2) { return v1.update_date<v2.update_date ? -1 : v1.update_date>v2.update_date ? 1 : 0; })
	);

	// rensa listor
    $("#open").empty();
    $("#finished").empty();
		
    //mata ut open_items med mustache
    open_items.forEach(function(item) {
        var template = $('#open_items_template').html();
        var html = Mustache.to_html(template, item);
    	$("#open").append(html);
    }); 
    
    //mäta tid för att visa lista
    /*diff = Date.now() - timeInMs;
    timeInMs = Date.now();
    output = output + "totel: " + diff + " ms\n";
    
    alert(output);
    */
    
    
    // om listan är tom
    if (open_items.length==0) $("#open").append("<div class='empty'>No open items</div>");
    if (finished_items.length != 0) $("#finished").append("<br/><center><button onclick='to_finished();'>View finished ("+finished_items.length+")</button></center>");
    
    // byta sida 
	$(".page").hide();
	$("#tree").show();
}


//filter
 function view_filter(){
    // spara view för att backa rätt från edit
    view = "filter";
    
    itemList.update_postpone();
    
    // ladda in filtervärden
    var query = $(".search").val();
    var type = $(".type-filter").val();
    var status = $(".status-filter").val();
    var path = $(".path-filter").val();
    var prio = $(".prio-filter").val();
    var context = $(".context-filter").val();
    var prioline="";
    var postponeline=true;
    console.log(context);
    
    // skapa path knappar 
    $("#path-buttons").empty();
    var root_items = itemList.get_all_items().query("parent_id", "==", "0");
    root_items .sort(
     	firstBy(function (v1, v2) { return v1.order - v2.order; })
        .thenBy(function (v1, v2) { return v1.title<v2.title ? -1 : v1.title>v2.title ? 1 : 0; })
	);
    root_items.forEach(function(item) {
        var template = $('#path_button_template').html();
        var html = Mustache.to_html(template, item);
    	$("#path-buttons").append(html);
    });
    
    // ladda in alla items 
    filtered_items = itemList.get_all_items();
    
    // filtrera title om fält är satt
    if (query) filtered_items = filtered_items.query("notes", "contains", query);
    
    // filtrera path om fält är satt
    if (path) filtered_items = filtered_items.query("path", "contains", path);

    // filtrera type om fält är satt
    if (type) filtered_items = filtered_items.query("type","==", type);
    
    // filtrera type om fält är satt
    if (prio) filtered_items = filtered_items.query("prio","<", prio+1);

    // filtrera title om fält är satt
    if (context) filtered_items = filtered_items.query("icon", "==", context);

    
    // begränsa sökning till prioriterade om för få filter är satta
    //if (query=="") filtered_items = filtered_items.query("prio", "<", 6);
    
    // filtrera på öppna eller avslutade
    if (status == "open") 
        filtered_items = filtered_items.query("finish_date","==","");
    else 
        filtered_items = filtered_items.query("finish_date","!=","");
    
    // sortera items
    if (status == "open")
        filtered_items .sort(
    	 	firstBy(function (v1, v2) { return v1.postpone.localeCompare(v2.postpone); })
    		.thenBy(function (v1, v2) { return v1.prio - v2.prio; }) 
            .thenBy(function (v1, v2) { if(v2.update_date != undefined & v2.update_date != undefined) return v2.update_date.localeCompare(v1.update_date); else return 0; })
               		//.thenBy(function (v1, v2) { return v1.path.localeCompare(v2.path); })
    	);
    else if (status == "finished")
    	filtered_items .sort( function (v1, v2) { return v2.finish_date.localeCompare(v1.finish_date); });    
   
    /* else if (sort_order == "old")
        filtered_items .sort( function (v1, v2) { return v1.start_date.localeCompare(v2.start_date); });    
    */
    
    //rensa lista
	$("#filtered").empty();
    
    // mata ut items med mustache
    filtered_items.forEach(function(item) {
        if (item.prio != prioline)  {
        	
        	if (item.postpone == "") {
		    	prio_item_count = filtered_items.query("prio","==",item.prio).query("postpone","==","").length;
		    	$("#filtered").append("<div style='padding:3px; background:#333;color:#AAA;'>"+prio_item_count+"<img src='img/prio"+item.prio+".png'></div>");
        	}
        	else if (postponeline) {
        		$("#filtered").append("<div style='padding:3px; background:#333;color:#AAA;'>Postponed</div>"); 
        		postponeline=false;
        	}
        	prioline=item.prio; 
 
        }
        var template = $('#filtered_items_template').html();
    	var html = Mustache.to_html(template, item);
    	$("#filtered").append(html);
    }); 
    
    // om inga item finns 
    if (filtered_items.length == 0)  $("#filtered").append("<div class='empty'>No items here</div>");
     
    // byta sida
    $(".page").hide();
	$("#search").show();
    
    // till toppen av sidan
    window.scrollTo(0, 0);
 }
 

function reorder(item_id, from_pos, to_pos){
    var items = itemList.get_subitems(item_id);
    console.log(items);
    var offset = 0;
    
    for (var index = 0, len = items.length; index < len; index++) {
        item = items[index];
        
        if (from_pos >= to_pos){
            if(index == (to_pos)) offset++;
        }
        else{
            if (index == (to_pos+1)) offset++;
        }
        
        if(index == from_pos) offset--;
        item.order = index + offset;
        if(index == from_pos) item.order = to_pos;
    }
    
    itemList.save_to_storage(); 
}

function set_preferences(){
    preferences = JSON.parse(window.localStorage.getItem("wiseguy_preferences"));

    //$(".search").val(preferences.slot1);
    
    $("#prefefined").html("");

    var template = $('#filter_buttons_template').html();
    //var template = "<button>{{icon}}</button>";
	var html = Mustache.to_html(template, preferences);
	$("#prefefined").append(html);
    
    $(".controls").css("background",preferences.controls_color);
    $("body").css("background",preferences.background_color);
    $(".header").css("background",preferences.background_color);
}


function save_preferences(){
    var slot1 =  $("#slot1").val();
    var slot2 =  $("#slot2").val();
    var slot3 =  $("#slot3").val();
    var slot4 =  $("#slot4").val();
    var slot5 =  $("#slot5").val();
    var slot6 =  $("#slot6").val();
    var slot7 =  $("#slot7").val();
    var slot8 =  $("#slot8").val();
    var background_color =  $("#background_color").val();
    var controls_color =  $("#controls_color").val();
    var star_icon = $("#star_icon").val();
    
    var buttons = {slot1:slot1, slot2:slot2, slot3:slot3, slot4:slot4, slot5:slot5, slot6:slot6, slot7:slot7,slot8:slot8, background_color: background_color, controls_color:controls_color, star_icon: star_icon};
    window.localStorage.setItem("wiseguy_preferences",JSON.stringify(buttons));
    
    
    set_preferences();
    
    view_filter();   
}

// #import-button
$(document).on('click', "#import-button", function() {
    if (confirm('All current data will be deleted?')==true) {
        window.localStorage.setItem(itemList.storageKey, $('#import').val());
        itemList.init("wiseguy_items");
        view_item(0);
    }
});
 
// #export all-button
$(document).on('click', "#export-button", function() {
    var items = itemList.get_all_items().query("finish_date","==","");
    var items_string = JSON.stringify(items);
    console.log(items);
    console.log(items_string);
    $("#export").html(items_string);
    $(".page").hide();
    $("#export").show();
});


// #export subtree-button
$(document).on('click', "#export-subtree-button", function() {
    var items = itemList.child_tree(current.id);
	items = items.concat(itemList.get_item(current.id));
    var items_string = JSON.stringify(items);
    console.log(items);
    console.log(items_string);
    $("#export").html(items_string);
    $(".page").hide();
    $("#export").show();
});

