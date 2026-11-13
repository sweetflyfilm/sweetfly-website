/* One shared bottom bar for every company page. */
(function () {
  if (document.querySelector('.sf-bottom-bar')) return;

  var bar = document.createElement('aside');
  var community = document.body.dataset.bottomAction === 'post';
  bar.className = 'sf-bottom-bar';
  bar.setAttribute('aria-label', community ? 'Rent gear or post to the community' : 'Rent gear or contact Sweet Flypaper');
  bar.innerHTML = '<a class="sf-bottom-rent" href="https://rent.sweetflyfilm.com/">' +
    '<span>Rent <span class="sf-bottom-rent-detail">gear from </span><strong>SweetFly Shop</strong></span><span aria-hidden="true">↗</span></a>' +
    '<a class="sf-bottom-contact" href="https://tally.so/r/ODPpg7" target="_blank" rel="noopener noreferrer">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/></svg>' +
    '<span>Contact Us</span></a>';
  if (community) {
    var contact = bar.querySelector('.sf-bottom-contact');
    var post = document.createElement('button');
    post.type = 'button';
    post.className = 'sf-bottom-contact';
    post.dataset.openPost = '';
    post.setAttribute('aria-haspopup', 'dialog');
    post.setAttribute('aria-controls', 'post-dialog');
    post.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 10 14-5v14L4 14zM4 10H2v4h2m3 1 1 6h4l-2-5M21 8v8"/></svg><span>Post Here</span>';
    contact.replaceWith(post);
  }
  document.body.appendChild(bar);

  var spacer = document.createElement('div');
  spacer.className = 'sf-bottom-bar-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spacer);

})();
