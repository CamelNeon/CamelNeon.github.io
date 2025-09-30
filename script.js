// Hide header on scroll down, show on scroll up
let lastScrollTop = 0;
window.addEventListener("scroll", function(){
let st = window.pageYOffset || document.documentElement.scrollTop;
const header = document.getElementById("header");
if (st > lastScrollTop){
header.style.top = "-80px"; // hide
} else {
header.style.top = "0"; // show
}
lastScrollTop = st <= 0 ? 0 : st;
}, false);