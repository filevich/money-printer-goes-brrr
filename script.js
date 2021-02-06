// ==UserScript==
// @name     money-printer-goes-brrrr
// @version  1
// @grant    none
// ==/UserScript==

const setCookie = (c_name, value, expiredays) => {
    var exdate = new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ?
        "" :
        ";expires="+exdate.toUTCString())
}

const cookie_names = [
    '_CGB_ITER',
    '_CGB_TODAY'
]

for (var i in cookie_names)
    setCookie(cookie_names[i], 88, null)


const addCss = (cssString) => {
    var head = document.getElementsByTagName('head')[0]
    var newCss = document.createElement('style')
    newCss.type = "text/css"
    newCss.innerHTML = cssString
    head.appendChild(newCss)
}

(() => {

  const SITE_NAME = 'playnano.online'
  
  if(window.location.hostname.includes(SITE_NAME))
    alert('we are here')
  

})()