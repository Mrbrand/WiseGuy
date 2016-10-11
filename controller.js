/* KNAPPAR   *******************************************************************/

$(".add-button").click(function() {
    itemList.add_from_form(current_page+" form");
     open_page(previous_page);
});


$(".back-button").click(function() { 
	if(view == "menu") set_categories();
     open_page("#issues");
});


$(".cancel-button").click(function() { 
    open_page(previous_page);
}); 

$("#category_filter").change(function() { 
    if($(this).val()=="edit") open_page("#category_list");
    else open_page("#issues");
}); 
 
 
$(".delete-button").click(function() {
	id = $(current_page+" form .item-id").val();
    if (confirm('Delete "'+itemList.get_item(id).title+'"?')==true) {
		itemList.remove_item(id);
		open_page(previous_page);
    }
});


$("#export-button").click(function() { 
    var items = itemList.get_all().query("finish_date", "==", "");
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
	            
        open_page(previous_page);
        //$("body").scrollTop(scroll_position);
        
 });
 
 
$("#import-button").click(function() { 
    if (confirm('All current_item data will be deleted?')==true) {
        window.localStorage.setItem(itemList.storageKey, $('#import').val());
       	open_page("#issues");
    }
});
 

$(".more-button").click(function() {	
	$('.more').show();
	$('.more-button').hide();
});
 
 
 
$(".new-issue-button").click(function() {
	$("#new-item-form").children().show();
	
	$("#new .menu-title").html("New Project");
	$('#new-item-form .autovalue').val(""); 
    $('#new-item-form input[name="type"]').val("7"); 
	$('#new-item-form input:radio[value=""]').prop('checked', true); 
	$('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
	$('#new-item-form select[name="category"]').val($("#category_filter").val()); 
	if($("#category_filter").val() =="*") $('#new-item-form select[name="category"]').val("-"); 
	
	$("#new-item-form .context").hide();
	open_page ("#new");
});


$("#single_issue .new-task-button").click(function() { 
	$("#new-item-form").children().show();
	$("#new .menu-title").html("New Task for: "+current_item.title);
	$('#new-item-form .autovalue').val(""); 
	$('#new-item-form input[name="type"]').val("6"); 
	$('#new-item-form input[name="parent_id"]').val(current_item.id); 
    $('#new-item-form input:radio').prop('checked', false); 
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
    $('#new-item-form input:radio[value=""]').prop('checked', true); // prio (css trick med bilder)
	$('#new-item-form select[name="category"]').val(current_item.category); 
	
	$("#new-item-form .category_select").hide();
	open_page ("#new");
	
});

$("#task_list .new-task-button").click(function() { 
	$("#new-item-form").children().show();
	$("#new .menu-title").html("New Task: no issue");
	$('#new-item-form .autovalue').val(""); 
	$('#new-item-form input[name="type"]').val("6"); 
	$('#new-item-form input[name="parent_id"]').val("-"); 
    $('#edit-item-form input:radio').prop('checked', false); 
    $('#new-item-form input:radio[value="5"]').prop('checked', true); // prio (css trick med bilder)
    $('#new-item-form input:radio[value=""]').prop('checked', true); // prio (css trick med bilder)
	$('#new-item-form select[name="category"]').val("-"); 
	
	open_page ("#new");
	
});



$(".new-category-button").click(function() { 
	$('#new-category-form .autovalue').val(""); 
	$('#new-category-form input[name="type"]').val("13"); 
	$('#new-category-form input[name="parent_id"]').val(""); 
    	
	open_page ("#new-category");
	
});


$(".pref-button").click(function() { 
	open_page("#menu");
});

$("#task_list input[name='icon']").click(function() { 
	open_page("#task_list");
});


$(".save-button").click(function() {
    console.log(view);
    itemList.edit_from_form(current_page+" form");
     open_page(previous_page);
   
});

$("#show_postponed").change(function() { 
    open_page("#issues");
}); 


// swipe back
$("#single_issue").on('swiperight',  function(){ 
	open_page("#issues");
});


$(".task-list-button").click(function() { 
	open_page("#task_list");
});


$(".issue-list-button").click(function() { 
	open_page("#issues");
});



// GOTO EDIT  
$(document).on('click', ".task .subitem-left, .issue .subitem-left", function() {
	id = $(this).parent().find(".item_id").text();
	item = itemList.get_item(id);

	$("#edit .menu-title").html("Edit: "+item.title);
    
    $('#edit-item-form input:radio').prop('checked', false); 
    $('#edit-item-form input:radio[value="'+item.prio+'"]').prop('checked', true); // prio (css trick med bilder)
    $('#edit-item-form input:radio[value="'+item.icon+'"]').prop('checked', true); // prio (css trick med bilder)
	
	
    for (var key in item) {
        $('#edit-item-form .autovalue[name="'+key+'"]').val(item[key]);
    }
      
    open_page ("#edit");
});


// GOTO CATEGORY EDIT  
$(document).on('click', ".category .subitem-left", function() {
	id = $(this).parent().find(".item_id").text();
	item = itemList.get_item(id);

	$("#edit-category .menu-title").html("Edit: "+item.title);
	
    for (var key in item) {
        $('#edit-category-form .autovalue[name="'+key+'"]').val(item[key]);
    }
      
    open_page ("#edit-category");
});

// GOTO SINGLE ISSUE
$(document).on('click', ".issue .subitem-center", function() {
	id = $(this).parent().find(".item_id").text();
	current_item = itemList.get_item(id);

	$("#single_issue .menu-title").text(current_item.title);
	
	open_page("#single_issue");
	//view_single_issue(id);
});


// GOTO SINGLE ISSUE
$(document).on('click', "#task_list .subitem-center", function() {
	id = $(this).parent().find(".item_id").text();
	current_item = itemList.get_item(itemList.get_item(id).parent_id);

	$("#single_issue .menu-title").text(current_item.title);
	
	open_page("#single_issue");
	//view_single_issue(id);
});


