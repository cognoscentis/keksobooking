'use strict';

var pinMap = document.querySelector('.tokyo__pin-map');
var allpins = pinMap.getElementsByClassName('pin');
var offerDialog = document.querySelector('#offer-dialog');
var dialogTitle = offerDialog.querySelector('.dialog__title');
var dialogPanel = offerDialog.querySelector('.dialog__panel');
var dialogClose = offerDialog.querySelector('.dialog__close');
var lodgeTemplate = document.querySelector('#lodge-template');
var allOffers = [];
var typeDescriptions = {
  flat: 'Квартира',
  bungalo: 'Бунгало',
  house: 'Дом'
};

var OFFERS_COUNT = 8;
var OFFER_TITLE = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];
var OFFER_FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];
var OFFER_HOUSE_TYPE = [
  'flat',
  'house',
  'bungalo'
];
var OFFER_TIME = [
  '12:00',
  '13:00',
  '14:00'
];

// Генерация числа [min, max], включая предельные значения
function getRandomInteger(min, max) {
  var rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}

// Генерация массива фич (случайной длины)
function getRandomFeatures() {
  var randomFeatures = [];
  var num = getRandomInteger(0, OFFER_FEATURES.length - 1); // определяем количество фич в будущем массиве
  for (var i = 0; i < num; i++) {
    var value = OFFER_FEATURES[i];
    randomFeatures.push(value);
  }
  return randomFeatures;
}

// Генерация массива объявлений
function createOffersArray(count) {
  var offers = [];
  for (var i = 0; i < count; i++) {
    var locationX = getRandomInteger(300, 900);
    var locationY = getRandomInteger(100, 500);
    offers.push({
      location: {
        x: locationX,
        y: locationY
      },
      author: {
        avatar: 'img/avatars/user0' + (i + 1) + '.png'
      },
      offer: {
        title: OFFER_TITLE[i],
        address: locationX + ', ' + locationY,
        price: getRandomInteger(1000, 1000000),
        type: OFFER_HOUSE_TYPE[getRandomInteger(0, OFFER_HOUSE_TYPE.length - 1)],
        rooms: getRandomInteger(1, 5),
        guests: getRandomInteger(1, 10),
        checkin: OFFER_TIME[getRandomInteger(0, OFFER_TIME.length - 1)],
        checkout: OFFER_TIME[getRandomInteger(0, OFFER_TIME.length - 1)],
        features: getRandomFeatures(),
        description: '',
        photos: [],
      }
    });
  }
  return offers;
}

// Создание единичной метки объявления для карты
function createPin(object) {
  var pin = pinMap.querySelector('.pin').cloneNode(true);
  pin.classList.remove('pin__main');
  pin.style.left = (object.location.x + 28) + 'px'; // Добавление размеров метки для точного отображения. 28px - половина ширины pin.png
  pin.style.top = (object.location.y + 75) + 'px'; // 75px - высота pin.png
  pin.tabIndex = '0';
  pin.getElementsByTagName('img')[0].src = object.author.avatar;
  pin.getElementsByTagName('img')[0].alt = 'Pin';
  pin.getElementsByTagName('img')[0].height = '40';
  return pin;
}

// Создание фрагмента с метками
function createDomPinsList(array, count) {
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < count; i++) {
    fragment.appendChild(createPin(array[i]));
  }
  pinMap.appendChild(fragment);
}

// Создание фрагмента для dialog__panel
function createDomDialogPanel(object) {
  var template = lodgeTemplate.content.cloneNode(true);
  var featuresForDom = '';

  template.querySelector('.lodge__title').textContent = object.offer.title;
  template.querySelector('.lodge__address').textContent = object.offer.address;
  template.querySelector('.lodge__price').textContent = object.offer.price + ' ' + '\u20BD' + '/ночь';
  template.querySelector('.lodge__type').textContent = typeDescriptions[object.offer.type];
  template.querySelector('.lodge__rooms-and-guests').textContent = 'Для ' + object.offer.guests + ' гостей в ' + object.offer.rooms + ' комнатах';
  template.querySelector('.lodge__checkin-time').textContent = 'Заезд после ' + object.offer.checkin + ', выезд до' + object.offer.checkout;

  for (var i = 0; i < object.offer.features.length; i++) {
    featuresForDom += '<span class="feature__image feature__image--' + object.offer.features[i] + '"></span>';
  }

  template.querySelector('.lodge__features').innerHTML = featuresForDom;
  template.querySelector('.lodge__description').textContent = object.offer.description;
  dialogTitle.getElementsByTagName('img')[0].src = object.author.avatar;

  dialogPanel = offerDialog.querySelector('.dialog__panel'); // без этой строчки будет выдавать ошибку при клике на пине, т.к. не сможет найти значение dialogPanel, которое было определенно в начале этого файла. Потому что оно было заменено при выполнении функции createDomDialogPanel(allOffers[0]);
  offerDialog.replaceChild(template, dialogPanel);
}

// -------------------------------------- Events ----------------------------------------
// Обработчик клика на пине
function onPinClick(evt) {
  var target = evt.target;
  offerDialog.classList.remove('hidden');
  while (target !== pinMap) {
    if (target.classList.contains('pin')) {
      if (target.classList.contains('pin__main')) { // Если повесить на pin__main класс pin--active, то иконка начинает баговать. В ТЗ ничего не сказано про pin__main. Решил исключить pin__main
        return;
      }
      for (var i = 0; i < allpins.length; i++) {
        if (allpins[i] !== target) {
          allpins[i].classList.remove('pin--active');
        } else {
          createDomDialogPanel(allOffers[i - 1]); // Единица вычитается, т.к. allpins.length > allOffers.length на единицу из-за div.pin__main
          continue;
        }
      }
      target.classList.add('pin--active');
      return;
    }
    target = target.parentNode;
  }
}

// Закрытие диалога и снятие подсветки с пина
function onDialogCloseClick() {
  offerDialog.classList.add('hidden');
  for (var i = 0; i < allpins.length; i++) {
    allpins[i].classList.remove('pin--active');
  }
}

pinMap.addEventListener('click', function (evt) {
  onPinClick(evt);
});
pinMap.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 13) {
    onPinClick(evt);
  }
});
dialogClose.addEventListener('click', function () {
  onDialogCloseClick();
});
document.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27) {
    onDialogCloseClick();
  }
});

// ------------------------------------ Events end --------------------------------------

allOffers = createOffersArray(OFFERS_COUNT);
createDomPinsList(allOffers, OFFERS_COUNT);
createDomDialogPanel(allOffers[0]);
