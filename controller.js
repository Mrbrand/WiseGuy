/* INIT *******************************************************************/
var itemList = new Carbon("wiseguy_items");
var view="issue_list";
var current={};

 var items = itemList.get_all();


items.forEach(function(item) {
	if(item.category == undefined) item.category = "-";
});

// Manuell sortering 
Sortable.create(document.getElementById('open'), {handle: '.subitem-right',onSort: function (evt) {
    var tasks  = itemList.get_all().query("finish_date","==","").query("parent_id", "==", current.id);
    reorder(tasks, evt.oldIndex, evt.newIndex);
}});

Sortable.create(document.getElementById('categories'), {handle: '.subitem-right',onSort: function (evt) {
    var categories=itemList.get_all().query("type", "==", 13);
    reorder(categories, evt.oldIndex, evt.newIndex);
}});

set_categories();
view_issue_list();


/* BUTTONS *******************************************************************/

$(".add-button").click(function() {
    itemList.add_from_form("#new-item-form");
    if(view == "issue_list") view_issue_list();
    if(view == "menu") view_menu();
    else view_single_issue(current.id);
});


$(".back-button").click(function() { 
	if(view == "menu") set_categories();
    view_issue_list();
});


$(".cancel-button").click(function() { 
    if(view == "issue_list") view_issue_list();
    else if(view == "menu") view_menu();
    else view_single_issue(current.id);
}); 

$("#category_filter").change(function() { 
    if($(this).val()=="edit") view_menu();
    else view_issue_list();
}); 
 
 
$(".delete-button").click(function() {
	id = $("#edit-item-form .item-id").val();
    if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
		itemList.remove_item(id);
		if(view == "issue_list") view_issue_list();
		else view_single_issue(current.id);
    }
});


$("#export-button").click(function() { 
    var items = itemList.get_all();
    var items_string = JSON.stringify(items);
    $("#export").html(items_string);
    $(".page").hide();
    $("#export").show();
});


$(".finish-button").click(function() {
        item = itemList.get_item($("#edit-item-form .item-id").val());
        itemList.edit_from_form("#edit-item-form");
        
        /*if(item.repeat){
            var item_copy = itemList.copy_item(item.id);
            item_copy["postpone"] = moment().add( item.repeat, 'days').format('YYYY-MM-DD');      
        }
        */
        
	    itemList.set_item_field(item.id, "finish_date", moment().format('YYYY-MM-DD HH:mm:ss'))
	            
        if(view == "issue_list") view_issue_list();
    	else view_single_issue(current.id);
        //$("body").scrollTop(scroll_position);
        
 });
 
 
$("#import-button").click(function() { 
    if (confirm('All current data will be deleted?')==true) {
        window.localStorage.setItem(itemList.storageKey, $('#import').val());
       	view_issue_list();
    }
});
 

$(".more-button").click(function() {	
	$('.more').show();
	$('.more-button').hide();
});
 
 
 
$(".new-issue-button").click(function() {
	$('#new-item-form .autovalue').val(""); 
    $('#new-item-form input[name="type"]').val("7"); 
	$('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	$('#new-item-form select[name="category"]').val($("#category_filter").val()); 
	if($("#category_filter").val() =="*") $('#new-item-form select[name="category"]').val("-"); 
	
	open_page ("#new");
	$("#new-item-form [name='title'] ").focus();
});



$(".new-task-button").click(function() { 
	$('#new-item-form .autovalue').val(""); 
	$('#new-item-form input[name="type"]').val("6"); 
	$('#new-item-form input[name="parent_id"]').val(current.id); 
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	$('#new-item-form select[name="category"]').val(current.category); 
	open_page ("#new");
	$("#new-item-form [name='title'] ").focus();
});



$(".new-category-button").click(function() { 
	$('#new-item-form .autovalue').val(""); 
	$('#new-item-form input[name="type"]').val("13"); 
	$('#new-item-form input[name="parent_id"]').val(""); 
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	
	open_page ("#new");
	$("#new-item-form [name='title'] ").focus();
});


$(".pref-button").click(function() { 
	view_menu() ; 
});



$(".save-button").click(function() {
    console.log(view);
    itemList.edit_from_form("#edit-item-form");
   
    if(view == "issue_list") view_issue_list();
    else if(view == "menu") view_menu();
    else view_single_issue(current.id);
   
});

$("#show_postponed").change(function() { 
    view_issue_list();
}); 

// GOTO EDIT  
$(document).on('click', ".subitem-left", function() {
	id = $(this).parent().find(".item_id").text();
	edit_item = itemList.get_item(id);

	$(".menu-title").html("Edit: "+edit_item.title);
    
    $('#edit-item-form input:radio[value="'+edit_item.prio+'"]').prop('checked', true); // prio (css trick med bilder)
	
    for (var key in edit_item) {
        $('#edit-item-form .autovalue[name="'+key+'"]').val(edit_item[key]);
    }
    
    open_page ("#edit", [".more-button"])
});



// GOTO SINGLE ISSUE
$(document).on('click', ".issue .subitem-center", function() {
	id = $(this).parent().find(".item_id").text();
	issue = itemList.get_item(id);

	$("#single_issue .menu-title").text(issue.title)
	edit_item = itemList.get_item(id);

	view_single_issue(id);
});


/* FUNCTIONS *******************************************************************/

function view_issue_list(){
  	view = "issue_list";
    
    var query = $(".search").val().toLowerCase();
    var category = $("#category_filter").val();
    var show_postponed = $('#show_postponed').prop("checked");
    //var sortby = $("#sortby").val();
	
    var open_items=itemList.get_all();
    open_items=open_items.query("type", "==", 7);
	open_items=open_items.query("finish_date", "==", "");
    open_items=open_items.filter(function (item){
		 	return item['title'].toLowerCase().indexOf(query) != -1 || item['notes'].toLowerCase().indexOf(query) != -1 
		});
    if(category!="*") open_items=open_items.query("category", "==", category);
    if(!show_postponed) open_items=open_items.query("postpone", "==", "");
   console.log(category);
    /*var finished_items=itemList.get_all();
    finished_items=finished_items.query("status", "==", "finished"); 
    //finished_items=finished_items.query("prio", "==", undefined);
    finished_items=finished_items.query("title", "contains", query);
    */
  
    //sortera fltered items
    open_items.sort(
        firstBy("prio")
        .thenBy("postpone") 
        .thenBy("update_date", -1)
	);

   	$("#filtered").empty();    
  	open_items.forEach(function(item) {
		item_meta = item_with_meta(item.id);
		var template = $('#issue_template').html();
		var html = Mustache.to_html(template, item_meta);
		$("#filtered").append(html);
	});

  	//om inga items hittas
	if (open_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
    
    $(".page").hide();
	$("#issues").show();
}




function view_single_issue (id) {
	view = "single_issue";
	current = itemList.get_item(id);
	
    //$("#quick_search").val(itemList.get_item(id).title);
	// var query = $("#search-item").val().toLowerCase();
        
    //filtrera array med items
    open_items = itemList.get_all().query("finish_date","==","").query("parent_id", "==", id);
    finished_items = itemList.get_all().query("finish_date","!=","").query("parent_id", "==", id);
    
    // sortera array med items
	open_items.sort(firstBy("order").thenBy("update_date", -1) );
	finished_items.sort(firstBy("finish_date",-1));

	// rensa listor
    $("#open").empty();
    $("#finished").empty();
		
    //mata ut open_items med mustache
    open_items.forEach(function(item) {
        var template = $('#open_task_template').html();
        var html = Mustache.to_html(template, item);
    	$("#open").append(html);
    }); 
    
    finished_items.forEach(function(item) {
        var template = $('#finished_task_template').html();
        var html = Mustache.to_html(template, item);
    	$("#finished").append(html);
    });
       
    // om listan är tom
    if (open_items.length==0 && finished_items.length == 0) $("#open").append("<div class='empty'>No items</div>");
    
    // byta sida 
	$(".page").hide();
	$("#single_issue").show();
}



function view_menu() {
	view = "menu";
    var categories=itemList.get_all().query("type", "==", 13);
	categories.sort(firstBy("order").thenBy("update_date", -1) );
    
    $("#categories").empty();
    categories.forEach(function(item) {
		item_meta = item_with_meta(item.id);
		var template = $('#open_task_template').html();
		var html = Mustache.to_html(template, item_meta);
		$("#categories").append(html);
	});
   
    $(".page").hide();
	$("#category_list").show();
}



function open_page (page_id, show_extra) {
	
	$(".extra").hide();
	
	if (show_extra) show_extra.forEach(function(element) {
		$(element).show();
	});
	
	$(".page").hide();
	$(page_id).show();
	
	window.scrollTo(0, 0);
}



function reorder(items, from_pos, to_pos){
    //var tasks  = itemList.get_all().query("finish_date","==","").query("parent_id", "==", item_id);
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
 //mustache output  
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
	
	return item;
}
