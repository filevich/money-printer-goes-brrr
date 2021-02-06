// ==UserScript==
// @name     money-printer-goes-brrrr
// @version  1
// @grant    none
// ==/UserScript==

const PREFIX = '_MPGB'

const p = (s) => {
  return PREFIX + '-' + s
}

const setCookie = (id, value, expire) => {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expire)
    document.cookie = id + "=" + escape(value) + ((expire==null) ?
        "" :
        ";expires="+exdate.toUTCString())
}

const getCookie = (cname) => {
  var name = cname + "="
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return undefined
}

const statuses = ['PLAYING', 'PAUSED', 'STOPPED']
    , cookies  = [ 'status', 'current-iter', 'delta', 'err', 'next-id', 'current-iter', 'max-iter' ].map(s => p(s))

const addCss = (cssString) => {
    var head = document.getElementsByTagName('head')[0]
    var newCss = document.createElement('style')
    newCss.type = "text/css"
    newCss.innerHTML = cssString
    head.appendChild(newCss)
}

const appendStyles = () => {
  addCss(`
    #_MPGB-ui {
      position: absolute;
      width: auto;
      height: auto;
      padding: 2vw;
      z-index: 100;
      background: rgb(0, 0, 0);
      color: white;
      right: 0;
      position: fixed;
      bottom: 0;
    }

    #_MPGB-ui > input[type=number] {
      width: 10vw;
    }
  `)
}

const createMenu = () => {

  var menu = document.createElement('div')
  menu.id = PREFIX + '-ui'
  menu.innerHTML = `
    status: <span id="_MPGB-status"></span> <hr>
    delta: <input id="_MPGB-delta" type="number" value=""> sec <hr>
    err: <input id="_MPGB-err" type="number" value=""> sec <hr>
    max iter: <input id="_MPGB-max-iter" type="number" value=""> <hr>
    next id: <input id="_MPGB-next-id" type="text" value=""> <hr>
    current iter: <span id="_MPGB-current-iter"></span><hr>

    <input id="_MPGB-start" type="button" value="start">
    <input id="_MPGB-pause" type="button" value="pause">
    <input id="_MPGB-stop" type="button" value="stop">
  `
  document.body.appendChild(menu)

  render()

  document.getElementById('_MPGB-start').addEventListener('click', () => {
    setCookie(p('status'), 'PLAYING', null)
    run()
  })

  document.getElementById('_MPGB-pause').addEventListener('click', () => {
    setCookie(p('status'), 'PAUSED', null)
    run()
  })

  document.getElementById('_MPGB-stop').addEventListener('click', () => {
    setCookie(p('status'), 'STOPPED', 0)
  })

  document.getElementById('_MPGB-next-id').addEventListener("change", () => {
    let v = document.getElementById('_MPGB-next-id').value
    setCookie(p('next-id'), v,  null)
  })

}

const render = () => {
  let delta   = getCookie(p('delta'))
    , err     = getCookie(p('err'))
    , next_id = getCookie(p('next-id'))
    , current_iter = getCookie(p('current-iter'))
    , max_iter = getCookie(p('max-iter'))
    , status = getCookie(p('status'))
  
  document.getElementById('_MPGB-status').innerHTML = status
  document.getElementById('_MPGB-delta').value = delta
  document.getElementById('_MPGB-err').value = err
  document.getElementById('_MPGB-max-iter').value = max_iter
  document.getElementById('_MPGB-next-id').value = next_id
  document.getElementById('_MPGB-current-iter').innerHTML = current_iter + '/' + max_iter
}


const save = (id) => {
  let v = document.getElementById('_MPGB-next-id').value
  setCookie(p('next-id'), v,  null)
}


const createUI = () => {
  appendStyles()
  createMenu()
}

const ini = () => {

  const DEFAULT_DELTA     = 1// 25
      , DEFAULT_ERR       = 0// 5
      , DEFAULT_MAX_ITER  = 5
      , DEFAULT_NEXT_ID   = 'next-video-form'

  // cookies?
  if (!getCookie(p('status'))) {
    setCookie(p('status'),        'STOPPED',        null)
    setCookie(p('current-iter'),  0,                null)
    setCookie(p('delta'),         DEFAULT_DELTA,    null)
    setCookie(p('err'),           DEFAULT_ERR,      null)
    setCookie(p('next-id'),       DEFAULT_NEXT_ID,  null)
    setCookie(p('current-iter'),  0,                null)
    setCookie(p('max-iter'),  DEFAULT_MAX_ITER, null)
  }
}

const calcTimeOut = () => {
  let delta   = parseInt(getCookie(p('delta')))
    , err     = parseInt(getCookie(p('err')))
  
  return (delta + err) * 1000
}

var timer = 0

const run = () => {
  let status = getCookie(p('status'))

  switch (status) {
    case 'PLAYING':      
      
      timer = setInterval(() => {
        if (isFinished()) {
          clearInterval(timer)
          next()
        }
      }, 1000)

      break;
  
    case 'PAUSED':
      clearInterval(timer)
      break;
    
    case 'STOPPED':
      break;
  }
}

const isFinished = () => {
  document.getElementById('video-progress').classList.contains('finished')
}

const next = () => {
  const id = getCookie(p('next-id'))
  let form = document.getElementById(id)
    , btn  = form.querySelector('.watch-next-btn')

  let current_iter = getCookie(p('current-iter'))
    , max_iter = getCookie(p('max-iter'))

  current_iter++

  // shouldStop = current_iter == max_iter
  shouldStop = window.location.href.includes('captcha')

  if (shouldStop)
    setCookie(p('status'), 'STOPPED', null)

  setCookie(p('current-iter'), current_iter, null)
    
  btn.disabled = false
  btn.click()

  window.location.reload()

}

window.onload = () => {
  const SITE_NAME = 'playnano.online'
      , SITES = [ 'localhost', SITE_NAME ]

  if(!SITES.some(r => window.location.hostname.includes(r)))
    return;

  ini()
  createUI()
  run()
}


/*
https://playnano.online/watch-and-learn/nano/JChBTohSHlM
https://playnano.online/watch-and-learn/nano/captcha
*/