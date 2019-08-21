const API_KEY = '72a030c9d43c47f1a4a31d87f636be6f';
const ENDPOINT = 'https://api.giphy.com/v1/gifs/search';
const KEYCODE_LEFT_KEY = 37;
const KEYCODE_RIGHT_KEY = 39;
const previousButtonEl = document.querySelector('.previous-button');
const nextButtonEl = document.querySelector('.next-button');
const images = document.getElementsByClassName('gallery-image');
const galleryEl = document.querySelector('.gallery');
const featuredEl = document.querySelector('.featured-gif-wrapper');
const captionEl = document.querySelector('.featured-gif-caption');
const errorMessageEl = document.querySelector('.error-message');
const searchInputEl = document.querySelector('.gif-input');


function getAjaxRequestLimit() {
  return (window.innerWidth < 768 ? 6 : 7);
}

// The offsetNum is the number responsible for fetching gifs from a determined starting point. For a new search,
// the offset will always start at 0, but any subsequent query offsets within the same search will use Math.random to pull a new set of gifs.
function loadGifsViaApiCall(offsetNum) {
  let ajaxRequestLimit = (getAjaxRequestLimit());
  const xhr = new XMLHttpRequest();
  let query = {
    text: searchInputEl.value,
    offset: offsetNum,
    request() {
      return `${ENDPOINT}?q=${this.text}&limit=${ajaxRequestLimit}&offset=${this.offset}&api_key=${API_KEY}`;
    }
  };

  if (offsetNum !== 0) {
    galleryEl.innerHTML = '';
  }

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      onSuccess(JSON.parse(xhr.responseText));
    }
    else if (xhr.status !== 200 && xhr.status !== 0) {
      onError(xhr, xhr.status);
    }
  }

  xhr.open('GET', query.request(), true);
  xhr.send();
}

function onSuccess(giphyApiResponse) {
  searchInputEl.style.outline = 'none';
  showAllGifs(giphyApiResponse);
}

function onError(xhr, status) {
  let errorParagraphEl = document.createElement('p');
  let errorText = document.createTextNode(`${status} error. Sorry about that.`);

  errorParagraphEl.setAttribute('class', 'text-center white');
  errorParagraphEl.appendChild(errorText);
  errorMessageEl.appendChild(errorParagraphEl);
}

function addHoveredClass(e) {
  if (e.keyCode === KEYCODE_LEFT_KEY) {
    previousButtonEl.classList.toggle('hovered');
    moveThroughGallery(-1);
  } else if (e.keyCode === KEYCODE_RIGHT_KEY) {
    nextButtonEl.classList.toggle('hovered');
    moveThroughGallery(1);
  }
}

function removeHoveredClass(e) {
  if (e.keyCode === KEYCODE_LEFT_KEY) {
    previousButtonEl.classList.remove('hovered');
  } else if (e.keyCode === KEYCODE_RIGHT_KEY) {
    nextButtonEl.classList.remove('hovered');
  }
}

function displayButtons(visibility) {
  if (visibility === 'visible') {
    nextButtonEl.style.visibility = 'visible';
    previousButtonEl.style.visibility = 'visible';
  } else if (visibility === 'hidden') {
    nextButtonEl.style.visibility = 'hidden';
    previousButtonEl.style.visibility = 'hidden';
  }
}

function setInitialFeaturedImage(imgUrl, username, source) {
  let initialFeaturedGifEl = document.createElement('img');

  initialFeaturedGifEl.setAttribute('src', imgUrl);
  initialFeaturedGifEl.setAttribute('class', 'featured-image');
  initialFeaturedGifEl.setAttribute('id', '0');

  featuredEl.appendChild(initialFeaturedGifEl);

  let initialFeaturedCaptionEl = document.createElement('p');
  let initialCaptionText = document.createTextNode(`Source: ${getImageCaption(username, source)}`);

  initialFeaturedCaptionEl.appendChild(initialCaptionText);
  captionEl.appendChild(initialFeaturedCaptionEl);
}

function getImageCaption(username, source) {
  if (username) {
    return username;
  } else if (source) {
    return source;
  } else {
    return 'No image source';
  }
}

function setNoResultsErrorMessage() {
  let errorParagraphEl = document.createElement('p');
  let errorText = document.createTextNode('No results found :(');

  errorParagraphEl.setAttribute('class', 'text-center white');
  errorParagraphEl.appendChild(errorText);
  errorMessageEl.appendChild(errorParagraphEl);
}

function showAllGifs(giphyApiResponse) {
  if (giphyApiResponse.data.length === 0) {
    displayButtons('hidden');
    setNoResultsErrorMessage();
  } else {
    document.getElementsByClassName('featured-container')[0].style.visibility = 'visible';
    displayButtons('visible');

    setInitialFeaturedImage(
      giphyApiResponse.data[0].images.fixed_height.url,
      giphyApiResponse.data[0].username,
      giphyApiResponse.data[0].source_tld
    );

    giphyApiResponse.data.forEach((gif, index) => {
      const col = document.createElement('div');
      const img = document.createElement('img');

      col.setAttribute('class', 'col');

      col.innerHTML = (
        "<img src='" + gif.images.fixed_height.url +
        "' class='gallery-image' onclick='selectImageFromGallery(parseInt(this.id))' id='" +
         index + "' />" + "<p id='" + index + "' style='display:none'>Source: " +
        getImageCaption(gif.username, gif.source_tld) + "</p>"
      );

      galleryEl.appendChild(col);
    });
    loopImages(imagesIndex);
  }
}

let imagesIndex = 0;

function setFeaturedImageCaption() {
  const pTags = document.getElementsByTagName('p');

  for (let tag in pTags) {
    if (pTags[tag].id === images[imagesIndex].id) {
      captionEl.innerHTML = '<p>' + pTags[tag].innerText + '</p>';
    }
  }
}

function moveThroughGallery(n) {
  loopImages(imagesIndex += n);
  removeActiveState();
}

function removeActiveState() {
  for (let i = 0; i < images.length; i++) {
    if (images[i].id !== featuredEl.children[0].id) {
      images[i].classList.remove('active');
    }
  }
}


function selectImageFromGallery(n) {
  loopImages(imagesIndex = n);
  for (let i = 0; i < images.length; i++) {
    if (images[i].id !== featuredEl.children[0].id) {
      images[i].classList.remove('active');
    }
  }
}

function keepTrackOfCurrentPositionInGallery(num) {
  let ajaxRequestLimit = (getAjaxRequestLimit());
  if (num <= 0) {
    previousButtonEl.disabled = true;
    previousButtonEl.className = 'arrow disabled';
    imagesIndex = 0;
  }

  if (num > (ajaxRequestLimit - 1)) {
    loadGifsViaApiCall(Math.floor(Math.random() * 25));
    imagesIndex = 0;
  }

  if (num <= (ajaxRequestLimit - 1)) {
    featuredEl.innerHTML = (
      "<img src='" + images[imagesIndex].src + "' class='featured-image' id='" + images[imagesIndex].id + "' />"
    );

    if (featuredEl.children[0].id === images[imagesIndex].id) {
      images[imagesIndex].classList.add('active');
    }

    setFeaturedImageCaption();
  }
}

function loopImages(n) {
  previousButtonEl.disabled = false;
  previousButtonEl.classList.remove('disabled');

  keepTrackOfCurrentPositionInGallery(n);
}

// This is the listener than activates a Giphy AJAX call upon a query submission.
document.querySelector('.search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  galleryEl.innerHTML = '';
  errorMessageEl.innerHTML = '';
  document.querySelector('.featured-container').style.visibility = 'hidden';
  loadGifsViaApiCall(0);
});
document.onkeydown = (addHoveredClass);
document.onkeyup = (removeHoveredClass);
