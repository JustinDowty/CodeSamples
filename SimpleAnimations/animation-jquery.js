$(document).ready(function(){  
  $(window).scroll(function() {
		checkAnimations();
	});
	checkAnimations();
});

function isVisible(el){
	var height = el.outerHeight();
	
	// 1/3 down from top
	var topBound = el.offset().top;
	var bottomBound = el.offset().top + height;
	var elementMiddle = el.offset().top + height/2;
	
	var windowBottom = $(window).scrollTop() + $(window).height();
	var windowTop = $(window).scrollTop();
	
	// Bottom of viewport is within bottom 2/3 of element
	if (windowBottom < bottomBound && windowBottom > topBound + (height / 3)){ 
		return true;
	// Top is within to 2/3 of element
	} else if (windowTop < bottomBound - (height / 3) && windowTop > topBound) { 
		return true;
	// Center of element is between top and bottom of viewport 
	} else if (windowTop < elementMiddle && windowBottom > elementMiddle) { 
		return true;
	} else {
		return false;
	}
}

function checkAnimations(){
	$('.slideup-module').each(function(){			
		if (isVisible($(this)){
			$(this).addClass("slideup");
			$(this).removeClass("slideup-module");
		} 
	});
	/* Slide Right Animation */
	$('.slideright-module').each(function(){
		if (isVisible($(this))){
			$(this).addClass("slideright");
			$(this).removeClass("slideright-module");
		} 
	});
	/* Slide Left Animation */
	$('.slideleft-module').each(function(){
		if (isVisible($(this)){
			$(this).addClass("slideleft");
			$(this).removeClass("slideleft-module");
		} 
	});
	/* Pop Up Animation */
	$('.popup-module').each(function(){
		if (isVisible($(this)){
			$(this).addClass("popup");
			$(this).removeClass("popup-module");
		} 
	});
}