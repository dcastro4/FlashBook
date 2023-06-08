
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

  var myIndex = 0;
  carousel();
  
  function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";  
    }
    myIndex++;
    if (myIndex > x.length) {myIndex = 1}    
    x[myIndex-1].style.display = "block";  
    setTimeout(carousel, 5000); // Change image every 2 seconds
  }

  function removeFromCart(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = () => {
      var elem = document.getElementById('product_'+id);
      elem.parentElement.removeChild(elem);

      document.getElementById('buy_button').value = "Buy $"+xhttp.responseText;

      var others = document.getElementsByClassName('w3-bar-item w3-padding-small w3-container');
      if (others.length == 1) {
        var buy_section = others[0];
        var container = buy_section.parentElement;
        container.removeChild(buy_section);

        container.innerHTML += '<div class="w3-bar-item w3-padding-small w3-container"><h1 class="w3-text-orange">No products in shopping cart</h1></div>';
      }
    };
    xhttp.open('GET', '/books/removeFromCart/'+id);
    xhttp.send();
  }

  function addToCart(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
      var others = document.getElementsByClassName('w3-bar-item w3-padding-small w3-container');
      // alert(others.length);
      if (others.length > 1) {
        if (xhttp.responseText) {
          const book = JSON.parse(xhttp.responseText);
          var buy_section = document.getElementById('buy_section');
          var container = buy_section.parentElement;
          container.removeChild(buy_section);

          var txt = '<div class="w3-bar-item w3-padding-small w3-container" id="product_'+book.id+'">';
          txt += '<div class="w3-row-padding w3-margin-bottom w3-margin-top w3-border-bottom">';
          txt += '<div class="w3-third w3-margin-bottom">';
          txt += '<img src="/books/image/'+book.ISBN+'" alt="Book Image" style="width: 100%;">';
          txt += '</div>';
          txt += '<div class="w3-third">';
          txt += '<p style="max-height: 40px; overflow: hidden;" title="'+book.title+'"><b>'+book.title+'</b></p>';
          txt += '<button onclick="removeFromCart('+book.id+')" class="w3-button w3-red w3-padding-small w3-block">Remove</button>';
          txt += '</div>';
          txt += '<div class="w3-third w3-margin-top">$'+book.cost+'</div>';
          txt += '</div>';
          txt += '</div>';

          container.innerHTML += txt;

          txt = '<div class="w3-bar-item w3-padding-small w3-container" id="buy_section">';
          txt += '<form action="/user/cart/buy" method="POST" class="w3-container">';
          txt += '<input type="submit" class="w3-button w3-block fb-palette-primary" value="Buy $'+book.total+'" id="buy_button">';
          txt += '<input type="radio" class="w3-radio w3-radio-small" name="shopping_method" value="home" checked>';
          txt += '<label for="home">Home</label>';
          txt +='<input type="radio" class="w3-radio w3-radio-small" name="shopping_method" value="store">';
          txt += '<label for="store">Store</label>';
          txt += '<p>Select the shopping method for the products.</p>';
          txt += '</form>';
          txt += '</div>';

          container.innerHTML += txt;

        }
      } else {
        if (xhttp.responseText) {
          const book = JSON.parse(xhttp.responseText);
          var container = others[0].parentElement;
          container.removeChild(others[0]);

          var txt = '<div class="w3-bar-item w3-padding-small w3-container" id="product_'+book.id+'">';
          txt += '<div class="w3-row-padding w3-margin-bottom w3-margin-top w3-border-bottom">';
          txt += '<div class="w3-third w3-margin-bottom">';
          txt += '<img src="/books/image/'+book.ISBN+'" alt="Book Image" style="width: 100%;">';
          txt += '</div>';
          txt += '<div class="w3-third">';
          txt += '<p style="max-height: 40px; overflow: hidden;" title="'+book.title+'"><b>'+book.title+'</b></p>';
          txt += '<button onclick="removeFromCart('+book.id+')" class="w3-button w3-red w3-padding-small w3-block">Remove</button>';
          txt += '</div>';
          txt += '<div class="w3-third w3-margin-top">$'+book.cost+'</div>';
          txt += '</div>';
          txt += '</div>';

          container.innerHTML += txt;

          txt = '<div class="w3-bar-item w3-padding-small w3-container" id="buy_section">';
          txt += '<form action="/user/cart/buy" method="POST" class="w3-container">';
          txt += '<input type="submit" class="w3-button w3-block fb-palette-primary" value="Buy $'+book.total+'" id="buy_button">';
          txt += '<input type="radio" class="w3-radio w3-radio-small" name="shopping_method" value="home" checked>';
          txt += '<label for="home">Home</label>';
          txt +='<input type="radio" class="w3-radio w3-radio-small" name="shopping_method" value="store">';
          txt += '<label for="store">Store</label>';
          txt += '<p>Select the shopping method for the products.</p>';
          txt += '</form>';
          txt += '</div>';

          container.innerHTML += txt;
        }
      }
      
      w3_open();
    }
    xhttp.open('GET', '/books/addToCart/'+id);
    xhttp.send();
  }