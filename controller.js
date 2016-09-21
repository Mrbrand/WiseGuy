/* INIT *******************************************************************/
var itemList = new Carbon("wiseguy2_items");
var view="issue_list";
var current={};

view_issue_list();


/* BUTTONS *******************************************************************/

$(".add-button").click(function() {
    itemList.add_from_form("#new-item-form");
    if(view == "issue_list") view_issue_list();
    else view_single_issue(current.id);
});


$(".back-button").click(function() { 
	view_issue_list();  
});


$(".cancel-button").click(function() { 
    view_issue_list();
}); 
 
 
$(".delete-button").click(function() {
	id = $("#edit-item-form .item-id").val();
    if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
    itemList.remove_item(id);
    view_issue_list();
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
        item = itemList.get_item($(".item-id").val());
        itemList.edit_from_form("#edit-item-form");
        
        /*if(item.repeat){
            var item_copy = itemList.copy_item(item.id);
            item_copy["postpone"] = moment().add( item.repeat, 'days').format('YYYY-MM-DD');      
        }
        */
        
	    itemList.set_item_field(item.id, "finish_date", moment().format('YYYY-MM-DD HH:mm:ss'))
	            
        view_single_issue(item.parent_id);
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
	$('#new-item-form input[name="type"]').val("7"); 
	$('#new-item-form textarea[name="title"]').val(""); 
    $('#new-item-form input[name="notes"]').val(""); 
    $('#new-item-form textarea[name="genre"]').val(""); 
    $('#new-item-form textarea[name="grade"]').val(""); 
	$('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	
	$(".page").hide();
	$("#new").show();
});

$(".new-task-button").click(function() { 
	
	$('#new-item-form input[name="type"]').val("6"); 
    $('#new-item-form textarea[name="title"]').val(""); 
    $('#new-item-form input[name="notes"]').val(""); 
    $('#new-item-form textarea[name="genre"]').val(""); 
    $('#new-item-form textarea[name="grade"]').val(""); 
	$('#new-item-form input[name="parent_id"]').val(current.id); 
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	
	$(".page").hide();
	$("#new").show();
});


$(".pref-button").click(function() { 
        $(".page").hide();
		$("#menu").show();
});


$(".save-button").click(function() {
    console.log("Hej");
    itemList.edit_from_form("#edit-item-form");
    view_issue_list();   
});




// GOTO EDIT .subitem-left 
$(document).on('click', ".subitem-left", function() {
	
	id = $(this).parent().find(".item_id").text();
	edit_item = itemList.get_item(id);

	$(".menu-title").html("Edit: "+edit_item.title);
    
    $('#edit-item-form input:radio[value="'+edit_item.prio+'"]').prop('checked', true); // prio (css trick med bilder)
	
    for (var key in edit_item) {
        $('#edit-item-form input:text[name="'+key+'"]').val(edit_item[key]);
        $('#edit-item-form textarea[name="'+key+'"]').val(edit_item[key]);
    }
    
    $(".page").hide();
    $("#edit").show();
	
	$('.more').hide();
	$('.more-button').show();
    
    window.scrollTo(0, 0);
});

// GOTO SINGLE ISSUE
$(document).on('click', ".subitem-center", function() {
	
	id = $(this).parent().find(".item_id").text();
	edit_item = itemList.get_item(id);

	view_single_issue(id);
});


/* FUNCTIONS *******************************************************************/

function view_issue_list(){
  	
  	view = "issue_list";
    var query = $(".search").val().toLowerCase();
    //var sortby = $("#sortby").val();
    open_items=itemList.get_all();
    open_items=open_items.query("type", "==", 7);
    //open_items=open_items.query("title", "contains", query);
    
    open_items=open_items.filter(function (item){
		 	return item['title'].toLowerCase().indexOf(query) != -1 || item['notes'].toLowerCase().indexOf(query) != -1 
		});
    
    
    finished_items=itemList.get_all();
    finished_items=finished_items.query("status", "==", "finished"); 
    //finished_items=finished_items.query("prio", "==", undefined);
    finished_items=finished_items.query("title", "contains", query);
    
    //sortera fltered items
    open_items.sort(
        firstBy("prio")
        .thenBy("update_date", -1) 
	);

  	//mustache output
   	$("#filtered").empty();    
  	open_items.forEach(function(item) {
		var template = $('#open_items_template').html();
		var html = Mustache.to_html(template, item);
		$("#filtered").append(html);
	});

  	//om inga items hittas
	if (open_items.length == 0 && finished_items.length == 0) $("#open_items").append("<div class='empty'>No items here</div>");
    
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
	finished_items.sort(firstBy("finish_date"));
	open_items.sort(firstBy("order") /*.thenBy("title")*/ );
	console.log(finished_items);

	// rensa listor
    $("#open").empty();
    $("#finished").empty();
		
    //mata ut open_items med mustache
    open_items.forEach(function(item) {
        var template = $('#open_items_template').html();
        var html = Mustache.to_html(template, item);
    	$("#open").append(html);
    }); 
    
    finished_items.forEach(function(item) {
        var template = $('#finished_items_template').html();
        var html = Mustache.to_html(template, item);
    	$("#finished").append(html);
    });
       
    // om listan är tom
    if (open_items.length==0 && finished_items.length == 0) $("#open").append("<div class='empty'>No items</div>");
    
    // byta sida 
	$(".page").hide();
	$("#single_issue").show();
}



