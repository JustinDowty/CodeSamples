function isVisible(el){
	var height = el.offsetHeight;
	var elementTop = el.offsetTop;
	var elementMiddle = el.offsetTop + height/2;

	// 1/3 down from top
	var topBound = elementTop;
	var bottomBound = elementTop + height;
	
	var doc = document.documentElement;
	var windowTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	var windowBottom = windowTop + window.innerHeight;
	
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
	var popups = document.getElementsByClassName('popup-module');
	for(var i = 0; i < popups.length; i++){
		if(isVisible(popups[i])){
			popups[i].classList.add("popup");
			popups[i].classList.remove("popup-module");
		}
	}
	var slideups = document.getElementsByClassName('slideup-module');
	for(var i = 0; i < slideups.length; i++){
		if(isVisible(slideups[i])){
			slideups[i].classList.add("slideup");
			slideups[i].classList.remove("slideup-module");
		}
	}
	var sliderights = document.getElementsByClassName('slideright-module');
	for(var i = 0; i < sliderights.length; i++){
		if(isVisible(sliderights[i])){
			sliderights[i].classList.add("slideright");
			sliderights[i].classList.remove("slideright-module");
		}
	}
	var slidelefts = document.getElementsByClassName('slideleft-module');
	for(var i = 0; i < slidelefts.length; i++){
		if(isVisible(slidelefts[i])){
			slidelefts[i].classList.add("slideleft");
			slidelefts[i].classList.remove("slideleft-module");
		}
	}
}

window.onscroll = () => {
	checkAnimations();
};
checkAnimations();
