 // alertbar later
    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > 280) {
            $('.alertbar').fadeIn();
        } else {
            $('.alertbar').fadeOut();
        }
    });


// Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();

    $(window).scroll(function(event){
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(this).scrollTop();
        
        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight){
            // Scroll Down            
            $('nav').removeClass('nav-down').addClass('nav-up'); 
            $('.nav-up').css('top', - $('nav').outerHeight() + 'px');
           
        } else {
            // Scroll Up
            if(st + $(window).height() < $(document).height()) {               
                $('nav').removeClass('nav-up').addClass('nav-down');
                $('.nav-up, .nav-down').css('top', '0px');             
            }
        }

        lastScrollTop = st;
    }
    
    
    $('.site-content').css('margin-top', $('header').outerHeight() + 'px');


function loadSearch(){
    // Create a new Index
    idx = lunr(function(){
        this.field('id')
        this.field('title', { boost: 10 })
        this.field('summary')
    })
 
    // Send a request to get the content json file
    $.getJSON('/content.json', function(data){
 
        // Put the data into the window global so it can be used later
        window.searchData = data
 
        // Loop through each entry and add it to the index
        $.each(data, function(index, entry){
            idx.add($.extend({"id": index}, entry))
        })
    })
 
    // When search is pressed on the menu toggle the search box
    $('#search').on('click', function(){
        $('.searchForm').toggleClass('show')
    })
 
    // When the search form is submitted
    $('#searchForm').on('submit', function(e){
        // Stop the default action
        e.preventDefault()
 
        // Find the results from lunr
        results = idx.search($('#searchField').val())
 
        // Empty #content and put a list in for the results
        $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
        $('#content').append('<ul id="searchResults"></ul>')
 
        // Loop through results
        $.each(results, function(index, result){
            // Get the entry from the window global
            entry = window.searchData[result.ref]
 
            // Append the entry to the list.
            $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
        })
    })
}



// Smooth on external page
$(function() {
  setTimeout(function() {
    if (location.hash) {
      /* we need to scroll to the top of the window first, because the browser will always jump to the anchor first before JavaScript is ready, thanks Stack Overflow: http://stackoverflow.com/a/3659116 */
      window.scrollTo(0, 0);
      target = location.hash.split('#');
      smoothScrollTo($('#'+target[1]));
    }
  }, 1);

  // taken from: https://css-tricks.com/snippets/jquery/smooth-scrolling/
  $('a[href*=\\#]:not([href=\\#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      smoothScrollTo($(this.hash));
      return false;
    }
  });

  function smoothScrollTo(target) {
    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

    if (target.length) {
      $('html,body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  }
});

//lightbox
function is_youtubelink(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return (url.match(p)) ? RegExp.$1 : false;
}
function is_imagelink(url) {
  var p = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;
  return (url.match(p)) ? true : false;
}
function is_vimeolink(url,el) {
  var id = false;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
          if (xmlhttp.status == 200) {
              var response = JSON.parse(xmlhttp.responseText);
              id = response.video_id;
              console.log(id);
              el.classList.add('lightbox-vimeo');
              el.setAttribute('data-id',id);

              el.addEventListener("click", function(event) {
                  event.preventDefault();
                  document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="videoWrapperContainer"><div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+el.getAttribute('data-id')+'/?autoplay=1&byline=0&title=0&portrait=0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div></div>';
                  document.getElementById('lightbox').style.display = 'block';

                  setGallery(this);
              });
          }
          else if (xmlhttp.status == 400) {
              alert('There was an error 400');
          }
          else {
              alert('something else other than 200 was returned');
          }
      }
  };
  xmlhttp.open("GET", 'https://vimeo.com/api/oembed.json?url='+url, true);
  xmlhttp.send();
}
function setGallery(el) {
  var elements = document.body.querySelectorAll(".gallery");
  elements.forEach(element => {
      element.classList.remove('gallery');
});
if(el.closest('ul, p')) {
  var link_elements = el.closest('ul, p').querySelectorAll("a[class*='lightbox-']");
  link_elements.forEach(link_element => {
    link_element.classList.remove('current');
  });
  link_elements.forEach(link_element => {
    if(el.getAttribute('href') == link_element.getAttribute('href')) {
      link_element.classList.add('current');
    }
  });
  if(link_elements.length>1) {
    document.getElementById('lightbox').classList.add('gallery');
    link_elements.forEach(link_element => {
      link_element.classList.add('gallery');
    });
  }
  var currentkey;
  var gallery_elements = document.querySelectorAll('a.gallery');
  Object.keys(gallery_elements).forEach(function (k) {
    if(gallery_elements[k].classList.contains('current')) currentkey = k;
  });
  if(currentkey==(gallery_elements.length-1)) var nextkey = 0;
  else var nextkey = parseInt(currentkey)+1;
  if(currentkey==0) var prevkey = parseInt(gallery_elements.length-1);
  else var prevkey = parseInt(currentkey)-1;
  document.getElementById('next').addEventListener("click", function() {
    gallery_elements[nextkey].click();
  });
  document.getElementById('prev').addEventListener("click", function() {
    gallery_elements[prevkey].click();
  });
}
}

document.addEventListener("DOMContentLoaded", function() {

  //create lightbox div in the footer
  var newdiv = document.createElement("div");
  newdiv.setAttribute('id',"lightbox");
  document.body.appendChild(newdiv);

  //add classes to links to be able to initiate lightboxes
  var elements = document.querySelectorAll('a');
  elements.forEach(element => {
      var url = element.getAttribute('href');
      if(url) {
          if(url.indexOf('vimeo') !== -1 && !element.classList.contains('no-lightbox')) {
              is_vimeolink(url,element);
          }
          if(is_youtubelink(url) && !element.classList.contains('no-lightbox')) {
              element.classList.add('lightbox-youtube');
              element.setAttribute('data-id',is_youtubelink(url));
          }
          if(is_imagelink(url) && !element.classList.contains('no-lightbox')) {
              element.classList.add('lightbox-image');
              var href = element.getAttribute('href');
              var filename = href.split('/').pop();
              var split = filename.split(".");
              var name = split[0];
              element.setAttribute('title',name);
          }
      }
  });

  //remove the clicked lightbox
  document.getElementById('lightbox').addEventListener("click", function(event) {
      if(event.target.id != 'next' && event.target.id != 'prev'){
          this.innerHTML = '';
          document.getElementById('lightbox').style.display = 'none';
      }
  });
  
  //add the youtube lightbox on click
  var elements = document.querySelectorAll('a.lightbox-youtube');
  elements.forEach(element => {
      element.addEventListener("click", function(event) {
          event.preventDefault();
          document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="videoWrapperContainer"><div class="videoWrapper"><iframe src="https://www.youtube.com/embed/'+this.getAttribute('data-id')+'?autoplay=1&showinfo=0&rel=0"></iframe></div>';
          document.getElementById('lightbox').style.display = 'block';

          setGallery(this);
      });
  });

  //add the image lightbox on click
  var elements = document.querySelectorAll('a.lightbox-image');
  elements.forEach(element => {
      element.addEventListener("click", function(event) {
          event.preventDefault();
          document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="img" style="background: url(\''+this.getAttribute('href')+'\') center center / contain no-repeat;" title="'+this.getAttribute('title')+'" ><img src="'+this.getAttribute('href')+'" alt="'+this.getAttribute('title')+'" /></div><span>'+this.getAttribute('title')+'</span>';
          document.getElementById('lightbox').style.display = 'block';

          setGallery(this);
      });
  });

});


//carousel
let carousel = (el, parameter) => {
  el = el !==undefined ? el : "";
  parameter = parameter !== undefined ? parameter : {};
  let method = {
      transition: parameter.transition !== undefined ? parameter.transition : null,
      responsive: parameter.grid !== undefined ? parameter.grid : null,
      pagination: parameter.pagination !== undefined ? parameter.pagination : false,
      autoplay: parameter.autoplay !== undefined ? parameter.autoplay : null,
      playTimer: parameter.autoplay !== undefined && parameter.autoplay.playTimer !== undefined
          ? parameter.autoplay.playTimer
          : 2000,
  },trigger = document.querySelectorAll(".carousel-slider"+el);
  Array.prototype.forEach.call(trigger, function (el) {
      
  let content = el.querySelector (".carousel-content"),
      count = content.childElementCount,
      responsive = method.responsive || JSON.parse (content.getAttribute ("data-grid")),
      widths,
      d_widths = el.offsetWidth,
      c_widths = d_widths * count,
      autoplay = method.autoplay || el.getAttribute ("data-autoplay"),
      autoplay_timer = method.playTimer || el.getAttribute ("data-timer"),
      is_pagination = method.pagination || content.getAttribute ("data-pagination"),
      config = {
          "lg": 1024,
          "md": 768,
          "sm": 667
      },
      step,
      pagination_content = el.querySelector (".carousel-pagination");

  content.firstElementChild.classList.add ("active");
  content.style.transitionDuration = method.transition || "500ms";
  this.autoplayEffect = null;

  let index_settings = () => {//tabindexleri slide itemlerine aktarıyoruz
      let slides = content.querySelectorAll (".slide-item");
      for (i in slides) {
          slides[ i ].tabIndex = i;
      }
  }, size = (widths) => {
      let item_resize = el.querySelectorAll (".slide-item");
      Array.prototype.forEach.call (item_resize, (item_size) => {
          item_size.style.width = widths + "px";
      });
  }, responsive_grid = () => {
      if (responsive) {
          if (window.innerWidth >= config.lg) {
              if (responsive.xl !== undefined) {
                  gridCount = responsive.xl;
                  widths = Number (d_widths) / Number (gridCount);
              }
          } else if (window.innerWidth >= config.md) {
              if (responsive.lg !== undefined) {
                  gridCount = responsive.lg;
                  widths = Number (d_widths) / Number (gridCount);
                  console.log (d_widths, gridCount, responsive)
              }
          } else if (window.innerWidth >= config.sm) {
              if (responsive.md !== undefined) {
                  gridCount = responsive.md;
                  widths = Number (d_widths) / Number (gridCount);
              }
          } else if (window.innerWidth < config.sm) {
              if (responsive.sm !== undefined) {
                  gridCount = responsive.sm;
                  widths = Number (d_widths) / Number (gridCount);
              }
          }
      } else {
          widths = d_widths;
      }
      size (widths);
      c_widths = widths * content.lastElementChild.tabIndex;
      content.style.minWidth = c_widths;
      return widths;
  };

  let autoplay_ = () => {
      if (autoplay) {
          let i = 0;
          let last_i = content.lastElementChild.tabIndex;
          this.autoplayEffect = setInterval (() => {
              if (last_i > i) {
                  content.style.transform = "translate3d(-" + d_widths * i + "px,0px,0px)";
                  content.children.item (i + 1).classList.add ("active");
                  content.children.item (i).classList.remove ("active");
              } else {
                  content.lastElementChild.classList.remove ("active");
                  content.firstElementChild.classList.add ("active");
                  content.style.transform = "translate3d(" + 0 + "px,0px,0px)";

                  i = 0;
              }
              i++;
          }, Number (autoplay_timer));
      }
  }, pagination = () => {
      if (is_pagination) {
          let pagination_item = el.querySelector (".carousel-pagination");
          for (let i = 0; i < count; i++) {
              let p_item = document.createElement ("a");
              p_item.href = "#!";
              p_item.classList.add ("item");
              p_item.tabIndex = i;
              pagination_item.appendChild (p_item);
          }
      }
  }, slider_next = (el) => {
      let content = el.querySelector (".carousel-content");
      let last_i = content.lastElementChild.tabIndex;
      let i = content.querySelector (".slide-item.active").tabIndex + 1;
      step = d_widths / responsive_grid ();
      widths = d_widths / step;
      if (step > 1) {
          last_i = last_i - step + 1;
      }
      if (i <= last_i) {
          content.children.item (i).classList.add ("active");
          content.children.item (i - 1).classList.remove ("active");
          let ml_ = widths * i;
          content.style.transform = "translate3d(-" + ml_ + "px,0px,0px)";
          i++;
      } else {
          i = 1;
          content.lastElementChild.classList.remove ("active");
          content.firstElementChild.classList.add ("active");
          content.style.transform = "translate3d(" + 0 + "px,0px,0px)";
      }
  }, slider_prev = () => {
      let content = el.querySelector (".carousel-content");
      let last_i = content.lastElementChild.tabIndex;
      let i = content.querySelector (".slide-item.active").tabIndex;
      step = d_widths / responsive_grid ();
      widths = d_widths / step;
      if (i >= 1) {
          content.children.item (i - 1).classList.add ("active");
          content.children.item (i).classList.remove ("active");
          i--;
          let ml_ = widths * i;
          content.style.transform = "translate3d(-" + ml_ + "px,0px,0px)";
      } else {
          i = last_i;
          content.lastElementChild.classList.add ("active");
          content.firstElementChild.classList.remove ("active");
          if (step > 1) {
              last_i = last_i - step + 1;
          }
          let ml_ = widths * ( last_i - 1 );
          content.style.transform = "translate3d(-" + ml_ + "px,0px,0px)";
          i--;
      }

  }, slider_direction = (el) => {
      let prev = el.querySelector (".carousel-prev-btn");
      let next = el.querySelector (".carousel-next-btn");
      if (el.contains (prev) && el.contains (next)) {
          prev.addEventListener ("click", () => {
              window.clearInterval (this.autoplayEffect);
              slider_prev (el);
          }, false);

          next.addEventListener ("click", () => {
              window.clearInterval (this.autoplayEffect);
              slider_next (el);
          }, false);
      }
      if (el.contains (pagination_content)) {
          pagination ();
          let paginate = pagination_content.querySelectorAll (".item");
          Array.prototype.forEach.call (paginate, (el) => {
              el.addEventListener ("click", () => {
                  window.clearInterval (this.autoplayEffect);
                  let last_i = el.parentNode.lastChild.tabIndex,
                      i = el.tabIndex;
                  let ml_ = widths * i;
                  content.style.transform = "translate3d(-" + ml_ + "px,0px,0px)";
              }, false);
          });
      }
  };
  window.addEventListener ("resize", () => {
      d_widths = el.offsetWidth;
      console.log ("ekran değişti", d_widths);
      responsive_grid ();
  }, true);
  responsive_grid ();
  slider_direction (el);
  autoplay_ ();
  index_settings ();

  });

  return this;
};

carousel();