var idx = 1;

activeSlide(idx);

function activeSlide(x) {
    var i;
    var slides = document.getElementsByClassName("slides");
    var dots = document.getElementsByClassName("dots");
    if (x > slides.length) {
        idx = 1
    }
    if (x < 1) {
        idx = slides.length
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" dotActv", "");
    }
    slides[idx-1].style.display = "block";
    dots[idx-1].className += " dotActv";
}

function changeSlide(x) {
    activeSlide(idx += x);
}

function curSlide(x) {
    activeSlide(idx = x);
}
