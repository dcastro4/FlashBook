
function w3_open() {
    // document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("mySidebar").style.width = "25%";
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
}

function w3_close() {
    // document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
}

function remove(id) {
    alert('Removed! ' + id);
}

// JavaScript code to toggle the book options
function toggleExpand(button) {
    var content = button.nextElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
      button.className += " w3-grey";
    } else {
      content.style.display = "none";
      button.className = button.className.replace(" w3-grey", "");
    }
  }