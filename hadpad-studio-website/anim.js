/* HADPAD STUDIO — motion layer (scroll reveal, parallax, mouse tilt, progress bar) */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* 1. scroll progress bar + header shadow */
  var bar=document.createElement('div');bar.className='scroll-progress';document.body.appendChild(bar);
  var header=document.querySelector('.header');

  /* 2. mark elements for scroll reveal, with staggered delays */
  function mark(sel,opts){
    $(sel).forEach(function(el,i){
      el.classList.add('reveal');
      if(opts&&opts.dir)el.classList.add(opts.dir);
      if(opts&&opts.stagger)el.style.setProperty('--d',(i*opts.stagger)+'s');
    });
  }
  mark('.intro-strip .strip-inner');
  mark('.section-header');
  mark('.projects .project',{stagger:.12});
  mark('.service',{stagger:.1});
  mark('.detail-card',{stagger:.15});
  mark('.about-photo',{dir:'left'});
  mark('.about-copy',{dir:'right'});
  mark('.contact-heading');
  mark('.contact-left');
  mark('.contact-form');

  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $('.reveal').forEach(function(el){io.observe(el)});
  }else{
    $('.reveal').forEach(function(el){el.classList.add('in')});
  }

  /* 3. scroll-linked effects (progress bar, header shadow, about-photo parallax) */
  var photo=document.querySelector('.about-photo img');
  var ticking=false;
  function onScroll(){
    var y=window.scrollY||document.documentElement.scrollTop;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
    if(header)header.classList.toggle('scrolled',y>10);
    if(photo&&!reduce){
      var r=photo.parentElement.getBoundingClientRect();
      if(r.bottom>0&&r.top<window.innerHeight){
        var p=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight;
        photo.style.transform='scale(1.12) translateY('+(p*-28).toFixed(1)+'px)';
      }
    }
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* 4. hero: logo plate follows the mouse (3D tilt + parallax) — desktop only */
  var plate=document.querySelector('.visual-plate');
  var finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(plate&&finePointer&&!reduce){
    var hero=document.querySelector('.hero');
    hero.addEventListener('mousemove',function(e){
      var r=hero.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      plate.style.transition='transform .15s ease-out';
      plate.style.transform='perspective(900px) rotateY('+(x*9).toFixed(2)+'deg) rotateX('+(-y*9).toFixed(2)+'deg)';
    });
    hero.addEventListener('mouseleave',function(){
      plate.style.transition='transform .8s cubic-bezier(.2,.7,.2,1)';
      plate.style.transform='perspective(900px) rotateY(0) rotateX(0)';
    });
  }

  /* 5. gentle tilt on visiting-card images */
  if(finePointer&&!reduce){
    $('.detail-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform='perspective(800px) rotateY('+(x*8).toFixed(2)+'deg) rotateX('+(-y*8).toFixed(2)+'deg)';
      });
      card.addEventListener('mouseleave',function(){card.style.transform=''});
    });
  }
})();
