/* INIT *******************************************************************/
var itemList = new Carbon("wiseguy_items");

var current_page = "#issues";
var previous_page = "";
var current_item={};

var items = itemList.get_all();


items.forEach(function(item) {
	if(item.category == undefined) item.category = "-";
	 if(moment(item.postpone, 'YYYY-MM-DD') < moment()) item.postpone =""; 
});

// Manuell sortering 
Sortable.create(document.getElementById('open'), {handle: '.subitem-right',onSort: function (evt) {
    var tasks  = itemList.get_all().query("finish_date","==","").query("parent_id", "==", current_item.id);
    reorder(tasks, evt.oldIndex, evt.newIndex);
}});

Sortable.create(document.getElementById('categories'), {handle: '.subitem-right',onSort: function (evt) {
    var categories=itemList.get_all().query("type", "==", 13);
    reorder(categories, evt.oldIndex, evt.newIndex);
}});

set_categories();
view_issue_list();



/* PageHandler class *******************************************************/

function open_page (page_id, show_extra) {
	previous_page = current_page;
	current_page = page_id;
		
	if(page_id == "#category_list") view_menu();
	else if(page_id == "#issues") view_issue_list();
	else if(page_id == "#single_issue") view_single_issue(current_item.id);
	else if(page_id == "#task_list") view_task_list();
	
	console.log(page_id);
	
	
	$(".extra").hide();
	
	if (show_extra) show_extra.forEach(function(element) {
		$(element).show();
	});
		
	$(".page").hide();
	$(page_id).show();
	
	window.scrollTo(0, 0);
}


/* FUNCTIONS *******************************************************************/

function view_issue_list(){ 	
    var query = $(".search").val().toLowerCase();
    var category = $("#category_filter").val();
    var show_postponed = $('#show_postponed').prop("checked");
    
    var open_items=itemList.get_all()
   		.query("type", "==", 7)
		.query("finish_date", "==", "")
    	.filter(function (item){
		 	return item['title'].toLowerCase().indexOf(query) != -1 || 
		 				item['notes'].toLowerCase().indexOf(query) != -1 
		});
    
    if(category!="*") open_items=open_items.query("category", "==", category);
    if(!show_postponed) open_items=open_items.query("postpone", "==", "");
    
    open_items.sort(
        firstBy("prio")
        .thenBy("postpone") 
        .thenBy("update_date", -1));

	mustache_output("#filtered", open_items, "#issue_template");

  	//om inga items hittas
	if (open_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
    
    $(".page").hide();
	$("#issues").show();
	view = "issue_list";
}



function view_task_list(){ 	
    var query = $(".search").val().toLowerCase();
    var category = $("#category_filter").val();
    var show_postponed = $('#show_postponed').prop("checked");
    var context = $('input[name="icon"]:checked').val();
    //var sortby = $("#sortby").val();
	
    var open_items=itemList.get_all()
    	.query("type", "==", 6)
		.query("finish_date", "==", "")
		.filter(function (item){
		 	return item['title'].toLowerCase().indexOf(query) != -1 || item['notes'].toLowerCase().indexOf(query) != -1 
		});
    
    if(category!="*") open_items=open_items.query("category", "==", category);
    if(!show_postponed) open_items=open_items.query("postpone", "==", "");
     if(context) open_items=open_items.query("icon", "==", context);
  
    //sortera fltered items
    open_items.sort(
        firstBy("prio")
        .thenBy("postpone") 
        .thenBy("icon")
	);

	mustache_output("#tasks", open_items, "#filtered_task_template");

  	//om inga items hittas
	if (open_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
	
	$(".page").hide();
	$("#task_list").show();
	view = "task_list";
}



function view_single_issue (id) {
    var open_items = itemList.get_all()
    	.query("finish_date","==","")
    	.query("parent_id", "==", id)
    	.sort(firstBy("order")
    	.thenBy("update_date", -1));
    
    var finished_items = itemList.get_all()
    	.query("finish_date","!=","")
    	.query("parent_id", "==", id)
    	.sort(firstBy("finish_date",-1));

	mustache_output("#open", open_items, "#open_task_template");
    mustache_output("#finished", finished_items, "#finished_task_template");
    
    // om listan är tom
    if (open_items.length==0 && finished_items.length == 0) $("#open").append("<div class='empty'>No items</div>");
    
    // byta sida 
	$(".page").hide();
	$("#single_issue").show();
	view = "single_issue";
	current_item = itemList.get_item(id);
}



function view_menu() {
	view = "menu";
    var categories=itemList.get_all()
    	.query("type", "==", 13)
		.sort(firstBy("order").thenBy("update_date", -1) );
    
    mustache_output("#categories", categories, "#open_task_template");
	
    $(".page").hide();
	$("#category_list").show();
}





function reorder(items, from_pos, to_pos){
    items.sort(firstBy("order").thenBy("update_date", -1) );
    
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
    console.log(items);
    itemList.save(); 
}




function set_categories(){
   	var categories=itemList.get_all().query("type", "==", 13);
   	categories.sort(firstBy("order").thenBy("update_date", -1) );
   	
   	$(".cat").remove();
    categories.forEach(function(item) {
		item_meta = item_with_meta(item.id);
		var template = $('#category_template').html();
		var html = Mustache.to_html(template, item_meta);
		$(".category_select").append(html);
	});    
	$(".category_select").val("*");
}



function mustache_output(output_id, items, template_id){
    $(output_id).empty();
    items.forEach(function(item) {
		item_meta = item_with_meta(item.id);
		var template = $(template_id).html();
		var html = Mustache.to_html(template, item_meta);
		$(output_id).append(html);
	});
}



function item_with_meta(id){
	var item = JSON.parse(JSON.stringify(itemList.get_item(id)));
	open_tasks = itemList.get_all().query("finish_date","==","").query("parent_id", "==", id);
    finished_tasks = itemList.get_all().query("finish_date","!=","").query("parent_id", "==", id);
    
    // sortera array med items
	open_tasks.sort(firstBy("order").thenBy("update_date", -1) );
	finished_tasks.sort(firstBy("finish_date"));
	item.subitems = open_tasks[0];
	item.open_task_count = open_tasks.length;
	item.finished_task_count = finished_tasks.length;
	if(item.type==6) item.parent_title = itemList.get_item(item.parent_id).title
	
	return item;
}
