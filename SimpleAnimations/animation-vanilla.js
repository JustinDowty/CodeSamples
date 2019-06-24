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

// Using the CSS pattern visible in the CSS file we can loop the different animation
// names to check all elements within the array classNames
function checkAnimations(){
	var classNames = ["popup", "slideup", "slideright", "slideleft"];
	for(var nameIndex = 0; nameIndex < classNames.length; nameIndex++) {
		var className = classNames[nameIndex];
		var moduleName = className + "-module";
		var elements = document.getElementsByClassName(moduleName);
		for(var i = 0; i < elements.length; i++) {
			if(isVisible(elements[i])){
				elements[i].classList.add(className);
				elements[i].classList.remove(moduleName);
			}
		}
	}
}

window.onscroll = () => {
	checkAnimations();
};
checkAnimations();
